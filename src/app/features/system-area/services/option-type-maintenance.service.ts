import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CookieService } from '../../../core/services/cookie.service';
import {
  ApiResponse,
  CancelOptionTypeRequest,
  InsertOptionTypeRequest,
  OptionTypeItem,
  OptionTypeListResponse,
  UpdateOptionTypeRequest
} from '../models/option-type-maintenance.model';

@Injectable({
  providedIn: 'root'
})
export class OptionTypeMaintenanceService {
  private readonly apiUrl = environment.apiUrl;

  constructor(
    private readonly http: HttpClient,
    private readonly cookieService: CookieService
  ) {}

  getOptionTypes(): Observable<OptionTypeItem[]> {
    return this.http
      .get<ApiResponse<OptionTypeListResponse>>(
        `${this.apiUrl}/store/option-type/select`,
        {
          headers: this.getHeaders(),
          withCredentials: true
        }
      )
      .pipe(map((response) => response.data?.list ?? []));
  }

  getOptionTypeById(optionTypeId: number): Observable<OptionTypeItem> {
    const params = new HttpParams().set('option_type_id', String(optionTypeId));

    return this.http
      .get<ApiResponse<OptionTypeItem>>(
        `${this.apiUrl}/store/option-type/select-one`,
        {
          headers: this.getHeaders(),
          params,
          withCredentials: true
        }
      )
      .pipe(
        map((response) => {
          if (!response.data) {
            throw new Error('La respuesta no contiene el tipo de opcion solicitado.');
          }

          return response.data;
        })
      );
  }

  insertOptionType(payload: InsertOptionTypeRequest): Observable<ApiResponse<OptionTypeItem>> {
    return this.http.post<ApiResponse<OptionTypeItem>>(
      `${this.apiUrl}/store/option-type/insert`,
      payload,
      {
        headers: this.getHeaders(),
        withCredentials: true
      }
    );
  }

  updateOptionType(payload: UpdateOptionTypeRequest): Observable<ApiResponse<OptionTypeItem>> {
    return this.http.post<ApiResponse<OptionTypeItem>>(
      `${this.apiUrl}/store/option-type/update`,
      payload,
      {
        headers: this.getHeaders(),
        withCredentials: true
      }
    );
  }

  cancelOptionType(payload: CancelOptionTypeRequest): Observable<ApiResponse<OptionTypeItem>> {
    return this.http.post<ApiResponse<OptionTypeItem>>(
      `${this.apiUrl}/store/option-type/canceled`,
      payload,
      {
        headers: this.getHeaders(),
        withCredentials: true
      }
    );
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
      headers['Authorization'] = token.startsWith('Bearer ')
        ? token
        : `Bearer ${token}`;
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
