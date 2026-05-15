import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { ChevronLeft, ChevronRight, Eye, EyeOff, LucideAngularModule } from 'lucide-angular';
import { Subscription } from 'rxjs';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';
import { AuthService } from '../../../core/services/auth.service';
import { MotionService } from '../../../core/services/motion.service';
import { PreferencesService } from '../../../core/services/preferences.service';
import { HeaderVariant } from '../../../core/models/preferences.model';
import { SessionTimeoutAlertComponent } from '../../components/alert/session-timeout-alert/session-timeout-alert.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule,
    RouterOutlet,
    SidebarComponent,
    HeaderComponent,
    SessionTimeoutAlertComponent
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  activeSection = 'Sistema';
  sidebarCollapsed = false;
  headerVisible = true;
  headerVariant: HeaderVariant = 'classic';
  expandSidebarIcon = ChevronRight;
  collapseSidebarIcon = ChevronLeft;
  showHeaderIcon = Eye;
  hideHeaderIcon = EyeOff;

  isOnline = navigator.onLine;
  networkType = navigator.onLine ? 'Con internet' : 'Sin internet';

  private readonly headerVisibleStorageKey = 'headerVisible';
  private readonly mobileSidebarBreakpoint = '(max-width: 768px)';
  private preferencesSubscription?: Subscription;
  private loginEntryTimer?: ReturnType<typeof setTimeout>;

  private onlineHandler = () => {
    this.isOnline = true;
    this.networkType = 'Con internet';
  };

  private offlineHandler = () => {
    this.isOnline = false;
    this.networkType = 'Sin internet';
  };

  runLoginEntrySequence = false;

  constructor(
    private readonly authService: AuthService,
    private readonly motionService: MotionService,
    private readonly preferencesService: PreferencesService
  ) {}

  ngOnInit(): void {
    this.headerVariant = this.preferencesService.snapshot.headerVariant;
    this.preferencesSubscription = this.preferencesService.preferences$.subscribe((preferences) => {
      this.headerVariant = preferences.headerVariant;
    });

    this.loadHeaderPreference();
    this.runLoginEntrySequence = this.motionService.consumeLoginDashboardTransition();

    if (this.runLoginEntrySequence) {
      this.loginEntryTimer = setTimeout(() => {
        this.runLoginEntrySequence = false;
      }, 1900);
    }

    window.addEventListener('online', this.onlineHandler);
    window.addEventListener('offline', this.offlineHandler);
  }

  ngOnDestroy(): void {
    if (this.loginEntryTimer) {
      clearTimeout(this.loginEntryTimer);
    }

    window.removeEventListener('online', this.onlineHandler);
    window.removeEventListener('offline', this.offlineHandler);
    this.preferencesSubscription?.unsubscribe();
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  toggleHeader(): void {
    this.headerVisible = !this.headerVisible;
    localStorage.setItem(this.headerVisibleStorageKey, String(this.headerVisible));
  }

  onSelectSection(section: string): void {
    this.activeSection = section;
  }

  closeSidebarOnMobile(): void {
    if (typeof window === 'undefined') {
      return;
    }

    if (window.matchMedia(this.mobileSidebarBreakpoint).matches) {
      this.sidebarCollapsed = true;
    }
  }

  get username(): string {
    return this.authService.getName() || 'Usuario';
  }

  get img(): string {
    return localStorage.getItem('profileImage') ?? '';
  }

  private loadHeaderPreference(): void {
    const storedPreference = localStorage.getItem(this.headerVisibleStorageKey);

    if (storedPreference === null) {
      this.headerVisible = true;
      return;
    }

    this.headerVisible = storedPreference !== 'false';
  }
}
