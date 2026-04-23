import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RecoverPasswordComponent } from './pages/recover-password/recover-password.component';
import { NewPasswordComponent } from './pages/new-password/new-password.component';
import { TwoFactorComponent } from './pages/two-factor/two-factor.component';

export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'recover-password',
    component: RecoverPasswordComponent
  },
  {
    path: 'new-password',
    component: NewPasswordComponent
  },
  {
    path: 'two-factor',
    component: TwoFactorComponent
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  }
];