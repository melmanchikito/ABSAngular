import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  trigger,
  state,
  style,
  animate,
  transition
} from '@angular/animations';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  animations: [
    trigger('searchSlide', [
      state('closed', style({
        height: '0px',
        opacity: 0,
        overflow: 'hidden',
        paddingTop: '0px',
        paddingBottom: '0px'
      })),

      state('open', style({
        height: '*',
        opacity: 1,
        overflow: 'hidden'
      })),

      transition('closed => open', [
        animate('300ms cubic-bezier(0.4, 0, 0.2, 1)')
      ]),

      transition('open => closed', [
        animate('220ms cubic-bezier(0.4, 0, 1, 1)')
      ])
    ])
  ]
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Input() img: string | null = null;
  @Input() username: string | null = null;

  isOnline = navigator.onLine;
  networkType = 'Con internet';

  showSearch = false;
  isSearchCollapsible = false;

  private observer?: MutationObserver;

  ngOnInit(): void {
    this.updateNetworkStatus();
    this.updateSearchMode();

    window.addEventListener('online', this.updateNetworkStatus);
    window.addEventListener('offline', this.updateNetworkStatus);
    window.addEventListener('resize', this.updateSearchMode);

    this.observer = new MutationObserver(() => {
      this.updateSearchMode();
    });

    this.observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
  }

  ngOnDestroy(): void {
    window.removeEventListener('online', this.updateNetworkStatus);
    window.removeEventListener('offline', this.updateNetworkStatus);
    window.removeEventListener('resize', this.updateSearchMode);

    this.observer?.disconnect();
  }

  get searchState(): 'open' | 'closed' {
    if (!this.isSearchCollapsible) {
      return 'open';
    }

    return this.showSearch ? 'open' : 'closed';
  }

  toggleSearch(): void {
    if (!this.isSearchCollapsible) {
      return;
    }

    this.showSearch = !this.showSearch;
  }

  updateSearchMode = (): void => {
    const root = document.documentElement;

    const isLargeFont =
      root.classList.contains('font-large') ||
      root.classList.contains('font-extralarge');

    const isSmallScreen = window.innerWidth <= 1350;

    const nextValue = isLargeFont || isSmallScreen;

    if (this.isSearchCollapsible !== nextValue) {
      this.isSearchCollapsible = nextValue;
      this.showSearch = false;
    }
  };

  updateNetworkStatus = (): void => {
    this.isOnline = navigator.onLine;

    if (!this.isOnline) {
      this.networkType = 'Sin internet';
      return;
    }

    const connection = (navigator as any).connection;

    if (connection?.type === 'wifi') {
      this.networkType = 'WiFi';
      return;
    }

    if (connection?.type === 'ethernet') {
      this.networkType = 'Cable';
      return;
    }

    this.networkType = 'Con internet';
  };
}