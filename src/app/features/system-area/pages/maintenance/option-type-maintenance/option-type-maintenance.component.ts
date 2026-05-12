import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
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
import {
  CirclePlus,
  Edit3,
  LucideAngularModule,
  RefreshCcw,
  Search,
  Tags,
  Trash2,
  X
} from 'lucide-angular';
import { finalize } from 'rxjs';
import { ConfirmDialogComponent } from '../../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { DataGridPaginationComponent } from '../../../../../shared/components/data-grid-pagination/data-grid-pagination.component';
import { EmptyStateComponent } from '../../../../../shared/components/empty-state/empty-state.component';
import { PageHeaderComponent } from '../../../../../shared/components/page-header/page-header.component';
import { StatCardComponent } from '../../../../../shared/components/stat-card/stat-card.component';
import { StatusBadgeComponent } from '../../../../../shared/components/status-badge/status-badge.component';
import {
  CancelOptionTypeRequest,
  InsertOptionTypeRequest,
  OptionTypeItem,
  UpdateOptionTypeRequest
} from '../../../models/option-type-maintenance.model';
import { OptionTypeMaintenanceService } from '../../../services/option-type-maintenance.service';

type OptionTypeStatusFilter = 'all' | 'active' | 'inactive';
type OptionTypeModalMode = 'create' | 'edit';
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
    LucideAngularModule,
    ConfirmDialogComponent,
    DataGridPaginationComponent,
    EmptyStateComponent,
    PageHeaderComponent,
    StatCardComponent,
    StatusBadgeComponent
  ],
  templateUrl: './option-type-maintenance.component.html',
  styleUrl: './option-type-maintenance.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OptionTypeMaintenanceComponent {
  readonly optionTypeIcon = Tags;
  readonly addIcon = CirclePlus;
  readonly editIcon = Edit3;
  readonly refreshIcon = RefreshCcw;
  readonly searchIcon = Search;
  readonly trashIcon = Trash2;
  readonly closeIcon = X;

  readonly pageSize = 7;
  readonly optionTypes = signal<OptionTypeItem[]>([]);
  readonly searchTerm = signal('');
  readonly statusFilter = signal<OptionTypeStatusFilter>('all');
  readonly currentPage = signal(1);
  readonly selectedOptionTypeId = signal<number | null>(null);
  readonly isLoading = signal(false);
  readonly isSaving = signal(false);
  readonly isLoadingDetail = signal(false);
  readonly modalOpen = signal(false);
  readonly modalMode = signal<OptionTypeModalMode>('create');
  readonly editingOptionType = signal<OptionTypeItem | null>(null);
  readonly optionTypeToCancel = signal<OptionTypeItem | null>(null);
  readonly toast = signal<ToastState | null>(null);
  readonly formError = signal('');

  readonly totalOptionTypes = computed(() => this.optionTypes().length);
  readonly activeOptionTypesCount = computed(
    () => this.optionTypes().filter((type) => !type.canceled).length
  );
  readonly inactiveOptionTypesCount = computed(
    () => this.optionTypes().filter((type) => type.canceled).length
  );

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

  readonly selectedOptionType = computed(() => {
    const selectedId = this.selectedOptionTypeId();

    if (!selectedId) {
      return null;
    }

    return this.optionTypes().find((type) => type.id === selectedId) ?? null;
  });

  readonly cancelOptionTypeMessage = computed(() => {
    const name = this.optionTypeToCancel()?.name ?? 'este tipo de opcion';

    return `Esta seguro de que desea borrar ${name}?`;
  });

  readonly modalTitle = computed(() =>
    this.modalMode() === 'create' ? 'Nuevo tipo de opcion' : 'Editar tipo de opcion'
  );

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

  openCreateModal(): void {
    this.modalMode.set('create');
    this.editingOptionType.set(null);
    this.formError.set('');
    this.optionTypeForm.reset({
      code: '',
      name: ''
    });
    this.optionTypeForm.controls.code.enable();
    this.modalOpen.set(true);
  }

  openEditModal(optionType: OptionTypeItem): void {
    this.modalMode.set('edit');
    this.editingOptionType.set(optionType);
    this.formError.set('');
    this.optionTypeForm.reset({
      code: optionType.code,
      name: optionType.name
    });
    this.optionTypeForm.controls.code.disable();
    this.modalOpen.set(true);
    this.isLoadingDetail.set(true);

    this.optionTypeService
      .getOptionTypeById(optionType.id)
      .pipe(finalize(() => this.isLoadingDetail.set(false)))
      .subscribe({
        next: (loadedOptionType) => {
          this.editingOptionType.set(loadedOptionType);
          this.optionTypeForm.reset({
            code: loadedOptionType.code,
            name: loadedOptionType.name
          });
          this.optionTypeForm.controls.code.disable();
        },
        error: (error) =>
          this.handleHttpError(
            error,
            'No se pudo cargar el tipo de opcion seleccionado.',
            true
          )
      });
  }

  closeModal(): void {
    if (this.isSaving()) {
      return;
    }

    this.modalOpen.set(false);
    this.editingOptionType.set(null);
    this.formError.set('');
    this.isLoadingDetail.set(false);
    this.optionTypeForm.controls.code.enable();
  }

  saveOptionType(): void {
    this.formError.set('');
    this.optionTypeForm.markAllAsTouched();

    if (this.optionTypeForm.invalid) {
      this.formError.set('Revise los campos obligatorios antes de guardar.');
      return;
    }

    this.isSaving.set(true);

    if (this.modalMode() === 'create') {
      const payload: InsertOptionTypeRequest = {
        code: this.optionTypeForm.controls.code.getRawValue().trim(),
        name: this.optionTypeForm.controls.name.getRawValue().trim(),
        created_by: this.getUsername()
      };

      this.optionTypeService
        .insertOptionType(payload)
        .pipe(finalize(() => this.isSaving.set(false)))
        .subscribe({
          next: () => this.afterSuccessfulSave('Tipo de opcion creado correctamente.'),
          error: (error) => this.handleHttpError(error, 'No se pudo crear el tipo de opcion.', true)
        });

      return;
    }

    const editing = this.editingOptionType();

    if (!editing) {
      this.isSaving.set(false);
      this.formError.set('No se encontro el tipo de opcion seleccionado.');
      return;
    }

    const payload: UpdateOptionTypeRequest = {
      option_type_id: editing.id,
      name: this.optionTypeForm.controls.name.getRawValue().trim(),
      updated_by: this.getUsername()
    };

    this.optionTypeService
      .updateOptionType(payload)
      .pipe(finalize(() => this.isSaving.set(false)))
      .subscribe({
        next: () => this.afterSuccessfulSave('Tipo de opcion actualizado correctamente.'),
        error: (error) => this.handleHttpError(error, 'No se pudo actualizar el tipo de opcion.', true)
      });
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
    return value || 'Sin registro';
  }

  getOptionTypeInitial(optionType: OptionTypeItem): string {
    return (optionType.name || optionType.code || '?').trim().charAt(0).toUpperCase();
  }

  trackByOptionTypeId(_: number, optionType: OptionTypeItem): number {
    return optionType.id;
  }

  private afterSuccessfulSave(message: string): void {
    this.modalOpen.set(false);
    this.editingOptionType.set(null);
    this.optionTypeForm.controls.code.enable();
    this.setToast('success', message);
    this.loadOptionTypes();
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
