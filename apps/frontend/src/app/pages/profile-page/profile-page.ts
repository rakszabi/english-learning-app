import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProfileService } from '../../core/services/profile.service';
import { User } from '../../core/services/auth.service';
import {
  LearningPreferencesService,
  LEARNING_LEVELS,
  SUGGESTED_INTERESTS,
  LearningLevelId,
  LearningLevelOption,
} from '../../core/services/learning-preferences.service';
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
  private readonly learningPrefs = inject(LearningPreferencesService);

  protected readonly learningLevels = LEARNING_LEVELS;
  protected readonly suggestedInterests = SUGGESTED_INTERESTS;

  /** Draft UI state for learning preferences (synced from service on load & after save) */
  protected readonly learnLevelId = signal<LearningLevelId | null>(null);
  protected readonly learnInterests = signal<string[]>([]);
  /** Bound with ngModel (0–20 or empty = no target) */
  protected learnDailyNew: number | null = null;
  protected learnDailyPractice: number | null = null;
  protected learnInterestDraft = '';
  protected readonly learnPrefsSuccess = signal(false);
  protected readonly learnPrefsError = signal<string | null>(null);
  protected readonly savingLearnPrefs = signal(false);
  protected readonly isEditingLearnPrefs = signal(false);

  /** Saved snapshot (reactive) — shown in view mode */
  protected readonly learnPrefsSaved = computed(() => this.learningPrefs.preferences());

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
        this.learningPrefs.hydrateFromUser(user.learningPreferences);
        this.syncLearningPrefsFromService();
        this.loading.set(false);
      },
      error: () => {
        this.loadError.set('Failed to load profile. Please try again.');
        this.loading.set(false);
      },
    });
  }

  private syncLearningPrefsFromService(): void {
    const p = this.learningPrefs.preferences();
    this.learnLevelId.set(p.levelId);
    this.learnInterests.set([...p.interests]);
    this.learnDailyNew = p.dailyNewDialogues;
    this.learnDailyPractice = p.dailyPracticeSessions;
  }

  protected selectLevel(id: LearningLevelId): void {
    this.learnLevelId.set(id);
  }

  protected clearLearningLevel(): void {
    this.learnLevelId.set(null);
  }

  protected toggleInterest(tag: string): void {
    const t = tag.trim();
    if (!t) return;
    const list = this.learnInterests();
    const lower = t.toLowerCase();
    const exists = list.some((x) => x.toLowerCase() === lower);
    this.learnInterests.set(
      exists ? list.filter((x) => x.toLowerCase() !== lower) : [...list, t]
    );
  }

  protected interestSelected(tag: string): boolean {
    return this.learnInterests().some((x) => x.toLowerCase() === tag.toLowerCase());
  }

  protected addCustomInterest(): void {
    const t = this.learnInterestDraft.trim();
    if (!t) return;
    const list = this.learnInterests();
    if (list.some((x) => x.toLowerCase() === t.toLowerCase())) {
      this.learnInterestDraft = '';
      return;
    }
    this.learnInterests.set([...list, t]);
    this.learnInterestDraft = '';
  }

  protected levelOption(id: LearningLevelId | null): LearningLevelOption | null {
    if (id == null) return null;
    return LEARNING_LEVELS.find((l) => l.id === id) ?? null;
  }

  protected startEditLearnPrefs(): void {
    this.syncLearningPrefsFromService();
    this.learnInterestDraft = '';
    this.learnPrefsSuccess.set(false);
    this.learnPrefsError.set(null);
    this.isEditingLearnPrefs.set(true);
  }

  protected cancelEditLearnPrefs(): void {
    this.syncLearningPrefsFromService();
    this.learnPrefsError.set(null);
    this.isEditingLearnPrefs.set(false);
  }

  protected saveLearningPreferences(): void {
    if (this.savingLearnPrefs()) return;
    this.savingLearnPrefs.set(true);
    this.learnPrefsError.set(null);

    this.learningPrefs
      .saveToServer({
        levelId: this.learnLevelId(),
        interests: this.learnInterests(),
        dailyNewDialogues: this.learnDailyNew,
        dailyPracticeSessions: this.learnDailyPractice,
      })
      .subscribe({
        next: (user) => {
          this.profile.set(user);
          this.syncLearningPrefsFromService();
          this.savingLearnPrefs.set(false);
          this.isEditingLearnPrefs.set(false);
          this.learnPrefsSuccess.set(true);
          setTimeout(() => this.learnPrefsSuccess.set(false), 3500);
        },
        error: (err) => {
          this.savingLearnPrefs.set(false);
          this.learnPrefsError.set(
            err?.error?.message ?? 'Failed to save learning preferences. Please try again.'
          );
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
          this.learningPrefs.hydrateFromUser(user.learningPreferences);
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
      next: (user) => {
        this.profile.set(user);
        this.learningPrefs.hydrateFromUser(user.learningPreferences);
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
