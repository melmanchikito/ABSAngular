import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  ApiResponse,
  CancelPositionRequest,
  InsertPositionRequest,
  PositionItem,
  PositionListResponse,
  UpdatePositionRequest
} from '../models/position-maintenance.model';

@Injectable({
  providedIn: 'root'
})
export class PositionMaintenanceService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  getPositions(): Observable<PositionItem[]> {
    return this.http
      .get<ApiResponse<PositionListResponse>>(
        `${this.apiUrl}/store/position/select`,
        {
          headers: this.getHeaders(),
          withCredentials: true
        }
      )
      .pipe(map((response) => response.data?.list ?? []));
  }

  getPositionById(positionId: number): Observable<PositionItem> {
    const params = new HttpParams().set('position_id', String(positionId));

    return this.http
      .get<ApiResponse<PositionItem>>(
        `${this.apiUrl}/store/position/select-one`,
        {
          headers: this.getHeaders(),
          params,
          withCredentials: true
        }
      )
      .pipe(
        map((response) => {
          if (!response.data) {
            throw new Error('La respuesta no contiene el cargo solicitado.');
          }

          return response.data;
        })
      );
  }

  insertPosition(payload: InsertPositionRequest): Observable<ApiResponse<PositionItem>> {
    return this.http.post<ApiResponse<PositionItem>>(
      `${this.apiUrl}/store/position/insert`,
      payload,
      {
        headers: this.getHeaders(),
        withCredentials: true
      }
    );
  }

  updatePosition(payload: UpdatePositionRequest): Observable<ApiResponse<PositionItem>> {
    return this.http.post<ApiResponse<PositionItem>>(
      `${this.apiUrl}/store/position/update`,
      payload,
      {
        headers: this.getHeaders(),
        withCredentials: true
      }
    );
  }

  cancelPosition(payload: CancelPositionRequest): Observable<ApiResponse<PositionItem>> {
    return this.http.post<ApiResponse<PositionItem>>(
      `${this.apiUrl}/store/position/canceled`,
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
