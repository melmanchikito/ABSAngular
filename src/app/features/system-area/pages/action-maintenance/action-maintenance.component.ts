import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  ChevronLeft,
  ChevronRight,
  CirclePlus,
  ClipboardCheck,
  Edit3,
  LucideAngularModule,
  RefreshCcw,
  Search,
  Trash2,
  X
} from 'lucide-angular';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { StatCardComponent } from '../../../../shared/components/stat-card/stat-card.component';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import {
  ActionItem,
  CancelActionRequest,
  InsertActionRequest,
  UpdateActionRequest
} from '../../models/action-maintenance.model';
import { ActionMaintenanceService } from '../../services/action-maintenance.service';

type ActionModalMode = 'create' | 'edit';
type ActionStatusFilter = 'all' | 'active' | 'inactive';
type BackendErrorBody = Record<string, unknown>;

interface ActionForm {
  code: string;
  name: string;
}

@Component({
  selector: 'app-action-maintenance',
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
  templateUrl: './action-maintenance.component.html',
  styleUrl: './action-maintenance.component.scss'
})
export class ActionMaintenanceComponent implements OnInit {
  readonly actionIcon = ClipboardCheck;
  readonly addIcon = CirclePlus;
  readonly chevronLeftIcon = ChevronLeft;
  readonly chevronRightIcon = ChevronRight;
  readonly editIcon = Edit3;
  readonly refreshIcon = RefreshCcw;
  readonly searchIcon = Search;
  readonly trashIcon = Trash2;
  readonly closeIcon = X;

  actions: ActionItem[] = [];
  selectedActionId: number | null = null;
  searchTerm = '';
  statusFilter: ActionStatusFilter = 'all';
  currentPage = 1;
  pageSize = 6;
  isLoading = false;
  isSaving = false;
  isLoadingDetail = false;
  successMessage = '';
  errorMessage = '';
  formError = '';

  modalOpen = false;
  modalMode: ActionModalMode = 'create';
  editingAction: ActionItem | null = null;
  actionToCancel: ActionItem | null = null;

  actionForm: ActionForm = this.createEmptyForm();

  constructor(private readonly actionService: ActionMaintenanceService) {}

  ngOnInit(): void {
    this.loadActions();
  }

  get modalTitle(): string {
    return this.modalMode === 'create' ? 'Nueva accion' : 'Editar accion';
  }

  get totalActions(): number {
    return this.actions.length;
  }

  get activeActions(): number {
    return this.actions.filter((action) => !action.canceled).length;
  }

  get inactiveActions(): number {
    return this.actions.filter((action) => action.canceled).length;
  }

  get selectedAction(): ActionItem | null {
    if (!this.selectedActionId) {
      return null;
    }

    return this.actions.find((action) => action.id === this.selectedActionId) ?? null;
  }

