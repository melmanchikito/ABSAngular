import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthApiService } from '../../services/auth-api.service';
import { NavigationService } from '../../../../core/services/navigation.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  errorMessage = '';
  infoMessage = '';
  form: FormGroup;

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
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.errorMessage = '';
    this.infoMessage = '';

    const email = this.form.get('email')?.value ?? '';
    const password = this.form.get('password')?.value ?? '';

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
  }

  goToRecoverPassword(event: Event): void {
    event.preventDefault();
    void this.navigationService.goToRecoverPassword();
  }
}