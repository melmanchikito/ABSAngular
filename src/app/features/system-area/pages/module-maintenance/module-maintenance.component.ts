import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  ChevronLeft,
  ChevronRight,
  CirclePlus,
  Edit3,
  LayoutDashboard,
  LucideAngularModule,
  RefreshCcw,
  Search,
  Trash2,
  X
} from 'lucide-angular';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { DataGridPaginationComponent } from '../../../../shared/components/data-grid-pagination/data-grid-pagination.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { StatCardComponent } from '../../../../shared/components/stat-card/stat-card.component';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import {
  CancelModuleRequest,
  InsertModuleRequest,
  ModuleItem,
  UpdateModuleRequest
} from '../../models/module-maintenance.model';
import { ModuleMaintenanceService } from '../../services/module-maintenance.service';

type ModuleModalMode = 'create' | 'edit';
type ModuleStatusFilter = 'all' | 'active' | 'inactive';
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
    LucideAngularModule,
    ConfirmDialogComponent,
    DataGridPaginationComponent,
    EmptyStateComponent,
    PageHeaderComponent,
    StatCardComponent,
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
  readonly editIcon = Edit3;
  readonly refreshIcon = RefreshCcw;
  readonly searchIcon = Search;
  readonly trashIcon = Trash2;
  readonly closeIcon = X;

  modules: ModuleItem[] = [];
  selectedModuleId: number | null = null;
  searchTerm = '';
  statusFilter: ModuleStatusFilter = 'all';
  currentPage = 1;
  pageSize = 6;
  isLoading = false;
  isSaving = false;
  isLoadingDetail = false;
  successMessage = '';
  errorMessage = '';
  formError = '';

  modalOpen = false;
  modalMode: ModuleModalMode = 'create';
  editingModule: ModuleItem | null = null;
  moduleToCancel: ModuleItem | null = null;

  moduleForm: ModuleForm = this.createEmptyForm();

  constructor(private readonly moduleService: ModuleMaintenanceService) {}

  ngOnInit(): void {
    this.loadModules();
  }

  get modalTitle(): string {
    return this.modalMode === 'create' ? 'Nuevo modulo' : 'Editar modulo';
  }

  get totalModules(): number {
    return this.modules.length;
  }

  get activeModules(): number {
    return this.modules.filter((module) => !module.canceled).length;
  }

  get inactiveModules(): number {
    return this.modules.filter((module) => module.canceled).length;
  }

  get selectedModule(): ModuleItem | null {
    if (!this.selectedModuleId) {
      return null;
    }

    return this.modules.find((module) => module.id === this.selectedModuleId) ?? null;
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

  openCreateModal(): void {
    this.modalMode = 'create';
    this.editingModule = null;
    this.moduleForm = this.createEmptyForm();
    this.formError = '';
    this.successMessage = '';
    this.errorMessage = '';
    this.modalOpen = true;
  }

  openEditModal(module: ModuleItem): void {
    this.modalMode = 'edit';
    this.editingModule = module;
    this.moduleForm = this.createFormFromModule(module);
    this.formError = '';
    this.successMessage = '';
    this.errorMessage = '';
    this.modalOpen = true;
    this.isLoadingDetail = true;

    this.moduleService.getModuleById(module.id).subscribe({
      next: (loadedModule) => {
        this.isLoadingDetail = false;
        this.editingModule = loadedModule;
        this.moduleForm = this.createFormFromModule(loadedModule);
      },
      error: (error) => {
        this.isLoadingDetail = false;
        this.handleHttpError(
          error,
          'No se pudo cargar el modulo seleccionado para editar.',
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
    this.editingModule = null;
    this.formError = '';
    this.isLoadingDetail = false;
  }

  saveModule(): void {
    this.successMessage = '';
    this.errorMessage = '';
    this.formError = '';

    const code = this.moduleForm.code.trim();
    const name = this.moduleForm.name.trim();
    const order = Number(this.moduleForm.order);

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

    this.isSaving = true;

    if (this.modalMode === 'create') {
      const payload: InsertModuleRequest = {
        code,
        name,
        order,
        created_by: this.getUsername()
      };

      this.moduleService.insertModule(payload).subscribe({
        next: () => this.afterSuccessfulSave('Modulo creado correctamente.'),
        error: (error) => this.handleSaveError(error, 'No se pudo crear el modulo.')
      });

      return;
    }

    if (!this.editingModule) {
      this.isSaving = false;
      this.formError = 'No se encontro el modulo seleccionado.';
      return;
    }

    const payload: UpdateModuleRequest = {
      module_id: this.editingModule.id,
      name,
      order,
      updated_by: this.getUsername()
    };

    this.moduleService.updateModule(payload).subscribe({
      next: () => this.afterSuccessfulSave('Modulo actualizado correctamente.'),
      error: (error) => this.handleSaveError(error, 'No se pudo actualizar el modulo.')
    });
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
    return value || 'Sin registro';
  }

  getModuleInitial(module: ModuleItem): string {
    return (module.name || module.code || '?').trim().charAt(0).toUpperCase();
  }

  trackByModuleId(_: number, module: ModuleItem): number {
    return module.id;
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

  private afterSuccessfulSave(message: string): void {
    this.isSaving = false;
    this.modalOpen = false;
    this.editingModule = null;
    this.successMessage = message;
    this.loadModules();
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
