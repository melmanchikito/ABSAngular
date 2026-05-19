import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  ApiResponse,
  AreaItem,
  AreaListResponse,
  CancelAreaRequest,
  InsertAreaRequest,
  UpdateAreaRequest
} from '../models/area-maintenance.model';

@Injectable({
  providedIn: 'root'
})
export class AreaMaintenanceService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  getAreas(): Observable<AreaItem[]> {
    return this.http
      .get<ApiResponse<AreaListResponse>>(
        `${this.apiUrl}/store/area/select`,
        {
          headers: this.getHeaders(),
          withCredentials: true
        }
      )
      .pipe(map((response) => response.data?.list ?? []));
  }

  getAreaById(areaId: number): Observable<AreaItem> {
    const params = new HttpParams().set('area_id', String(areaId));

    return this.http
      .get<ApiResponse<AreaItem>>(
        `${this.apiUrl}/store/area/select-one`,
        {
          headers: this.getHeaders(),
          params,
          withCredentials: true
        }
      )
      .pipe(
        map((response) => {
          if (!response.data) {
            throw new Error('La respuesta no contiene el area solicitada.');
          }

          return response.data;
        })
      );
  }

  insertArea(payload: InsertAreaRequest): Observable<ApiResponse<AreaItem>> {
    return this.http.post<ApiResponse<AreaItem>>(
      `${this.apiUrl}/store/area/insert`,
      payload,
      {
        headers: this.getHeaders(),
        withCredentials: true
      }
    );
  }

  updateArea(payload: UpdateAreaRequest): Observable<ApiResponse<AreaItem>> {
    return this.http.post<ApiResponse<AreaItem>>(
      `${this.apiUrl}/store/area/update`,
      payload,
      {
        headers: this.getHeaders(),
        withCredentials: true
      }
    );
  }

  cancelArea(payload: CancelAreaRequest): Observable<ApiResponse<AreaItem>> {
    return this.http.post<ApiResponse<AreaItem>>(
      `${this.apiUrl}/store/area/canceled`,
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
