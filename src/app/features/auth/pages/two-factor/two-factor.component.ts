import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavigationService } from '../../../../core/services/navigation.service';
import { AuthService } from '../../../../core/services/auth.service';
import { AuthApiService } from '../../services/auth-api.service';

@Component({
  selector: 'app-two-factor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './two-factor.component.html',
  styleUrl: './two-factor.component.scss'
})
export class TwoFactorComponent {
  code: string[] = Array(6).fill('');
  errorMessage = '';
  infoMessage = '';

  constructor(
    private readonly navigationService: NavigationService,
    private readonly authService: AuthService,
    private readonly authApiService: AuthApiService
  ) {}

  async verifyOtp(): Promise<void> {
    const email = this.authService.getEmail();
    const userId = Number(this.authService.getUserId() || 0);
    const otpCode = this.code.join('');

    if (!email || !userId) {
      await this.navigationService.goToLogin();
      return;
    }

    this.errorMessage = '';
    this.infoMessage = '';

    const result = await this.authApiService.handleOtp(otpCode, email, userId);

    if (!result.success) {
      this.errorMessage = result.error || 'No se pudo validar el OTP';
      return;
    }

    this.infoMessage = result.message || 'Código validado correctamente';

    if (result.route === 'main') {
      await this.navigationService.goToMain();
      return;
    }

    if (result.route === 'login') {
      await this.navigationService.goToLogin();
    }
  }

  onInput(index: number, event: Event, next?: HTMLInputElement | null): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/\D/g, '').slice(0, 1);

    this.code[index] = value;
    input.value = value;

    if (value && next) {
      next.focus();
    }
  }

  onBackspace(index: number, previous?: HTMLInputElement | null): void {
    if (!this.code[index] && previous) {
      previous.focus();
    }
  }

  goBack(): void {
    void this.navigationService.goToLogin();
  }
}