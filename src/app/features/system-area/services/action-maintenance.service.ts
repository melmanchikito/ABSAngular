import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  ActionItem,
  ActionListResponse,
  ApiResponse,
  CancelActionRequest,
  InsertActionRequest,
  UpdateActionRequest
} from '../models/action-maintenance.model';

@Injectable({
  providedIn: 'root'
})
export class ActionMaintenanceService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  getActions(): Observable<ActionItem[]> {
    return this.http
      .get<ApiResponse<ActionListResponse>>(
        `${this.apiUrl}/store/action/select`,
        {
          headers: this.getHeaders(),
          withCredentials: true
        }
      )
      .pipe(map((response) => response.data?.list ?? []));
  }

  getActionById(actionId: number): Observable<ActionItem> {
    const params = new HttpParams().set('action_id', String(actionId));

    return this.http
      .get<ApiResponse<ActionItem>>(
        `${this.apiUrl}/store/action/select-one`,
        {
          headers: this.getHeaders(),
          params,
          withCredentials: true
        }
      )
      .pipe(
        map((response) => {
          if (!response.data) {
            throw new Error('La respuesta no contiene la accion solicitada.');
          }

          return response.data;
        })
      );
  }

  insertAction(payload: InsertActionRequest): Observable<ApiResponse<ActionItem>> {
    return this.http.post<ApiResponse<ActionItem>>(
      `${this.apiUrl}/store/action/insert`,
      payload,
      {
        headers: this.getHeaders(),
        withCredentials: true
      }
    );
  }

  updateAction(payload: UpdateActionRequest): Observable<ApiResponse<ActionItem>> {
    return this.http.post<ApiResponse<ActionItem>>(
      `${this.apiUrl}/store/action/update`,
      payload,
      {
        headers: this.getHeaders(),
        withCredentials: true
      }
    );
  }

  cancelAction(payload: CancelActionRequest): Observable<ApiResponse<ActionItem>> {
    return this.http.post<ApiResponse<ActionItem>>(
      `${this.apiUrl}/store/action/canceled`,
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
