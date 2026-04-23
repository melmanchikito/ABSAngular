import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CookieService {
  setCookie(name: string, value: string | number, days = 1): void {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${encodeURIComponent(String(value))}; expires=${date.toUTCString()}; path=/; SameSite=Strict`;
  }

  getCookie(name: string): string | null {
    const nameEQ = `${name}=`;
    const cookies = document.cookie.split(';');

    for (let cookie of cookies) {
      while (cookie.startsWith(' ')) {
        cookie = cookie.substring(1);
      }

      if (cookie.startsWith(nameEQ)) {
        return decodeURIComponent(cookie.substring(nameEQ.length));
      }
    }

    return null;
  }

  deleteCookie(name: string): void {
    document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Strict`;
  }
}