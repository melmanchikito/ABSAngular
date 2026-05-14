import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface EmployeeRelation {
  id?: number;
  code?: string | null;
  name?: string | null;
}

export interface EmployeeItem {
  id: number;
  code: string;
  name?: string | null;
  first_name?: string | null;
  middle_name?: string | null;
  first_surname?: string | null;
  second_surname?: string | null;
  cedula?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  sex?: string | null;
  birthdate?: string | null;
  integration_date?: string | null;
  company_id?: number | null;
  branch_id?: number | null;
  department_id?: number | null;
  position_id?: number | null;
  company_code?: string | null;
  company_name?: string | null;
  branch_code?: string | null;
  branch_name?: string | null;
  department_code?: string | null;
  department_name?: string | null;
  position_code?: string | null;
  position_name?: string | null;
  company?: EmployeeRelation | null;
  branch?: EmployeeRelation | null;
  department?: EmployeeRelation | null;
  position?: EmployeeRelation | null;
  canceled?: boolean;
  canceled_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export type EmployeeWithoutUser = EmployeeItem;

interface EmployeeListResponse {
  list?: EmployeeItem[];
}

export interface EmployeeApiResponse<T> {
  code: number;
  message: string;
  data?: T;
  error_code?: string;
  details_error?: {
    error_message?: string;
    error_detail?: Record<string, string[]>;
  };
}

export interface InsertEmployeeRequest {
  code: string;
  first_name: string;
  middle_name: string;
  first_surname: string;
  second_surname: string;
  cedula: string;
  email: string;
  phone: string;
  address: string;
  sex: string;
  birthdate: string;
  integration_date: string;
  company_id: number;
  branch_id: number;
  department_id: number;
  position_id: number;
  created_by: string;
}

export interface UpdateEmployeeRequest {
  employee_id: number;
  code: string;
  first_name: string;
  middle_name: string;
  first_surname: string;
  second_surname: string;
  cedula: string;
  email: string;
  phone: string;
  address: string;
  sex: string;
  birthdate: string;
  integration_date: string;
  company_id: number;
  branch_id: number;
  department_id: number;
  position_id: number;
  updated_by: string;
}

export interface CancelEmployeeRequest {
  employee_id: number;
  canceled_by: string;
}

@Injectable({
  providedIn: 'root'
})
export class EmployeeMaintenanceService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  getEmployees(): Observable<EmployeeItem[]> {
    return this.getEmployeeList(
      '/store/employee/select',
      'Error cargando empleados:'
    );
  }

  getEmployeesWithoutUser(): Observable<EmployeeWithoutUser[]> {
    return this.getEmployeeList(
      '/store/employee/select-notuser',
      'Error cargando empleados sin usuario:'
    );
  }

  getEmployeesForMaintenance(): Observable<EmployeeItem[]> {
    return this.http
      .get<EmployeeApiResponse<EmployeeItem[] | EmployeeListResponse>>(
        `${this.apiUrl}/store/employee/select`,
        {
          headers: this.getHeaders(),
          withCredentials: true
        }
      )
      .pipe(map((response) => this.extractEmployees(response)));
  }

  getEmployeeById(employeeId: number): Observable<EmployeeItem> {
    const params = new HttpParams().set('employee_id', String(employeeId));

    return this.http
      .get<EmployeeApiResponse<EmployeeItem>>(
        `${this.apiUrl}/store/employee/select-one`,
        {
          headers: this.getHeaders(),
          params,
          withCredentials: true
        }
      )
      .pipe(
        map((response) => {
          if (!response.data) {
            throw new Error('La respuesta no contiene el empleado solicitado.');
          }

          return this.normalizeEmployee(response.data);
        })
      );
  }

  getEmployeesByCompany(companyId: number): Observable<EmployeeItem[]> {
    const params = new HttpParams().set('company_id', String(companyId));

    return this.http
      .get<EmployeeApiResponse<EmployeeItem[] | EmployeeListResponse>>(
        `${this.apiUrl}/store/employee/select-company`,
        {
          headers: this.getHeaders(),
          params,
          withCredentials: true
        }
      )
      .pipe(map((response) => this.extractEmployees(response)));
  }

  insertEmployee(payload: InsertEmployeeRequest): Observable<EmployeeApiResponse<EmployeeItem>> {
    return this.http.post<EmployeeApiResponse<EmployeeItem>>(
      `${this.apiUrl}/store/employee/insert`,
      payload,
      {
        headers: this.getHeaders(),
        withCredentials: true
      }
    );
  }

  updateEmployee(payload: UpdateEmployeeRequest): Observable<EmployeeApiResponse<EmployeeItem>> {
    return this.http.post<EmployeeApiResponse<EmployeeItem>>(
      `${this.apiUrl}/store/employee/update`,
      payload,
      {
        headers: this.getHeaders(),
        withCredentials: true
      }
    );
  }

  cancelEmployee(payload: CancelEmployeeRequest): Observable<EmployeeApiResponse<EmployeeItem>> {
    return this.http.post<EmployeeApiResponse<EmployeeItem>>(
      `${this.apiUrl}/store/employee/canceled`,
      payload,
      {
        headers: this.getHeaders(),
        withCredentials: true
      }
    );
  }

  private getEmployeeList(endpoint: string, errorMessage: string): Observable<EmployeeItem[]> {
    return this.http
      .get<EmployeeApiResponse<EmployeeItem[] | EmployeeListResponse>>(
        `${this.apiUrl}${endpoint}`,
        {
          headers: this.getHeaders(),
          withCredentials: true
        }
      )
      .pipe(
        map((response) => this.extractEmployees(response)),
        catchError((error) => {
          console.error(errorMessage, error);
          return of([]);
        })
      );
  }

  private extractEmployees(response: EmployeeApiResponse<EmployeeItem[] | EmployeeListResponse>): EmployeeItem[] {
    const employees = Array.isArray(response.data)
      ? response.data
      : response.data?.list ?? [];

    return employees.map((employee) => this.normalizeEmployee(employee));
  }

  private normalizeEmployee(employee: EmployeeItem): EmployeeItem {
    const fullName = [
      employee.first_name,
      employee.middle_name,
      employee.first_surname,
      employee.second_surname
    ]
      .map((value) => String(value ?? '').trim())
      .filter(Boolean)
      .join(' ');

    return {
      ...employee,
      name: employee.name ?? fullName
    };
  }

  private getHeaders(): HttpHeaders {
    const token = this.getToken();
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

  private getToken(): string {
    const storedToken =
      localStorage.getItem('token') ||
      sessionStorage.getItem('token') ||
      localStorage.getItem('authToken') ||
      sessionStorage.getItem('authToken');

    return this.normalizeToken(storedToken);
  }

  private normalizeToken(token: string | null): string {
    if (!token) {
      return '';
    }

    return token
      .replace(/^Bearer\s+/i, '')
      .replaceAll('"', '')
      .trim();
  }
}
