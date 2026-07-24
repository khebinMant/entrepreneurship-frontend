import { Component, inject, OnInit, signal, computed, effect, ElementRef, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import { AuthenticationService } from '../../../core/authentication/services/authentication.service';
import { EntrepreneurshipService } from '../../services/entrepreneurship.service';
import { EventService } from '../../../event/services/event.service';
import { UserService } from '../../../user/services/user.service';
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

  readonly loading = signal(false);
  readonly isAdmin = computed(() => this.authService.hasRole(APP_ROLE.ADMIN) || this.authService.hasRole(APP_ROLE.ADMIN_KEYCLOAK));
  readonly username = computed(() => this.authService.authState().username || 'Usuario');
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

  constructor() {
    effect(() => {
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
      { label: 'Emprendimientos', value: entrepAnalytics?.totalEntrepreneurships ?? 0, icon: 'pi pi-briefcase', route: '/app/entrepreneurships', color: '#4f46e5' },
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
      { label: 'Mis Emprendimientos', value: entrepStats?.totalEntrepreneurships ?? 0, icon: 'pi pi-briefcase', route: '/app/entrepreneurships', color: '#4f46e5' },
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
    this.monthlyChart = new Chart(canvasEl.nativeElement, {
      type: 'bar',
      data: {
        labels: this.monthLabels(),
        datasets: [
          {
            label: 'Emprendimientos',
            data: this.entrepMonthlyData(),
            backgroundColor: '#4f46e5',
            borderRadius: 4,
          },
          {
            label: 'Eventos',
            data: this.eventMonthlyData(),
            backgroundColor: '#0891b2',
            borderRadius: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top', labels: { boxWidth: 12, padding: 12, font: { size: 11 } } },
        },
        scales: {
          y: { beginAtZero: true, ticks: { stepSize: 1 } },
          x: { grid: { display: false } },
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
    const labels: string[] = [];
    const data: number[] = [];
    const colors: string[] = [];
    if (bt.physical) { labels.push('Físico'); data.push(bt.physical); colors.push('#4f46e5'); }
    if (bt.digital) { labels.push('Digital'); data.push(bt.digital); colors.push('#0891b2'); }
    if (bt.both) { labels.push('Ambos'); data.push(bt.both); colors.push('#059669'); }
    if (!data.length) return;
    this.typeChart = new Chart(canvasEl.nativeElement, {
      type: 'doughnut',
      data: { labels, datasets: [{ data, backgroundColor: colors }] },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: 'right', labels: { boxWidth: 12, padding: 8, font: { size: 11 } } } },
      },
    });
  }

  private renderCategoryChart(): void {
    const canvasEl = this.categoryChartCanvas();
    if (!canvasEl?.nativeElement) return;
    this.categoryChart?.destroy();
    const items = this.byCategory();
    if (!items.length) return;
    const colors = ['#4f46e5','#0891b2','#059669','#d97706','#dc2626','#7c3aed','#db2777','#ea580c','#14b8a6','#f97316'];
    this.categoryChart = new Chart(canvasEl.nativeElement, {
      type: 'pie',
      data: {
        labels: items.map(i => i.categoryName),
        datasets: [{ data: items.map(i => i.count), backgroundColor: items.map((_, i) => colors[i % colors.length]) }],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { position: 'right', labels: { boxWidth: 12, padding: 8, font: { size: 11 } } },
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
    const labels = items.map(i => {
      if (i.name === 'Physical Event') return 'Presencial';
      if (i.name === 'Virtual Event') return 'Virtual';
      return i.name;
    });
    const data = items.map(i => i.count);
    const colors = ['#4f46e5', '#0891b2', '#d97706'];
    this.eventTypeChart = new Chart(canvasEl.nativeElement, {
      type: 'pie',
      data: { labels, datasets: [{ data, backgroundColor: colors.slice(0, labels.length) }] },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: 'right', labels: { boxWidth: 12, padding: 8, font: { size: 11 } } } },
      },
    });
  }

  private renderEventVisChart(): void {
    const canvasEl = this.eventVisChartCanvas();
    if (!canvasEl?.nativeElement) return;
    this.eventVisChart?.destroy();
    const items = this.eventByVisibility();
    if (!items.length) return;
    const labels = items.map(i => {
      if (i.name === 'Public') return 'Público';
      if (i.name === 'Private') return 'Privado';
      return i.name;
    });
    const data = items.map(i => i.count);
    const colors = ['#059669', '#dc2626', '#d97706'];
    this.eventVisChart = new Chart(canvasEl.nativeElement, {
      type: 'pie',
      data: { labels, datasets: [{ data, backgroundColor: colors.slice(0, labels.length) }] },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: 'right', labels: { boxWidth: 12, padding: 8, font: { size: 11 } } } },
      },
    });
  }
}
