import { Component, inject, signal } from '@angular/core';
import { DialogueService, DialogueDetail } from '../../core/services/dialogue.service';
import { DifficultyModalComponent, DifficultyScore } from '../../ui-components/difficulty-modal/difficulty-modal.component';
import { DialogueLinesComponent } from '../../ui-components/dialogue-lines/dialogue-lines.component';

type PageState = 'intro' | 'loading' | 'practicing' | 'rated' | 'no_more';

interface RatedSummary {
  topic: string;
  score: DifficultyScore;
}

@Component({
  selector: 'app-practice-page',
  imports: [DifficultyModalComponent, DialogueLinesComponent],
  templateUrl: './practice-page.html',
  styleUrl: './practice-page.scss',
})
export class PracticePage {
  private readonly dialogueService = inject(DialogueService);

  protected readonly state = signal<PageState>('intro');
  protected readonly dialogue = signal<DialogueDetail | null>(null);
  protected readonly showTranslations = signal(true);
  protected readonly sessionCount = signal(0);
  protected readonly lastRated = signal<RatedSummary | null>(null);

  // Modal state
  protected readonly isModalOpen = signal(false);
  protected readonly submitting = signal(false);
  protected readonly submitError = signal<string | null>(null);

  protected readonly SCORE_LABEL: Record<DifficultyScore, string> = {
    EASY: 'Easy',
    MEDIUM: 'Medium',
    HARD: 'Hard',
  };

  protected start(): void {
    this.loadNext();
  }

  protected toggleTranslations(): void {
    this.showTranslations.update((v) => !v);
  }

  protected openModal(): void {
    this.submitError.set(null);
    this.isModalOpen.set(true);
  }

  protected closeModal(): void {
    if (this.submitting()) return;
    this.isModalOpen.set(false);
  }

  protected onScored(score: DifficultyScore): void {
    const d = this.dialogue();
    if (!d || this.submitting()) return;

    this.submitting.set(true);
    this.submitError.set(null);

    this.dialogueService.submitPractice(d.id, score).subscribe({
      next: () => {
        this.submitting.set(false);
        this.isModalOpen.set(false);
        this.sessionCount.update((n) => n + 1);
        this.lastRated.set({ topic: d.topic, score });
        this.state.set('rated');
      },
      error: (err) => {
        this.submitting.set(false);
        this.submitError.set(err?.error?.message ?? 'Something went wrong. Please try again.');
      },
    });
  }

  protected nextDialogue(): void {
    this.loadNext();
  }

  protected finishSession(): void {
    this.state.set('no_more');
  }

  private loadNext(): void {
    this.state.set('loading');
    this.showTranslations.set(true);

    this.dialogueService.getNextForPractice().subscribe({
      next: (d) => {
        if (typeof d.dialogJson === 'string') {
          d.dialogJson = JSON.parse(d.dialogJson as unknown as string);
        }
        this.dialogue.set(d);
        this.state.set('practicing');
      },
      error: () => {
        this.state.set('no_more');
      },
    });
  }
}
