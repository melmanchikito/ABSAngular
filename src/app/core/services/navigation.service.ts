import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { APP_ROUTES } from '../constants/app-routes.constants';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  constructor(private readonly router: Router) {}

  goToLogin(): Promise<boolean> {
    return this.router.navigate([APP_ROUTES.login]);
  }

  goToRecoverPassword(): Promise<boolean> {
    return this.router.navigate([APP_ROUTES.recoverPassword]);
  }

  goToNewPassword(): Promise<boolean> {
    return this.router.navigate([APP_ROUTES.newPassword]);
  }

  goToTwoFactor(): Promise<boolean> {
    return this.router.navigate([APP_ROUTES.twoFactor]);
  }

  goToMain(): Promise<boolean> {
    return this.router.navigate([APP_ROUTES.main]);
  }

  goToHelpdesk(): Promise<boolean> {
    return this.router.navigate([APP_ROUTES.helpdesk]);
  }
}