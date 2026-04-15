import { Component, inject, input, output } from '@angular/core';
import { DialogueLine } from '../../core/services/dialogue.service';
import { TtsService } from '../../core/services/tts.service';

@Component({
  selector: 'app-dialogue-lines',
  standalone: true,
  templateUrl: './dialogue-lines.component.html',
  styleUrl: './dialogue-lines.component.scss',
})
export class DialogueLinesComponent {
  protected readonly tts = inject(TtsService);

  readonly lines = input<DialogueLine[]>([]);
  readonly showTranslations = input<boolean>(true);

  /** Emitted when the user clicks a blurred English line (to reveal all). */
  readonly reveal = output<void>();

  protected onLineClick(): void {
    if (!this.showTranslations()) {
      this.reveal.emit();
    }
  }

  protected speakLine(index: number): void {
    const line = this.lines()[index];
    if (!line) return;
    const key = String(index);
    if (this.tts.playingKey() === key) {
      this.tts.stop();
    } else {
      this.tts.speak(line.en, key, line.speaker);
    }
  }

  protected speakAll(): void {
    if (this.tts.playingKey() === 'all') {
      this.tts.stop();
      return;
    }
    this.tts.speakAll(
      this.lines().map((l) => ({ text: l.en, speaker: l.speaker }))
    );
  }
}
