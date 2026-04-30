import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';
import { AuthService } from '../../../core/services/auth.service';
import { SessionTimeoutAlertComponent } from '../../components/alert/session-timeout-alert/session-timeout-alert.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    SidebarComponent,
    HeaderComponent,
    SessionTimeoutAlertComponent
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  activeSection = 'HelpDesk';
  sidebarCollapsed = false;

  isOnline = navigator.onLine;
  networkType = navigator.onLine ? 'Con internet' : 'Sin internet';

  private onlineHandler = () => {
    this.isOnline = true;
    this.networkType = 'Con internet';
  };

  private offlineHandler = () => {
    this.isOnline = false;
    this.networkType = 'Sin internet';
  };

  constructor(private readonly authService: AuthService) {}

  ngOnInit(): void {
    window.addEventListener('online', this.onlineHandler);
    window.addEventListener('offline', this.offlineHandler);
  }

  ngOnDestroy(): void {
    window.removeEventListener('online', this.onlineHandler);
    window.removeEventListener('offline', this.offlineHandler);
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  onSelectSection(section: string): void {
    this.activeSection = section;
  }

  get username(): string {
    return this.authService.getName() || 'Usuario';
  }

  get img(): string {
    return localStorage.getItem('profileImage') ?? '';
  }
}
