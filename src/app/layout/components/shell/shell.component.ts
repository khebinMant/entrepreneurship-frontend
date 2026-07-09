import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgClass } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { FooterComponent } from '../footer/footer.component';
import { SidebarStateService } from '../../../core/theme/sidebar-state.service';
import { SessionTimeoutService } from '../../../core/authentication/services/session-timeout.service';
import { SessionExpiredModalComponent } from '../../../core/authentication/components/session-expired-modal.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, NgClass, HeaderComponent, SidebarComponent, FooterComponent, SessionExpiredModalComponent],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss',
})
export class ShellComponent implements OnInit {
  readonly sidebarState = inject(SidebarStateService);
  private readonly sessionTimeout = inject(SessionTimeoutService);

  ngOnInit(): void {
    this.sessionTimeout.configure(30);
    this.sessionTimeout.startTracking();
  }
}
