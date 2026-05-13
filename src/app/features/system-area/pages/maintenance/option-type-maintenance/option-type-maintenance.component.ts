import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  computed,
  inject,
  signal
} from '@angular/core';
import {
  FormControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  CirclePlus,
  Edit3,
  Eye,
  LucideAngularModule,
  RefreshCcw,
  Search,
  SlidersHorizontal,
  Tags,
  Trash2,
  X
} from 'lucide-angular';
import { finalize } from 'rxjs';
import { ConfirmDialogComponent } from '../../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { DataGridPaginationComponent } from '../../../../../shared/components/data-grid-pagination/data-grid-pagination.component';
import { EmptyStateComponent } from '../../../../../shared/components/empty-state/empty-state.component';
import { PageHeaderComponent } from '../../../../../shared/components/page-header/page-header.component';
import { formatDateTime, isDateLikeField } from '../../../../../shared/utils/date-format.util';
import { StatusBadgeComponent } from '../../../../../shared/components/status-badge/status-badge.component';
import { GridColumnConfig, GridFilterOption } from '../../../../../shared/models/grid-view.model';
import {
  CancelOptionTypeRequest,
  InsertOptionTypeRequest,
  OptionTypeItem,
  UpdateOptionTypeRequest
} from '../../../models/option-type-maintenance.model';
import { OptionTypeMaintenanceService } from '../../../services/option-type-maintenance.service';

type OptionTypeStatusFilter = 'all' | 'active' | 'inactive';
type OptionTypeGridColumn = keyof OptionTypeItem | 'actions';
type OptionTypeFormField = 'code' | 'name';
type BackendErrorBody = Record<string, unknown>;

interface ToastState {
  type: 'success' | 'error';
  message: string;
}

interface OptionTypeForm {
  code: FormControl<string>;
  name: FormControl<string>;
}

