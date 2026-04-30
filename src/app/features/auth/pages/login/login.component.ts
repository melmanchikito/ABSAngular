import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  CircleAlert,
  Eye,
  EyeOff,
  Info,
  LockKeyhole,
  LogIn,
  LucideAngularModule,
  Mail
} from 'lucide-angular';
import { AuthApiService } from '../../services/auth-api.service';
import { NavigationService } from '../../../../core/services/navigation.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  readonly alertIcon = CircleAlert;
  readonly eyeIcon = Eye;
  readonly eyeOffIcon = EyeOff;
  readonly infoIcon = Info;
  readonly lockIcon = LockKeyhole;
  readonly loginIcon = LogIn;
  readonly mailIcon = Mail;

  errorMessage = '';
  infoMessage = '';
  form: FormGroup;
  showPassword = false;
  isSubmitting = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly authApiService: AuthApiService,
    private readonly navigationService: NavigationService
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid || this.isSubmitting) {
      this.form.markAllAsTouched();
      return;
    }

    this.errorMessage = '';
    this.infoMessage = '';
    this.isSubmitting = true;

    const email = this.form.get('email')?.value ?? '';
    const password = this.form.get('password')?.value ?? '';

    try {
      const result = await this.authApiService.handleLogin(email, password);

      if (!result.success) {
        this.errorMessage = result.error || 'No se pudo iniciar sesión';
        return;
      }

      if (result.message) {
        this.infoMessage = result.message;
      }

      if (result.route === 'new-password') {
        await this.navigationService.goToNewPassword();
        return;
      }

      if (result.route === 'two-factor') {
        await this.navigationService.goToTwoFactor();
        return;
      }

      if (result.route === 'main') {
        await this.navigationService.goToMain();
      }
    } finally {
      this.isSubmitting = false;
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  goToRecoverPassword(event: Event): void {
    event.preventDefault();
    void this.navigationService.goToRecoverPassword();
  }
}
