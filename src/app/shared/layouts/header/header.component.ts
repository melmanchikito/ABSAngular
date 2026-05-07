import { Component, HostListener, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Bell,
  Cake,
  CheckCircle2,
  ClipboardList,
  LucideAngularModule,
  Search,
  Settings,
  Wifi,
  WifiOff,
  EthernetPort
} from 'lucide-angular';
import { Subscription } from 'rxjs';
import { ProfileImageService } from '../../../features/profile/services/profile-image.service';

interface BrowserNetworkInformation {
  type?: string;
}

interface NavigatorWithConnection extends Navigator {
  connection?: BrowserNetworkInformation;
}

type HeaderPanel = 'notifications' | 'birthdays' | null;

interface HeaderNotification {
  title: string;
  description: string;
  time: string;
  unread: boolean;
  icon: typeof Bell;
}

interface HeaderBirthday {
  name: string;
  area: string;
  dateLabel: string;
}

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
  birthdayIcon = Cake;
  activePanel: HeaderPanel = null;

  profileImageUrl: string | null = null;

  readonly notifications: HeaderNotification[] = [
    {
      title: 'Ticket asignado',
      description: 'Se te asigno un nuevo ticket de Help Desk.',
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

  readonly birthdays: HeaderBirthday[] = [
    {
      name: 'German Machado',
      area: 'Area de Desarrollo',
      dateLabel: 'Hoy'
    },
    {
      name: 'Maria Perez',
      area: 'Administracion',
      dateLabel: 'Hoy'
    }
  ];

  private imageSubscription?: Subscription;

  constructor(
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

  get todayBirthdays(): number {
    return this.birthdays.filter((birthday) => birthday.dateLabel.toLowerCase() === 'hoy').length;
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

  getInitial(name: string): string {
    return name.trim().charAt(0).toUpperCase();
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
