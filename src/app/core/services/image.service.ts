import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, from, map, of, switchMap, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

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
            headers: this.getAuthHeaders()
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
        headers: this.getAuthHeaders()
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

    if (!token) {
      console.warn('No se encontró token de autenticación en localStorage.');
      return new HttpHeaders({
        'Content-Type': 'application/json'
      });
    }

    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: token.startsWith('Bearer ') ? token : `Bearer ${token}`
    });
  }

  private getToken(): string {
    const possibleKeys = [
      'token',
      'access_token',
      'accessToken',
      'authToken',
      'jwt',
      'ABS_TOKEN'
    ];

    for (const key of possibleKeys) {
      const value = localStorage.getItem(key);

      if (value) {
        return value.replaceAll('"', '');
      }
    }

    return '';
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

  private getUserId(): string {
    return (
      localStorage.getItem('user_id') ||
      localStorage.getItem('userId') ||
      '5'
    );
  }

  private getUsername(): string {
    return (
      localStorage.getItem('username') ||
      localStorage.getItem('user') ||
      'adminUser'
    );
  }
}