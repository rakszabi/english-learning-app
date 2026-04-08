import { Component, input, output } from '@angular/core';
import { DialogueLine } from '../../core/services/dialogue.service';

@Component({
  selector: 'app-dialogue-lines',
  standalone: true,
  templateUrl: './dialogue-lines.component.html',
  styleUrl: './dialogue-lines.component.scss',
})
export class DialogueLinesComponent {
  readonly lines = input<DialogueLine[]>([]);
  readonly showTranslations = input<boolean>(true);

  /** Emitted when the user clicks a blurred English line (to reveal all). */
  readonly reveal = output<void>();

  protected onLineClick(): void {
    if (!this.showTranslations()) {
      this.reveal.emit();
    }
  }
}
