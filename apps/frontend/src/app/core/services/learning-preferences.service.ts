import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ProfileService } from './profile.service';
import type { User } from './auth.service';

export type LearningLevelId = 1 | 2 | 3 | 4 | 5;

export interface LearningLevelOption {
  id: LearningLevelId;
  name: string;
  summary: string;
}

export interface LearningPreferences {
  levelId: LearningLevelId | null;
  interests: string[];
  dailyNewDialogues: number | null;
  dailyPracticeSessions: number | null;
}

export const LEARNING_LEVELS: readonly LearningLevelOption[] = [
  {
    id: 1,
    name: 'Beginner',
    summary: 'Roughly A1–A2: greetings, simple phrases, very familiar topics.',
  },
  {
    id: 2,
    name: 'Elementary',
    summary: 'Roughly A2–B1: everyday situations, short exchanges, basic grammar.',
  },
  {
    id: 3,
    name: 'Intermediate',
    summary: 'Roughly B1–B2: broader vocabulary, opinions, natural conversation pace.',
  },
  {
    id: 4,
    name: 'Upper intermediate',
    summary: 'Roughly B2–C1: nuanced language, longer turns, faster listening.',
  },
  {
    id: 5,
    name: 'Advanced',
    summary: 'Roughly C1+: idioms, subtle tone, near-native complexity.',
  },
] as const;

export const SUGGESTED_INTERESTS: readonly string[] = [
  'Travel',
  'Business',
  'Daily life',
  'Food & drink',
  'Health & fitness',
  'Technology',
  'Culture & arts',
  'Entertainment',
];

const defaultPrefs: LearningPreferences = {
  levelId: null,
  interests: [],
  dailyNewDialogues: null,
  dailyPracticeSessions: null,
};

function normalizeIncoming(raw: unknown): LearningPreferences {
  if (!raw || typeof raw !== 'object') {
    return { ...defaultPrefs };
  }
  const o = raw as Record<string, unknown>;
  const lid = o['levelId'];
  const levelId =
    lid === 1 || lid === 2 || lid === 3 || lid === 4 || lid === 5 ? lid : null;
  const interestsRaw = o['interests'];
  const interests = Array.isArray(interestsRaw)
    ? [...new Set(interestsRaw.map((s) => String(s).trim()).filter(Boolean))]
    : [];
  const dn = o['dailyNewDialogues'];
  const dp = o['dailyPracticeSessions'];
  return {
    levelId,
    interests,
    dailyNewDialogues:
      typeof dn === 'number' && dn >= 0 ? Math.min(20, Math.floor(dn)) : null,
    dailyPracticeSessions:
      typeof dp === 'number' && dp >= 0 ? Math.min(20, Math.floor(dp)) : null,
  };
}

function normalizeOutgoing(prefs: LearningPreferences): LearningPreferences {
  return {
    levelId: prefs.levelId,
    interests: [...new Set(prefs.interests.map((s) => s.trim()).filter(Boolean))],
    dailyNewDialogues:
      prefs.dailyNewDialogues != null
        ? Math.min(20, Math.max(0, Math.floor(prefs.dailyNewDialogues)))
        : null,
    dailyPracticeSessions:
      prefs.dailyPracticeSessions != null
        ? Math.min(20, Math.max(0, Math.floor(prefs.dailyPracticeSessions)))
        : null,
  };
}

@Injectable({ providedIn: 'root' })
export class LearningPreferencesService {
  private readonly profileService = inject(ProfileService);

  readonly preferences = signal<LearningPreferences>({ ...defaultPrefs });

  /** Call after GET /profile (or any response that includes learningPreferences). */
  hydrateFromUser(learningPreferences: LearningPreferences | undefined | null): void {
    this.preferences.set(normalizeIncoming(learningPreferences ?? null));
  }

  /** PUT /profile/learning-preferences; updates local signal from response. */
  saveToServer(prefs: LearningPreferences): Observable<User> {
    const body = normalizeOutgoing(prefs);
    return this.profileService.updateLearningPreferences(body).pipe(
      tap((user) => {
        this.hydrateFromUser(user.learningPreferences);
      })
    );
  }
}
