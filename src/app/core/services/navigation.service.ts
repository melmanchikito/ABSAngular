import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { APP_ROUTES } from '../constants/app-routes.constants';
import {
  SystemAreaKey,
  SystemAreaSubmoduleKey
} from '../../features/system-area/models/system-area.model';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  constructor(private readonly router: Router) {}

  goToLogin(): Promise<boolean> {
    return this.router.navigate([APP_ROUTES.login]);
  }
  goToSystemArea(): Promise<boolean> {
    return this.goToAreaSubmodule('sistema', 'configuracion');
  }

  goToHome(): Promise<boolean> {
    return this.router.navigate([APP_ROUTES.home]);
  }

  goToArea(area: SystemAreaKey): Promise<boolean> {
    return this.router.navigate([APP_ROUTES.area, area]);
  }

  goToAreaSubmodule(
    area: SystemAreaKey,
    submodule: SystemAreaSubmoduleKey
  ): Promise<boolean> {
    return this.router.navigate([APP_ROUTES.area, area, submodule]);
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
    return this.goToHome();
  }

  goToHelpdesk(): Promise<boolean> {
    return this.router.navigate([APP_ROUTES.helpdesk]);
  }

  goToProfile(): Promise<boolean> {
    return this.router.navigate([APP_ROUTES.profile]);
  }

  goToMail(): Promise<boolean> {
    return this.router.navigate([APP_ROUTES.mail]);
  }
}
