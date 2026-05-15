import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  ApiResponse,
  CancelSellerRequest,
  InsertSellerRequest,
  SellerItem,
  SellerListResponse,
  UpdateSellerRequest
} from '../models/seller-maintenance.model';

@Injectable({
  providedIn: 'root'
})
export class SellerMaintenanceService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  getSellers(): Observable<SellerItem[]> {
    return this.http
      .get<ApiResponse<SellerListResponse>>(
        `${this.apiUrl}/store/seller/select`,
        {
          headers: this.getHeaders(),
          withCredentials: true
        }
      )
      .pipe(map((response) => response.data?.list ?? []));
  }

  getSellerById(sellerId: number): Observable<SellerItem> {
    const params = new HttpParams().set('seller_id', String(sellerId));

    return this.http
      .get<ApiResponse<SellerItem>>(
        `${this.apiUrl}/store/seller/select-one`,
        {
          headers: this.getHeaders(),
          params,
          withCredentials: true
        }
      )
      .pipe(
        map((response) => {
          if (!response.data) {
            throw new Error('La respuesta no contiene el vendedor solicitado.');
          }

          return response.data;
        })
      );
  }

  insertSeller(payload: InsertSellerRequest): Observable<ApiResponse<SellerItem>> {
    return this.http.post<ApiResponse<SellerItem>>(
      `${this.apiUrl}/store/seller/insert`,
      payload,
      {
        headers: this.getHeaders(),
        withCredentials: true
      }
    );
  }

  updateSeller(payload: UpdateSellerRequest): Observable<ApiResponse<SellerItem>> {
    return this.http.post<ApiResponse<SellerItem>>(
      `${this.apiUrl}/store/seller/update`,
      payload,
      {
        headers: this.getHeaders(),
        withCredentials: true
      }
    );
  }

  cancelSeller(payload: CancelSellerRequest): Observable<ApiResponse<SellerItem>> {
    return this.http.post<ApiResponse<SellerItem>>(
      `${this.apiUrl}/store/seller/canceled`,
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
