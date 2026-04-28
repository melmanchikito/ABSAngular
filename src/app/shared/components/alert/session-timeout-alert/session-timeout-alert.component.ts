import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthApiService } from '../../../../features/auth/services/auth-api.service';

@Component({
  selector: 'app-session-timeout-alert',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './session-timeout-alert.component.html',
  styleUrl: './session-timeout-alert.component.scss'
})
export class SessionTimeoutAlertComponent implements OnInit, OnDestroy {
  private readonly idleLimitMs = 10 * 60 * 1000;
  //private readonly idleLimitMs = 10 * 1000;
  private readonly warningLimitSeconds = 5 * 60;
  //private readonly warningLimitSeconds = 15;

  private idleTimer: ReturnType<typeof setTimeout> | null = null;
  private countdownTimer: ReturnType<typeof setInterval> | null = null;
  private lastActivityReset = 0;

  warningVisible = false;
  sessionExpired = false;
  remainingSeconds = this.warningLimitSeconds;
  isLoggingOut = false;

  private readonly activityEvents = [
    'mousemove',
    'mousedown',
    'keydown',
    'scroll',
    'touchstart',
    'click'
  ];

  constructor(private readonly authApiService: AuthApiService) {}

  ngOnInit(): void {
    this.startListeningActivity();
    this.resetIdleTimer();
  }

  ngOnDestroy(): void {
    this.stopListeningActivity();
    this.clearTimers();
  }

  get formattedTime(): string {
    const minutes = Math.floor(this.remainingSeconds / 60);
    const seconds = this.remainingSeconds % 60;

    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  continueSession(): void {
    if (this.sessionExpired || this.isLoggingOut) {
      return;
    }

    this.warningVisible = false;
    this.sessionExpired = false;
    this.remainingSeconds = this.warningLimitSeconds;

    this.clearCountdownTimer();
    this.resetIdleTimer();
  }

  async logoutNow(): Promise<void> {
    if (this.isLoggingOut) {
      return;
    }

    this.isLoggingOut = true;
    this.clearTimers();

    await this.authApiService.handleLogout();
  }

  private startListeningActivity(): void {
    this.activityEvents.forEach((eventName) => {
      window.addEventListener(eventName, this.handleActivity, true);
    });
  }

  private stopListeningActivity(): void {
    this.activityEvents.forEach((eventName) => {
      window.removeEventListener(eventName, this.handleActivity, true);
    });
  }

  private handleActivity = (): void => {
    if (this.warningVisible || this.isLoggingOut) {
      return;
    }

    const now = Date.now();

    if (now - this.lastActivityReset < 1000) {
      return;
    }

    this.lastActivityReset = now;
    this.resetIdleTimer();
  };

  private resetIdleTimer(): void {
    this.clearIdleTimer();

    this.idleTimer = setTimeout(() => {
      this.showWarning();
    }, this.idleLimitMs);
  }

  private showWarning(): void {
    this.warningVisible = true;
    this.sessionExpired = false;
    this.remainingSeconds = this.warningLimitSeconds;

    this.clearCountdownTimer();

    this.countdownTimer = setInterval(() => {
      this.remainingSeconds--;

      if (this.remainingSeconds <= 0) {
        this.remainingSeconds = 0;
        this.sessionExpired = true;
        this.clearCountdownTimer();
      }
    }, 1000);
  }

  private clearTimers(): void {
    this.clearIdleTimer();
    this.clearCountdownTimer();
  }

  private clearIdleTimer(): void {
    if (this.idleTimer) {
      clearTimeout(this.idleTimer);
      this.idleTimer = null;
    }
  }

  private clearCountdownTimer(): void {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = null;
    }
  }
}