import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgFor } from '@angular/common';

interface NavItem {
  label: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgFor],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  readonly navItems: NavItem[] = [
    { label: 'Dashboard', route: '/app/dashboard', icon: 'dashboard' },
    { label: 'Emprendimientos', route: '/app/entrepreneurships', icon: 'business' },
    { label: 'Eventos', route: '/app/events', icon: 'event' },
    { label: 'Catálogos', route: '/app/catalogues', icon: 'catalog' },
    { label: 'Perfil', route: '/app/profile', icon: 'person' },
  ];
}
