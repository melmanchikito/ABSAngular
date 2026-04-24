import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { PreferencesService } from '../../../../core/services/preferences.service';
import { AuthService } from '../../../../core/services/auth.service';
import { AccentColor, AppTheme, FontSize } from '../../../../core/models/preferences.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {
  constructor(
    public readonly preferencesService: PreferencesService,
    private readonly authService: AuthService
  ) {}

  get prefs() {
    return this.preferencesService.snapshot;
  }

  get username(): string {
    return this.authService.getName() || 'Usuario';
  }

  get email(): string {
    return this.authService.getEmail() || 'correo@empresa.com';
  }

  setTheme(theme: AppTheme): void {
    this.preferencesService.setTheme(theme);
  }

  setFontSize(fontSize: FontSize): void {
    this.preferencesService.setFontSize(fontSize);
  }

  setAccentColor(color: AccentColor): void {
    this.preferencesService.setAccentColor(color);
  }

  reset(): void {
    this.preferencesService.reset();
  }
}