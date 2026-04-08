import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from '../../ui-components/button/button.component';
import { DialogueService } from '../../core/services/dialogue.service';

type TopicType = 'unique' | 'any';
export type TopicState = 'idle' | 'waiting' | 'generating' | 'done' | 'error';

@Component({
  selector: 'app-new-dialogue-page',
  standalone: true,
  imports: [RouterLink, ButtonComponent],
  templateUrl: './new-dialogue-page.html',
  styleUrl: './new-dialogue-page.scss',
})
export class NewDialoguePage {
  private readonly dialogueService = inject(DialogueService);

  // ── Topic generation config ─────────────────────────────
  protected readonly topicType = signal<TopicType>('unique');
  protected readonly count = signal<number>(10);
  protected readonly loadingTopics = signal(false);
  protected readonly topicError = signal<string | null>(null);
  protected readonly topics = signal<string[]>([]);
  protected readonly selectedTopics = signal<Set<string>>(new Set());

  // ── Dialogue generation state ───────────────────────────
  protected readonly isGenerating = signal(false);
  protected readonly topicStates = signal<Map<string, TopicState>>(new Map());
  protected readonly completedCount = signal(0);
  protected readonly totalToGenerate = signal(0);

  // ── Computed ─────────────────────────────────────────────
  protected readonly hasResults = computed(() => this.topics().length > 0);

  /** Topics selected that have not yet been successfully generated */
  protected readonly actionableSelectedCount = computed(() => {
    const states = this.topicStates();
    const selected = this.selectedTopics();
    if (states.size === 0) return selected.size;
    let count = 0;
    for (const t of selected) {
      if (states.get(t) !== 'done') count++;
    }
    return count;
  });

  /** True when all non-done topics are selected */
  protected readonly allNonDoneSelected = computed(() => {
    const states = this.topicStates();
    const topics = this.topics();
    const selected = this.selectedTopics();
    const nonDone = topics.filter((t) => states.get(t) !== 'done');
    if (nonDone.length === 0) return true;
    return nonDone.every((t) => selected.has(t));
  });

  protected readonly generationStarted = computed(() => this.totalToGenerate() > 0);

  // ── Config form ──────────────────────────────────────────
  protected onCountInput(event: Event): void {
    const raw = parseInt((event.target as HTMLInputElement).value, 10);
    if (!isNaN(raw)) {
      this.count.set(Math.max(1, Math.min(raw, 50)));
    }
  }

  protected generate(): void {
    if (this.isGenerating()) return;
    this.loadingTopics.set(true);
    this.topicError.set(null);
    this.topicStates.set(new Map());
    this.completedCount.set(0);
    this.totalToGenerate.set(0);

    this.dialogueService.generateTopics(this.count(), this.topicType() === 'unique').subscribe({
      next: (topics) => {
        this.topics.set(topics);
        this.selectedTopics.set(new Set(topics));
        this.loadingTopics.set(false);
      },
      error: () => {
        this.topicError.set('Failed to generate topics. Please try again.');
        this.loadingTopics.set(false);
      },
    });
  }

  // ── Topic selection ──────────────────────────────────────
  protected toggleAll(): void {
    if (this.isGenerating()) return;
    const states = this.topicStates();
    const nonDone = this.topics().filter((t) => states.get(t) !== 'done');
    const newSelected = new Set(this.selectedTopics());

    if (this.allNonDoneSelected()) {
      for (const t of nonDone) newSelected.delete(t);
    } else {
      for (const t of nonDone) newSelected.add(t);
    }
    this.selectedTopics.set(newSelected);
  }

  protected toggleTopic(topic: string): void {
    if (this.isGenerating()) return;
    // Done topics are permanently locked
    if (this.topicStates().get(topic) === 'done') return;
    const set = new Set(this.selectedTopics());
    if (set.has(topic)) {
      set.delete(topic);
    } else {
      set.add(topic);
    }
    this.selectedTopics.set(set);
  }

  // ── Dialogue generation ──────────────────────────────────
  protected startGeneration(): void {
    if (this.isGenerating() || this.actionableSelectedCount() === 0) return;

    const states = this.topicStates();
    // Only queue topics that are selected and NOT already done
    const queue = Array.from(this.selectedTopics()).filter(
      (t) => states.get(t) !== 'done',
    );

    // Build new state map: keep existing done states, set others
    const newStates = new Map(states);
    for (const t of this.topics()) {
      if (newStates.get(t) === 'done') continue;
      newStates.set(t, queue.includes(t) ? 'waiting' : 'idle');
    }
    this.topicStates.set(newStates);
    this.totalToGenerate.set(queue.length);
    this.completedCount.set(0);
    this.isGenerating.set(true);

    this.processNext(queue, 0);
  }

  private processNext(queue: string[], index: number): void {
    if (index >= queue.length) {
      this.isGenerating.set(false);
      return;
    }

    const topic = queue[index];
    this.topicStates.update((m) => new Map(m).set(topic, 'generating'));

    this.dialogueService.generateDialogue(topic).subscribe({
      next: () => {
        this.topicStates.update((m) => new Map(m).set(topic, 'done'));
        this.completedCount.update((n) => n + 1);
        this.processNext(queue, index + 1);
      },
      error: () => {
        this.topicStates.update((m) => new Map(m).set(topic, 'error'));
        this.completedCount.update((n) => n + 1);
        this.processNext(queue, index + 1);
      },
    });
  }

  protected topicState(topic: string): TopicState | undefined {
    return this.topicStates().get(topic);
  }
}
