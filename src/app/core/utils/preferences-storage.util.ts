import {
  AccentColor,
  AppLanguage,
  AppPreferences,
  AppTheme,
  CardDensity,
  FontSize,
  HeaderVariant,
  SidebarPosition,
  SystemWallpaper
} from '../models/preferences.model';

export const PREFERENCES_STORAGE_KEYS = {
  preferences: 'abs_preferences',
  theme: 'abs_theme',
  publicTheme: 'theme',
  accentColor: 'abs_accent_color',
  wallpaper: 'abs_wallpaper',
  publicWallpaper: 'wallpaperSelected',
  wallpaperEnabled: 'abs_wallpaper_enabled',
  publicWallpaperEnabled: 'wallpaperEnabled',
  headerVariant: 'abs_header_variant',
  legacyHeaderStyle: 'abs_header_style',
  sidebarPosition: 'abs_sidebar_position',
  language: 'abs_language',
  animationsDisabled: 'animationsDisabled'
} as const;

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
  headerVariant: 'classic',
  sidebarPosition: 'left',
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

const WALLPAPER_ASSETS: Record<AppPreferences['wallpaper'], string> = {
  none: '',
  arwallaros: 'assets/auth/arwallaros.webp',
  arwallpaper: 'assets/auth/arwallpaper.webp',
  autofondo: 'assets/auth/autofondo.svg',
  fondonnewpass: 'assets/auth/fondonnewpass.webp',
  fondonnew: 'assets/auth/fondonnew.webp',
  lockScreen: 'assets/auth/lockScreen.webp'
};

const THEMES: readonly AppTheme[] = ['light', 'dark', 'system', 'liquid-glass'];
const FONT_SIZES: readonly FontSize[] = ['small', 'medium', 'large', 'extralarge'];
const HEADER_VARIANTS: readonly HeaderVariant[] = ['classic', 'floating'];
const SIDEBAR_POSITIONS: readonly SidebarPosition[] = ['left', 'right'];
const LANGUAGES: readonly AppLanguage[] = ['es', 'en', 'it'];
const ACCENT_COLORS: readonly AccentColor[] = ['absRed', 'executiveRed', 'enterpriseGray', 'premiumNight'];
const CARD_DENSITIES: readonly CardDensity[] = ['compact', 'normal', 'comfortable'];
export function loadStoredPreferences(storage: Storage = localStorage): AppPreferences {
  const saved = storage.getItem(PREFERENCES_STORAGE_KEYS.preferences);

  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      return normalizePreferences({
        ...loadLegacyPreferences(DEFAULT_PREFERENCES, storage),
        ...(isRecord(parsed) ? parsed : {})
      });
    } catch {
      storage.removeItem(PREFERENCES_STORAGE_KEYS.preferences);
      return loadLegacyPreferences(DEFAULT_PREFERENCES, storage);
    }
  }

  return loadLegacyPreferences(DEFAULT_PREFERENCES, storage);
}

export function persistStoredPreferences(
  prefs: AppPreferences,
  storage: Storage = localStorage
): AppPreferences {
  const normalizedPrefs = normalizePreferences(prefs);

  storage.setItem(PREFERENCES_STORAGE_KEYS.preferences, JSON.stringify(normalizedPrefs));
  storage.setItem(PREFERENCES_STORAGE_KEYS.theme, normalizedPrefs.theme);
  storage.setItem(PREFERENCES_STORAGE_KEYS.publicTheme, toStoredTheme(normalizedPrefs.theme));
  storage.setItem(PREFERENCES_STORAGE_KEYS.accentColor, normalizedPrefs.accentColor);
  storage.setItem(PREFERENCES_STORAGE_KEYS.wallpaper, normalizedPrefs.wallpaper);
  storage.setItem(PREFERENCES_STORAGE_KEYS.publicWallpaper, normalizedPrefs.wallpaper);
  storage.setItem(PREFERENCES_STORAGE_KEYS.wallpaperEnabled, String(normalizedPrefs.wallpaperEnabled));
  storage.setItem(PREFERENCES_STORAGE_KEYS.publicWallpaperEnabled, String(normalizedPrefs.wallpaperEnabled));
  storage.setItem(PREFERENCES_STORAGE_KEYS.headerVariant, normalizedPrefs.headerVariant);
  storage.setItem(PREFERENCES_STORAGE_KEYS.legacyHeaderStyle, normalizedPrefs.headerVariant);
  storage.setItem(PREFERENCES_STORAGE_KEYS.sidebarPosition, normalizedPrefs.sidebarPosition);
  storage.setItem(PREFERENCES_STORAGE_KEYS.language, normalizedPrefs.language);
  storage.setItem(PREFERENCES_STORAGE_KEYS.animationsDisabled, String(!normalizedPrefs.showAnimations));

  return normalizedPrefs;
}

