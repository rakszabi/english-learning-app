import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProfileService } from '../../core/services/profile.service';
import { User } from '../../core/services/auth.service';
import { InputComponent } from '../../ui-components/input/input.component';
import { ButtonComponent } from '../../ui-components/button/button.component';
import { AvatarComponent } from '../../ui-components/avatar/avatar.component';

@Component({
  selector: 'app-profile-page',
  imports: [DatePipe, FormsModule, InputComponent, ButtonComponent, AvatarComponent],
  templateUrl: './profile-page.html',
  styleUrl: './profile-page.scss',
})
export class ProfilePage implements OnInit {
  private readonly profileService = inject(ProfileService);

  // ── Data ───────────────────────────────────────────────────────────────────
  protected readonly profile = signal<User | null>(null);
  protected readonly loading = signal(true);
  protected readonly loadError = signal<string | null>(null);

  // ── Personal info edit ─────────────────────────────────────────────────────
  protected readonly isEditingInfo = signal(false);
  protected editInfo = { firstname: '', lastname: '', headline: '' };
  protected readonly savingInfo = signal(false);
  protected readonly infoError = signal<string | null>(null);
  protected readonly infoSuccess = signal(false);

  // ── Password change ────────────────────────────────────────────────────────
  protected readonly isChangingPassword = signal(false);
  protected passwordForm = { old: '', new: '', confirm: '' };
  protected readonly savingPassword = signal(false);
  protected readonly passwordError = signal<string | null>(null);
  protected readonly passwordSuccess = signal(false);

  // ── Computed ───────────────────────────────────────────────────────────────
  protected readonly displayName = computed(() => {
    const p = this.profile();
    if (!p) return '';
    const full = `${p.firstname ?? ''} ${p.lastname ?? ''}`.trim();
    return full || p.email;
  });

  ngOnInit(): void {
    this.profileService.getProfile().subscribe({
      next: (user) => {
        this.profile.set(user);
        this.loading.set(false);
      },
      error: () => {
        this.loadError.set('Failed to load profile. Please try again.');
        this.loading.set(false);
      },
    });
  }

  // ── Info edit handlers ─────────────────────────────────────────────────────
  protected startEditInfo(): void {
    const p = this.profile();
    if (!p) return;
    this.editInfo = {
      firstname: p.firstname ?? '',
      lastname: p.lastname ?? '',
      headline: p.profileHeadline ?? '',
    };
    this.infoError.set(null);
    this.infoSuccess.set(false);
    this.isEditingInfo.set(true);
  }

  protected cancelEditInfo(): void {
    this.isEditingInfo.set(false);
  }

  protected saveInfo(): void {
    if (this.savingInfo()) return;
    this.savingInfo.set(true);
    this.infoError.set(null);

    this.profileService
      .updateProfile({
        firstname: this.editInfo.firstname,
        lastname: this.editInfo.lastname,
        profileHeadline: this.editInfo.headline,
      })
      .subscribe({
        next: (user) => {
          this.profile.set(user);
          this.savingInfo.set(false);
          this.isEditingInfo.set(false);
          this.infoSuccess.set(true);
          setTimeout(() => this.infoSuccess.set(false), 3500);
        },
        error: (err) => {
          this.infoError.set(err?.error?.message ?? 'Failed to save changes. Please try again.');
          this.savingInfo.set(false);
        },
      });
  }

  // ── Password handlers ──────────────────────────────────────────────────────
  protected startChangePassword(): void {
    this.passwordForm = { old: '', new: '', confirm: '' };
    this.passwordError.set(null);
    this.passwordSuccess.set(false);
    this.isChangingPassword.set(true);
  }

  protected cancelChangePassword(): void {
    this.isChangingPassword.set(false);
  }

  protected savePassword(): void {
    if (this.savingPassword()) return;

    if (!this.passwordForm.old || !this.passwordForm.new || !this.passwordForm.confirm) {
      this.passwordError.set('Please fill in all fields.');
      return;
    }
    if (this.passwordForm.new.length < 8) {
      this.passwordError.set('New password must be at least 8 characters.');
      return;
    }
    if (this.passwordForm.new !== this.passwordForm.confirm) {
      this.passwordError.set('New passwords do not match.');
      return;
    }

    this.savingPassword.set(true);
    this.passwordError.set(null);

    this.profileService.changePassword(this.passwordForm.old, this.passwordForm.new).subscribe({
      next: () => {
        this.savingPassword.set(false);
        this.isChangingPassword.set(false);
        this.passwordSuccess.set(true);
        setTimeout(() => this.passwordSuccess.set(false), 4000);
      },
      error: (err) => {
        this.passwordError.set(err?.error?.message ?? 'Failed to change password. Please try again.');
        this.savingPassword.set(false);
      },
    });
  }
}
