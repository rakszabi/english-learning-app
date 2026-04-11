import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  NgApexchartsModule,
  ApexAnnotations,
  ApexOptions,
  YAxisAnnotations,
} from 'ng-apexcharts';
import { StatsService, DailyActivity, DashboardPayload } from '../../core/services/stats.service';

interface StatCard {
  label: string;
  value: number;
  sub?: string;
  accent: 'indigo' | 'emerald' | 'amber' | 'slate';
}

@Component({
  selector: 'app-dashboard-page',
  imports: [NgApexchartsModule, RouterLink],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.scss',
})
export class DashboardPage implements OnInit {
  private readonly statsService = inject(StatsService);

  protected readonly loading = signal(true);
  protected readonly error = signal(false);
  protected readonly payload = signal<DashboardPayload | null>(null);
  protected readonly selectedDays = signal<30 | 14 | 7>(30);

  protected readonly activity = computed(() => this.payload()?.series ?? []);

  protected readonly goals = computed(
    () =>
      this.payload()?.goals ?? {
        dailyNewDialogues: null,
        dailyPracticeSessions: null,
      }
  );

  protected readonly today = computed(() => this.payload()?.today ?? null);

  protected readonly insights = computed(() => this.payload()?.insights ?? null);

  protected readonly hasGoals = computed(() => {
    const g = this.goals();
    return (
      (g.dailyNewDialogues != null && g.dailyNewDialogues > 0) ||
      (g.dailyPracticeSessions != null && g.dailyPracticeSessions > 0)
    );
  });

  protected readonly filtered = computed(() => {
    const days = this.selectedDays();
    const all = this.activity();
    return all.slice(-days);
  });

  protected readonly cards = computed<StatCard[]>(() => {
    const data = this.filtered();
    const totalNew = data.reduce((s, d) => s + d.newCount, 0);
    const totalReview = data.reduce((s, d) => s + d.reviewCount, 0);
    const activeDays = data.filter((d) => d.newCount + d.reviewCount > 0).length;
    const streak = this.calcStreak(data);
    return [
      { label: 'Total sessions', value: totalNew + totalReview, accent: 'slate' },
      { label: 'New dialogues', value: totalNew, sub: 'learned', accent: 'indigo' },
      { label: 'Reviews', value: totalReview, sub: 'completed', accent: 'emerald' },
      { label: 'Active days', value: activeDays, sub: `of ${this.selectedDays()}`, accent: 'amber' },
      { label: 'Current streak', value: streak, sub: streak === 1 ? 'day' : 'days', accent: 'indigo' },
    ];
  });

