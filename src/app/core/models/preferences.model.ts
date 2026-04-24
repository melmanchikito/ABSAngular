export type AppTheme = 'light' | 'dark' | 'system';
export type FontSize = 'small' | 'medium' | 'large' | 'extralarge';

export type AccentColor =
  | 'absRed'
  | 'executiveRed'
  | 'enterpriseGray'
  | 'premiumNight';

export type CardDensity = 'compact' | 'normal' | 'comfortable';

export interface AppPreferences {
  theme: AppTheme;
  fontSize: FontSize;
  accentColor: AccentColor;
  cardDensity: CardDensity;

  autoSync: boolean;
  syncInterval: string;
  syncOnlyOnWifi: boolean;
  syncNotifications: boolean;
  retryFailedSync: boolean;

  showAnimations: boolean;
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
  language: string;

  soundEnabled: boolean;
  vibrationEnabled: boolean;
  lowStockWarningThreshold: number;
  showOfflineBanner: boolean;

  keepHistoryDays: number;
  requirePinOnOpen: boolean;
}