export function applyPreferencesToDocument(
  prefs: AppPreferences,
  doc: Document = document
): void {
  const root = doc.documentElement;
  const normalizedPrefs = normalizePreferences(prefs);
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = normalizedPrefs.theme === 'dark' || (normalizedPrefs.theme === 'system' && systemDark);
  const themeAttribute = normalizedPrefs.theme === 'liquid-glass'
    ? 'liquid-glass'
    : isDark
      ? 'dark'
      : 'light';

  root.setAttribute('data-theme', themeAttribute);

  root.classList.remove('font-small', 'font-medium', 'font-large', 'font-extralarge');
  root.classList.add(`font-${normalizedPrefs.fontSize}`);

  root.classList.remove(
    'accent-absRed',
    'accent-executiveRed',
    'accent-enterpriseGray',
    'accent-premiumNight'
  );
  root.classList.add(`accent-${normalizedPrefs.accentColor}`);

  const wallpaper = normalizedPrefs.wallpaperEnabled ? normalizedPrefs.wallpaper : 'none';
  const wallpaperAsset = WALLPAPER_ASSETS[wallpaper];

  root.setAttribute('data-wallpaper', wallpaper);

  if (wallpaper !== 'none' && wallpaperAsset) {
    root.style.setProperty('--abs-wallpaper-image', `url("${wallpaperAsset}")`);
  } else {
    root.style.removeProperty('--abs-wallpaper-image');
  }

  root.classList.remove('density-compact', 'density-normal', 'density-comfortable');
  root.classList.add(`density-${normalizedPrefs.cardDensity}`);

  root.classList.toggle('animations-disabled', !normalizedPrefs.showAnimations);
  root.setAttribute('data-animations', normalizedPrefs.showAnimations ? 'enabled' : 'disabled');
  root.setAttribute('data-header-variant', normalizedPrefs.headerVariant);
  root.setAttribute('data-header-style', normalizedPrefs.headerVariant);
  root.setAttribute('data-sidebar-position', normalizedPrefs.sidebarPosition);
  root.setAttribute('lang', normalizedPrefs.language);
}

