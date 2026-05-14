import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  CirclePlus,
  Edit3,
  Eye,
  LucideAngularModule,
  RefreshCcw,
  Search,
  SlidersHorizontal,
  Trash2,
  Users,
  X
} from 'lucide-angular';
import { ConfirmDialogComponent } from '../../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { DataGridPaginationComponent } from '../../../../../shared/components/data-grid-pagination/data-grid-pagination.component';
import { EmptyStateComponent } from '../../../../../shared/components/empty-state/empty-state.component';
import { PageHeaderComponent } from '../../../../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../../../../shared/components/status-badge/status-badge.component';
import { GridColumnConfig, GridFilterOption } from '../../../../../shared/models/grid-view.model';
import { formatDateTime, isDateLikeField } from '../../../../../shared/utils/date-format.util';
import {
  CancelEmployeeRequest,
  EmployeeItem,
  EmployeeMaintenanceService,
  EmployeeRelation
} from '../../../../system-area/services/employee-maintenance.service';

type EmployeeStatusFilter = 'all' | 'active' | 'inactive';
type EmployeeGridColumn =
  | 'id'
  | 'code'
  | 'first_names'
  | 'surnames'
  | 'cedula'
  | 'email'
  | 'phone'
  | 'sex'
  | 'birthdate'
  | 'integration_date'
  | 'company'
  | 'branch'
  | 'department'
  | 'position'
  | 'canceled'
  | 'created_at'
  | 'updated_at'
  | 'canceled_at'
  | 'actions';
type BackendErrorBody = Record<string, unknown>;
type RelationKey = 'company' | 'branch' | 'department' | 'position';

@Component({
  selector: 'app-employee-maintenance',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    LucideAngularModule,
    ConfirmDialogComponent,
    DataGridPaginationComponent,
    EmptyStateComponent,
    PageHeaderComponent,
    StatusBadgeComponent
  ],
  templateUrl: './employee-maintenance.component.html',
  styleUrl: './employee-maintenance.component.scss'
})
export class EmployeeMaintenanceComponent implements OnInit {
  readonly employeeIcon = Users;
  readonly addIcon = CirclePlus;
  readonly detailIcon = Eye;
  readonly editIcon = Edit3;
  readonly refreshIcon = RefreshCcw;
  readonly searchIcon = Search;
  readonly filterIcon = SlidersHorizontal;
  readonly trashIcon = Trash2;
  readonly closeIcon = X;

  readonly gridColumns: readonly GridColumnConfig<EmployeeGridColumn>[] = [
    { key: 'id', label: 'ID', width: '88px' },
    { key: 'code', label: 'Codigo', width: '130px' },
    { key: 'first_names', label: 'Nombres', width: '190px' },
    { key: 'surnames', label: 'Apellidos', width: '190px' },
    { key: 'cedula', label: 'Cedula', width: '150px' },
    { key: 'email', label: 'Email', width: '220px' },
    { key: 'phone', label: 'Celular', width: '150px' },
    { key: 'sex', label: 'Sexo', width: '130px' },
    { key: 'birthdate', label: 'Fecha nacimiento', width: '180px' },
    { key: 'integration_date', label: 'Fecha ingreso', width: '170px' },
    { key: 'company', label: 'Empresa', width: '170px' },
    { key: 'branch', label: 'Sucursal', width: '170px' },
    { key: 'department', label: 'Departamento', width: '190px' },
    { key: 'position', label: 'Cargo', width: '170px' },
    { key: 'canceled', label: 'Estado', width: '140px' },
    { key: 'created_at', label: 'Fecha creacion', width: '180px' },
    { key: 'updated_at', label: 'Fecha actualizacion', width: '190px' },
    { key: 'canceled_at', label: 'Fecha anulacion', width: '180px' },
    { key: 'actions', label: 'Acciones', width: '170px', align: 'right' }
  ];

  readonly statusFilterOptions: readonly GridFilterOption<EmployeeStatusFilter>[] = [
    { value: 'all', label: 'Todas' },
    { value: 'active', label: 'Activas' },
    { value: 'inactive', label: 'Inactivas' }
  ];

  employees: EmployeeItem[] = [];
  selectedEmployeeId: number | null = null;
  searchTerm = '';
  statusFilter: EmployeeStatusFilter = 'all';
  statusFilterDraft: EmployeeStatusFilter = 'all';
  filtersOpen = false;
  currentPage = 1;
  pageSize = 7;
  isLoading = false;
  isSaving = false;
  successMessage = '';
  errorMessage = '';
  employeeToCancel: EmployeeItem | null = null;

  constructor(private readonly employeeService: EmployeeMaintenanceService) {}

  ngOnInit(): void {
    this.loadEmployees();
  }

