import { Component, effect, input, output, signal } from '@angular/core';

export type DifficultyScore = 'EASY' | 'MEDIUM' | 'HARD';

@Component({
  selector: 'app-difficulty-modal',
  standalone: true,
  templateUrl: './difficulty-modal.component.html',
  styleUrl: './difficulty-modal.component.scss',
})
export class DifficultyModalComponent {
  readonly isOpen = input<boolean>(false);
  readonly submitting = input<boolean>(false);
  readonly error = input<string | null>(null);

  readonly scored = output<DifficultyScore>();
  readonly cancelled = output<void>();

  protected readonly selectedScore = signal<DifficultyScore | null>(null);

  constructor() {
    // Reset selection whenever modal opens
    effect(() => {
      if (this.isOpen()) {
        this.selectedScore.set(null);
      }
    });
  }

  protected select(score: DifficultyScore): void {
    this.selectedScore.set(score);
  }

  protected submit(): void {
    const score = this.selectedScore();
    if (!score || this.submitting()) return;
    this.scored.emit(score);
  }

  protected cancel(): void {
    if (this.submitting()) return;
    this.cancelled.emit();
  }
}
