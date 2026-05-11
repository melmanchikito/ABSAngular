import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  ApiResponse,
  CancelModuleRequest,
  InsertModuleRequest,
  ModuleItem,
  ModuleListResponse,
  UpdateModuleRequest
} from '../models/module-maintenance.model';

@Injectable({
  providedIn: 'root'
})
export class ModuleMaintenanceService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  getModules(): Observable<ModuleItem[]> {
    return this.http
      .get<ApiResponse<ModuleListResponse>>(
        `${this.apiUrl}/store/module/select`,
        {
          headers: this.getHeaders(),
          withCredentials: true
        }
      )
      .pipe(map((response) => response.data?.list ?? []));
  }

  getModuleById(moduleId: number): Observable<ModuleItem> {
    const params = new HttpParams().set('module_id', String(moduleId));

    return this.http
      .get<ApiResponse<ModuleItem>>(
        `${this.apiUrl}/store/module/select-one`,
        {
          headers: this.getHeaders(),
          params,
          withCredentials: true
        }
      )
      .pipe(
        map((response) => {
          if (!response.data) {
            throw new Error('La respuesta no contiene el modulo solicitado.');
          }

          return response.data;
        })
      );
  }

  insertModule(payload: InsertModuleRequest): Observable<ApiResponse<ModuleItem>> {
    return this.http.post<ApiResponse<ModuleItem>>(
      `${this.apiUrl}/store/module/insert`,
      payload,
      {
        headers: this.getHeaders(),
        withCredentials: true
      }
    );
  }

  updateModule(payload: UpdateModuleRequest): Observable<ApiResponse<ModuleItem>> {
    return this.http.post<ApiResponse<ModuleItem>>(
      `${this.apiUrl}/store/module/update`,
      payload,
      {
        headers: this.getHeaders(),
        withCredentials: true
      }
    );
  }

  cancelModule(payload: CancelModuleRequest): Observable<ApiResponse<ModuleItem>> {
    return this.http.post<ApiResponse<ModuleItem>>(
      `${this.apiUrl}/store/module/canceled`,
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
