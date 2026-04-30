import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  ArrowLeft,
  CircleAlert,
  Info,
  LucideAngularModule,
  MailSearch,
  Send
} from 'lucide-angular';
import { NavigationService } from '../../../../core/services/navigation.service';
import { AuthApiService } from '../../services/auth-api.service';

@Component({
  selector: 'app-recover-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  templateUrl: './recover-password.component.html',
  styleUrl: './recover-password.component.scss'
})
export class RecoverPasswordComponent {
  readonly alertIcon = CircleAlert;
  readonly backIcon = ArrowLeft;
  readonly infoIcon = Info;
  readonly mailSearchIcon = MailSearch;
  readonly sendIcon = Send;

  errorMessage = '';
  infoMessage = '';
  form: FormGroup;
  isSubmitting = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly navigationService: NavigationService,
    private readonly authApiService: AuthApiService
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
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

    try {
      const result = await this.authApiService.handleRecover(email);

      if (!result.success) {
        this.errorMessage = result.error || 'No se pudo validar el correo';
        return;
      }

      if (result.message) {
        this.infoMessage = result.message;
      }

      if (result.route === 'two-factor') {
        await this.navigationService.goToTwoFactor();
        return;
      }

      if (result.route === 'new-password') {
        await this.navigationService.goToNewPassword();
      }
    } finally {
      this.isSubmitting = false;
    }
  }

  goBack(): void {
    void this.navigationService.goToLogin();
  }
}
