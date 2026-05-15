import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  ChevronLeft,
  ChevronRight,
  CirclePlus,
  ClipboardCheck,
  Edit3,
  Eye,
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
  ActionItem,
  CancelActionRequest,
  InsertActionRequest,
  UpdateActionRequest
} from '../../../models/action-maintenance.model';
import { ActionMaintenanceService } from '../../../services/action-maintenance.service';

type ActionStatusFilter = 'all' | 'active' | 'inactive';
type ActionGridColumn = keyof ActionItem | 'actions';
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
    RouterLink,
    LucideAngularModule,
    ConfirmDialogComponent,
    DataGridPaginationComponent,
    DebouncedSearchDirective,
    EmptyStateComponent,
    PageHeaderComponent,
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
  readonly detailIcon = Eye;
  readonly editIcon = Edit3;
  readonly refreshIcon = RefreshCcw;
  readonly searchIcon = Search;
  readonly filterIcon = SlidersHorizontal;
  readonly trashIcon = Trash2;
  readonly closeIcon = X;
  readonly gridColumns: readonly GridColumnConfig<ActionGridColumn>[] = [
    { key: 'id', label: 'ID', width: '88px' },
    { key: 'code', label: 'Codigo' },
    { key: 'name', label: 'Nombre' },
    { key: 'canceled', label: 'Estado', width: '140px' },
    { key: 'canceled_at', label: 'Fecha anulacion', width: '180px' },
    { key: 'created_at', label: 'Fecha creacion', width: '180px' },
    { key: 'updated_at', label: 'Fecha actualizacion', width: '190px' },
    { key: 'actions', label: 'Acciones', width: '170px', align: 'right' }
  ];
  readonly statusFilterOptions: readonly GridFilterOption<ActionStatusFilter>[] = [
    { value: 'all', label: 'Todas' },
    { value: 'active', label: 'Activas' },
    { value: 'inactive', label: 'Inactivas' }
  ];

  actions: ActionItem[] = [];
  selectedActionId: number | null = null;
  searchTerm = '';
  statusFilter: ActionStatusFilter = 'all';
  statusFilterDraft: ActionStatusFilter = 'all';
  filtersOpen = false;
  currentPage = 1;
  pageSize = 6;
  isLoading = false;
  isSaving = false;
  isLoadingDetail = false;
  successMessage = '';
  errorMessage = '';
  formError = '';

  editingAction: ActionItem | null = null;
  actionToCancel: ActionItem | null = null;

  actionForm: ActionForm = this.createEmptyForm();

  constructor(private readonly actionService: ActionMaintenanceService) {}

  ngOnInit(): void {
    this.loadActions();
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

  selectAction(action: ActionItem): void {
    this.selectedActionId = action.id;
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
    return formatDateTime(value);
  }

  trackByActionId(_: number, action: ActionItem): number {
    return action.id;
  }

  trackByColumnKey(_: number, column: GridColumnConfig<ActionGridColumn>): ActionGridColumn {
    return column.key;
  }

  getColumnClass(column: GridColumnConfig<ActionGridColumn>): string {
    const classes = [`app-grid-col-${column.key}`];

    if (column.align === 'right') {
      classes.push('app-grid-col-right');
    }

    if (column.align === 'center') {
      classes.push('app-grid-col-center');
    }

    return classes.join(' ');
  }

  formatGridValue(action: ActionItem, key: ActionGridColumn): string {
    if (key === 'actions' || key === 'canceled') {
      return '';
    }

    const value = action[key];

    if (isDateLikeField(String(key))) {
      return formatDateTime(value as string | null | undefined);
    }

    return value === null || value === undefined || value === '' ? 'Sin registro' : String(value);
  }

  @HostListener('document:click')
  closeFiltersFromOutside(): void {
    this.filtersOpen = false;
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