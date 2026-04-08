import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { DialogueService, DialogueDetail } from '../../core/services/dialogue.service';
import { ButtonComponent } from '../../ui-components/button/button.component';

type DifficultyScore = 'EASY' | 'MEDIUM' | 'HARD';

@Component({
  selector: 'app-dialogue-page',
  imports: [RouterLink, DatePipe, ButtonComponent],
  templateUrl: './dialogue-page.html',
  styleUrl: './dialogue-page.scss',
})
export class DialoguePage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly dialogueService = inject(DialogueService);

  protected readonly dialogue = signal<DialogueDetail | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly showTranslations = signal(true);

  protected readonly isModalOpen = signal(false);
  protected readonly selectedScore = signal<DifficultyScore | null>(null);
  protected readonly submitting = signal(false);
  protected readonly submitError = signal<string | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error.set('Dialogue not found.');
      this.loading.set(false);
      return;
    }

    this.dialogueService.getById(id).subscribe({
      next: (d) => {
        if (typeof d.dialogJson === 'string') {
          d.dialogJson = JSON.parse(d.dialogJson);
        }
        this.dialogue.set(d);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load dialogue. Please try again.');
        this.loading.set(false);
      },
    });
  }

  protected toggleTranslations(): void {
    this.showTranslations.update((v) => !v);
  }

  protected openModal(): void {
    this.selectedScore.set(null);
    this.submitError.set(null);
    this.isModalOpen.set(true);
  }

  protected closeModal(): void {
    if (this.submitting()) return;
    this.isModalOpen.set(false);
  }

  protected selectScore(score: DifficultyScore): void {
    this.selectedScore.set(score);
  }

  protected submitPractice(): void {
    const d = this.dialogue();
    const score = this.selectedScore();
    if (!d || !score || this.submitting()) return;

    this.submitting.set(true);
    this.submitError.set(null);

    this.dialogueService.submitPractice(d.id, score).subscribe({
      next: () => {
        this.submitting.set(false);
        this.isModalOpen.set(false);
        this.router.navigate(['/dialogues']);
      },
      error: (err) => {
        this.submitting.set(false);
        this.submitError.set(err?.error?.message ?? 'Something went wrong. Please try again.');
      },
    });
  }
}
