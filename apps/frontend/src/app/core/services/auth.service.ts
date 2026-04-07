import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface User {
  id: number;
  email: string;
  firstname?: string;
  lastname?: string;
  role: string;
  status: string;
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

  getCurrentUserEmail(): string | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.email ?? null;
    } catch {
      return null;
    }
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_KEY);
    this.router.navigate(['/login']);
  }
}