export function normalizePreferences(rawPreferences: unknown): AppPreferences {
  const source = isRecord(rawPreferences) ? rawPreferences : {};
  const animationsDisabled = parseBoolean(source['animationsDisabled']);
  const showAnimations =
    parseBoolean(source['showAnimations']) ??
    (animationsDisabled === null ? DEFAULT_PREFERENCES.showAnimations : !animationsDisabled);

  return {
    theme: parseStoredTheme(readString(source['theme']) ?? DEFAULT_PREFERENCES.theme),
    fontSize: parseEnum(source['fontSize'], FONT_SIZES, DEFAULT_PREFERENCES.fontSize),
    accentColor: parseEnum(source['accentColor'], ACCENT_COLORS, DEFAULT_PREFERENCES.accentColor),
    cardDensity: parseEnum(source['cardDensity'], CARD_DENSITIES, DEFAULT_PREFERENCES.cardDensity),
    wallpaperEnabled: parseBoolean(source['wallpaperEnabled']) ?? DEFAULT_PREFERENCES.wallpaperEnabled,
    wallpaper: parseStoredWallpaper(readString(source['wallpaper']) ?? DEFAULT_PREFERENCES.wallpaper),

    autoSync: parseBoolean(source['autoSync']) ?? DEFAULT_PREFERENCES.autoSync,
    syncInterval: readString(source['syncInterval']) ?? DEFAULT_PREFERENCES.syncInterval,
    syncOnlyOnWifi: parseBoolean(source['syncOnlyOnWifi']) ?? DEFAULT_PREFERENCES.syncOnlyOnWifi,
    syncNotifications: parseBoolean(source['syncNotifications']) ?? DEFAULT_PREFERENCES.syncNotifications,
    retryFailedSync: parseBoolean(source['retryFailedSync']) ?? DEFAULT_PREFERENCES.retryFailedSync,

    showAnimations,
    headerVariant: parseEnum(
      source['headerVariant'] ?? source['headerStyle'],
      HEADER_VARIANTS,
      DEFAULT_PREFERENCES.headerVariant
    ),
    sidebarPosition: parseEnum(source['sidebarPosition'], SIDEBAR_POSITIONS, DEFAULT_PREFERENCES.sidebarPosition),
    compactSidebar: parseBoolean(source['compactSidebar']) ?? DEFAULT_PREFERENCES.compactSidebar,
    roundedCards: parseBoolean(source['roundedCards']) ?? DEFAULT_PREFERENCES.roundedCards,
    showProductImages: parseBoolean(source['showProductImages']) ?? DEFAULT_PREFERENCES.showProductImages,

    defaultSaveMode: readString(source['defaultSaveMode']) ?? DEFAULT_PREFERENCES.defaultSaveMode,
    confirmBeforeDelete: parseBoolean(source['confirmBeforeDelete']) ?? DEFAULT_PREFERENCES.confirmBeforeDelete,
    autoExpandOrderItems: parseBoolean(source['autoExpandOrderItems']) ?? DEFAULT_PREFERENCES.autoExpandOrderItems,
    showTaxBreakdown: parseBoolean(source['showTaxBreakdown']) ?? DEFAULT_PREFERENCES.showTaxBreakdown,
    warnStockBeforeOrder: parseBoolean(source['warnStockBeforeOrder']) ?? DEFAULT_PREFERENCES.warnStockBeforeOrder,
    defaultGlobalDiscount: readNumber(source['defaultGlobalDiscount']) ?? DEFAULT_PREFERENCES.defaultGlobalDiscount,
    ordersPageSize: readNumber(source['ordersPageSize']) ?? DEFAULT_PREFERENCES.ordersPageSize,
    defaultOrderSort: readString(source['defaultOrderSort']) ?? DEFAULT_PREFERENCES.defaultOrderSort,
    defaultHistoryFilter: readString(source['defaultHistoryFilter']) ?? DEFAULT_PREFERENCES.defaultHistoryFilter,

    pdfCompanyName: readString(source['pdfCompanyName']) ?? DEFAULT_PREFERENCES.pdfCompanyName,
    pdfFooterText: readString(source['pdfFooterText']) ?? DEFAULT_PREFERENCES.pdfFooterText,
    pdfAutoDownload: parseBoolean(source['pdfAutoDownload']) ?? DEFAULT_PREFERENCES.pdfAutoDownload,

    currency: readString(source['currency']) ?? DEFAULT_PREFERENCES.currency,
    dateFormat: readString(source['dateFormat']) ?? DEFAULT_PREFERENCES.dateFormat,
    language: parseEnum(source['language'], LANGUAGES, DEFAULT_PREFERENCES.language),

    soundEnabled: parseBoolean(source['soundEnabled']) ?? DEFAULT_PREFERENCES.soundEnabled,
    vibrationEnabled: parseBoolean(source['vibrationEnabled']) ?? DEFAULT_PREFERENCES.vibrationEnabled,
    lowStockWarningThreshold:
      readNumber(source['lowStockWarningThreshold']) ?? DEFAULT_PREFERENCES.lowStockWarningThreshold,
    showOfflineBanner: parseBoolean(source['showOfflineBanner']) ?? DEFAULT_PREFERENCES.showOfflineBanner,

    keepHistoryDays: readNumber(source['keepHistoryDays']) ?? DEFAULT_PREFERENCES.keepHistoryDays,
    requirePinOnOpen: parseBoolean(source['requirePinOnOpen']) ?? DEFAULT_PREFERENCES.requirePinOnOpen
  };
}

