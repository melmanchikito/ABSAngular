import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  ApiResponse,
  CancelDepartmentRequest,
  DepartmentItem,
  DepartmentListResponse,
  InsertDepartmentRequest,
  UpdateDepartmentRequest
} from '../models/department-maintenance.model';

@Injectable({
  providedIn: 'root'
})
export class DepartmentMaintenanceService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  getDepartments(): Observable<DepartmentItem[]> {
    return this.http
      .get<ApiResponse<DepartmentListResponse>>(
        `${this.apiUrl}/store/department/select`,
        {
          headers: this.getHeaders(),
          withCredentials: true
        }
      )
      .pipe(map((response) => response.data?.list ?? []));
  }

  getDepartmentById(departmentId: number): Observable<DepartmentItem> {
    const params = new HttpParams().set('department_id', String(departmentId));

    return this.http
      .get<ApiResponse<DepartmentItem>>(
        `${this.apiUrl}/store/department/select-one`,
        {
          headers: this.getHeaders(),
          params,
          withCredentials: true
        }
      )
      .pipe(
        map((response) => {
          if (!response.data) {
            throw new Error('La respuesta no contiene el departamento solicitado.');
          }

          return response.data;
        })
      );
  }

  insertDepartment(payload: InsertDepartmentRequest): Observable<ApiResponse<DepartmentItem>> {
    return this.http.post<ApiResponse<DepartmentItem>>(
      `${this.apiUrl}/store/department/insert`,
      payload,
      {
        headers: this.getHeaders(),
        withCredentials: true
      }
    );
  }

  updateDepartment(payload: UpdateDepartmentRequest): Observable<ApiResponse<DepartmentItem>> {
    return this.http.post<ApiResponse<DepartmentItem>>(
      `${this.apiUrl}/store/department/update`,
      payload,
      {
        headers: this.getHeaders(),
        withCredentials: true
      }
    );
  }

  cancelDepartment(payload: CancelDepartmentRequest): Observable<ApiResponse<DepartmentItem>> {
    return this.http.post<ApiResponse<DepartmentItem>>(
      `${this.apiUrl}/store/department/canceled`,
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
