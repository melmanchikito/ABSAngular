import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CookieService } from '../../../core/services/cookie.service';

export interface PermissionActionNode {
  id: number;
  name: string;
  has_permission: boolean;
}

export interface PermissionOptionNode {
  id: number;
  name: string;
  actions: PermissionActionNode[];
}

export interface PermissionModuleNode {
  id: number;
  name: string;
  options: PermissionOptionNode[];
}

export interface PermissionAreaNode {
  id: number;
  name: string;
  modules: PermissionModuleNode[];
}

export interface PermissionTreeData {
  areas?: PermissionAreaNode[];
}

interface ApiResponse<T> {
  code?: number;
  message?: string;
  data?: T;
  areas?: PermissionAreaNode[];
}

@Injectable({
  providedIn: 'root'
})
export class PermissionManagerService {
  private readonly apiUrl = environment.apiUrl;

  constructor(
    private readonly http: HttpClient,
    private readonly cookieService: CookieService
  ) {}

  getUserPermissions(userId: number): Observable<PermissionAreaNode[]> {
    const url = `${this.apiUrl}/tasks/permissions/user-permissions`;
    const params = new HttpParams().set('user_id', String(userId));

    console.group('GESTOR PERMISOS REQUEST');
    console.log('User ID:', userId);
    console.log('URL:', `${url}?${params.toString()}`);
    console.log('Headers:', this.headersToObject(this.getHeaders()));
    console.trace();
    console.groupEnd();

    return this.http
      .get<ApiResponse<PermissionTreeData>>(url, {
        headers: this.getHeaders(),
        params,
        withCredentials: true
      })
      .pipe(
        map((response) => {
          console.group('GESTOR PERMISOS RESPONSE');
          console.log('User ID:', userId);
          console.log('URL:', `${url}?${params.toString()}`);
          console.log('Respuesta completa:', response);
          console.groupEnd();

          return response.data?.areas ?? response.areas ?? [];
        })
      );
  }

  getPermissionsTree(userId: number): Observable<PermissionAreaNode[]> {
    return this.getUserPermissions(userId);
  }

  private getHeaders(): HttpHeaders {
    const token = this.getToken();
    const headers: Record<string, string> = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-Device-Platform': 'web',
      'X-Device-Id': localStorage.getItem('device_id') || 'web-device',
      'X-Device-Fingerprint':
        localStorage.getItem('device_fingerprint') || 'web-fingerprint'
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

  private headersToObject(headers: HttpHeaders): Record<string, string | null> {
    return headers.keys().reduce<Record<string, string | null>>((accumulator, key) => {
      accumulator[key] = headers.get(key);
      return accumulator;
    }, {});
  }
}
