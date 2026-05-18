import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  ChevronLeft,
  ChevronRight,
  CirclePlus,
  Edit3,
  Eye,
  LayoutDashboard,
  LucideAngularModule,
  RefreshCcw,
  Search,
  SlidersHorizontal,
  Trash2,
  X
} from 'lucide-angular';
import { ConfirmDialogComponent } from '../../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { DataGridPaginationComponent } from '../../../../../shared/components/data-grid-pagination/data-grid-pagination.component';
import { DebouncedSearchDirective } from '../../../../../shared/directives/debounced-search.directive';
import { EmptyStateComponent } from '../../../../../shared/components/empty-state/empty-state.component';
import { PageHeaderComponent } from '../../../../../shared/components/page-header/page-header.component';
import { formatDateTime, isDateLikeField } from '../../../../../shared/utils/date-format.util';
import { StatusBadgeComponent } from '../../../../../shared/components/status-badge/status-badge.component';
import { GridColumnConfig, GridFilterOption } from '../../../../../shared/models/grid-view.model';
import {
  CancelModuleRequest,
  InsertModuleRequest,
  ModuleItem,
  UpdateModuleRequest
} from '../../../models/module-maintenance.model';
import { ModuleMaintenanceService } from '../../../services/module-maintenance.service';

type ModuleStatusFilter = 'all' | 'active' | 'inactive';
type ModuleGridColumn = keyof ModuleItem | 'actions';
type BackendErrorBody = Record<string, unknown>;

interface ModuleForm {
  code: string;
  name: string;
  order: number | null;
}

@Component({
  selector: 'app-module-maintenance',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    LucideAngularModule,
    ConfirmDialogComponent,
    DataGridPaginationComponent,
    DebouncedSearchDirective,
    EmptyStateComponent,
    PageHeaderComponent,
    StatusBadgeComponent
  ],
  templateUrl: './module-maintenance.component.html',
  styleUrl: './module-maintenance.component.scss'
})
export class ModuleMaintenanceComponent implements OnInit {
  readonly moduleIcon = LayoutDashboard;
  readonly addIcon = CirclePlus;
  readonly chevronLeftIcon = ChevronLeft;
  readonly chevronRightIcon = ChevronRight;
  readonly detailIcon = Eye;
  readonly editIcon = Edit3;
  readonly refreshIcon = RefreshCcw;
  readonly searchIcon = Search;
  readonly filterIcon = SlidersHorizontal;
  readonly trashIcon = Trash2;
  readonly closeIcon = X;
  readonly gridColumns: readonly GridColumnConfig<ModuleGridColumn>[] = [
    { key: 'id', label: 'ID', width: '88px' },
    { key: 'code', label: 'Codigo' },
    { key: 'name', label: 'Nombre' },
    { key: 'order', label: 'Orden', width: '110px' },
    { key: 'canceled', label: 'Estado', width: '140px' },
    { key: 'canceled_at', label: 'Fecha anulacion', width: '180px' },
    { key: 'created_at', label: 'Fecha creacion', width: '180px' },
    { key: 'updated_at', label: 'Fecha actualizacion', width: '190px' },
    { key: 'actions', label: 'Acciones', width: '170px', align: 'right' }
  ];
  readonly statusFilterOptions: readonly GridFilterOption<ModuleStatusFilter>[] = [
    { value: 'all', label: 'Todos' },
    { value: 'active', label: 'Activos' },
    { value: 'inactive', label: 'Inactivos' }
  ];

  modules: ModuleItem[] = [];
  selectedModuleId: number | null = null;
  searchTerm = '';
  statusFilter: ModuleStatusFilter = 'all';
  statusFilterDraft: ModuleStatusFilter = 'all';
  filtersOpen = false;
  currentPage = 1;
  pageSize = 6;
  isLoading = false;
  isSaving = false;
  isLoadingDetail = false;
  successMessage = '';
  errorMessage = '';
  formError = '';

  editingModule: ModuleItem | null = null;
  moduleToCancel: ModuleItem | null = null;

  moduleForm: ModuleForm = this.createEmptyForm();

  constructor(private readonly moduleService: ModuleMaintenanceService) {}

  ngOnInit(): void {
    this.loadModules();
  }

