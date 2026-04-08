import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-avatar',
  standalone: true,
  templateUrl: './avatar.component.html',
  styleUrl: './avatar.component.scss',
})
export class AvatarComponent {
  readonly name = input<string>('?');
  readonly size = input<'sm' | 'md' | 'lg'>('md');

  protected readonly initial = computed(() => {
    const n = this.name().trim();
    return n ? n[0].toUpperCase() : '?';
  });
}
