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
  LucideAngularModule,
  RefreshCcw,
  Search,
  SlidersHorizontal,
  Settings,
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
import { ModuleItem } from '../../../models/module-maintenance.model';
import {
  CancelOptionRequest,
  InsertOptionRequest,
  OptionItem,
  OptionTypeItem,
  UpdateOptionRequest
} from '../../../models/option-maintenance.model';
import { ModuleMaintenanceService } from '../../../services/module-maintenance.service';
import { OptionMaintenanceService } from '../../../services/option-maintenance.service';

type OptionStatusFilter = 'all' | 'active' | 'inactive';
type OptionGridColumn = keyof OptionItem | 'module_name' | 'type_name' | 'actions';
type BackendErrorBody = Record<string, unknown>;

interface OptionForm {
  code: string;
  name: string;
  order: number | null;
  module_id: number | null;
  type_id: number | null;
}

@Component({
  selector: 'app-option-maintenance',
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
  templateUrl: './option-maintenance.component.html',
  styleUrl: './option-maintenance.component.scss'
})
export class OptionMaintenanceComponent implements OnInit {
  readonly optionIcon = Settings;
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
  readonly gridColumns: readonly GridColumnConfig<OptionGridColumn>[] = [
    { key: 'id', label: 'ID', width: '88px' },
    { key: 'code', label: 'Codigo' },
    { key: 'name', label: 'Nombre' },
    { key: 'order', label: 'Orden', width: '110px' },
    { key: 'module_id', label: 'Modulo ID', width: '130px' },
    { key: 'module_name', label: 'Modulo' },
    { key: 'type_id', label: 'Tipo ID', width: '120px' },
    { key: 'type_name', label: 'Tipo' },
    { key: 'canceled', label: 'Estado', width: '140px' },
    { key: 'canceled_at', label: 'Fecha anulacion', width: '180px' },
    { key: 'created_at', label: 'Fecha creacion', width: '180px' },
    { key: 'updated_at', label: 'Fecha actualizacion', width: '190px' },
    { key: 'actions', label: 'Acciones', width: '170px', align: 'right' }
  ];
  readonly statusFilterOptions: readonly GridFilterOption<OptionStatusFilter>[] = [
    { value: 'all', label: 'Todas' },
    { value: 'active', label: 'Activas' },
    { value: 'inactive', label: 'Inactivas' }
  ];

  options: OptionItem[] = [];
  modules: ModuleItem[] = [];
  optionTypes: OptionTypeItem[] = [];
  selectedOptionId: number | null = null;
  selectedModuleFilter: number | 'all' = 'all';
  selectedModuleFilterDraft: number | 'all' = 'all';
  selectedTypeFilter: number | 'all' = 'all';
  selectedTypeFilterDraft: number | 'all' = 'all';
  searchTerm = '';
  statusFilter: OptionStatusFilter = 'all';
  statusFilterDraft: OptionStatusFilter = 'all';
  filtersOpen = false;
  currentPage = 1;
  pageSize = 6;
  isLoading = false;
  isLoadingCatalogs = false;
  isSaving = false;
  isLoadingDetail = false;
  successMessage = '';
  errorMessage = '';
  formError = '';

  editingOption: OptionItem | null = null;
  optionToCancel: OptionItem | null = null;

  optionForm: OptionForm = this.createEmptyForm();

  constructor(
    private readonly optionService: OptionMaintenanceService,
    private readonly moduleService: ModuleMaintenanceService
  ) {}

  ngOnInit(): void {
    this.loadCatalogs();
    this.loadOptions();
  }