  get filteredEmployees(): EmployeeItem[] {
    const term = this.searchTerm.trim().toLowerCase();

    return this.employees.filter((employee) => {
      const matchesStatus =
        this.statusFilter === 'all' ||
        (this.statusFilter === 'active' && !employee.canceled) ||
        (this.statusFilter === 'inactive' && employee.canceled);

      if (!matchesStatus) {
        return false;
      }

      if (!term) {
        return true;
      }

      return [
        employee.code,
        this.getEmployeeName(employee),
        this.getEmployeeFirstNames(employee),
        this.getEmployeeSurnames(employee),
        employee.cedula,
        employee.email,
        employee.phone,
        employee.sex,
        employee.birthdate,
        employee.integration_date,
        this.getRelationLabel(employee, 'company'),
        this.getRelationLabel(employee, 'branch'),
        this.getRelationLabel(employee, 'department'),
        this.getRelationLabel(employee, 'position')
      ].some((value) => String(value ?? '').toLowerCase().includes(term));
    });
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredEmployees.length / this.pageSize));
  }

  get paginatedEmployees(): EmployeeItem[] {
    const safePage = Math.min(this.currentPage, this.totalPages);
    const start = (safePage - 1) * this.pageSize;

    return this.filteredEmployees.slice(start, start + this.pageSize);
  }

  get showingCount(): number {
    return this.paginatedEmployees.length;
  }

  get cancelEmployeeMessage(): string {
    const employeeName = this.employeeToCancel ? this.getEmployeeName(this.employeeToCancel) : 'este empleado';

    return `Esta seguro de que desea borrar ${employeeName}?`;
  }

  loadEmployees(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.employeeService.getEmployeesForMaintenance().subscribe({
      next: (employees) => {
        this.employees = employees;
        this.currentPage = Math.min(this.currentPage, this.totalPages);
        this.selectedEmployeeId = employees.some((employee) => employee.id === this.selectedEmployeeId)
          ? this.selectedEmployeeId
          : null;
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.handleHttpError(error, 'No se pudo cargar el listado de empleados.');
      }
    });
  }

  onFiltersChange(): void {
    this.currentPage = 1;
  }

  setStatusFilter(filter: EmployeeStatusFilter): void {
    this.statusFilter = filter;
    this.onFiltersChange();
  }

  toggleFilters(event?: MouseEvent): void {
    event?.stopPropagation();
    this.statusFilterDraft = this.statusFilter;
    this.filtersOpen = !this.filtersOpen;
  }

  applyFilters(): void {
    this.setStatusFilter(this.statusFilterDraft);
    this.filtersOpen = false;
  }

  clearFilters(): void {
    this.statusFilterDraft = 'all';
    this.setStatusFilter('all');
    this.filtersOpen = false;
  }

  setPage(page: number): void {
    this.currentPage = Math.min(Math.max(1, page), this.totalPages);
  }

  selectEmployee(employee: EmployeeItem): void {
    this.selectedEmployeeId = employee.id;
  }

  askCancel(employee: EmployeeItem): void {
    this.employeeToCancel = employee;
    this.successMessage = '';
    this.errorMessage = '';
  }

  closeCancelConfirm(): void {
    if (this.isSaving) {
      return;
    }

    this.employeeToCancel = null;
  }

  confirmCancel(): void {
    if (!this.employeeToCancel) {
      return;
    }

    const payload: CancelEmployeeRequest = {
      employee_id: this.employeeToCancel.id,
      canceled_by: this.getUsername()
    };

    this.isSaving = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.employeeService.cancelEmployee(payload).subscribe({
      next: () => {
        this.isSaving = false;
        this.employeeToCancel = null;
        this.selectedEmployeeId = null;
        this.successMessage = 'Empleado anulado correctamente.';
        this.loadEmployees();
      },
      error: (error) => {
        this.isSaving = false;
        this.handleHttpError(error, 'No se pudo anular el empleado.');
      }
    });
  }

  trackByEmployeeId(_: number, employee: EmployeeItem): number {
    return employee.id;
  }

  trackByColumnKey(_: number, column: GridColumnConfig<EmployeeGridColumn>): EmployeeGridColumn {
    return column.key;
  }

  getColumnClass(column: GridColumnConfig<EmployeeGridColumn>): string {
    const classes = [`app-grid-col-${column.key}`];

    if (column.align === 'right') {
      classes.push('app-grid-col-right');
    }

    if (column.align === 'center') {
      classes.push('app-grid-col-center');
    }

    return classes.join(' ');
  }

  formatGridValue(employee: EmployeeItem, key: EmployeeGridColumn): string {
    if (key === 'actions' || key === 'canceled') {
      return '';
    }

    if (key === 'first_names') {
      return this.getEmployeeFirstNames(employee);
    }

    if (key === 'surnames') {
      return this.getEmployeeSurnames(employee);
    }

    if (key === 'sex') {
      return this.formatSex(employee.sex);
    }

    if (key === 'company' || key === 'branch' || key === 'department' || key === 'position') {
      return this.getRelationLabel(employee, key);
    }

    const value = employee[key];

    if (isDateLikeField(String(key))) {
      return formatDateTime(value as string | null | undefined);
    }

    return value === null || value === undefined || value === '' ? 'Sin registro' : String(value);
  }

  @HostListener('document:click')
  closeFiltersFromOutside(): void {
    this.filtersOpen = false;
  }

  private getEmployeeName(employee: EmployeeItem): string {
    if (employee.name) {
      return employee.name;
    }

    const fullName = `${this.getEmployeeFirstNames(employee)} ${this.getEmployeeSurnames(employee)}`.trim();

    return fullName || 'Sin registro';
  }

  private getEmployeeFirstNames(employee: EmployeeItem): string {
    return [
      employee.first_name,
      employee.middle_name
    ]
      .map((value) => String(value ?? '').trim())
      .filter(Boolean)
      .join(' ') || 'Sin registro';
  }

  private getEmployeeSurnames(employee: EmployeeItem): string {
    return [
      employee.first_surname,
      employee.second_surname
    ]
      .map((value) => String(value ?? '').trim())
      .filter(Boolean)
      .join(' ') || 'Sin registro';
  }

  private formatSex(value?: string | null): string {
    const normalizedValue = String(value ?? '').trim().toUpperCase();

    if (normalizedValue === 'M' || normalizedValue === 'MALE') {
      return 'Masculino';
    }

    if (normalizedValue === 'F' || normalizedValue === 'FEMALE') {
      return 'Femenino';
    }

    return normalizedValue || 'Sin registro';
  }

  private getRelationLabel(employee: EmployeeItem, key: RelationKey): string {
    const relation = employee[key] as EmployeeRelation | null | undefined;
    const code = this.toDisplayValue(relation?.code ?? employee[`${key}_code`]);
    const name = this.toDisplayValue(relation?.name ?? employee[`${key}_name`]);

    if (code && name) {
      return `${code} - ${name}`;
    }

    if (name) {
      return name;
    }

    if (code) {
      return code;
    }

    const id = employee[`${key}_id` as keyof EmployeeItem];

    return id === null || id === undefined || id === '' ? 'Sin registro' : String(id);
  }

  private toDisplayValue(value: unknown): string {
    return String(value ?? '').trim();
  }

  private handleHttpError(error: unknown, fallback: string): void {
    console.error('Error completo:', error);
    console.error('Respuesta backend:', (error as { error?: unknown }).error);

    const message = this.extractErrorMessage(this.getErrorBody(error), fallback);
    this.errorMessage = message;
  }

  private getErrorBody(error: unknown): BackendErrorBody | null {
    if (!error || typeof error !== 'object') {
      return null;
    }

    const errorRecord = error as BackendErrorBody;
    const body = errorRecord['error'];

    return this.isRecord(body) ? body : null;
  }

  private extractErrorMessage(errorBody: BackendErrorBody | null, fallback: string): string {
    const nestedError = this.isRecord(errorBody?.['error']) ? errorBody?.['error'] : null;
    const details = this.isRecord(nestedError?.['details_error'])
      ? nestedError?.['details_error']
      : errorBody?.['details_error'];
    const detail = this.isRecord(details) ? details['error_detail'] : null;

    if (this.isStringArrayRecord(detail)) {
      const messages = Object.keys(detail).map((key) => `${key}: ${detail[key].join(', ')}`);

      if (messages.length) {
        return messages.join(' ');
      }
    }

    const detailsMessage = this.isRecord(details) ? details['error_message'] : null;
    const bodyMessage = errorBody?.['message'];
    const nestedMessage = nestedError?.['message'];

    if (typeof detailsMessage === 'string') {
      return detailsMessage;
    }

    if (typeof bodyMessage === 'string') {
      return bodyMessage;
    }

    if (typeof nestedMessage === 'string') {
      return nestedMessage;
    }

    return fallback;
  }

  private isRecord(value: unknown): value is BackendErrorBody {
    return Boolean(value && typeof value === 'object' && !Array.isArray(value));
  }

  private isStringArrayRecord(value: unknown): value is Record<string, string[]> {
    if (!this.isRecord(value)) {
      return false;
    }

    return Object.values(value).every(
      (item) => Array.isArray(item) && item.every((entry) => typeof entry === 'string')
    );
  }

  private getUsername(): string {
    return (
      localStorage.getItem('username') ||
      localStorage.getItem('userName') ||
      localStorage.getItem('user') ||
      localStorage.getItem('email') ||
      'Usuario'
    );
  }
}
