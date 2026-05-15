import { Injectable } from '@angular/core';
import { delay, map, Observable, of } from 'rxjs';
import {
  CommercialDeviceAssignment,
  CommercialDeviceOption,
  SaveCommercialDeviceAssignmentRequest
} from '../models/commercial-device-management.model';

@Injectable({
  providedIn: 'root'
})
export class CommercialDeviceManagementService {
  private readonly mockDevices: readonly CommercialDeviceOption[] = [
    { id: 1, code: 'EQ-001', name: 'Terminal POS Matriz', serial: 'POS-A01-2026' },
    { id: 2, code: 'EQ-002', name: 'Tablet Comercial Norte', serial: 'TAB-N02-2026' },
    { id: 3, code: 'EQ-003', name: 'Lector movil Bodega', serial: 'SCN-B03-2026' }
  ];

  private assignments: CommercialDeviceAssignment[] = [
    {
      id: 1,
      seller_id: 1,
      seller_code: 'VEN001',
      seller_name: 'Vendedor principal',
      device_id: 1,
      device_code: 'EQ-001',
      device_name: 'Terminal POS Matriz',
      device_serial: 'POS-A01-2026',
      status: 'active',
      assigned_at: '2026-05-01 09:00:00',
      updated_at: '2026-05-01 09:00:00',
      canceled_at: null
    },
    {
      id: 2,
      seller_id: 2,
      seller_code: 'VEN002',
      seller_name: 'Vendedor zona norte',
      device_id: 2,
      device_code: 'EQ-002',
      device_name: 'Tablet Comercial Norte',
      device_serial: 'TAB-N02-2026',
      status: 'inactive',
      assigned_at: '2026-04-18 15:20:00',
      updated_at: '2026-04-22 10:15:00',
      canceled_at: '2026-04-22 10:15:00'
    }
  ];

  getAssignments(): Observable<CommercialDeviceAssignment[]> {
    // TODO: Reemplazar mock por endpoint definitivo de asignaciones comerciales.
    return of(this.assignments.map((assignment) => ({ ...assignment }))).pipe(delay(180));
  }

  getDevices(): Observable<CommercialDeviceOption[]> {
    // TODO: Reemplazar mock por catalogo real de dispositivos/equipos.
    return of(this.mockDevices.map((device) => ({ ...device }))).pipe(delay(140));
  }

  saveAssignment(
    request: SaveCommercialDeviceAssignmentRequest,
    seller: { code: string; name: string },
    device: CommercialDeviceOption,
    assignmentId?: number | null
  ): Observable<CommercialDeviceAssignment> {
    // TODO: Conectar con endpoint insert/update cuando backend publique contrato final.
    const now = this.formatNow();

    if (assignmentId) {
      this.assignments = this.assignments.map((assignment) =>
        assignment.id === assignmentId
          ? {
              ...assignment,
              seller_id: request.seller_id,
              seller_code: seller.code,
              seller_name: seller.name,
              device_id: request.device_id,
              device_code: device.code,
              device_name: device.name,
              device_serial: device.serial,
              status: 'active',
              updated_at: now,
              canceled_at: null
            }
          : assignment
      );

      return this.getAssignments().pipe(
        map((assignments) => assignments.find((assignment) => assignment.id === assignmentId)!)
      );
    }

    const nextAssignment: CommercialDeviceAssignment = {
      id: this.nextId(),
      seller_id: request.seller_id,
      seller_code: seller.code,
      seller_name: seller.name,
      device_id: request.device_id,
      device_code: device.code,
      device_name: device.name,
      device_serial: device.serial,
      status: 'active',
      assigned_at: now,
      updated_at: now,
      canceled_at: null
    };

    this.assignments = [nextAssignment, ...this.assignments];

    return of({ ...nextAssignment }).pipe(delay(180));
  }

  cancelAssignment(assignmentId: number): Observable<void> {
    // TODO: Conectar con endpoint canceled cuando backend publique contrato final.
    const now = this.formatNow();

    this.assignments = this.assignments.map((assignment) =>
      assignment.id === assignmentId
        ? {
            ...assignment,
            status: 'inactive',
            updated_at: now,
            canceled_at: now
          }
        : assignment
    );

    return of(void 0).pipe(delay(160));
  }

  private nextId(): number {
    return Math.max(0, ...this.assignments.map((assignment) => assignment.id)) + 1;
  }

  private formatNow(): string {
    const now = new Date();
    const date = now.toISOString().slice(0, 10);
    const time = now.toTimeString().slice(0, 8);

    return `${date} ${time}`;
  }
}
