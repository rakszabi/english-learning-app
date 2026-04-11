import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { LearningPreferences } from './learning-preferences.service';

export interface User {
  id: number;
  email: string;
  firstname?: string;
  lastname?: string;
  role: string;
  status: string;
  profileHeadline?: string;
  avatarUrl?: string;
  emailVerifiedAt?: string;
  lastLoginAt?: string;
  createdAt?: string;
  learningPreferences?: LearningPreferences;
}

export interface LoginResponse {
  status: string;
  message: string;
  messageCode: string;
  data: {
    data: User;
    jwt: string;
    refresh: string;
  };
}

export interface RegisterResponse {
  status: string;
  message: string;
  messageCode: string;
  data: User;
}

export interface RegisterPayload {
  email: string;
  firstname: string;
  lastname: string;
  password: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly TOKEN_KEY = 'ela_jwt';
  private readonly REFRESH_KEY = 'ela_refresh';

  register(payload: RegisterPayload): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(
      `${environment.apiUrl}/api/profile/registration`,
      payload,
    );
  }

  requestPasswordReset(email: string): Observable<{ status: string; message: string }> {
    return this.http.post<{ status: string; message: string }>(
      `${environment.apiUrl}/api/profile/password-reset`,
      { email },
    );
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${environment.apiUrl}/api/auth/login`, { email, password })
      .pipe(
        tap((res) => {
          localStorage.setItem(this.TOKEN_KEY, res.data.jwt);
          localStorage.setItem(this.REFRESH_KEY, res.data.refresh);
        })
      );
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  private decodeJwtPayload(token: string): Record<string, string> | null {
    try {
      const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      const json = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join(''),
      );
      return JSON.parse(json);
    } catch {
      return null;
    }
  }

  getCurrentUserEmail(): string | null {
    const token = this.getToken();
    if (!token) return null;
    return this.decodeJwtPayload(token)?.['email'] ?? null;
  }

  getCurrentUserDisplayName(): string | null {
    const token = this.getToken();
    if (!token) return null;
    const payload = this.decodeJwtPayload(token);
    if (!payload) return null;
    const first = payload['firstname'] ?? '';
    const last = payload['lastname'] ?? '';
    const full = `${first} ${last}`.trim();
    if (full) return full;
    const prefix = (payload['email'] ?? '').split('@')[0];
    return prefix ? prefix.charAt(0).toUpperCase() + prefix.slice(1) : null;
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_KEY);
    this.router.navigate(['/login']);
  }
}
