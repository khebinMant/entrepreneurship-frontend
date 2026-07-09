import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgFor, NgClass, NgIf } from '@angular/common';
import { SidebarStateService } from '../../../core/theme/sidebar-state.service';
import { PermissionService } from '../../../core/permission/services/permission.service';
import { HasRoleDirective } from '../../../core/permission/directives/has-role.directive';

interface NavItem {
  label: string;
  route: string;
  icon: string;
  adminOnly?: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgFor, NgClass, NgIf, HasRoleDirective],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  readonly sidebarState = inject(SidebarStateService);
  readonly permissionService = inject(PermissionService);

  readonly navItems: NavItem[] = [
    { label: 'Inicio', route: '/app/dashboard', icon: 'pi pi-home' },
    { label: 'Eventos', route: '/app/events', icon: 'pi pi-calendar' },
    { label: 'Emprendimientos', route: '/app/entrepreneurships', icon: 'pi pi-briefcase' },
    { label: 'Categorías', route: '/app/categories', icon: 'pi pi-tags', adminOnly: true },
    { label: 'Catálogos', route: '/app/catalogues', icon: 'pi pi-book', adminOnly: true },
    { label: 'Perfil', route: '/app/profile', icon: 'pi pi-user' },
  ];
}
