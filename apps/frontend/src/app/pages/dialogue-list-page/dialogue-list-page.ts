import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ButtonComponent } from '../../ui-components/button/button.component';
import {
  DialogueService,
  DialogueItem,
  PracticedDialogueItem,
} from '../../core/services/dialogue.service';

type Tab = 'new' | 'practiced';

@Component({
  selector: 'app-dialogue-list-page',
  standalone: true,
  imports: [RouterLink, ButtonComponent],
  templateUrl: './dialogue-list-page.html',
  styleUrl: './dialogue-list-page.scss',
})
export class DialogueListPage implements OnInit {
  private readonly dialogueService = inject(DialogueService);
  private readonly router = inject(Router);

  protected navigateToNew(): void {
    this.router.navigate(['/dialogues/new']);
  }

  protected readonly activeTab = signal<Tab>('new');
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly notPracticed = signal<DialogueItem[]>([]);
  protected readonly practiced = signal<PracticedDialogueItem[]>([]);

  ngOnInit(): void {
    this.loadData();
  }

  protected loadData(): void {
    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      unpracticed: this.dialogueService.getUnpracticed(),
      practiced: this.dialogueService.getPracticed(),
    }).subscribe({
      next: ({ unpracticed, practiced }) => {
        this.notPracticed.set(unpracticed);
        this.practiced.set(practiced);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load dialogues. Please try again.');
        this.loading.set(false);
      },
    });
  }

  protected formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }
}
