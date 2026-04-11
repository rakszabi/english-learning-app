import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DialogueItem {
  id: number;
  topic: string;
  createdAt: string;
  practiced: false;
  practiceCount: 0;
}

export interface PracticedDialogueScoreBreakdown {
  EASY: number;
  MEDIUM: number;
  HARD: number;
}

export interface PracticedDialogueItem {
  id: number;
  topic: string;
  createdAt: string;
  practiced: true;
  practiceCount: number;
  latestPractice: {
    score: 'EASY' | 'MEDIUM' | 'HARD';
    learningDate: string;
  };
  /** Rounded mean of session scores (EASY=3, MEDIUM=2, HARD=1). */
  averageScore: 'EASY' | 'MEDIUM' | 'HARD';
  scoreBreakdown: PracticedDialogueScoreBreakdown;
}

export interface DialogueLine {
  speaker: 'A' | 'B';
  en: string;
  hu: string;
}

export interface DialogueDetail {
  id: number;
  topic: string;
  createdAt: string;
  dialogJson: {
    topic: string;
    lines: DialogueLine[];
  };
}

interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

@Injectable({ providedIn: 'root' })
export class DialogueService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/dialogue`;

  getUnpracticed(): Observable<DialogueItem[]> {
    return this.http
      .get<ApiResponse<DialogueItem[]>>(`${this.baseUrl}/unpracticed`)
      .pipe(map((res) => res.data));
  }

  getPracticed(): Observable<PracticedDialogueItem[]> {
    return this.http
      .get<ApiResponse<PracticedDialogueItem[]>>(`${this.baseUrl}/practiced`)
      .pipe(map((res) => res.data));
  }

  getNextForPractice(): Observable<DialogueDetail> {
    return this.http
      .get<ApiResponse<DialogueDetail>>(`${environment.apiUrl}/api/dialogue-practice/review`)
      .pipe(map((res) => res.data));
  }

  submitPractice(dialogueId: number, score: 'EASY' | 'MEDIUM' | 'HARD'): Observable<unknown> {
    return this.http.post(`${environment.apiUrl}/api/dialogue-practice`, { dialogueId, score });
  }

  getById(id: string | number): Observable<DialogueDetail> {
    return this.http
      .get<ApiResponse<DialogueDetail>>(`${this.baseUrl}/${id}`)
      .pipe(map((res) => res.data));
  }

  generateDialogue(topic: string): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/generate`, { topic });
  }

  generateTopics(count: number, unique: boolean): Observable<string[]> {
    const params = new HttpParams()
      .set('count', count.toString())
      .set('unique', unique.toString());
    return this.http
      .get<ApiResponse<string[]>>(`${this.baseUrl}/topics/generate`, { params })
      .pipe(map((res) => res.data));
  }
}
