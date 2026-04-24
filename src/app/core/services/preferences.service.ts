import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AccentColor, AppPreferences, AppTheme, CardDensity, FontSize } from '../models/preferences.model';

export const DEFAULT_PREFERENCES: AppPreferences = {
  theme: 'light',
  fontSize: 'medium',
  accentColor: 'red',
  cardDensity: 'normal',

  autoSync: true,
  syncInterval: '15',
  syncOnlyOnWifi: false,
  syncNotifications: true,
  retryFailedSync: true,

  showAnimations: true,
  compactSidebar: false,
  roundedCards: true,
  showProductImages: true,

  defaultSaveMode: 'ask',
  confirmBeforeDelete: true,
  autoExpandOrderItems: false,
  showTaxBreakdown: true,
  warnStockBeforeOrder: true,
  defaultGlobalDiscount: 0,
  ordersPageSize: 10,
  defaultOrderSort: 'date_desc',
  defaultHistoryFilter: 'all',

  pdfCompanyName: 'ABS',
  pdfFooterText: 'Documento generado por ABS',
  pdfAutoDownload: false,

  currency: 'USD',
  dateFormat: 'DD/MM/YYYY',
  language: 'es',

  soundEnabled: true,
  vibrationEnabled: true,
  lowStockWarningThreshold: 5,
  showOfflineBanner: true,

  keepHistoryDays: 0,
  requirePinOnOpen: false
};

@Injectable({
  providedIn: 'root'
})
export class PreferencesService {
  private readonly storageKey = 'abs_preferences';

  private readonly preferencesSubject = new BehaviorSubject<AppPreferences>(
    this.loadPreferences()
  );

  readonly preferences$ = this.preferencesSubject.asObservable();

  constructor() {
    this.applyPreferences(this.preferencesSubject.value);
  }

  get snapshot(): AppPreferences {
    return this.preferencesSubject.value;
  }

  setTheme(theme: AppTheme): void {
    this.update({ theme });
  }

  setFontSize(fontSize: FontSize): void {
    this.update({ fontSize });
  }

  setAccentColor(accentColor: AccentColor): void {
    this.update({ accentColor });
  }

  setCardDensity(cardDensity: CardDensity): void {
    this.update({ cardDensity });
  }

  update(data: Partial<AppPreferences>): void {
    const next: AppPreferences = {
      ...this.snapshot,
      ...data
    };

    localStorage.setItem(this.storageKey, JSON.stringify(next));
    this.preferencesSubject.next(next);
    this.applyPreferences(next);
  }

  reset(): void {
    localStorage.setItem(this.storageKey, JSON.stringify(DEFAULT_PREFERENCES));
    this.preferencesSubject.next(DEFAULT_PREFERENCES);
    this.applyPreferences(DEFAULT_PREFERENCES);
  }

  private loadPreferences(): AppPreferences {
    const saved = localStorage.getItem(this.storageKey);

    if (!saved) {
      return DEFAULT_PREFERENCES;
    }

    try {
      return {
        ...DEFAULT_PREFERENCES,
        ...JSON.parse(saved)
      };
    } catch {
      return DEFAULT_PREFERENCES;
    }
  }

  private applyPreferences(prefs: AppPreferences): void {
    const root = document.documentElement;

    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = prefs.theme === 'dark' || (prefs.theme === 'system' && systemDark);

    root.classList.toggle('theme-dark', isDark);
    root.classList.toggle('theme-light', !isDark);

    root.classList.remove('font-small', 'font-medium', 'font-large', 'font-extralarge');
    root.classList.add(`font-${prefs.fontSize}`);

    root.classList.remove('accent-red', 'accent-darkRed', 'accent-gray');
    root.classList.add(`accent-${prefs.accentColor}`);

    root.classList.remove('density-compact', 'density-normal', 'density-comfortable');
    root.classList.add(`density-${prefs.cardDensity}`);
  }
}