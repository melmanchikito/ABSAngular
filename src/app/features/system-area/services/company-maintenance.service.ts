import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  ApiResponse,
  CancelCompanyRequest,
  Company,
  CompanyListResponse,
  InsertCompanyRequest,
  UpdateCompanyRequest
} from '../models/company-maintenance.model';

@Injectable({
  providedIn: 'root'
})
export class CompanyMaintenanceService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  getCompanies(): Observable<Company[]> {
    return this.http
      .get<ApiResponse<CompanyListResponse>>(
        `${this.apiUrl}/store/company/select`,
        {
          headers: this.getHeaders(),
          withCredentials: true
        }
      )
      .pipe(map((response) => response.data?.list ?? []));
  }

  getCompanyById(companyId: number): Observable<Company> {
    const params = new HttpParams().set('company_id', String(companyId));

    return this.http
      .get<ApiResponse<Company>>(
        `${this.apiUrl}/store/company/select-one`,
        {
          headers: this.getHeaders(),
          params,
          withCredentials: true
        }
      )
      .pipe(
        map((response) => {
          if (!response.data) {
            throw new Error('La respuesta no contiene la empresa solicitada.');
          }

          return response.data;
        })
      );
  }

  insertCompany(payload: InsertCompanyRequest): Observable<ApiResponse<Company>> {
    return this.http.post<ApiResponse<Company>>(
      `${this.apiUrl}/store/company/insert`,
      payload,
      {
        headers: this.getHeaders(),
        withCredentials: true
      }
    );
  }

  updateCompany(payload: UpdateCompanyRequest): Observable<ApiResponse<Company>> {
    return this.http.post<ApiResponse<Company>>(
      `${this.apiUrl}/store/company/update`,
      payload,
      {
        headers: this.getHeaders(),
        withCredentials: true
      }
    );
  }

  cancelCompany(payload: CancelCompanyRequest): Observable<ApiResponse<Company>> {
    return this.http.post<ApiResponse<Company>>(
      `${this.apiUrl}/store/company/canceled`,
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
