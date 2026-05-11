import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  ApiResponse,
  CancelProductRequest,
  InsertProductRequest,
  ProductItem,
  ProductListResponse,
  UpdateProductRequest
} from '../models/product-maintenance.model';

@Injectable({
  providedIn: 'root'
})
export class ProductMaintenanceService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  getProducts(): Observable<ProductItem[]> {
    return this.http
      .get<ApiResponse<ProductListResponse>>(
        `${this.apiUrl}/store/product/select`,
        {
          headers: this.getHeaders(),
          withCredentials: true
        }
      )
      .pipe(map((response) => response.data?.list ?? []));
  }

  getProductById(productId: number): Observable<ProductItem> {
    const params = new HttpParams().set('product_id', String(productId));

    return this.http
      .get<ApiResponse<ProductItem>>(
        `${this.apiUrl}/store/product/select-one`,
        {
          headers: this.getHeaders(),
          params,
          withCredentials: true
        }
      )
      .pipe(
        map((response) => {
          if (!response.data) {
            throw new Error('La respuesta no contiene el producto solicitado.');
          }

          return response.data;
        })
      );
  }

  insertProduct(payload: InsertProductRequest): Observable<ApiResponse<ProductItem>> {
    return this.http.post<ApiResponse<ProductItem>>(
      `${this.apiUrl}/store/product/insert`,
      payload,
      {
        headers: this.getHeaders(),
        withCredentials: true
      }
    );
  }

  updateProduct(payload: UpdateProductRequest): Observable<ApiResponse<ProductItem>> {
    return this.http.post<ApiResponse<ProductItem>>(
      `${this.apiUrl}/store/product/update`,
      payload,
      {
        headers: this.getHeaders(),
        withCredentials: true
      }
    );
  }

  cancelProduct(payload: CancelProductRequest): Observable<ApiResponse<ProductItem>> {
    return this.http.post<ApiResponse<ProductItem>>(
      `${this.apiUrl}/store/product/canceled`,
      payload,
      {
        headers: this.getHeaders(),
        withCredentials: true
      }
    );
  }

  getReviewProducts(): Observable<ProductItem[]> {
    return this.http
      .get<ApiResponse<ProductListResponse>>(
        `${this.apiUrl}/reviews/product/select`,
        {
          headers: this.getHeaders(),
          withCredentials: true
        }
      )
      .pipe(map((response) => response.data?.list ?? []));
  }

  getReviewProductById(productId: number): Observable<ProductItem> {
    const params = new HttpParams().set('product_id', String(productId));

    return this.http
      .get<ApiResponse<ProductItem>>(
        `${this.apiUrl}/reviews/product/select-one`,
        {
          headers: this.getHeaders(),
          params,
          withCredentials: true
        }
      )
      .pipe(
        map((response) => {
          if (!response.data) {
            throw new Error('La respuesta no contiene el producto de revision solicitado.');
          }

          return response.data;
        })
      );
  }

  getPromotions(): Observable<ApiResponse<unknown>> {
    return this.http.get<ApiResponse<unknown>>(
      `${this.apiUrl}/reviews/promotion/select`,
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
