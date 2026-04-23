import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AuthUser } from '../models/auth.model';
import { CookieService } from './cookie.service';
import { PermissionsService } from './permissions.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly userSubject = new BehaviorSubject<AuthUser | null>(null);
  readonly user$ = this.userSubject.asObservable();

  private inactivityTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private readonly cookieService: CookieService,
    private readonly permissionsService: PermissionsService
  ) {
    this.loadUserFromCookies();
    this.startActivityListeners();
  }

  loadUserFromCookies(): void {
    const token = this.cookieService.getCookie('authToken');
    const userId = this.cookieService.getCookie('userId');
    const nameUsuario = this.cookieService.getCookie('nameUsuario');
    const email = this.cookieService.getCookie('emailUser');

    if (token && userId && nameUsuario && email) {
      this.userSubject.next({
        token,
        userId: Number(userId),
        nameUsuario,
        email
      });
    } else {
      this.userSubject.next(null);
    }
  }

  getUserSnapshot(): AuthUser | null {
    return this.userSubject.value;
  }

  isAuthenticated(): boolean {
    return !!this.cookieService.getCookie('authToken');
  }

  login(user: AuthUser): void {
    this.cookieService.setCookie('authToken', user.token);
    this.cookieService.setCookie('userId', user.userId);
    this.cookieService.setCookie('nameUsuario', user.nameUsuario);
    this.cookieService.setCookie('emailUser', user.email);

    this.userSubject.next(user);
    this.resetInactivityTimer();
  }

  logout(): void {
    this.cookieService.deleteCookie('authToken');
    this.cookieService.deleteCookie('userId');
    this.cookieService.deleteCookie('nameUsuario');
    this.cookieService.deleteCookie('emailUser');
    this.cookieService.deleteCookie('isLogin');
    this.cookieService.deleteCookie('FirstPassword');

    localStorage.clear();
    this.permissionsService.clearPermissions();
    this.userSubject.next(null);

    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
      this.inactivityTimer = null;
    }
  }

  setEmail(email: string): void {
    this.cookieService.setCookie('emailUser', email);
  }

  getEmail(): string | null {
    return this.cookieService.getCookie('emailUser');
  }

  setIsLogin(value: string): void {
    this.cookieService.setCookie('isLogin', value);
  }

  getIsLogin(): string | null {
    return this.cookieService.getCookie('isLogin');
  }

  setName(username: string): void {
    this.cookieService.setCookie('nameUsuario', username);
  }

  getName(): string | null {
    return this.cookieService.getCookie('nameUsuario');
  }

  setUserId(id: string): void {
    this.cookieService.setCookie('userId', id);
  }

  getUserId(): string | null {
    return this.cookieService.getCookie('userId');
  }

  setFirstPassword(value: string): void {
    this.cookieService.setCookie('FirstPassword', value);
  }

  getFirstPassword(): string | null {
    return this.cookieService.getCookie('FirstPassword');
  }

  private startActivityListeners(): void {
    if (typeof window === 'undefined') {
      return;
    }

    ['mousemove', 'keydown', 'click'].forEach((eventName) => {
      window.addEventListener(eventName, () => this.resetInactivityTimer());
    });

    this.resetInactivityTimer();
  }

  private resetInactivityTimer(): void {
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
    }

    this.inactivityTimer = setTimeout(() => {
      this.logout();
      window.location.href = '/auth/login';
    }, 15 * 60 * 1000);
  }
}