import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  ApiResponse,
  CancelLocationRequest,
  InsertLocationRequest,
  LocationItem,
  LocationListResponse,
  UpdateLocationRequest
} from '../models/location-maintenance.model';

@Injectable({
  providedIn: 'root'
})
export class LocationMaintenanceService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  getLocations(): Observable<LocationItem[]> {
    return this.http
      .get<ApiResponse<LocationListResponse>>(
        `${this.apiUrl}/store/location/select`,
        {
          headers: this.getHeaders(),
          withCredentials: true
        }
      )
      .pipe(map((response) => response.data?.list ?? []));
  }

  getLocationById(locationId: number): Observable<LocationItem> {
    const params = new HttpParams().set('location_id', String(locationId));

    return this.http
      .get<ApiResponse<LocationItem>>(
        `${this.apiUrl}/store/location/select-one`,
        {
          headers: this.getHeaders(),
          params,
          withCredentials: true
        }
      )
      .pipe(
        map((response) => {
          if (!response.data) {
            throw new Error('La respuesta no contiene la ubicacion solicitada.');
          }

          return response.data;
        })
      );
  }

  insertLocation(payload: InsertLocationRequest): Observable<ApiResponse<LocationItem>> {
    return this.http.post<ApiResponse<LocationItem>>(
      `${this.apiUrl}/store/location/insert`,
      payload,
      {
        headers: this.getHeaders(),
        withCredentials: true
      }
    );
  }

  updateLocation(payload: UpdateLocationRequest): Observable<ApiResponse<LocationItem>> {
    return this.http.post<ApiResponse<LocationItem>>(
      `${this.apiUrl}/store/location/update`,
      payload,
      {
        headers: this.getHeaders(),
        withCredentials: true
      }
    );
  }

  cancelLocation(payload: CancelLocationRequest): Observable<ApiResponse<LocationItem>> {
    return this.http.post<ApiResponse<LocationItem>>(
      `${this.apiUrl}/store/location/canceled`,
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
