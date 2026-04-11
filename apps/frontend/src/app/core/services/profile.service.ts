import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from './auth.service';
import type { LearningPreferences } from './learning-preferences.service';

interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

export interface UpdateProfilePayload {
  firstname: string;
  lastname: string;
  profileHeadline?: string;
}

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/profile`;

  getProfile(): Observable<User> {
    return this.http.get<ApiResponse<User>>(this.baseUrl).pipe(map((r) => r.data));
  }

  updateProfile(payload: UpdateProfilePayload): Observable<User> {
    return this.http.put<ApiResponse<User>>(this.baseUrl, payload).pipe(map((r) => r.data));
  }

  changePassword(oldPassword: string, newPassword: string): Observable<User> {
    return this.http
      .put<ApiResponse<User>>(`${this.baseUrl}/change-password`, { oldPassword, newPassword })
      .pipe(map((r) => r.data));
  }

  updateLearningPreferences(payload: LearningPreferences): Observable<User> {
    return this.http
      .put<ApiResponse<User>>(`${this.baseUrl}/learning-preferences`, payload)
      .pipe(map((r) => r.data));
  }
}
