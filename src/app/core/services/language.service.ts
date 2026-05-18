import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { distinctUntilChanged, map } from 'rxjs';
import { AppLanguage } from '../models/preferences.model';
import { PreferencesService } from './preferences.service';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  readonly supportedLanguages: readonly AppLanguage[] = ['es', 'en'];

  constructor(
    private readonly translateService: TranslateService,
    private readonly preferencesService: PreferencesService
  ) {
    this.translateService.addLangs([...this.supportedLanguages]);
    this.translateService.setFallbackLang('es').subscribe();
    this.applyLanguage(this.preferencesService.snapshot.language);

    this.preferencesService.preferences$
      .pipe(
        map((preferences) => preferences.language),
        distinctUntilChanged()
      )
      .subscribe((language) => this.applyLanguage(language));
  }

  get currentLanguage(): AppLanguage {
    return this.preferencesService.snapshot.language;
  }

  setLanguage(language: AppLanguage): void {
    if (!this.supportedLanguages.includes(language)) {
      return;
    }

    this.preferencesService.setLanguage(language);
  }

  private applyLanguage(language: AppLanguage): void {
    const selectedLanguage = this.supportedLanguages.includes(language) ? language : 'es';

    document.documentElement.lang = selectedLanguage;
    this.translateService.use(selectedLanguage).subscribe();
  }
}
