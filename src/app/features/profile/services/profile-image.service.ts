import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {
  BehaviorSubject,
  Observable,
  catchError,
  from,
  map,
  of,
  switchMap,
  tap
} from 'rxjs';
import { environment } from '../../../../environments/environment';

interface InsertUserImageRequest {
  user_id: string;
  image: string;
  type: string;
  created_by: string;
}

interface UserImageResponse {
  code?: number;
  message?: string;
  data?: {
    user_id?: string;
    image?: string;
    type?: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ProfileImageService {
  private readonly baseUrl = `${environment.apiUrl}/store/user-image`;

  private readonly imageSubject = new BehaviorSubject<string | null>(
    localStorage.getItem('profileImageUrl')
  );

  readonly imageUrl$ = this.imageSubject.asObservable();

  constructor(private readonly http: HttpClient) {}

  uploadUserImage(file: File): Observable<string | null> {
    return from(this.fileToBase64(file)).pipe(
      switchMap((base64Image) => {
        const body: InsertUserImageRequest = {
          user_id: this.getUserId(),
          image: base64Image,
          type: 'profile',
          created_by: this.getUsername()
        };

        return this.http.post<UserImageResponse>(
          `${this.baseUrl}/insert`,
          body,
          {
            headers: this.getAuthHeaders(),
            withCredentials: true
          }
        );
      }),
      switchMap(() => this.loadUserImage()),
      catchError((error) => {
        console.error('Error subiendo imagen de usuario:', error);
        return of(null);
      })
    );
  }

  loadUserImage(): Observable<string | null> {
    return this.http.get<UserImageResponse>(
      `${this.baseUrl}/select`,
      {
        headers: this.getAuthHeaders(),
        params: {
          user_id: this.getUserId(),
          type: 'profile'
        },
        withCredentials: true
      }
    ).pipe(
      map((response) => {
        const image = response?.data?.image;

        if (!image) {
          return null;
        }

        return image;
      }),
      tap((imageUrl) => this.setImageUrl(imageUrl)),
      catchError((error) => {
        console.error('Error obteniendo imagen de usuario:', error);
        return of(null);
      })
    );
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.getToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-Device-Platform': 'web',
      'X-Device-Id': localStorage.getItem('device_id') || 'web-device',
      'X-Device-Fingerprint':
        localStorage.getItem('device_fingerprint') || 'web-fingerprint'
    };

    if (token) {
      headers['Authorization'] = token.startsWith('Bearer ')
        ? token
        : `Bearer ${token}`;
    } else {
      console.warn('No se encontró token válido. La API puede responder 401.');
    }

    return new HttpHeaders(headers);
  }

  private getToken(): string {
    const storages = [localStorage, sessionStorage];

    const possibleKeys = [
      'token',
      'access_token',
      'accessToken',
      'authToken',
      'jwt',
      'jwt_token',
      'ABS_TOKEN',
      'auth',
      'session',
      'user',
      'currentUser',
      'authUser',
      'userData',
      'login',
      'credentials'
    ];

    for (const storage of storages) {
      for (const key of possibleKeys) {
        const value = storage.getItem(key);
        const token = this.extractTokenFromValue(value);

        if (token) {
          return token;
        }
      }

      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);

        if (!key) {
          continue;
        }

        const value = storage.getItem(key);
        const token = this.extractTokenFromValue(value);

        if (token) {
          return token;
        }
      }
    }

    return '';
  }

  private extractTokenFromValue(value: string | null): string {
    if (!value) {
      return '';
    }

    const cleanValue = value.replaceAll('"', '').trim();

    if (cleanValue.startsWith('Bearer eyJ')) {
      return cleanValue.replace('Bearer ', '');
    }

    if (cleanValue.startsWith('eyJ')) {
      return cleanValue;
    }

    try {
      const parsed = JSON.parse(value);
      return this.findTokenInObject(parsed);
    } catch {
      return '';
    }
  }

  private findTokenInObject(data: unknown): string {
    if (!data || typeof data !== 'object') {
      return '';
    }

    const objectData = data as Record<string, unknown>;

    const possibleToken =
      objectData['token'] ||
      objectData['access_token'] ||
      objectData['accessToken'] ||
      objectData['authToken'] ||
      objectData['jwt'] ||
      objectData['jwt_token'];

    if (typeof possibleToken === 'string') {
      return possibleToken.replace('Bearer ', '').replaceAll('"', '');
    }

    for (const key of Object.keys(objectData)) {
      const value = objectData[key];

      if (value && typeof value === 'object') {
        const token = this.findTokenInObject(value);

        if (token) {
          return token;
        }
      }
    }

    return '';
  }

  private getUserId(): string {
    const directId =
      localStorage.getItem('user_id') ||
      localStorage.getItem('userId');

    if (directId) {
      return directId;
    }

    const userPermissions = localStorage.getItem('userPermissions');

    if (userPermissions) {
      try {
        const parsed = JSON.parse(userPermissions);

        if (parsed?.id) {
          return String(parsed.id);
        }
      } catch {
        return '';
      }
    }

    return '';
  }

  private getUsername(): string {
    const directUsername =
      localStorage.getItem('username') ||
      localStorage.getItem('user') ||
      localStorage.getItem('email');

    if (directUsername) {
      return directUsername;
    }

    const userPermissions = localStorage.getItem('userPermissions');

    if (userPermissions) {
      try {
        const parsed = JSON.parse(userPermissions);

        if (parsed?.username) {
          return String(parsed.username);
        }

        if (parsed?.email) {
          return String(parsed.email);
        }

        if (parsed?.id) {
          return `user_${parsed.id}`;
        }
      } catch {
        return 'adminUser';
      }
    }

    return 'adminUser';
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        resolve(reader.result as string);
      };

      reader.onerror = () => {
        reject(new Error('No se pudo leer la imagen.'));
      };

      reader.readAsDataURL(file);
    });
  }

  private setImageUrl(imageUrl: string | null): void {
    this.imageSubject.next(imageUrl);

    if (imageUrl) {
      localStorage.setItem('profileImageUrl', imageUrl);
    } else {
      localStorage.removeItem('profileImageUrl');
    }
  }
}