import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, of, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse, ApiResponseError } from '../../../core/models/api-response.model';
import {
  Branch,
  Category,
  Company,
  ComponentItem,
  Department,
  Device,
  Employee,
  EquipmentWithDevices,
  Problem
} from '../models/helpdesk.model';

interface ListResponse<T> {
  list: T[];
}

interface LegacyListResponse<T> {
  Data?: ListResponse<T>;
}

type HelpdeskDataResponse<T> = ApiResponse<ListResponse<T>> | LegacyListResponse<T>;

export interface InsertDeviceRequest {
  code: string;
  name: string;
  model: string;
  description: string;
  type: string;
  state: string;
  serial_number: string;
  assignment_at: string;
  last_maintenance_at: string;
  warranty_expire_at: string;
  supplier_id: number;
  company_id: number;
  brand_id: number;
  equipment_id: number;
  helpdesk_id: number;
  created_by: string;
}

export interface CancelDeviceRequest {
  device_id: number;
  canceled_by: string;
}

export interface InsertComponentRequest {
  code: string;
  name: string;
  model: string;
  type: string;
  state: string;
  serial_number: string;
  capacity: string;
  volts: string;
  amps: string;
  watts: string;
  assignment_at: string;
  warranty_expire_at: string;
  device_id: number;
  helpdesk_id: number;
  reusable: boolean;
  brand_id: number;
  supplier_id: number;
  created_by: string;
}

export interface DeviceMutationResult {
  success: boolean;
  message: string;
  device?: Device;
}

export interface ComponentMutationResult {
  success: boolean;
  message: string;
  component?: ComponentItem;
}

@Injectable({
  providedIn: 'root'
})
export class HelpdeskDataService {
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
      .get<HelpdeskDataResponse<EquipmentWithDevices>>(
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

          return this.extractList<EquipmentWithDevices>(response);
        }),
        catchError((error) => {
          console.error('Error cargando equipos con dispositivos:', error);
          return of([]);
        })
      );
  }

  insertDevice(payload: InsertDeviceRequest): Observable<DeviceMutationResult> {
    return this.postDeviceMutation(
      payload,
      '/store/device/insert',
      '/store/divice/insert',
      'Equipo creado correctamente.',
      'No se pudo crear el equipo.'
    );
  }

  cancelDevice(payload: CancelDeviceRequest): Observable<DeviceMutationResult> {
    return this.postDeviceMutation(
      payload,
      '/store/device/canceled',
      '/store/divice/canceled',
      'Equipo anulado correctamente.',
      'No se pudo anular el equipo.'
    );
  }

  insertComponent(payload: InsertComponentRequest): Observable<ComponentMutationResult> {
    return this.http
      .post<ApiResponse<ComponentItem>>(
        `${this.apiUrl}/store/component/insert`,
        payload,
        {
          headers: this.getAuthHeaders(),
          withCredentials: true
        }
      )
      .pipe(
        map((response) => {
          if (this.isApiMutationError(response)) {
            return {
              success: false,
              message: response.message || 'No se pudo crear el componente.'
            };
          }

          return {
            success: true,
            message: response.message || 'Componente creado correctamente.',
            component: response.data
          };
        }),
        catchError((error) => of({
          success: false,
          message: this.extractApiErrorMessage(error, 'No se pudo crear el componente.')
        }))
      );
  }

  private getList<T>(endpoint: string, errorMessage: string): Observable<T[]> {
    return this.http
      .get<HelpdeskDataResponse<T>>(
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

          return this.extractList<T>(response);
        }),
        catchError((error) => {
          console.error(errorMessage, error);
          return of([]);
        })
      );
  }

  private extractList<T>(response: HelpdeskDataResponse<T>): T[] {
    if ('data' in response && response.data?.list) {
      return response.data.list;
    }

    if ('Data' in response && response.Data?.list) {
      return response.Data.list;
    }

    return [];
  }

  private isApiError<T>(response: HelpdeskDataResponse<T>): response is ApiResponseError {
    return 'error_code' in response;
  }

  private isApiMutationError<T>(response: ApiResponse<T>): response is ApiResponseError {
    return 'error_code' in response;
  }

  private postDeviceMutation(
    payload: InsertDeviceRequest | CancelDeviceRequest,
    endpoint: string,
    fallbackEndpoint: string,
    successMessage: string,
    errorMessage: string
  ): Observable<DeviceMutationResult> {
    const request = (path: string) => this.http.post<ApiResponse<Device>>(
      `${this.apiUrl}${path}`,
      payload,
      {
        headers: this.getAuthHeaders(),
        withCredentials: true
      }
    );

    return request(endpoint).pipe(
      catchError((error) => {
        if (error?.status === 404) {
          return request(fallbackEndpoint);
        }

        return throwError(() => error);
      }),
      map((response) => {
        if (this.isApiMutationError(response)) {
          return {
            success: false,
            message: response.message || errorMessage
          };
        }

        return {
          success: true,
          message: response.message || successMessage,
          device: response.data
        };
      }),
      catchError((error) => of({
        success: false,
        message: this.extractApiErrorMessage(error, errorMessage)
      }))
    );
  }

  private extractApiErrorMessage(error: unknown, fallback: string): string {
    if (!error || typeof error !== 'object') {
      return fallback;
    }

    const httpError = error as {
      error?: {
        message?: string;
        details_error?: {
          error_message?: string;
          error_detail?: Record<string, string[]>;
        };
      };
    };

    const detail = httpError.error?.details_error?.error_detail;

    if (detail) {
      const messages: string[] = [];

      if (detail['code']?.includes('validation.unique')) {
        messages.push('El código ya existe. Use un código diferente.');
      }

      if (detail['equipment_id']?.includes('validation.required')) {
        messages.push('El backend requiere seleccionar un equipo base.');
      }

      if (messages.length) {
        return messages.join(' ');
      }
    }

    return (
      httpError.error?.details_error?.error_message ||
      httpError.error?.message ||
      fallback
    );
  }

  private getAuthHeaders(): HttpHeaders {
    const headers: Record<string, string> = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-Device-Platform': 'web',
      'X-Device-Id': localStorage.getItem('device_id') || 'web-device',
      'X-Device-Fingerprint':
        localStorage.getItem('device_fingerprint') || 'web-fingerprint'
    };

    return new HttpHeaders(headers);
  }
}
