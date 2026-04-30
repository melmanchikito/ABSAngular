import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Wifi, WifiOff, EthernetPort } from 'lucide-angular';
import { Subscription } from 'rxjs';
import { ProfileImageService } from '../../../features/profile/services/profile-image.service';

interface BrowserNetworkInformation {
  type?: string;
}

interface NavigatorWithConnection extends Navigator {
  connection?: BrowserNetworkInformation;
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

  profileImageUrl: string | null = null;

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