@Component({
  selector: 'app-option-type-maintenance',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    LucideAngularModule,
    ConfirmDialogComponent,
    DataGridPaginationComponent,
    EmptyStateComponent,
    PageHeaderComponent,
    StatusBadgeComponent
  ],
  templateUrl: './option-type-maintenance.component.html',
  styleUrl: './option-type-maintenance.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OptionTypeMaintenanceComponent {
  readonly optionTypeIcon = Tags;
  readonly addIcon = CirclePlus;
  readonly detailIcon = Eye;
  readonly editIcon = Edit3;
  readonly refreshIcon = RefreshCcw;
  readonly searchIcon = Search;
  readonly filterIcon = SlidersHorizontal;
  readonly trashIcon = Trash2;
  readonly closeIcon = X;
  readonly gridColumns: readonly GridColumnConfig<OptionTypeGridColumn>[] = [
    { key: 'id', label: 'ID', width: '88px' },
    { key: 'code', label: 'Codigo' },
    { key: 'name', label: 'Nombre' },
    { key: 'canceled', label: 'Estado', width: '140px' },
    { key: 'canceled_at', label: 'Fecha anulacion', width: '180px' },
    { key: 'created_at', label: 'Fecha creacion', width: '180px' },
    { key: 'updated_at', label: 'Fecha actualizacion', width: '190px' },
    { key: 'actions', label: 'Acciones', width: '170px', align: 'right' }
  ];
  readonly statusFilterOptions: readonly GridFilterOption<OptionTypeStatusFilter>[] = [
    { value: 'all', label: 'Todos' },
    { value: 'active', label: 'Activos' },
    { value: 'inactive', label: 'Inactivos' }
  ];

  readonly pageSize = 7;
  readonly optionTypes = signal<OptionTypeItem[]>([]);
  readonly searchTerm = signal('');
  readonly statusFilter = signal<OptionTypeStatusFilter>('all');
  readonly statusFilterDraft = signal<OptionTypeStatusFilter>('all');
  readonly filtersOpen = signal(false);
  readonly currentPage = signal(1);
  readonly selectedOptionTypeId = signal<number | null>(null);
  readonly isLoading = signal(false);
  readonly isSaving = signal(false);
  readonly isLoadingDetail = signal(false);
  readonly editingOptionType = signal<OptionTypeItem | null>(null);
  readonly optionTypeToCancel = signal<OptionTypeItem | null>(null);
  readonly toast = signal<ToastState | null>(null);
  readonly formError = signal('');

  readonly filteredOptionTypes = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const status = this.statusFilter();

    return this.optionTypes().filter((type) => {
      const matchesStatus =
        status === 'all' ||
        (status === 'active' && !type.canceled) ||
        (status === 'inactive' && type.canceled);

      if (!matchesStatus) {
        return false;
      }

      if (!term) {
        return true;
      }

      return [type.code, type.name, String(type.id)]
        .some((value) => value.toLowerCase().includes(term));
    });
  });

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredOptionTypes().length / this.pageSize))
  );

  readonly paginatedOptionTypes = computed(() => {
    const safePage = Math.min(this.currentPage(), this.totalPages());
    const start = (safePage - 1) * this.pageSize;

    return this.filteredOptionTypes().slice(start, start + this.pageSize);
  });

  readonly showingCount = computed(() => this.paginatedOptionTypes().length);

  readonly cancelOptionTypeMessage = computed(() => {
    const name = this.optionTypeToCancel()?.name ?? 'este tipo de opcion';

    return `Esta seguro de que desea borrar ${name}?`;
  });

  readonly optionTypeForm = inject(NonNullableFormBuilder).group<OptionTypeForm>({
    code: inject(NonNullableFormBuilder).control('', [
      Validators.required,
      Validators.minLength(2)
    ]),
    name: inject(NonNullableFormBuilder).control('', [
      Validators.required,
      Validators.minLength(3)
    ])
  });

  private readonly optionTypeService = inject(OptionTypeMaintenanceService);
  private toastTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.loadOptionTypes();
  }

  loadOptionTypes(): void {
    this.isLoading.set(true);

    this.optionTypeService
      .getOptionTypes()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (optionTypes) => {
          this.optionTypes.set(optionTypes);
          this.currentPage.set(Math.min(this.currentPage(), this.totalPages()));
          this.selectedOptionTypeId.set(
            optionTypes.some((type) => type.id === this.selectedOptionTypeId())
              ? this.selectedOptionTypeId()
              : null
          );
        },
        error: (error) => this.handleHttpError(error, 'No se pudo cargar el listado de tipos de opcion.')
      });
  }

  updateSearchTerm(value: string): void {
    this.searchTerm.set(value);
    this.currentPage.set(1);
  }

  setStatusFilter(filter: OptionTypeStatusFilter): void {
    this.statusFilter.set(filter);
    this.currentPage.set(1);
  }

  toggleFilters(event?: MouseEvent): void {
    event?.stopPropagation();
    this.statusFilterDraft.set(this.statusFilter());
    this.filtersOpen.update((open) => !open);
  }

  updateStatusFilterDraft(filter: OptionTypeStatusFilter): void {
    this.statusFilterDraft.set(filter);
  }

  applyFilters(): void {
    this.setStatusFilter(this.statusFilterDraft());
    this.filtersOpen.set(false);
  }

  clearFilters(): void {
    this.statusFilterDraft.set('all');
    this.setStatusFilter('all');
    this.filtersOpen.set(false);
  }

  previousPage(): void {
    this.currentPage.set(Math.max(1, this.currentPage() - 1));
  }

  nextPage(): void {
    this.currentPage.set(Math.min(this.totalPages(), this.currentPage() + 1));
  }

  setPage(page: number): void {
    this.currentPage.set(Math.min(Math.max(1, page), this.totalPages()));
  }

  selectOptionType(optionType: OptionTypeItem): void {
    this.selectedOptionTypeId.set(optionType.id);
  }

  askCancel(optionType: OptionTypeItem): void {
    this.optionTypeToCancel.set(optionType);
  }

  closeCancelConfirm(): void {
    if (this.isSaving()) {
      return;
    }

    this.optionTypeToCancel.set(null);
  }

  confirmCancel(): void {
    const optionType = this.optionTypeToCancel();

    if (!optionType) {
      return;
    }

    const payload: CancelOptionTypeRequest = {
      option_type_id: optionType.id,
      canceled_by: this.getUsername()
    };

    this.isSaving.set(true);

    this.optionTypeService
      .cancelOptionType(payload)
      .pipe(finalize(() => this.isSaving.set(false)))
      .subscribe({
        next: () => {
          this.optionTypeToCancel.set(null);
          this.selectedOptionTypeId.set(null);
          this.setToast('success', 'Tipo de opcion anulado correctamente.');
          this.loadOptionTypes();
        },
        error: (error) => this.handleHttpError(error, 'No se pudo anular el tipo de opcion.')
      });
  }

  fieldInvalid(field: OptionTypeFormField): boolean {
    const control = this.optionTypeForm.controls[field];

    return control.invalid && (control.touched || control.dirty);
  }

  fieldMessage(field: OptionTypeFormField): string {
    const control = this.optionTypeForm.controls[field];

    if (control.hasError('required')) {
      return field === 'code' ? 'El codigo es obligatorio.' : 'El nombre es obligatorio.';
    }

    if (control.hasError('minlength')) {
      return field === 'code'
        ? 'El codigo debe tener al menos 2 caracteres.'
        : 'El nombre debe tener al menos 3 caracteres.';
    }

    return '';
  }

  formatDate(value?: string | null): string {
    return formatDateTime(value);
  }

  trackByOptionTypeId(_: number, optionType: OptionTypeItem): number {
    return optionType.id;
  }

  trackByColumnKey(_: number, column: GridColumnConfig<OptionTypeGridColumn>): OptionTypeGridColumn {
    return column.key;
  }

  getColumnClass(column: GridColumnConfig<OptionTypeGridColumn>): string {
    const classes = [`app-grid-col-${column.key}`];

    if (column.align === 'right') {
      classes.push('app-grid-col-right');
    }

    if (column.align === 'center') {
      classes.push('app-grid-col-center');
    }

    return classes.join(' ');
  }

  formatGridValue(optionType: OptionTypeItem, key: OptionTypeGridColumn): string {
    if (key === 'actions' || key === 'canceled') {
      return '';
    }

    const value = optionType[key];

    if (isDateLikeField(String(key))) {
      return formatDateTime(value as string | null | undefined);
    }

    return value === null || value === undefined || value === '' ? 'Sin registro' : String(value);
  }

  @HostListener('document:click')
  closeFiltersFromOutside(): void {
    this.filtersOpen.set(false);
  }

  private handleHttpError(error: unknown, fallback: string, formError = false): void {
    const message = this.extractErrorMessage(this.getErrorBody(error), fallback);

    if (formError) {
      this.formError.set(message);
      return;
    }

    this.setToast('error', message);
  }

  private getErrorBody(error: unknown): BackendErrorBody | null {
    if (!error || typeof error !== 'object') {
      return null;
    }

    const body = (error as BackendErrorBody)['error'];

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

  private setToast(type: ToastState['type'], message: string): void {
    this.toast.set({ type, message });

    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
    }

    this.toastTimer = setTimeout(() => this.toast.set(null), 4200);
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