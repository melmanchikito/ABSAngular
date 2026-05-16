import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CookieService } from '../../../core/services/cookie.service';
import {
  ApiResponse,
  CancelUserRequest,
  InsertUserRequest,
  UpdateUserRequest,
  UserItem,
  UserListResponse,
} from '../models/user-maintenance.model';

@Injectable({
  providedIn: 'root',
})
export class UserMaintenanceService {
  private readonly apiUrl = environment.apiUrl;

  constructor(
    private readonly http: HttpClient,
    private readonly cookieService: CookieService,
  ) {}

  getUsers(): Observable<UserItem[]> {
    return this.http
      .get<ApiResponse<UserListResponse>>(`${this.apiUrl}/store/user/select`, {
        headers: this.getHeaders(),
        withCredentials: true,
      })
      .pipe(map((response) => response.data?.list ?? []));
  }

  getUserById(userId: number): Observable<UserItem> {
    const params = new HttpParams().set('user_id', String(userId));

    return this.http
      .get<ApiResponse<UserItem>>(`${this.apiUrl}/store/user/select-one`, {
        headers: this.getHeaders(),
        params,
        withCredentials: true,
      })
      .pipe(
        map((response) => {
          if (!response.data) {
            throw new Error('La respuesta no contiene el usuario solicitado.');
          }

          return response.data;
        }),
      );
  }

  insertUser(payload: InsertUserRequest): Observable<ApiResponse<UserItem>> {
    const url = `${this.apiUrl}/register`;

    return this.http.post<ApiResponse<UserItem>>(url, payload, {
      headers: this.getHeaders(),
      withCredentials: true,
    });
  }

  updateUser(payload: UpdateUserRequest): Observable<ApiResponse<UserItem>> {
    const url = `${this.apiUrl}/store/user/update`;

    return this.http.post<ApiResponse<UserItem>>(url, payload, {
      headers: this.getHeaders(),
      withCredentials: true,
    });
  }

  cancelUser(payload: CancelUserRequest): Observable<ApiResponse<UserItem>> {
    return this.http.post<ApiResponse<UserItem>>(`${this.apiUrl}/store/user/canceled`, payload, {
      headers: this.getHeaders(),
      withCredentials: true,
    });
  }

  private getHeaders(): HttpHeaders {
    const token = this.getToken();
    const headers: Record<string, string> = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-Device-Platform': 'web',
      'X-Device-Id': localStorage.getItem('device_id') || 'web-device',
      'X-Device-Fingerprint': localStorage.getItem('device_fingerprint') || 'web-fingerprint',
    };

    if (token) {
      headers['Authorization'] = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    }

    return new HttpHeaders(headers);
  }

  private getToken(): string {
    const storedToken =
      localStorage.getItem('token') ||
      sessionStorage.getItem('token') ||
      this.cookieService.getCookie('authToken') ||
      localStorage.getItem('authToken') ||
      sessionStorage.getItem('authToken');

    return this.normalizeToken(storedToken);
  }

  private normalizeToken(token: string | null): string {
    if (!token) {
      return '';
    }

    return token
      .replace(/^Bearer\s+/i, '')
      .replaceAll('"', '')
      .trim();
  }
}
