import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  ApiResponse,
  CancelOptionRequest,
  InsertOptionRequest,
  OptionItem,
  OptionListResponse,
  OptionTypeItem,
  OptionTypeListResponse,
  UpdateOptionRequest
} from '../models/option-maintenance.model';

@Injectable({
  providedIn: 'root'
})
export class OptionMaintenanceService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  getOptions(): Observable<OptionItem[]> {
    return this.http
      .get<ApiResponse<OptionListResponse>>(
        `${this.apiUrl}/store/option/select`,
        {
          headers: this.getHeaders(),
          withCredentials: true
        }
      )
      .pipe(map((response) => response.data?.list ?? []));
  }

  getOptionById(optionId: number): Observable<OptionItem> {
    const params = new HttpParams().set('option_id', String(optionId));

    return this.http
      .get<ApiResponse<OptionItem>>(
        `${this.apiUrl}/store/option/select-one`,
        {
          headers: this.getHeaders(),
          params,
          withCredentials: true
        }
      )
      .pipe(
        map((response) => {
          if (!response.data) {
            throw new Error('La respuesta no contiene la opcion solicitada.');
          }

          return response.data;
        })
      );
  }

  insertOption(payload: InsertOptionRequest): Observable<ApiResponse<OptionItem>> {
    return this.http.post<ApiResponse<OptionItem>>(
      `${this.apiUrl}/store/option/insert`,
      payload,
      {
        headers: this.getHeaders(),
        withCredentials: true
      }
    );
  }

  updateOption(payload: UpdateOptionRequest): Observable<ApiResponse<OptionItem>> {
    return this.http.post<ApiResponse<OptionItem>>(
      `${this.apiUrl}/store/option/update`,
      payload,
      {
        headers: this.getHeaders(),
        withCredentials: true
      }
    );
  }

  cancelOption(payload: CancelOptionRequest): Observable<ApiResponse<OptionItem>> {
    return this.http.post<ApiResponse<OptionItem>>(
      `${this.apiUrl}/store/option/canceled`,
      payload,
      {
        headers: this.getHeaders(),
        withCredentials: true
      }
    );
  }

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

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-Device-Platform': 'web',
      'X-Device-Id': localStorage.getItem('device_id') || 'web-device',
      'X-Device-Fingerprint':
        localStorage.getItem('device_fingerprint') || 'web-fingerprint'
    });
  }
}
