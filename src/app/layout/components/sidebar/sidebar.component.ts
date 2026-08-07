import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgClass } from '@angular/common';
import { SidebarStateService } from '../../../core/theme/sidebar-state.service';
import { HasRoleDirective } from '../../../core/permission/directives/has-role.directive';

interface NavItem {
  label: string;
  route?: string;
  icon: string;
  children?: NavItem[];
  adminOnly?: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgClass, HasRoleDirective],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  readonly sidebarState = inject(SidebarStateService);

  readonly navItems: NavItem[] = [
    {
      label: 'Crear',
      icon: 'pi pi-plus',
      children: [
        { label: 'Nuevo Evento', route: '/app/events/create', icon: 'pi pi-calendar-plus' },
        { label: 'Nuevo Emprendimiento', route: '/app/entrepreneurships/create', icon: 'pi pi-plus' },
      ],
    },
    { label: 'Panel administración', route: '/app/dashboard', icon: 'pi pi-chart-pie' },
    { label: 'Mis Emprendimientos', route: '/app/entrepreneurships', icon: 'pi pi-briefcase' },
    {
      label: 'Mis Eventos',
      icon: 'pi pi-calendar',
      children: [
        { label: 'Eventos', route: '/app/events', icon: 'pi pi-calendar' },
        { label: 'Invitaciones', route: '/app/invitations', icon: 'pi pi-envelope' },
      ],
    },
    { label: 'Perfil', route: '/app/profile', icon: 'pi pi-user' },
    {
      label: 'Configuración del sistema',
      icon: 'pi pi-cog',
      adminOnly: true,
      children: [
        { label: 'Categorías del sistema', route: '/app/categories', icon: 'pi pi-tags' },
        { label: 'Variables del Sistema', route: '/app/catalogues', icon: 'pi pi-book' },
      ],
    }
  ];

  readonly expandedGroup = signal<string | null>(null);
  readonly configLabel = 'Configuración del sistema';

  toggleGroup(label: string): void {
    this.expandedGroup.update(current => current === label ? null : label);
  }

  closeMobile(): void {
    this.sidebarState.closeMobile();
  }
}