  get filteredModules(): ModuleItem[] {
    const term = this.searchTerm.trim().toLowerCase();

    return this.modules.filter((module) => {
      const matchesStatus =
        this.statusFilter === 'all' ||
        (this.statusFilter === 'active' && !module.canceled) ||
        (this.statusFilter === 'inactive' && module.canceled);

      if (!matchesStatus) {
        return false;
      }

      if (!term) {
        return true;
      }

      return [
        module.code,
        module.name,
        String(module.order)
      ].some((value) => value.toLowerCase().includes(term));
    });
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredModules.length / this.pageSize));
  }

  get paginatedModules(): ModuleItem[] {
    const safePage = Math.min(this.currentPage, this.totalPages);
    const start = (safePage - 1) * this.pageSize;

    return this.filteredModules.slice(start, start + this.pageSize);
  }

  get showingCount(): number {
    return this.paginatedModules.length;
  }

  get cancelModuleMessage(): string {
    const moduleName = this.moduleToCancel?.name ?? 'este modulo';

    return `Esta seguro de que desea borrar ${moduleName}?`;
  }

  loadModules(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.moduleService.getModules().subscribe({
      next: (modules) => {
        this.modules = modules;
        this.currentPage = Math.min(this.currentPage, this.totalPages);
        this.selectedModuleId = modules.some((module) => module.id === this.selectedModuleId)
          ? this.selectedModuleId
          : null;
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.handleHttpError(error, 'No se pudo cargar el listado de modulos.');
      }
    });
  }

  onFiltersChange(): void {
    this.currentPage = 1;
  }

  setStatusFilter(filter: ModuleStatusFilter): void {
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

  previousPage(): void {
    this.currentPage = Math.max(1, this.currentPage - 1);
  }

  nextPage(): void {
    this.currentPage = Math.min(this.totalPages, this.currentPage + 1);
  }

  setPage(page: number): void {
    this.currentPage = Math.min(Math.max(1, page), this.totalPages);
  }

  selectModule(module: ModuleItem): void {
    this.selectedModuleId = module.id;
  }

  askCancel(module: ModuleItem): void {
    this.moduleToCancel = module;
    this.successMessage = '';
    this.errorMessage = '';
  }

  closeCancelConfirm(): void {
    if (this.isSaving) {
      return;
    }

    this.moduleToCancel = null;
  }

  confirmCancel(): void {
    if (!this.moduleToCancel) {
      return;
    }

    const payload: CancelModuleRequest = {
      module_id: this.moduleToCancel.id,
      canceled_by: this.getUsername()
    };

    this.isSaving = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.moduleService.cancelModule(payload).subscribe({
      next: () => {
        this.isSaving = false;
        this.moduleToCancel = null;
        this.selectedModuleId = null;
        this.successMessage = 'Modulo anulado correctamente.';
        this.loadModules();
      },
      error: (error) => {
        this.isSaving = false;
        this.handleHttpError(error, 'No se pudo anular el modulo.');
      }
    });
  }

  formatDate(value?: string | null): string {
    return formatDateTime(value);
  }

  trackByModuleId(_: number, module: ModuleItem): number {
    return module.id;
  }

  trackByColumnKey(_: number, column: GridColumnConfig<ModuleGridColumn>): ModuleGridColumn {
    return column.key;
  }

  getColumnClass(column: GridColumnConfig<ModuleGridColumn>): string {
    const classes = [`app-grid-col-${column.key}`];

    if (column.align === 'right') {
      classes.push('app-grid-col-right');
    }

    if (column.align === 'center') {
      classes.push('app-grid-col-center');
    }

    return classes.join(' ');
  }

  formatGridValue(module: ModuleItem, key: ModuleGridColumn): string {
    if (key === 'actions' || key === 'canceled') {
      return '';
    }

    const value = module[key];

    if (isDateLikeField(String(key))) {
      return formatDateTime(value as string | null | undefined);
    }

    return value === null || value === undefined || value === '' ? '-' : String(value);
  }

  @HostListener('document:click')
  closeFiltersFromOutside(): void {
    this.filtersOpen = false;
  }

  private createEmptyForm(): ModuleForm {
    return {
      code: '',
      name: '',
      order: null
    };
  }

  private createFormFromModule(module: ModuleItem): ModuleForm {
    return {
      code: module.code ?? '',
      name: module.name ?? '',
      order: module.order ?? null
    };
  }

  private handleHttpError(error: unknown, fallback: string, formError = false): void {
    console.error('Error completo:', error);
    console.error('Respuesta backend:', (error as { error?: unknown }).error);
    console.error(
      'Detalles validacion:',
      (error as { error?: { error?: { details_error?: unknown } } }).error?.error?.details_error
    );

    const message = this.extractErrorMessage(this.getErrorBody(error), fallback);

    if (formError) {
      this.formError = message;
      return;
    }

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
      const messages: string[] = [];

      if (detail['code']?.includes('validation.required')) {
        messages.push('El codigo es obligatorio.');
      }

      if (detail['name']?.includes('validation.required')) {
        messages.push('El nombre es obligatorio.');
      }

      if (detail['order']?.includes('validation.required')) {
        messages.push('El orden es obligatorio.');
      }

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