  get filteredActions(): ActionItem[] {
    const term = this.searchTerm.trim().toLowerCase();

    return this.actions.filter((action) => {
      const matchesStatus =
        this.statusFilter === 'all' ||
        (this.statusFilter === 'active' && !action.canceled) ||
        (this.statusFilter === 'inactive' && action.canceled);

      if (!matchesStatus) {
        return false;
      }

      if (!term) {
        return true;
      }

      return [
        action.code,
        action.name
      ].some((value) => value.toLowerCase().includes(term));
    });
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredActions.length / this.pageSize));
  }

  get paginatedActions(): ActionItem[] {
    const safePage = Math.min(this.currentPage, this.totalPages);
    const start = (safePage - 1) * this.pageSize;

    return this.filteredActions.slice(start, start + this.pageSize);
  }

  get showingCount(): number {
    return this.paginatedActions.length;
  }

  get cancelActionMessage(): string {
    const actionName = this.actionToCancel?.name ?? 'esta accion';

    return `Esta seguro de que desea borrar ${actionName}?`;
  }

  loadActions(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.actionService.getActions().subscribe({
      next: (actions) => {
        this.actions = actions;
        this.currentPage = Math.min(this.currentPage, this.totalPages);
        this.selectedActionId = actions.some((action) => action.id === this.selectedActionId)
          ? this.selectedActionId
          : null;
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.handleHttpError(error, 'No se pudo cargar el listado de acciones.');
      }
    });
  }

  onFiltersChange(): void {
    this.currentPage = 1;
  }

  setStatusFilter(filter: ActionStatusFilter): void {
    this.statusFilter = filter;
    this.onFiltersChange();
  }

  previousPage(): void {
    this.currentPage = Math.max(1, this.currentPage - 1);
  }

  nextPage(): void {
    this.currentPage = Math.min(this.totalPages, this.currentPage + 1);
  }

  selectAction(action: ActionItem): void {
    this.selectedActionId = action.id;
  }

  openCreateModal(): void {
    this.modalMode = 'create';
    this.editingAction = null;
    this.actionForm = this.createEmptyForm();
    this.formError = '';
    this.successMessage = '';
    this.errorMessage = '';
    this.modalOpen = true;
  }

  openEditModal(action: ActionItem): void {
    this.modalMode = 'edit';
    this.editingAction = action;
    this.actionForm = this.createFormFromAction(action);
    this.formError = '';
    this.successMessage = '';
    this.errorMessage = '';
    this.modalOpen = true;
    this.isLoadingDetail = true;

    this.actionService.getActionById(action.id).subscribe({
      next: (loadedAction) => {
        this.isLoadingDetail = false;
        this.editingAction = loadedAction;
        this.actionForm = this.createFormFromAction(loadedAction);
      },
      error: (error) => {
        this.isLoadingDetail = false;
        this.handleHttpError(
          error,
          'No se pudo cargar la accion seleccionada para editar.',
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
    this.editingAction = null;
    this.formError = '';
    this.isLoadingDetail = false;
  }

  saveAction(): void {
    this.successMessage = '';
    this.errorMessage = '';
    this.formError = '';

    const code = this.actionForm.code.trim();
    const name = this.actionForm.name.trim();

    if (this.modalMode === 'create' && !code) {
      this.formError = 'El codigo es obligatorio.';
      return;
    }

    if (!name) {
      this.formError = 'El nombre es obligatorio.';
      return;
    }

    this.isSaving = true;

    if (this.modalMode === 'create') {
      const payload: InsertActionRequest = {
        code,
        name,
        created_by: this.getUsername()
      };

      this.actionService.insertAction(payload).subscribe({
        next: () => this.afterSuccessfulSave('Accion creada correctamente.'),
        error: (error) => this.handleSaveError(error, 'No se pudo crear la accion.')
      });

      return;
    }

    if (!this.editingAction) {
      this.isSaving = false;
      this.formError = 'No se encontro la accion seleccionada.';
      return;
    }

    const payload: UpdateActionRequest = {
      action_id: this.editingAction.id,
      name,
      updated_by: this.getUsername()
    };

    this.actionService.updateAction(payload).subscribe({
      next: () => this.afterSuccessfulSave('Accion actualizada correctamente.'),
      error: (error) => this.handleSaveError(error, 'No se pudo actualizar la accion.')
    });
  }

  askCancel(action: ActionItem): void {
    this.actionToCancel = action;
    this.successMessage = '';
    this.errorMessage = '';
  }

  closeCancelConfirm(): void {
    if (this.isSaving) {
      return;
    }

    this.actionToCancel = null;
  }

  confirmCancel(): void {
    if (!this.actionToCancel) {
      return;
    }

    const payload: CancelActionRequest = {
      action_id: this.actionToCancel.id,
      canceled_by: this.getUsername()
    };

    this.isSaving = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.actionService.cancelAction(payload).subscribe({
      next: () => {
        this.isSaving = false;
        this.actionToCancel = null;
        this.selectedActionId = null;
        this.successMessage = 'Accion anulada correctamente.';
        this.loadActions();
      },
      error: (error) => {
        this.isSaving = false;
        this.handleHttpError(error, 'No se pudo anular la accion.');
      }
    });
  }

  formatDate(value?: string | null): string {
    return value || 'Sin registro';
  }

  getActionInitial(action: ActionItem): string {
    return (action.name || action.code || '?').trim().charAt(0).toUpperCase();
  }

  trackByActionId(_: number, action: ActionItem): number {
    return action.id;
  }

  private createEmptyForm(): ActionForm {
    return {
      code: '',
      name: ''
    };
  }

  private createFormFromAction(action: ActionItem): ActionForm {
    return {
      code: action.code ?? '',
      name: action.name ?? ''
    };
  }

  private afterSuccessfulSave(message: string): void {
    this.isSaving = false;
    this.modalOpen = false;
    this.editingAction = null;
    this.successMessage = message;
    this.loadActions();
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
