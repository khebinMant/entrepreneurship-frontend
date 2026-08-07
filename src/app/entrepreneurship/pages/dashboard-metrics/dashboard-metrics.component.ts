import { Component, inject, OnInit, signal, computed, effect, ElementRef, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import { AuthenticationService } from '../../../core/authentication/services/authentication.service';
import { EntrepreneurshipService } from '../../services/entrepreneurship.service';
import { EventService } from '../../../event/services/event.service';
import { UserService } from '../../../user/services/user.service';
import { ThemeService } from '../../../core/theme/theme.service';
import { APP_ROLE } from '../../../core/constants/app.constants';
import { lastValueFrom } from 'rxjs';
import type { MonthlyActivity, ByType, EventTypeCount, EventVisibilityCount, CategoryCount } from '../../../shared/models/analytics';

Chart.register(...registerables);

interface MetricCard {
  label: string;
  value: number;
  icon: string;
  route: string;
  color: string;
}

@Component({
  selector: 'app-dashboard-metrics',
  standalone: true,
  imports: [RouterLink, DatePipe],
  templateUrl: './dashboard-metrics.component.html',
  styleUrl: './dashboard-metrics.component.scss',
})
export class DashboardMetricsComponent implements OnInit {
  private readonly authService = inject(AuthenticationService);
  private readonly entrepreneurshipService = inject(EntrepreneurshipService);
  private readonly eventService = inject(EventService);
  private readonly userService = inject(UserService);
  private readonly themeService = inject(ThemeService);

  readonly loading = signal(false);
  readonly isAdmin = computed(() => this.authService.hasRole(APP_ROLE.ADMIN) || this.authService.hasRole(APP_ROLE.ADMIN_KEYCLOAK));
  readonly username = computed(() => this.authService.authState().username || 'Usuario');
  readonly greetName = computed(() => {
    const raw = this.authService.authState().username;
    if (!raw) return 'Emprendedor';
    const base = raw.includes('@') ? raw.split('@')[0] : raw;
    const parts = base.split(/[-_.]+/).filter(Boolean);
    if (parts.join('') === base) return base.charAt(0).toUpperCase() + base.slice(1);
    return parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
  });
  readonly userId = computed(() => this.authService.backendUserId());

  readonly metrics = signal<MetricCard[]>([]);
  readonly monthLabels = signal<string[]>(['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']);

  readonly entrepMonthlyData = signal<number[]>(new Array(12).fill(0));
  readonly eventMonthlyData = signal<number[]>(new Array(12).fill(0));

  readonly byTypeData = signal<ByType | null>(null);
  readonly byCategory = signal<CategoryCount[]>([]);
  readonly eventByType = signal<EventTypeCount[]>([]);
  readonly eventByVisibility = signal<EventVisibilityCount[]>([]);
  readonly upcomingEvents = signal(0);
  readonly pastEvents = signal(0);
  readonly totalInvitationsSent = signal(0);
  readonly totalParticipants = signal(0);

  readonly recentEntrepreneurships = signal<any[]>([]);
  readonly recentEvents = signal<any[]>([]);

  readonly monthlyChartCanvas = viewChild<ElementRef<HTMLCanvasElement>>('monthlyChart');
  readonly typeChartCanvas = viewChild<ElementRef<HTMLCanvasElement>>('typeChart');
  readonly categoryChartCanvas = viewChild<ElementRef<HTMLCanvasElement>>('categoryChart');
  readonly eventTypeChartCanvas = viewChild<ElementRef<HTMLCanvasElement>>('eventTypeChart');
  readonly eventVisChartCanvas = viewChild<ElementRef<HTMLCanvasElement>>('eventVisChart');

  private monthlyChart: Chart | null = null;
  private typeChart: Chart | null = null;
  private categoryChart: Chart | null = null;
  private eventTypeChart: Chart | null = null;
  private eventVisChart: Chart | null = null;

  private cssVar(name: string, fallback: string): string {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
  }

  private palette(): { primary: string; secondary: string; success: string; warning: string; error: string; text: string; grid: string } {
    return {
      primary: this.cssVar('--color-primary', '#2563eb'),
      secondary: this.cssVar('--color-secondary', '#0891b2'),
      success: this.cssVar('--color-success', '#059669'),
      warning: this.cssVar('--color-warning', '#d97706'),
      error: this.cssVar('--color-error', '#dc2626'),
      text: this.cssVar('--color-text-secondary', '#475569'),
      grid: this.cssVar('--color-border', '#e2e8f0'),
    };
  }

  private legendLabels(palette: { primary: string; secondary: string; success: string; warning: string; error: string; text: string; grid: string }): { position: 'top' | 'right'; labels: { boxWidth: number; padding: number; color: string; font: { size: number } } } {
    return { position: 'right', labels: { boxWidth: 12, padding: 8, color: palette.text, font: { size: 11 } } };
  }

  constructor() {
    effect(() => {
      this.themeService.isDark();
      if (!this.loading()) {
        setTimeout(() => {
          this.renderMonthlyChart();
          this.renderTypeChart();
          this.renderCategoryChart();
          this.renderEventTypeChart();
          this.renderEventVisChart();
        });
      }
    });
  }

  async ngOnInit(): Promise<void> {
    this.loading.set(true);
    try {
      if (this.isAdmin()) {
        await this.loadAdminDashboard();
      } else {
        await this.loadUserDashboard();
      }
    } catch { /* fallback */ }
    finally { this.loading.set(false); }
  }

  private async loadAdminDashboard(): Promise<void> {
    const [entrepAnalytics, eventAnalytics, users] = await Promise.all([
      lastValueFrom(this.entrepreneurshipService.getAnalyticsGlobal()).catch(() => null),
      lastValueFrom(this.eventService.getAnalyticsGlobal()).catch(() => null),
      lastValueFrom(this.userService.getAll()).catch(() => []),
    ]);

    this.metrics.set([
      { label: 'Emprendimientos', value: entrepAnalytics?.totalEntrepreneurships ?? 0, icon: 'pi pi-briefcase', route: '/app/entrepreneurships', color: '#2563eb' },
      { label: 'Eventos', value: eventAnalytics?.totalEvents ?? 0, icon: 'pi pi-calendar', route: '/app/events', color: '#0891b2' },
      { label: 'Usuarios', value: Array.isArray(users) ? users.length : 0, icon: 'pi pi-users', route: '/app/users', color: '#059669' },
      { label: 'Invitaciones', value: eventAnalytics?.totalInvitationsSent ?? 0, icon: 'pi pi-send', route: '/app/events', color: '#d97706' },
    ]);

    this.buildMonthlyChart(entrepAnalytics?.monthlyActivity, eventAnalytics?.monthlyActivity);
    this.buildTypeChart(entrepAnalytics?.byType);
    this.byCategory.set(entrepAnalytics?.byCategory ?? []);

    this.eventByType.set(eventAnalytics?.byType?.filter((t: EventTypeCount) => !isNaN(Number(t.id))) ?? []);
    this.eventByVisibility.set(eventAnalytics?.byVisibility?.filter((v: EventVisibilityCount) => !isNaN(Number(v.id))) ?? []);
    this.upcomingEvents.set(eventAnalytics?.upcomingEvents ?? 0);
    this.pastEvents.set(eventAnalytics?.pastEvents ?? 0);
    this.totalInvitationsSent.set(eventAnalytics?.totalInvitationsSent ?? 0);
    this.totalParticipants.set(eventAnalytics?.totalParticipants ?? 0);

    this.recentEntrepreneurships.set(entrepAnalytics?.recentEntrepreneurships ?? []);
    this.recentEvents.set(eventAnalytics?.recentEvents ?? []);
  }

  private async loadUserDashboard(): Promise<void> {
    const uid = this.userId();
    if (!uid) return;

    const [entrepStats, eventStats] = await Promise.all([
      lastValueFrom(this.entrepreneurshipService.getStatsByUser(uid)).catch(() => null),
      lastValueFrom(this.eventService.getStatsByCreator(uid)).catch(() => null),
    ]);

    this.metrics.set([
      { label: 'Mis Emprendimientos', value: entrepStats?.totalEntrepreneurships ?? 0, icon: 'pi pi-briefcase', route: '/app/entrepreneurships', color: '#2563eb' },
      { label: 'Mis Eventos', value: eventStats?.totalEvents ?? 0, icon: 'pi pi-calendar', route: '/app/events', color: '#0891b2' },
      { label: 'Invitaciones', value: eventStats?.totalInvitationsSent ?? 0, icon: 'pi pi-send', route: '/app/events', color: '#059669' },
      { label: 'Participantes', value: eventStats?.totalParticipants ?? 0, icon: 'pi pi-users', route: '/app/events', color: '#d97706' },
    ]);

    this.buildMonthlyChart(undefined, undefined);
    this.buildTypeChart(entrepStats?.byType);
    this.byCategory.set(entrepStats?.byCategory ?? []);

    this.eventByType.set(eventStats?.byType?.filter((t: EventTypeCount) => !isNaN(Number(t.id))) ?? []);
    this.eventByVisibility.set(eventStats?.byVisibility?.filter((v: EventVisibilityCount) => !isNaN(Number(v.id))) ?? []);
    this.upcomingEvents.set(eventStats?.upcomingEvents ?? 0);
    this.pastEvents.set(eventStats?.pastEvents ?? 0);
    this.totalInvitationsSent.set(eventStats?.totalInvitationsSent ?? 0);
    this.totalParticipants.set(eventStats?.totalParticipants ?? 0);

    this.recentEntrepreneurships.set(entrepStats?.recentEntrepreneurships ?? []);
    this.recentEvents.set(eventStats?.recentEvents ?? []);
  }

  private buildMonthlyChart(entrepActivity: MonthlyActivity[] | undefined, eventActivity: MonthlyActivity[] | undefined): void {
    const byMonthEntrep: Record<number, number> = {};
    const byMonthEvent: Record<number, number> = {};
    for (const a of entrepActivity ?? []) byMonthEntrep[a.month] = (byMonthEntrep[a.month] || 0) + a.count;
    for (const a of eventActivity ?? []) byMonthEvent[a.month] = (byMonthEvent[a.month] || 0) + a.count;
    const eData: number[] = [];
    const evData: number[] = [];
    for (let m = 1; m <= 12; m++) {
      eData.push(byMonthEntrep[m] || 0);
      evData.push(byMonthEvent[m] || 0);
    }
    this.entrepMonthlyData.set(eData);
    this.eventMonthlyData.set(evData);
  }

  private buildTypeChart(byType: ByType | undefined): void {
    this.byTypeData.set(byType ?? null);
  }

  totalEventsPercent(a: number, b: number): number {
    const total = a + b;
    return total ? Math.round((a / total) * 100) : 0;
  }

  participationPercent(a: number, b: number): number {
    const total = a + b;
    return total ? Math.round((a / total) * 100) : 0;
  }

  participationRate(): number {
    const total = this.totalInvitationsSent();
    return total ? Math.round((this.totalParticipants() / total) * 100) : 0;
  }

  typePercent(key: 'physical' | 'digital' | 'both'): number {
    const bt = this.byTypeData();
    if (!bt) return 0;
    const total = bt.physical + bt.digital + bt.both;
    return total ? Math.round((bt[key] / total) * 100) : 0;
  }

  typeTotal(): number {
    const bt = this.byTypeData();
    return bt ? bt.physical + bt.digital + bt.both : 0;
  }

  private renderMonthlyChart(): void {
    const canvasEl = this.monthlyChartCanvas();
    if (!canvasEl?.nativeElement) return;
    this.monthlyChart?.destroy();
    const palette = this.palette();
    this.monthlyChart = new Chart(canvasEl.nativeElement, {
      type: 'bar',
      data: {
        labels: this.monthLabels(),
        datasets: [
          {
            label: 'Emprendimientos',
            data: this.entrepMonthlyData(),
            backgroundColor: palette.primary,
            borderRadius: 4,
          },
          {
            label: 'Eventos',
            data: this.eventMonthlyData(),
            backgroundColor: palette.secondary,
            borderRadius: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top', labels: { boxWidth: 12, padding: 12, color: palette.text, font: { size: 11 } } },
        },
        scales: {
          y: { beginAtZero: true, ticks: { stepSize: 1, color: palette.text }, grid: { color: palette.grid } },
          x: { ticks: { color: palette.text }, grid: { display: false } },
        },
      },
    });
  }

  private renderTypeChart(): void {
    const canvasEl = this.typeChartCanvas();
    if (!canvasEl?.nativeElement) return;
    this.typeChart?.destroy();
    const bt = this.byTypeData();
    if (!bt) return;
    const palette = this.palette();
    const labels: string[] = [];
    const data: number[] = [];
    const colors: string[] = [];
    if (bt.physical) { labels.push('Físico'); data.push(bt.physical); colors.push(palette.primary); }
    if (bt.digital) { labels.push('Digital'); data.push(bt.digital); colors.push(palette.secondary); }
    if (bt.both) { labels.push('Ambos'); data.push(bt.both); colors.push(palette.success); }
    if (!data.length) return;
    this.typeChart = new Chart(canvasEl.nativeElement, {
      type: 'doughnut',
      data: { labels, datasets: [{ data, backgroundColor: colors }] },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: this.legendLabels(palette) },
      },
    });
  }

  private renderCategoryChart(): void {
    const canvasEl = this.categoryChartCanvas();
    if (!canvasEl?.nativeElement) return;
    this.categoryChart?.destroy();
    const items = this.byCategory();
    if (!items.length) return;
    const palette = this.palette();
    const colors = [palette.primary, palette.secondary, palette.success, palette.warning, palette.error, '#7c3aed', '#db2777', '#ea580c', '#14b8a6', '#f97316'];
    this.categoryChart = new Chart(canvasEl.nativeElement, {
      type: 'pie',
      data: {
        labels: items.map(i => i.categoryName),
        datasets: [{ data: items.map(i => i.count), backgroundColor: items.map((_, i) => colors[i % colors.length]) }],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: this.legendLabels(palette),
        },
      },
    });
  }

  private renderEventTypeChart(): void {
    const canvasEl = this.eventTypeChartCanvas();
    if (!canvasEl?.nativeElement) return;
    this.eventTypeChart?.destroy();
    const items = this.eventByType();
    if (!items.length) return;
    const palette = this.palette();
    const labels = items.map(i => {
      if (i.name === 'Physical Event') return 'Presencial';
      if (i.name === 'Virtual Event') return 'Virtual';
      return i.name;
    });
    const data = items.map(i => i.count);
    const colors = [palette.primary, palette.secondary, palette.warning];
    this.eventTypeChart = new Chart(canvasEl.nativeElement, {
      type: 'pie',
      data: { labels, datasets: [{ data, backgroundColor: colors.slice(0, labels.length) }] },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: this.legendLabels(palette) },
      },
    });
  }

  private renderEventVisChart(): void {
    const canvasEl = this.eventVisChartCanvas();
    if (!canvasEl?.nativeElement) return;
    this.eventVisChart?.destroy();
    const items = this.eventByVisibility();
    if (!items.length) return;
    const palette = this.palette();
    const labels = items.map(i => {
      if (i.name === 'Public') return 'Público';
      if (i.name === 'Private') return 'Privado';
      return i.name;
    });
    const data = items.map(i => i.count);
    const colors = [palette.success, palette.error, palette.warning];
    this.eventVisChart = new Chart(canvasEl.nativeElement, {
      type: 'pie',
      data: { labels, datasets: [{ data, backgroundColor: colors.slice(0, labels.length) }] },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: this.legendLabels(palette) },
      },
    });
  }

  exportMetrics(): void {
    const rows: (string | number)[][] = [];

    rows.push(['Emprendia — Métricas del panel']);
    rows.push(['Generado', new Date().toLocaleString('es-EC')]);
    rows.push([]);

    rows.push(['Resumen']);
    rows.push(['Métrica', 'Valor']);
    for (const m of this.metrics()) rows.push([m.label, m.value]);
    rows.push([]);

    rows.push(['Actividad mensual']);
    rows.push(['Mes', 'Emprendimientos', 'Eventos']);
    this.monthLabels().forEach((label, i) => {
      rows.push([label, this.entrepMonthlyData()[i] ?? 0, this.eventMonthlyData()[i] ?? 0]);
    });
    rows.push([]);

    const bt = this.byTypeData();
    if (bt) {
      rows.push(['Tipo de emprendimiento', 'Cantidad']);
      rows.push(['Físico', bt.physical]);
      rows.push(['Digital', bt.digital]);
      rows.push(['Ambos', bt.both]);
      rows.push([]);
    }

    if (this.byCategory().length) {
      rows.push(['Emprendimientos por categoría']);
      rows.push(['Categoría', 'Cantidad']);
      for (const c of this.byCategory()) rows.push([c.categoryName, c.count]);
      rows.push([]);
    }

    if (this.eventByType().length) {
      rows.push(['Eventos por tipo']);
      rows.push(['Tipo', 'Cantidad']);
      for (const t of this.eventByType()) {
        rows.push([t.name === 'Physical Event' ? 'Presencial' : t.name === 'Virtual Event' ? 'Virtual' : t.name, t.count]);
      }
      rows.push([]);
    }

    if (this.eventByVisibility().length) {
      rows.push(['Eventos por visibilidad']);
      rows.push(['Visibilidad', 'Cantidad']);
      for (const v of this.eventByVisibility()) {
        rows.push([v.name === 'Public' ? 'Público' : v.name === 'Private' ? 'Privado' : v.name, v.count]);
      }
      rows.push([]);
    }

    rows.push(['Eventos próximos', this.upcomingEvents()]);
    rows.push(['Eventos pasados', this.pastEvents()]);
    rows.push(['Invitaciones enviadas', this.totalInvitationsSent()]);
    rows.push(['Participantes', this.totalParticipants()]);
    rows.push(['Tasa de participación', this.participationRate() + '%']);

    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `emprendia-metricas-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
