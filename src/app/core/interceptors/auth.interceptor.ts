import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { CookieService } from '../services/cookie.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const cookieService = inject(CookieService);

  const token = getToken(cookieService);

  if (!token) {
    return next(req);
  }

  const cloned = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });

  return next(cloned);
};

function getToken(cookieService: CookieService): string {
  const storedToken =
    localStorage.getItem('token') ||
    sessionStorage.getItem('token') ||
    cookieService.getCookie('authToken') ||
    localStorage.getItem('authToken') ||
    sessionStorage.getItem('authToken');

  return normalizeToken(storedToken);
}

function normalizeToken(token: string | null): string {
  if (!token) {
    return '';
  }

  return token
    .replace(/^Bearer\s+/i, '')
    .replaceAll('"', '')
    .trim();
}
