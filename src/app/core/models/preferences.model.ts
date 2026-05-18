export type AppTheme = 'light' | 'dark' | 'system' | 'liquid-glass';
export type FontSize = 'small' | 'medium' | 'large' | 'extralarge';
export type HeaderVariant = 'classic' | 'floating';
export type SidebarPosition = 'left' | 'right';
export type AppLanguage = 'es' | 'en';

export type AccentColor =
  | 'absRed'
  | 'executiveRed'
  | 'enterpriseGray'
  | 'premiumNight';

export type CardDensity = 'compact' | 'normal' | 'comfortable';
export type SystemWallpaper =
  | 'none'
  | 'arwallaros'
  | 'arwallpaper'
  | 'autofondo'
  | 'fondonnewpass'
  | 'fondonnew'
  | 'lockScreen';

export interface AppPreferences {
  theme: AppTheme;
  fontSize: FontSize;
  accentColor: AccentColor;
  cardDensity: CardDensity;
  wallpaperEnabled: boolean;
  wallpaper: SystemWallpaper;

  autoSync: boolean;
  syncInterval: string;
  syncOnlyOnWifi: boolean;
  syncNotifications: boolean;
  retryFailedSync: boolean;

  showAnimations: boolean;
  headerVariant: HeaderVariant;
  sidebarPosition: SidebarPosition;
  compactSidebar: boolean;
  roundedCards: boolean;
  showProductImages: boolean;

  defaultSaveMode: string;
  confirmBeforeDelete: boolean;
  autoExpandOrderItems: boolean;
  showTaxBreakdown: boolean;
  warnStockBeforeOrder: boolean;
  defaultGlobalDiscount: number;
  ordersPageSize: number;
  defaultOrderSort: string;
  defaultHistoryFilter: string;

  pdfCompanyName: string;
  pdfFooterText: string;
  pdfAutoDownload: boolean;

  currency: string;
  dateFormat: string;
  language: AppLanguage;

  soundEnabled: boolean;
  vibrationEnabled: boolean;
  lowStockWarningThreshold: number;
  showOfflineBanner: boolean;

  keepHistoryDays: number;
  requirePinOnOpen: boolean;
}
