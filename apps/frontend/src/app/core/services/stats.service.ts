import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DailyActivity {
  date: string;
  newCount: number;
  reviewCount: number;
}

export interface GoalInsight {
  target: number;
  done: number;
  remaining: number;
  met: boolean;
  percent: number;
}

export interface DashboardGoals {
  dailyNewDialogues: number | null;
  dailyPracticeSessions: number | null;
}

export interface TodayProgress {
  date: string;
  newCount: number;
  reviewCount: number;
  totalSessions: number;
}

export interface DashboardInsights {
  newDialogues: GoalInsight | null;
  practiceSessions: GoalInsight | null;
  weeklyAvgNew: number;
  weeklyAvgSessions: number;
  weekOnTrackNew: boolean | null;
  weekOnTrackPractice: boolean | null;
}

export interface DashboardPayload {
  series: DailyActivity[];
  goals: DashboardGoals;
  today: TodayProgress;
  insights: DashboardInsights;
}

interface ApiResponse<T> {
  status: string;
  data: T;
}

@Injectable({ providedIn: 'root' })
export class StatsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/stats`;

  getDashboard(days = 30): Observable<DashboardPayload> {
    const params = new HttpParams().set('days', days.toString());
    return this.http
      .get<ApiResponse<DashboardPayload>>(`${this.baseUrl}/daily-activity`, { params })
      .pipe(map((res) => res.data));
  }
}