function loadLegacyPreferences(
  basePreferences: AppPreferences,
  storage: Storage
): AppPreferences {
  const theme =
    storage.getItem(PREFERENCES_STORAGE_KEYS.theme) ||
    storage.getItem(PREFERENCES_STORAGE_KEYS.publicTheme);
  const accentColor = storage.getItem(PREFERENCES_STORAGE_KEYS.accentColor);
  const wallpaper =
    storage.getItem(PREFERENCES_STORAGE_KEYS.wallpaper) ||
    storage.getItem(PREFERENCES_STORAGE_KEYS.publicWallpaper);
  const wallpaperEnabled =
    storage.getItem(PREFERENCES_STORAGE_KEYS.wallpaperEnabled) ??
    storage.getItem(PREFERENCES_STORAGE_KEYS.publicWallpaperEnabled);
  const animationsDisabled = storage.getItem(PREFERENCES_STORAGE_KEYS.animationsDisabled);
  const headerVariant =
    storage.getItem(PREFERENCES_STORAGE_KEYS.headerVariant) ||
    storage.getItem(PREFERENCES_STORAGE_KEYS.legacyHeaderStyle);
  const sidebarPosition = storage.getItem(PREFERENCES_STORAGE_KEYS.sidebarPosition);
  const language = storage.getItem(PREFERENCES_STORAGE_KEYS.language);

  return normalizePreferences({
    ...basePreferences,
    ...(theme ? { theme } : {}),
    ...(accentColor ? { accentColor } : {}),
    ...(wallpaper ? { wallpaper } : {}),
    ...(wallpaperEnabled !== null ? { wallpaperEnabled } : {}),
    ...(headerVariant ? { headerVariant } : {}),
    ...(sidebarPosition ? { sidebarPosition } : {}),
    ...(language ? { language } : {}),
    ...(animationsDisabled !== null ? { animationsDisabled } : {})
  });
}

function parseStoredTheme(theme: string): AppTheme {
  const normalized = theme.trim().toLowerCase();
  const themes: Record<string, AppTheme> = {
    claro: 'light',
    light: 'light',
    base: 'light',
    oscuro: 'dark',
    dark: 'dark',
    sistema: 'system',
    system: 'system',
    'liquid-glass': 'liquid-glass',
    liquid: 'liquid-glass'
  };

  return themes[normalized] ?? DEFAULT_PREFERENCES.theme;
}

function toStoredTheme(theme: AppTheme): 'claro' | 'oscuro' | 'sistema' | 'liquid-glass' {
  const themes: Record<AppTheme, 'claro' | 'oscuro' | 'sistema' | 'liquid-glass'> = {
    light: 'claro',
    dark: 'oscuro',
    system: 'sistema',
    'liquid-glass': 'liquid-glass'
  };

  return themes[theme];
}

function parseStoredWallpaper(wallpaper: string): AppPreferences['wallpaper'] {
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

function parseEnum<T extends string>(
  value: unknown,
  validValues: readonly T[],
  fallback: T
): T {
  return typeof value === 'string' && validValues.includes(value as T)
    ? (value as T)
    : fallback;
}

function parseBoolean(value: unknown): boolean | null {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value !== 'string') {
    return null;
  }

  const normalized = value.trim().toLowerCase();

  if (['true', '1', 'yes', 'si', 'sí'].includes(normalized)) {
    return true;
  }

  if (['false', '0', 'no'].includes(normalized)) {
    return false;
  }

  return null;
}

function readString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value : null;
}

function readNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}
