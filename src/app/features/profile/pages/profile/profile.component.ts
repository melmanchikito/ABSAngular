import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PreferencesService } from '../../../../core/services/preferences.service';
import { AuthService } from '../../../../core/services/auth.service';
import { AccentColor, AppTheme, CardDensity, FontSize } from '../../../../core/models/preferences.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {
  savedBadge = false;
  showResetConfirm = false;

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

  update(data: Partial<typeof this.prefs>): void {
    this.preferencesService.update(data);
    this.flashSaved();
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

  reset(): void {
    this.preferencesService.reset();
    this.showResetConfirm = false;
    this.flashSaved();
  }

  private flashSaved(): void {
    this.savedBadge = true;
    setTimeout(() => {
      this.savedBadge = false;
    }, 1500);
  }
}