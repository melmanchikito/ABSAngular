import { Component, HostListener, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Bell,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  House,
  LogOut,
  LucideAngularModule,
  Mail,
  Search,
  Settings,
  UserRound,
  Wifi,
  WifiOff,
  EthernetPort
} from 'lucide-angular';
import { Subscription } from 'rxjs';
import { ProfileImageService } from '../../../features/profile/services/profile-image.service';
import { NavigationService } from '../../../core/services/navigation.service';
import { AuthApiService } from '../../../features/auth/services/auth-api.service';

interface BrowserNetworkInformation {
  type?: string;
}

interface NavigatorWithConnection extends Navigator {
  connection?: BrowserNetworkInformation;
}

interface HeaderNotification {
  title: string;
  description: string;
  time: string;
  unread: boolean;
  icon: typeof Bell;
}

type HeaderPanel = 'notifications' | 'user' | null;

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Input() img: string | null = null;
  @Input() username: string | null = null;

  isOnline = navigator.onLine;
  networkType = 'Con internet';
  networkIcon = Wifi;
  searchIcon = Search;
  notificationIcon = Bell;
  homeIcon = House;
  chevronIcon = ChevronDown;
  logoutIcon = LogOut;
  mailIcon = Mail;
  userIcon = UserRound;
  activePanel: HeaderPanel = null;

  profileImageUrl: string | null = null;

  readonly notifications: HeaderNotification[] = [
    {
      title: 'Ticket asignado',
      description: 'Se te asigno un nuevo ticket.',
      time: 'Hace 5 min',
      unread: true,
      icon: ClipboardList
    },
    {
      title: 'Equipo actualizado',
      description: 'Se modifico la informacion de un equipo.',
      time: 'Hace 20 min',
      unread: true,
      icon: Settings
    },
    {
      title: 'Empresa creada',
      description: 'Se registro una nueva empresa.',
      time: 'Hoy',
      unread: true,
      icon: CheckCircle2
    }
  ];

  private imageSubscription?: Subscription;

  constructor(
    private readonly authApiService: AuthApiService,
    private readonly navigationService: NavigationService,
    private readonly profileImageService: ProfileImageService
  ) {}

  ngOnInit(): void {
    this.updateNetworkStatus();

    window.addEventListener('online', this.updateNetworkStatus);
    window.addEventListener('offline', this.updateNetworkStatus);

    this.imageSubscription = this.profileImageService.imageUrl$.subscribe((imageUrl) => {
      this.profileImageUrl = imageUrl;
    });

    this.profileImageService.loadUserImage().subscribe();
  }

  ngOnDestroy(): void {
    window.removeEventListener('online', this.updateNetworkStatus);
    window.removeEventListener('offline', this.updateNetworkStatus);
    this.imageSubscription?.unsubscribe();
  }

  get displayImage(): string {
    return this.profileImageUrl || this.img || 'assets/auth/perfil.webp';
  }

  get unreadNotifications(): number {
    return this.notifications.filter((notification) => notification.unread).length;
  }

  @HostListener('document:click')
  closePanels(): void {
    this.activePanel = null;
  }

  togglePanel(panel: Exclude<HeaderPanel, null>, event: MouseEvent): void {
    event.stopPropagation();
    this.activePanel = this.activePanel === panel ? null : panel;
  }

  keepPanelOpen(event: MouseEvent): void {
    event.stopPropagation();
  }

  goToHome(event: MouseEvent): void {
    event.stopPropagation();
    this.activePanel = null;
    void this.navigationService.goToHome();
  }

  goToProfile(event: MouseEvent): void {
    event.stopPropagation();
    this.activePanel = null;
    void this.navigationService.goToProfile();
  }

  goToMail(event: MouseEvent): void {
    event.stopPropagation();
    this.activePanel = null;
    void this.navigationService.goToMail();
  }

  async logout(event: MouseEvent): Promise<void> {
    event.stopPropagation();
    this.activePanel = null;
    await this.authApiService.handleLogout();
  }

  updateNetworkStatus = (): void => {
    this.isOnline = navigator.onLine;

    if (!this.isOnline) {
      this.networkType = 'Sin internet';
      this.networkIcon = WifiOff;
      return;
    }

    const connection = (navigator as NavigatorWithConnection).connection;

    if (connection?.type === 'ethernet') {
      this.networkType = 'Cable';
      this.networkIcon = EthernetPort;
      return;
    }

    this.networkType = connection?.type === 'wifi' ? 'WiFi' : 'Con internet';
    this.networkIcon = Wifi;
  };
}
