import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/models/api-response.model';
import {
  Branch,
  Category,
  Company,
  Department,
  Employee,
  EquipmentWithDevices,
  Problem
} from '../../../core/models/master-data.model';

interface ListResponse<T> {
  list: T[];
}

@Injectable({
  providedIn: 'root'
})
export class MasterDataService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  getEmployees(): Observable<Employee[]> {
    return this.getList<Employee>(
      '/store/employee/select',
      'Error cargando empleados'
    );
  }

  getCompanies(): Observable<Company[]> {
    return this.getList<Company>(
      '/store/company/select',
      'Error cargando compañías'
    );
  }

  getBranches(): Observable<Branch[]> {
    return this.getList<Branch>(
      '/store/branch/select',
      'Error cargando sucursales'
    );
  }

  getDepartments(): Observable<Department[]> {
    return this.getList<Department>(
      '/store/department/select',
      'Error cargando departamentos'
    );
  }

  getCategories(): Observable<Category[]> {
    return this.getList<Category>(
      '/store/category/select',
      'Error cargando categorías'
    );
  }

  getProblems(): Observable<Problem[]> {
    return this.getList<Problem>(
      '/store/problem/select',
      'Error cargando problemas'
    );
  }

  getEquipmentWithDevices(employeeId: number): Observable<EquipmentWithDevices[]> {
    if (!employeeId || employeeId <= 0) {
      return of([]);
    }

    const params = new HttpParams().set('employee_id', String(employeeId));

    return this.http
      .get<ApiResponse<ListResponse<EquipmentWithDevices>>>(
        `${this.apiUrl}/store/equipment/select-total`,
        {
          headers: this.getAuthHeaders(),
          params,
          withCredentials: true
        }
      )
      .pipe(
        map((response) => {
          if ('error_code' in response) {
            console.error('Error API cargando equipos:', response.message);
            return [];
          }

         return response.data?.list ?? []; 
        }),
        catchError((error) => {
          console.error('Error cargando equipos con dispositivos:', error);
          return of([]);
        })
      );
  }
private extractList<T>(response: any): T[] {
  return response?.data?.list ?? response?.Data?.list ?? [];
}
  private getList<T>(endpoint: string, errorMessage: string): Observable<T[]> {
  return this.http
    .get<any>(
      `${this.apiUrl}${endpoint}`,
      {
        headers: this.getAuthHeaders(),
        withCredentials: true
      }
    )
    .pipe(
      map((response) => {
        if (response?.error_code) {
          console.error(errorMessage, response.message);
          return [];
        }

        return this.extractList<T>(response);
      }),
      catchError((error) => {
        console.error(errorMessage, error);
        return of([]);
      })
    );
}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || '';

    const headers: Record<string, string> = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-Device-Platform': 'web',
      'X-Device-Id': localStorage.getItem('device_id') || 'web-device',
      'X-Device-Fingerprint':
        localStorage.getItem('device_fingerprint') || 'web-fingerprint'
    };

    if (token) {
      headers['Authorization'] = token.startsWith('Bearer ')
        ? token
        : `Bearer ${token}`;
    }

    return new HttpHeaders(headers);
  }
}