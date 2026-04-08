import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DailyActivity {
  date: string;      // 'YYYY-MM-DD'
  newCount: number;
  reviewCount: number;
}

interface ApiResponse<T> {
  status: string;
  data: T;
}

@Injectable({ providedIn: 'root' })
export class StatsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/stats`;

  getDailyActivity(days = 30): Observable<DailyActivity[]> {
    const params = new HttpParams().set('days', days.toString());
    return this.http
      .get<ApiResponse<DailyActivity[]>>(`${this.baseUrl}/daily-activity`, { params })
      .pipe(map((res) => res.data));
  }
}
