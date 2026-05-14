import { Injectable } from '@angular/core';
import { PreferencesService } from './preferences.service';

@Injectable({
  providedIn: 'root'
})
export class MotionService {
  private readonly loginTransitionKey = 'abs_login_dashboard_transition';

  constructor(private readonly preferencesService: PreferencesService) {}

  get animationsEnabled(): boolean {
    return this.preferencesService.snapshot.showAnimations;
  }

  markLoginDashboardTransition(): void {
    if (!this.animationsEnabled) {
      return;
    }

    sessionStorage.setItem(this.loginTransitionKey, 'true');
  }

  consumeLoginDashboardTransition(): boolean {
    const shouldRun =
      this.animationsEnabled &&
      sessionStorage.getItem(this.loginTransitionKey) === 'true';

    sessionStorage.removeItem(this.loginTransitionKey);

    return shouldRun;
  }
}
