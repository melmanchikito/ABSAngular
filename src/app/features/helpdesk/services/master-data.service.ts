import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import {
  Branch,
  Category,
  Company,
  Department,
  Employee,
  EquipmentWithDevices,
  Problem
} from '../../../core/models/master-data.model';

@Injectable({
  providedIn: 'root'
})
export class MasterDataService {
  getEmployees(): Observable<Employee[]> {
    return of([
      { id: 1, code: 'EMP001', name: 'Juan Pérez', company_id: 1, branch_id: 1, department_id: 1 },
      { id: 2, code: 'EMP002', name: 'Ana Gómez', company_id: 1, branch_id: 2, department_id: 2 },
      { id: 3, code: 'EMP003', name: 'Carlos Ruiz', company_id: 2, branch_id: 3, department_id: 3 }
    ]);
  }

  getCompanies(): Observable<Company[]> {
    return of([
      { id: 1, code: 'COM01', name: 'ABS Matriz' },
      { id: 2, code: 'COM02', name: 'ABS Sucursal' }
    ]);
  }

  getBranches(): Observable<Branch[]> {
    return of([
      { id: 1, code: 'SUC01', name: 'Guayaquil', company_id: 1, location_id: 1 },
      { id: 2, code: 'SUC02', name: 'Durán', company_id: 1, location_id: 2 },
      { id: 3, code: 'SUC03', name: 'Quito', company_id: 2, location_id: 3 }
    ]);
  }

  getDepartments(): Observable<Department[]> {
    return of([
      { id: 1, code: 'DEP01', name: 'Sistemas' },
      { id: 2, code: 'DEP02', name: 'Contabilidad' },
      { id: 3, code: 'DEP03', name: 'Compras' }
    ]);
  }

  getCategories(): Observable<Category[]> {
    return of([
      { id: 1, code: 'CAT01', name: 'Hardware', description: 'Problemas físicos' },
      { id: 2, code: 'CAT02', name: 'Software', description: 'Problemas lógicos' }
    ]);
  }

  getProblems(): Observable<Problem[]> {
    return of([
      { id: 1, code: 'PRO01', name: 'No enciende', description: 'Equipo no enciende', category_id: 1 },
      { id: 2, code: 'PRO02', name: 'Pantalla azul', description: 'Error del sistema', category_id: 2 },
      { id: 3, code: 'PRO03', name: 'Sin internet', description: 'Conectividad', category_id: 2 }
    ]);
  }

  getEquipmentWithDevices(employeeId: number): Observable<EquipmentWithDevices[]> {
    return of([
      {
        id: 1,
        code: 'EQ01',
        name: 'Laptop Dell',
        responsible_id: employeeId,
        devices: [
          {
            id: 11,
            code: 'DEV01',
            name: 'Laptop Dell Latitude',
            type: 'Laptop',
            description: 'Equipo principal',
            state: 'Activo',
            model: 'Latitude 5420',
            serial_number: 'ABC123',
            assignment_at: '2026-04-20',
            last_maintenance_at: '2026-04-10',
            components: [
              {
                id: 111,
                code: 'COMP01',
                name: 'RAM 16GB',
                type: 'Memoria',
                state: 'Activa',
                assignment_at: '2026-04-20'
              },
              {
                id: 112,
                code: 'COMP02',
                name: 'SSD 512GB',
                type: 'Disco',
                state: 'Activo',
                assignment_at: '2026-04-20'
              }
            ]
          }
        ]
      }
    ]);
  }
}