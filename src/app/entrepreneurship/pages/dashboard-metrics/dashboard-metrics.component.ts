import { Component, inject, OnInit, signal } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthenticationService } from '../../../core/authentication/services/authentication.service';

interface MetricCard {
  label: string;
  value: number;
  icon: string;
  route: string;
}

interface ChartBar {
  label: string;
  value: number;
  color: string;
}

@Component({
  selector: 'app-dashboard-metrics',
  standalone: true,
  imports: [NgFor, NgIf, RouterLink],
  templateUrl: './dashboard-metrics.component.html',
  styleUrl: './dashboard-metrics.component.scss',
})
export class DashboardMetricsComponent implements OnInit {
  readonly authService = inject(AuthenticationService);

  readonly metrics = signal<MetricCard[]>([
    { label: 'Emprendimientos', value: 0, icon: 'pi pi-briefcase', route: '/app/entrepreneurships' },
    { label: 'Eventos', value: 0, icon: 'pi pi-calendar', route: '/app/events' },
    { label: 'Usuarios', value: 0, icon: 'pi pi-users', route: '/app/users' },
    { label: 'Categorías', value: 0, icon: 'pi pi-tags', route: '/app/categories' },
  ]);

  readonly chartData = signal<ChartBar[]>([
    { label: 'Ene', value: 0, color: '#4f46e5' },
    { label: 'Feb', value: 0, color: '#4f46e5' },
    { label: 'Mar', value: 0, color: '#4f46e5' },
    { label: 'Abr', value: 0, color: '#4f46e5' },
    { label: 'May', value: 0, color: '#4f46e5' },
    { label: 'Jun', value: 0, color: '#4f46e5' },
  ]);

  readonly loading = signal(false);

  ngOnInit(): void {
    // TODO: Conectar con servicios reales para obtener métricas
  }
}
