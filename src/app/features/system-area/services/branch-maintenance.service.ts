import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  ApiResponse,
  BranchItem,
  BranchListResponse,
  CancelBranchRequest,
  InsertBranchRequest,
  UpdateBranchRequest
} from '../models/branch-maintenance.model';

@Injectable({
  providedIn: 'root'
})
export class BranchMaintenanceService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  getBranches(): Observable<BranchItem[]> {
    return this.http
      .get<ApiResponse<BranchListResponse>>(
        `${this.apiUrl}/store/branch/select`,
        {
          headers: this.getHeaders(),
          withCredentials: true
        }
      )
      .pipe(map((response) => response.data?.list ?? []));
  }

  getBranchById(branchId: number): Observable<BranchItem> {
    const params = new HttpParams().set('branch_id', String(branchId));

    return this.http
      .get<ApiResponse<BranchItem>>(
        `${this.apiUrl}/store/branch/select-one`,
        {
          headers: this.getHeaders(),
          params,
          withCredentials: true
        }
      )
      .pipe(
        map((response) => {
          if (!response.data) {
            throw new Error('La respuesta no contiene la sucursal solicitada.');
          }

          return response.data;
        })
      );
  }

  getBranchesByCompany(companyId: number): Observable<BranchItem[]> {
    const params = new HttpParams().set('company_id', String(companyId));

    return this.http
      .get<ApiResponse<BranchListResponse>>(
        `${this.apiUrl}/store/branch/select-company`,
        {
          headers: this.getHeaders(),
          params,
          withCredentials: true
        }
      )
      .pipe(map((response) => response.data?.list ?? []));
  }

  insertBranch(payload: InsertBranchRequest): Observable<ApiResponse<BranchItem>> {
    return this.http.post<ApiResponse<BranchItem>>(
      `${this.apiUrl}/store/branch/insert`,
      payload,
      {
        headers: this.getHeaders(),
        withCredentials: true
      }
    );
  }

  updateBranch(payload: UpdateBranchRequest): Observable<ApiResponse<BranchItem>> {
    return this.http.post<ApiResponse<BranchItem>>(
      `${this.apiUrl}/store/branch/update`,
      payload,
      {
        headers: this.getHeaders(),
        withCredentials: true
      }
    );
  }

  cancelBranch(payload: CancelBranchRequest): Observable<ApiResponse<BranchItem>> {
    return this.http.post<ApiResponse<BranchItem>>(
      `${this.apiUrl}/store/branch/canceled`,
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
