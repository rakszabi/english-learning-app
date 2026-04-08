import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DialogueItem {
  id: number;
  topic: string;
  createdAt: string;
}

export interface PracticedDialogueItem {
  id: number;
  topic: string;
  createdAt: string;
  latestPractice: {
    score: 'EASY' | 'MEDIUM' | 'HARD';
    learningDate: string;
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
