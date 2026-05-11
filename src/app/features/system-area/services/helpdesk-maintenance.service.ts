import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  ApiResponse,
  HelpdeskItem,
  HelpdeskListResponse,
  InsertHelpdeskRequest,
  UpdateHelpdeskRequest
} from '../models/helpdesk-maintenance.model';

@Injectable({
  providedIn: 'root'
})
export class HelpdeskMaintenanceService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  getHelpdesks(): Observable<HelpdeskItem[]> {
    return this.http
      .get<ApiResponse<HelpdeskListResponse>>(
        `${this.apiUrl}/store/helpdesk/select`,
        {
          headers: this.getHeaders(),
          withCredentials: true
        }
      )
      .pipe(map((response) => response.data?.list ?? []));
  }

  getHelpdeskById(helpdeskId: number): Observable<HelpdeskItem> {
    const params = new HttpParams().set('helpdesk_id', String(helpdeskId));

    return this.http
      .get<ApiResponse<HelpdeskItem>>(
        `${this.apiUrl}/store/helpdesk/select-one`,
        {
          headers: this.getHeaders(),
          params,
          withCredentials: true
        }
      )
      .pipe(
        map((response) => {
          if (!response.data) {
            throw new Error('La respuesta no contiene el helpdesk solicitado.');
          }

          return response.data;
        })
      );
  }

  insertHelpdesk(payload: InsertHelpdeskRequest): Observable<ApiResponse<HelpdeskItem>> {
    return this.http.post<ApiResponse<HelpdeskItem>>(
      `${this.apiUrl}/store/helpdesk/insert`,
      payload,
      {
        headers: this.getHeaders(),
        withCredentials: true
      }
    );
  }

  updateHelpdesk(payload: UpdateHelpdeskRequest): Observable<ApiResponse<HelpdeskItem>> {
    return this.http.post<ApiResponse<HelpdeskItem>>(
      `${this.apiUrl}/store/helpdesk/update`,
      payload,
      {
        headers: this.getHeaders(),
        withCredentials: true
      }
    );
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
