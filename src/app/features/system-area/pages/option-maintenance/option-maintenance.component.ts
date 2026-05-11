import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  ChevronLeft,
  ChevronRight,
  CirclePlus,
  Edit3,
  LucideAngularModule,
  RefreshCcw,
  Search,
  Settings,
  Trash2,
  X
} from 'lucide-angular';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { StatCardComponent } from '../../../../shared/components/stat-card/stat-card.component';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import { ModuleItem } from '../../models/module-maintenance.model';
import {
  CancelOptionRequest,
  InsertOptionRequest,
  OptionItem,
  OptionTypeItem,
  UpdateOptionRequest
} from '../../models/option-maintenance.model';
import { ModuleMaintenanceService } from '../../services/module-maintenance.service';
import { OptionMaintenanceService } from '../../services/option-maintenance.service';

type OptionModalMode = 'create' | 'edit';
type OptionStatusFilter = 'all' | 'active' | 'inactive';
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
    LucideAngularModule,
    ConfirmDialogComponent,
    EmptyStateComponent,
    PageHeaderComponent,
    StatCardComponent,
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
  readonly editIcon = Edit3;
  readonly refreshIcon = RefreshCcw;
  readonly searchIcon = Search;
  readonly trashIcon = Trash2;
  readonly closeIcon = X;

  options: OptionItem[] = [];
  modules: ModuleItem[] = [];
  optionTypes: OptionTypeItem[] = [];
  selectedOptionId: number | null = null;
  selectedModuleFilter: number | 'all' = 'all';
  selectedTypeFilter: number | 'all' = 'all';
  searchTerm = '';
  statusFilter: OptionStatusFilter = 'all';
  currentPage = 1;
  pageSize = 6;
  isLoading = false;
  isLoadingCatalogs = false;
  isSaving = false;
  isLoadingDetail = false;
  successMessage = '';
  errorMessage = '';
  formError = '';

  modalOpen = false;
  modalMode: OptionModalMode = 'create';
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

  get modalTitle(): string {
    return this.modalMode === 'create' ? 'Nueva opcion' : 'Editar opcion';
  }

  get totalOptions(): number {
    return this.options.length;
  }

  get activeOptionsCount(): number {
    return this.options.filter((option) => !option.canceled).length;
  }

  get inactiveOptionsCount(): number {
    return this.options.filter((option) => option.canceled).length;
  }

  get selectedOption(): OptionItem | null {
    if (!this.selectedOptionId) {
      return null;
    }

    return this.options.find((option) => option.id === this.selectedOptionId) ?? null;
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

  previousPage(): void {
    this.currentPage = Math.max(1, this.currentPage - 1);
  }

  nextPage(): void {
    this.currentPage = Math.min(this.totalPages, this.currentPage + 1);
  }

  selectOption(option: OptionItem): void {
    this.selectedOptionId = option.id;
  }

  openCreateModal(): void {
    this.modalMode = 'create';
    this.editingOption = null;
    this.optionForm = this.createEmptyForm();
    this.formError = '';
    this.successMessage = '';
    this.errorMessage = '';
    this.modalOpen = true;
  }

  openEditModal(option: OptionItem): void {
    this.modalMode = 'edit';
    this.editingOption = option;
    this.optionForm = this.createFormFromOption(option);
    this.formError = '';
    this.successMessage = '';
    this.errorMessage = '';
    this.modalOpen = true;
    this.isLoadingDetail = true;

    this.optionService.getOptionById(option.id).subscribe({
      next: (loadedOption) => {
        this.isLoadingDetail = false;
        this.editingOption = loadedOption;
        this.optionForm = this.createFormFromOption(loadedOption);
      },
      error: (error) => {
        this.isLoadingDetail = false;
        this.handleHttpError(
          error,
          'No se pudo cargar la opcion seleccionada para editar.',
          true
        );
      }
    });
  }

  closeModal(): void {
    if (this.isSaving) {
      return;
    }

    this.modalOpen = false;
    this.editingOption = null;
    this.formError = '';
    this.isLoadingDetail = false;
  }

  saveOption(): void {
    this.successMessage = '';
    this.errorMessage = '';
    this.formError = '';

    const code = this.optionForm.code.trim();
    const name = this.optionForm.name.trim();
    const order = Number(this.optionForm.order);
    const moduleId = Number(this.optionForm.module_id);
    const typeId = Number(this.optionForm.type_id);

    if (this.modalMode === 'create' && !code) {
      this.formError = 'El codigo es obligatorio.';
      return;
    }

    if (!name) {
      this.formError = 'El nombre es obligatorio.';
      return;
    }

    if (!Number.isFinite(order)) {
      this.formError = 'El orden es obligatorio y debe ser numerico.';
      return;
    }

    if (!Number.isFinite(moduleId) || moduleId <= 0) {
      this.formError = 'El modulo es obligatorio.';
      return;
    }

    if (!Number.isFinite(typeId) || typeId <= 0) {
      this.formError = 'El tipo de opcion es obligatorio.';
      return;
    }

    this.isSaving = true;

    if (this.modalMode === 'create') {
      const payload: InsertOptionRequest = {
        code,
        name,
        order,
        module_id: moduleId,
        type_id: typeId,
        created_by: this.getUsername()
      };

      this.optionService.insertOption(payload).subscribe({
        next: () => this.afterSuccessfulSave('Opcion creada correctamente.'),
        error: (error) => this.handleSaveError(error, 'No se pudo crear la opcion.')
      });

      return;
    }

    if (!this.editingOption) {
      this.isSaving = false;
      this.formError = 'No se encontro la opcion seleccionada.';
      return;
    }

    const payload: UpdateOptionRequest = {
      option_id: this.editingOption.id,
      name,
      order,
      module_id: moduleId,
      type_id: typeId,
      updated_by: this.getUsername()
    };

    this.optionService.updateOption(payload).subscribe({
      next: () => this.afterSuccessfulSave('Opcion actualizada correctamente.'),
      error: (error) => this.handleSaveError(error, 'No se pudo actualizar la opcion.')
    });
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
    return value || 'Sin registro';
  }

  getOptionInitial(option: OptionItem): string {
    return (option.name || option.code || '?').trim().charAt(0).toUpperCase();
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

  private afterSuccessfulSave(message: string): void {
    this.isSaving = false;
    this.modalOpen = false;
    this.editingOption = null;
    this.successMessage = message;
    this.loadOptions();
  }

  private handleSaveError(error: unknown, fallback: string): void {
    this.isSaving = false;
    this.handleHttpError(error, fallback, true);
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
