import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import { environment } from '../../../../environments/environment';

interface ApiSuccess<T> {
  code?: number;
  message?: string;
  data?: T;
}

interface ApiErrorResponse {
  code?: number;
  error_code: string;
  message?: string;
}

type BackendResponse<T> = ApiSuccess<T> | ApiErrorResponse;

interface ListResponse<T> {
  list: T[];
}

export interface Employee {
  id: number;
  code: string;
  name: string;
  company_id: number;
  branch_id: number;
  department_id: number;
}

export interface Company {
  id: number;
  code: string;
  name: string;
}

export interface Branch {
  id: number;
  code: string;
  name: string;
  company_id: number;
  location_id: number;
}

export interface Department {
  id: number;
  code: string;
  name: string;
}

export interface Equipment {
  id: number;
  code: string;
  name: string;
  responsible_id?: number;
}

export interface Device {
  id: number;
  code: string;
  name: string;
  model?: string;
  description?: string;
  type?: string;
  state?: string;
  serial_number?: string;
  ip_address?: string;
  mac?: string;
  last_ip_assignment_at?: string;
  allow_take_home?: boolean;
  assignment_at?: string;
  last_maintenance_at?: string;
  warranty_expire_at?: string;
  supplier_id?: number;
  company_id?: number;
  brand_id?: number;
  equipment_id?: number;
  helpdesk_id?: number;
  canceled?: boolean;
  canceled_at?: string;
  created_at?: string;
  updated_at?: string;
  components?: ComponentItem[];
}

export interface ComponentItem {
  id: number;
  code: string;
  name: string;
  type?: string;
  state?: string;
  serial_number?: string;
  capacity?: string;
  volts?: string;
  amps?: string;
  watts?: string;
  reusable?: boolean;
  assignment_at?: string;
  warranty_expire_at?: string;
  supplier_id?: number;
  brand_id?: number;
  device_id?: number;
  helpdesk_id?: number;
  canceled?: boolean;
  canceled_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface EquipmentWithDevices {
  id: number;
  code: string;
  name: string;
  description?: string;
  assignment_at?: string;
  responsible_id?: number;
  helpdesk_id?: number;
  canceled?: boolean;
  canceled_at?: string;
  created_at?: string;
  updated_at?: string;
  devices?: Device[];
}

export interface Category {
  id: number;
  code: string;
  name: string;
  description: string;
}

export interface Problem {
  id: number;
  code: string;
  name: string;
  description: string;
  category_id: number;
}

@Injectable({
  providedIn: 'root'
})
export class ReferenceDataService {
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
      .get<BackendResponse<ListResponse<EquipmentWithDevices>>>(
        `${this.apiUrl}/store/equipment/select-total`,
        {
          headers: this.getAuthHeaders(),
          params,
          withCredentials: true
        }
      )
      .pipe(
        map((response) => {
          if (this.isApiError(response)) {
            console.error('Error API cargando equipos:', response.message);
            return [];
          }

          return response.data?.list ?? [];
        }),
        catchError((error) => {
          console.error('Error cargando equipamiento con dispositivos:', error);
          return of([]);
        })
      );
  }

  private getList<T>(endpoint: string, errorMessage: string): Observable<T[]> {
    return this.http
      .get<BackendResponse<ListResponse<T>>>(
        `${this.apiUrl}${endpoint}`,
        {
          headers: this.getAuthHeaders(),
          withCredentials: true
        }
      )
      .pipe(
        map((response) => {
          if (this.isApiError(response)) {
            console.error(errorMessage, response.message);
            return [];
          }

          return response.data?.list ?? [];
        }),
        catchError((error) => {
          console.error(errorMessage, error);
          return of([]);
        })
      );
  }

  private isApiError<T>(response: BackendResponse<T>): response is ApiErrorResponse {
    return 'error_code' in response;
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