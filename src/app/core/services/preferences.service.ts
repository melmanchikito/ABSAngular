import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AccentColor, AppPreferences, AppTheme, CardDensity, FontSize, HeaderVariant } from '../models/preferences.model';
import {
  applyPreferencesToDocument,
  DEFAULT_PREFERENCES,
  loadStoredPreferences,
  persistStoredPreferences
} from '../utils/preferences-storage.util';

export { DEFAULT_PREFERENCES } from '../utils/preferences-storage.util';

@Injectable({
  providedIn: 'root'
})
export class PreferencesService {
  private readonly preferencesSubject = new BehaviorSubject<AppPreferences>(
    loadStoredPreferences()
  );

  readonly preferences$ = this.preferencesSubject.asObservable();

  constructor() {
    const persistedPreferences = this.persistPreferences(this.preferencesSubject.value);

    this.preferencesSubject.next(persistedPreferences);
    this.applyPreferences(persistedPreferences);
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

  setHeaderVariant(headerVariant: HeaderVariant): void {
    this.update({ headerVariant });
  }

  update(data: Partial<AppPreferences>): void {
    const next: AppPreferences = {
      ...this.snapshot,
      ...data
    };

    const persistedPreferences = this.persistPreferences(next);

    this.preferencesSubject.next(persistedPreferences);
    this.applyPreferences(persistedPreferences);
  }

  reset(): void {
    const persistedPreferences = this.persistPreferences(DEFAULT_PREFERENCES);

    this.preferencesSubject.next(persistedPreferences);
    this.applyPreferences(persistedPreferences);
  }

  private persistPreferences(prefs: AppPreferences): AppPreferences {
    return persistStoredPreferences(prefs);
  }

  private applyPreferences(prefs: AppPreferences): void {
    applyPreferencesToDocument(prefs);
  }
}
