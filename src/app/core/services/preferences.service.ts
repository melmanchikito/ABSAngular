import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {
  AccentColor,
  AppPreferences,
  AppTheme,
  FontSize
} from '../models/preferences.model';

const DEFAULT_PREFERENCES: AppPreferences = {
  theme: 'light',
  fontSize: 'medium',
  accentColor: 'red'
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

  reset(): void {
    this.preferencesSubject.next(DEFAULT_PREFERENCES);
    localStorage.setItem(this.storageKey, JSON.stringify(DEFAULT_PREFERENCES));
    this.applyPreferences(DEFAULT_PREFERENCES);
  }

  private update(data: Partial<AppPreferences>): void {
    const next = {
      ...this.snapshot,
      ...data
    };

    this.preferencesSubject.next(next);
    localStorage.setItem(this.storageKey, JSON.stringify(next));
    this.applyPreferences(next);
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

    root.classList.remove('font-small', 'font-medium', 'font-large');
    root.classList.add(`font-${prefs.fontSize}`);

    root.classList.remove('accent-red', 'accent-darkRed', 'accent-gray');
    root.classList.add(`accent-${prefs.accentColor}`);
  }
}