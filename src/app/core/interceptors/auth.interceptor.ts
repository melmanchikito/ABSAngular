import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { CookieService } from '../services/cookie.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const cookieService = inject(CookieService);

  const token = cookieService.getCookie('authToken');

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
