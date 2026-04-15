import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

export type TtsDialogueSpeaker = 'A' | 'B';

@Injectable({ providedIn: 'root' })
export class TtsService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/api/tts/speak`;

  private currentAudio: HTMLAudioElement | null = null;
  private objectUrls: string[] = [];

  /** 'all' | line index as string | null */
  readonly playingKey = signal<string | null>(null);

  /** Index of the line currently being read aloud during speakAll, null otherwise */
  readonly currentLineIndex = signal<number | null>(null);

  // ── Single line ────────────────────────────────────────────────────────────

  speak(text: string, key: string, speaker: TtsDialogueSpeaker): void {
    this.stop();
    this.playingKey.set(key);

    this.http
      .post(this.url, { text, speaker }, { responseType: 'arraybuffer' })
      .subscribe({
        next: (buffer) => {
          if (this.playingKey() !== key) return;
          const audio = this.createAudio(buffer);
          audio.onended = () => this.cleanup();
          audio.onerror = () => this.cleanup();
          audio.play();
        },
        error: () => this.cleanup(),
      });
  }

  // ── All lines sequentially ─────────────────────────────────────────────────

  speakAll(segments: { text: string; speaker: TtsDialogueSpeaker }[]): void {
    this.stop();
    this.playingKey.set('all');

    const requests = segments.map(({ text, speaker }) =>
      firstValueFrom(
        this.http.post(this.url, { text, speaker }, { responseType: 'arraybuffer' })
      )
    );

    Promise.all(requests)
      .then((buffers) => {
        if (this.playingKey() !== 'all') return;
        this.playSequentially(buffers, 0);
      })
      .catch(() => this.cleanup());
  }

  stop(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.onended = null;
      this.currentAudio.onerror = null;
      this.currentAudio = null;
    }
    this.cleanup();
  }

  // ── Internals ──────────────────────────────────────────────────────────────

  private playSequentially(buffers: ArrayBuffer[], index: number): void {
    if (this.playingKey() !== 'all' || index >= buffers.length) {
      this.cleanup();
      return;
    }

    this.currentLineIndex.set(index);

    const audio = this.createAudio(buffers[index]);
    audio.onended = () => this.playSequentially(buffers, index + 1);
    audio.onerror = () => this.cleanup();
    audio.play();
  }

  private createAudio(buffer: ArrayBuffer): HTMLAudioElement {
    const blob = new Blob([buffer], { type: 'audio/mpeg' });
    const objectUrl = URL.createObjectURL(blob);
    this.objectUrls.push(objectUrl);

    const audio = new Audio(objectUrl);
    this.currentAudio = audio;
    return audio;
  }

  private cleanup(): void {
    this.objectUrls.forEach((u) => URL.revokeObjectURL(u));
    this.objectUrls = [];
    this.currentAudio = null;
    this.currentLineIndex.set(null);
    this.playingKey.set(null);
  }
}