  get filteredOptions(): OptionItem[] {
    const term = this.searchTerm.trim().toLowerCase();

    return this.options.filter((option) => {
      const matchesStatus =
        this.statusFilter === 'all' ||
        (this.statusFilter === 'active' && !option.canceled) ||
        (this.statusFilter === 'inactive' && option.canceled);
      const matchesModule =
        this.selectedModuleFilter === 'all' || option.module_id === Number(this.selectedModuleFilter);
      const matchesType =
        this.selectedTypeFilter === 'all' || option.type_id === Number(this.selectedTypeFilter);

      if (!matchesStatus || !matchesModule || !matchesType) {
        return false;
      }

      if (!term) {
        return true;
      }

      return [
        option.code,
        option.name,
        String(option.order),
        String(option.module_id),
        String(option.type_id),
        this.getModuleName(option.module_id),
        this.getTypeName(option.type_id)
      ].some((value) => value.toLowerCase().includes(term));
    });
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredOptions.length / this.pageSize));
  }

  get paginatedOptions(): OptionItem[] {
    const safePage = Math.min(this.currentPage, this.totalPages);
    const start = (safePage - 1) * this.pageSize;

    return this.filteredOptions.slice(start, start + this.pageSize);
  }

  get showingCount(): number {
    return this.paginatedOptions.length;
  }

  get cancelOptionMessage(): string {
    const optionName = this.optionToCancel?.name ?? 'esta opcion';

    return `Esta seguro de que desea borrar ${optionName}?`;
  }

  loadOptions(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.optionService.getOptions().subscribe({
      next: (options) => {
        this.options = options;
        this.currentPage = Math.min(this.currentPage, this.totalPages);
        this.selectedOptionId = options.some((option) => option.id === this.selectedOptionId)
          ? this.selectedOptionId
          : null;
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.handleHttpError(error, 'No se pudo cargar el listado de opciones.');
      }
    });
  }

  loadCatalogs(): void {
    this.isLoadingCatalogs = true;
    let pendingCatalogs = 2;
    const finish = () => {
      pendingCatalogs -= 1;
      this.isLoadingCatalogs = pendingCatalogs > 0;
    };

    this.moduleService.getModules().subscribe({
      next: (modules) => {
        this.modules = modules.filter((module) => !module.canceled);
        finish();
      },
      error: (error) => {
        finish();
        this.handleHttpError(error, 'No se pudo cargar el listado de modulos.');
      }
    });

    this.optionService.getOptionTypes().subscribe({
      next: (types) => {
        this.optionTypes = types.filter((type) => !type.canceled);
        finish();
      },
      error: (error) => {
        finish();
        this.handleHttpError(error, 'No se pudo cargar el listado de tipos de opcion.');
      }
    });
  }

  onFiltersChange(): void {
    this.currentPage = 1;
  }

  setStatusFilter(filter: OptionStatusFilter): void {
    this.statusFilter = filter;
    this.onFiltersChange();
  }

  toggleFilters(event?: MouseEvent): void {
    event?.stopPropagation();
    this.statusFilterDraft = this.statusFilter;
    this.selectedModuleFilterDraft = this.selectedModuleFilter;
    this.selectedTypeFilterDraft = this.selectedTypeFilter;
    this.filtersOpen = !this.filtersOpen;
  }

  applyFilters(): void {
    this.statusFilter = this.statusFilterDraft;
    this.selectedModuleFilter = this.selectedModuleFilterDraft;
    this.selectedTypeFilter = this.selectedTypeFilterDraft;
    this.onFiltersChange();
    this.filtersOpen = false;
  }

  clearFilters(): void {
    this.statusFilterDraft = 'all';
    this.selectedModuleFilterDraft = 'all';
    this.selectedTypeFilterDraft = 'all';
    this.statusFilter = 'all';
    this.selectedModuleFilter = 'all';
    this.selectedTypeFilter = 'all';
    this.onFiltersChange();
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

  selectOption(option: OptionItem): void {
    this.selectedOptionId = option.id;
  }

  askCancel(option: OptionItem): void {
    this.optionToCancel = option;
    this.successMessage = '';
    this.errorMessage = '';
  }

  closeCancelConfirm(): void {
    if (this.isSaving) {
      return;
    }

    this.optionToCancel = null;
  }

  confirmCancel(): void {
    if (!this.optionToCancel) {
      return;
    }

    const payload: CancelOptionRequest = {
      option_id: this.optionToCancel.id,
      canceled_by: this.getUsername()
    };

    this.isSaving = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.optionService.cancelOption(payload).subscribe({
      next: () => {
        this.isSaving = false;
        this.optionToCancel = null;
        this.selectedOptionId = null;
        this.successMessage = 'Opcion anulada correctamente.';
        this.loadOptions();
      },
      error: (error) => {
        this.isSaving = false;
        this.handleHttpError(error, 'No se pudo anular la opcion.');
      }
    });
  }

  formatDate(value?: string | null): string {
    return formatDateTime(value);
  }

  getModuleName(moduleId: number): string {
    const module = this.modules.find((item) => item.id === moduleId);

    return module?.name || `Modulo ${moduleId}`;
  }

  getTypeName(typeId: number): string {
    const type = this.optionTypes.find((item) => item.id === typeId);

    return type?.name || `Tipo ${typeId}`;
  }

  trackByOptionId(_: number, option: OptionItem): number {
    return option.id;
  }

  trackByModuleId(_: number, module: ModuleItem): number {
    return module.id;
  }

  trackByTypeId(_: number, type: OptionTypeItem): number {
    return type.id;
  }

  trackByColumnKey(_: number, column: GridColumnConfig<OptionGridColumn>): OptionGridColumn {
    return column.key;
  }

  getColumnClass(column: GridColumnConfig<OptionGridColumn>): string {
    const classes = [`app-grid-col-${column.key}`];

    if (column.align === 'right') {
      classes.push('app-grid-col-right');
    }

    if (column.align === 'center') {
      classes.push('app-grid-col-center');
    }

    return classes.join(' ');
  }

  formatGridValue(option: OptionItem, key: OptionGridColumn): string {
    if (key === 'actions' || key === 'canceled') {
      return '';
    }

    if (key === 'module_name') {
      return this.getModuleName(option.module_id);
    }

    if (key === 'type_name') {
      return this.getTypeName(option.type_id);
    }

    const value = option[key];

    if (isDateLikeField(String(key))) {
      return formatDateTime(value as string | null | undefined);
    }

    return value === null || value === undefined || value === '' ? 'Sin registro' : String(value);
  }

  @HostListener('document:click')
  closeFiltersFromOutside(): void {
    this.filtersOpen = false;
  }

  private createEmptyForm(): OptionForm {
    return {
      code: '',
      name: '',
      order: null,
      module_id: null,
      type_id: null
    };
  }

  private createFormFromOption(option: OptionItem): OptionForm {
    return {
      code: option.code ?? '',
      name: option.name ?? '',
      order: option.order ?? null,
      module_id: option.module_id ?? null,
      type_id: option.type_id ?? null
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

      if (detail['module_id']?.includes('validation.required')) {
        messages.push('El modulo es obligatorio.');
      }

      if (detail['type_id']?.includes('validation.required')) {
        messages.push('El tipo de opcion es obligatorio.');
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