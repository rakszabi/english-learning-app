import { Component, ElementRef, HostListener, inject, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { AvatarComponent } from '../avatar/avatar.component';

@Component({
  selector: 'app-profile-dropdown',
  standalone: true,
  imports: [RouterLink, AvatarComponent],
  templateUrl: './profile-dropdown.component.html',
  styleUrl: './profile-dropdown.component.scss',
})
export class ProfileDropdownComponent {
  private readonly auth = inject(AuthService);
  private readonly el = inject(ElementRef);

  protected readonly isOpen = signal(false);

  protected readonly userInitial = computed(() => {
    const email = this.auth.getCurrentUserEmail();
    return email ? email[0].toUpperCase() : '?';
  });

  protected readonly userEmail = computed(() => this.auth.getCurrentUserEmail() ?? '');
  protected readonly userDisplayName = computed(() => this.auth.getCurrentUserDisplayName() ?? '');

  toggle(): void {
    this.isOpen.update((v) => !v);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.el.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
    }
  }

  protected logout(): void {
    this.isOpen.set(false);
    this.auth.logout();
  }
}
