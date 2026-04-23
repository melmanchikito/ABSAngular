import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NavigationService } from '../../../../core/services/navigation.service';
import { AuthApiService } from '../../services/auth-api.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-new-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './new-password.component.html',
  styleUrl: './new-password.component.scss'
})
export class NewPasswordComponent implements OnInit {
  errorMessage = '';
  infoMessage = '';
  userId: number | null = null;
  firstPassword = false;
  form: FormGroup;

  constructor(
    private readonly fb: FormBuilder,
    private readonly navigationService: NavigationService,
    private readonly authApiService: AuthApiService,
    private readonly authService: AuthService
  ) {
    this.form = this.fb.group({
      password: ['', [Validators.required]],
      passwordConfirmation: ['', [Validators.required]]
    });
  }

 /* ngOnInit(): void {
    const userIdFromCookie = this.authService.getUserId();
    const firstPasswordFlag = this.authService.getFirstPassword() === 'true';

    if (!userIdFromCookie) {
      void this.navigationService.goToLogin();
      return;
    }

    this.userId = Number(userIdFromCookie);
    this.firstPassword = firstPasswordFlag;
  }*/
 ngOnInit(): void {
  const userIdFromCookie = this.authService.getUserId();
  const firstPasswordFlag = this.authService.getFirstPassword() === 'true';

  this.userId = userIdFromCookie ? Number(userIdFromCookie) : 0;
  this.firstPassword = firstPasswordFlag;
}

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.errorMessage = '';
    this.infoMessage = '';

    const password = this.form.get('password')?.value ?? '';
    const passwordConfirmation = this.form.get('passwordConfirmation')?.value ?? '';

    const result = await this.authApiService.handleNewPassword(
      password,
      passwordConfirmation,
      this.userId ?? undefined,
      this.firstPassword
    );

    if (!result.success) {
      this.errorMessage = result.error || 'No se pudo actualizar la contraseña';
      return;
    }

    this.infoMessage = result.message || 'Contraseña actualizada correctamente';
  }

  goBack(): void {
    void this.navigationService.goToLogin();
  }
}