  protected readonly chartOptions = computed<ApexOptions>(() => {
    const data = this.filtered();
    const g = this.goals();
    const categories = data.map((d) => this.formatLabel(d.date));
    const newSeries = data.map((d) => d.newCount);
    const reviewSeries = data.map((d) => d.reviewCount);

    const totals = data.map((d) => d.newCount + d.reviewCount);
    const peak = totals.length ? Math.max(...totals) : 0;
    const goalCeiling = Math.max(
      g.dailyNewDialogues ?? 0,
      g.dailyPracticeSessions ?? 0,
      peak,
      1
    );
    const yMax = Math.max(4, Math.ceil(goalCeiling * 1.12));

    const yaxisAnn: YAxisAnnotations[] = [];
    if (g.dailyNewDialogues != null && g.dailyNewDialogues > 0) {
      yaxisAnn.push({
        y: g.dailyNewDialogues,
        borderColor: '#818cf8',
        strokeDashArray: 5,
        borderWidth: 2,
        label: {
          text: `New goal ${g.dailyNewDialogues}`,
          style: {
            background: '#eef2ff',
            color: '#3730a3',
            fontSize: '10px',
            fontWeight: 600,
            padding: { left: 6, right: 6, top: 2, bottom: 2 },
          },
        },
      });
    }
    if (g.dailyPracticeSessions != null && g.dailyPracticeSessions > 0) {
      yaxisAnn.push({
        y: g.dailyPracticeSessions,
        borderColor: '#f59e0b',
        strokeDashArray: 5,
        borderWidth: 2,
        label: {
          text: `Sessions goal ${g.dailyPracticeSessions}`,
          style: {
            background: '#fffbeb',
            color: '#b45309',
            fontSize: '10px',
            fontWeight: 600,
            padding: { left: 6, right: 6, top: 2, bottom: 2 },
          },
        },
      });
    }

    return {
      series: [
        { name: 'New', data: newSeries },
        { name: 'Review', data: reviewSeries },
      ],
      chart: {
        type: 'bar',
        height: 280,
        stacked: true,
        toolbar: { show: false },
        animations: { enabled: true, speed: 400 },
        fontFamily: 'inherit',
        background: 'transparent',
        sparkline: { enabled: false },
      },
      plotOptions: {
        bar: {
          columnWidth: '52%',
          borderRadius: 4,
          borderRadiusApplication: 'end',
          borderRadiusWhenStacked: 'last',
        },
      },
      colors: ['#4f46e5', '#10b981'],
      dataLabels: { enabled: false },
      stroke: { show: false },
      annotations: { yaxis: yaxisAnn },
      grid: {
        borderColor: 'rgba(0,0,0,0.06)',
        strokeDashArray: 4,
        xaxis: { lines: { show: false } },
        yaxis: { lines: { show: true } },
        padding: { left: 0, right: 0 },
      },
      xaxis: {
        categories,
        axisBorder: { show: false },
        axisTicks: { show: false },
        labels: {
          style: { colors: '#94a3b8', fontSize: '11px', fontFamily: 'inherit' },
          rotate: -35,
          rotateAlways: this.selectedDays() === 30,
        },
        tooltip: { enabled: false },
      },
      yaxis: {
        min: 0,
        max: yMax,
        labels: {
          style: { colors: '#94a3b8', fontSize: '11px', fontFamily: 'inherit' },
          formatter: (v: number) => (Number.isInteger(v) ? String(v) : ''),
        },
      },
      tooltip: {
        theme: 'light',
        shared: true,
        intersect: false,
        style: { fontFamily: 'inherit', fontSize: '13px' },
        x: { show: true },
        y: { formatter: (v: number) => `${v} session${v !== 1 ? 's' : ''}` },
      },
      legend: {
        show: true,
        position: 'top',
        horizontalAlign: 'right',
        fontSize: '12px',
        fontFamily: 'inherit',
        fontWeight: 500,
        labels: { colors: '#64748b' },
        markers: { size: 8, shape: 'circle' },
        itemMargin: { horizontal: 12 },
      },
      fill: { opacity: 1 },
      states: {
        hover: { filter: { type: 'lighten', value: 0.08 } },
        active: { filter: { type: 'darken', value: 0.1 } },
      },
    };
  });

  /** Always defined so `apx-chart` [annotations] input type-checks. */
  protected readonly chartAnnotations = computed(
    (): ApexAnnotations => this.chartOptions().annotations ?? { yaxis: [] }
  );

  ngOnInit(): void {
    this.load();
  }

  protected setDays(d: number): void {
    this.selectedDays.set(d as 7 | 14 | 30);
  }

  private load(): void {
    this.loading.set(true);
    this.error.set(false);
    this.statsService.getDashboard(30).subscribe({
      next: (data) => {
        this.payload.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }

  private calcStreak(data: DailyActivity[]): number {
    // Walk backwards from today
    let streak = 0;
    for (let i = data.length - 1; i >= 0; i--) {
      if (data[i].newCount + data[i].reviewCount > 0) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }

  private formatLabel(dateStr: string): string {
    const [, month, day] = dateStr.split('-');
    return `${parseInt(month, 10)}/${parseInt(day, 10)}`;
  }
}
