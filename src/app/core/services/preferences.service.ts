import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AccentColor, AppPreferences, AppTheme, CardDensity, FontSize } from '../models/preferences.model';

export const DEFAULT_PREFERENCES: AppPreferences = {
  theme: 'system',
  fontSize: 'medium',
  accentColor: 'absRed',
  cardDensity: 'normal',
  wallpaperEnabled: false,
  wallpaper: 'none',

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
  private readonly wallpaperAssets: Record<AppPreferences['wallpaper'], string> = {
    none: '',
    arwallaros: 'assets/auth/arwallaros.webp',
    arwallpaper: 'assets/auth/arwallpaper.webp',
    autofondo: 'assets/auth/autofondo.svg',
    fondonnewpass: 'assets/auth/fondonnewpass.webp',
    fondonnew: 'assets/auth/fondonnew.webp',
    lockScreen: 'assets/auth/lockScreen.webp'
  };

  private readonly storageKey = 'abs_preferences';
  private readonly themeStorageKey = 'abs_theme';
  private readonly publicThemeStorageKey = 'theme';
  private readonly accentColorStorageKey = 'abs_accent_color';
  private readonly wallpaperStorageKey = 'abs_wallpaper';
  private readonly publicWallpaperStorageKey = 'wallpaperSelected';
  private readonly wallpaperEnabledStorageKey = 'abs_wallpaper_enabled';
  private readonly publicWallpaperEnabledStorageKey = 'wallpaperEnabled';

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

    this.persistPreferences(next);
    this.preferencesSubject.next(next);
    this.applyPreferences(next);
  }

  reset(): void {
    this.persistPreferences(DEFAULT_PREFERENCES);
    this.preferencesSubject.next(DEFAULT_PREFERENCES);
    this.applyPreferences(DEFAULT_PREFERENCES);
  }

  private loadPreferences(): AppPreferences {
    const saved = localStorage.getItem(this.storageKey);

    if (!saved) {
      return this.loadLegacyPreferences(DEFAULT_PREFERENCES);
    }

    try {
      const parsedPreferences = {
        ...DEFAULT_PREFERENCES,
        ...JSON.parse(saved)
      };

      return this.loadLegacyPreferences(this.normalizePreferences(parsedPreferences));
    } catch {
      return this.loadLegacyPreferences(DEFAULT_PREFERENCES);
    }
  }

  private loadLegacyPreferences(basePreferences: AppPreferences): AppPreferences {
    const theme = localStorage.getItem(this.publicThemeStorageKey) || localStorage.getItem(this.themeStorageKey);
    const accentColor = localStorage.getItem(this.accentColorStorageKey);
    const wallpaper =
      localStorage.getItem(this.publicWallpaperStorageKey) ||
      localStorage.getItem(this.wallpaperStorageKey);
    const wallpaperEnabled =
      localStorage.getItem(this.publicWallpaperEnabledStorageKey) ??
      localStorage.getItem(this.wallpaperEnabledStorageKey);

    return {
      ...basePreferences,
      ...(theme ? { theme: this.parseStoredTheme(theme) } : {}),
      ...(accentColor ? { accentColor: accentColor as AppPreferences['accentColor'] } : {}),
      ...(wallpaper ? { wallpaper: this.parseStoredWallpaper(wallpaper) } : {}),
      ...(wallpaperEnabled !== null ? { wallpaperEnabled: wallpaperEnabled === 'true' } : {})
    };
  }

  private persistPreferences(prefs: AppPreferences): void {
    const normalizedPrefs = this.normalizePreferences(prefs);

    localStorage.setItem(this.storageKey, JSON.stringify(normalizedPrefs));
    localStorage.setItem(this.themeStorageKey, normalizedPrefs.theme);
    localStorage.setItem(this.publicThemeStorageKey, this.toStoredTheme(normalizedPrefs.theme));
    localStorage.setItem(this.accentColorStorageKey, normalizedPrefs.accentColor);
    localStorage.setItem(this.wallpaperStorageKey, normalizedPrefs.wallpaper);
    localStorage.setItem(this.publicWallpaperStorageKey, normalizedPrefs.wallpaper);
    localStorage.setItem(this.wallpaperEnabledStorageKey, String(normalizedPrefs.wallpaperEnabled));
    localStorage.setItem(this.publicWallpaperEnabledStorageKey, String(normalizedPrefs.wallpaperEnabled));
  }

  private applyPreferences(prefs: AppPreferences): void {
    const root = document.documentElement;

    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = prefs.theme === 'dark' || (prefs.theme === 'system' && systemDark);
    const themeAttribute = prefs.theme === 'liquid-glass'
      ? 'liquid-glass'
      : isDark
        ? 'dark'
        : 'light';

    root.setAttribute('data-theme', themeAttribute);

    root.classList.remove('font-small', 'font-medium', 'font-large', 'font-extralarge');
    root.classList.add(`font-${prefs.fontSize}`);

    root.classList.remove(
      'accent-absRed',
      'accent-executiveRed',
      'accent-enterpriseGray',
      'accent-premiumNight'
    );

    root.classList.add(`accent-${prefs.accentColor}`);
    const wallpaper = prefs.wallpaperEnabled ? prefs.wallpaper : 'none';
    const wallpaperAsset = this.wallpaperAssets[wallpaper];

    root.setAttribute('data-wallpaper', wallpaper);

    if (wallpaper !== 'none' && wallpaperAsset) {
      root.style.setProperty('--abs-wallpaper-image', `url("${wallpaperAsset}")`);
    } else {
      root.style.removeProperty('--abs-wallpaper-image');
    }

    root.classList.remove('density-compact', 'density-normal', 'density-comfortable');
    root.classList.add(`density-${prefs.cardDensity}`);
  }

  private parseStoredTheme(theme: string): AppTheme {
    const normalized = theme.trim().toLowerCase();
    const themes: Record<string, AppTheme> = {
      claro: 'light',
      light: 'light',
      oscuro: 'dark',
      dark: 'dark',
      sistema: 'system',
      system: 'system',
      'liquid-glass': 'liquid-glass',
      liquid: 'liquid-glass'
    };

    return themes[normalized] ?? DEFAULT_PREFERENCES.theme;
  }

  private normalizePreferences(prefs: AppPreferences): AppPreferences {
    return {
      ...prefs,
      theme: this.parseStoredTheme(prefs.theme),
      wallpaper: this.parseStoredWallpaper(prefs.wallpaper)
    };
  }

  private toStoredTheme(theme: AppTheme): 'claro' | 'oscuro' | 'sistema' | 'liquid-glass' {
    const themes: Record<AppTheme, 'claro' | 'oscuro' | 'sistema' | 'liquid-glass'> = {
      light: 'claro',
      dark: 'oscuro',
      system: 'sistema',
      'liquid-glass': 'liquid-glass'
    };

    return themes[theme];
  }

  private parseStoredWallpaper(wallpaper: string): AppPreferences['wallpaper'] {
    const normalized = wallpaper.trim();
    const wallpapers: Record<string, AppPreferences['wallpaper']> = {
      none: 'none',
      wallpaper1: 'arwallpaper',
      wallpaper2: 'arwallaros',
      wallpaper3: 'fondonnew',
      wallpaper4: 'fondonnewpass',
      arwallaros: 'arwallaros',
      arwallpaper: 'arwallpaper',
      autofondo: 'autofondo',
      fondonnewpass: 'fondonnewpass',
      fondonnew: 'fondonnew',
      lockScreen: 'lockScreen',
      LockScreen: 'lockScreen'
    };

    return wallpapers[normalized] ?? 'none';
  }
}
