import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  BriefcaseBusiness,
  CirclePlus,
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
import { EmptyStateComponent } from '../../../../../shared/components/empty-state/empty-state.component';
import { PageHeaderComponent } from '../../../../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../../../../shared/components/status-badge/status-badge.component';
import { GridColumnConfig, GridFilterOption } from '../../../../../shared/models/grid-view.model';
import { formatDateTime, isDateLikeField } from '../../../../../shared/utils/date-format.util';
import {
  CancelPositionRequest,
  PositionItem
} from '../../../models/position-maintenance.model';
import { PositionMaintenanceService } from '../../../services/position-maintenance.service';

type PositionStatusFilter = 'all' | 'active' | 'inactive';
type PositionGridColumn = keyof PositionItem | 'actions';
type BackendErrorBody = Record<string, unknown>;

@Component({
  selector: 'app-position-maintenance',
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
  templateUrl: './position-maintenance.component.html',
  styleUrl: './position-maintenance.component.scss'
})
export class PositionMaintenanceComponent implements OnInit {
  readonly positionIcon = BriefcaseBusiness;
  readonly addIcon = CirclePlus;
  readonly detailIcon = Eye;
  readonly editIcon = Edit3;
  readonly refreshIcon = RefreshCcw;
  readonly searchIcon = Search;
  readonly filterIcon = SlidersHorizontal;
  readonly trashIcon = Trash2;
  readonly closeIcon = X;

  readonly gridColumns: readonly GridColumnConfig<PositionGridColumn>[] = [
    { key: 'id', label: 'ID', width: '88px' },
    { key: 'code', label: 'Codigo' },
    { key: 'name', label: 'Nombre' },
    { key: 'canceled', label: 'Estado', width: '140px' },
    { key: 'created_at', label: 'Fecha creacion', width: '180px' },
    { key: 'updated_at', label: 'Fecha actualizacion', width: '190px' },
    { key: 'canceled_at', label: 'Fecha anulacion', width: '180px' },
    { key: 'actions', label: 'Acciones', width: '170px', align: 'right' }
  ];

  readonly statusFilterOptions: readonly GridFilterOption<PositionStatusFilter>[] = [
    { value: 'all', label: 'Todas' },
    { value: 'active', label: 'Activas' },
    { value: 'inactive', label: 'Inactivas' }
  ];

  positions: PositionItem[] = [];
  selectedPositionId: number | null = null;
  searchTerm = '';
  statusFilter: PositionStatusFilter = 'all';
  statusFilterDraft: PositionStatusFilter = 'all';
  filtersOpen = false;
  currentPage = 1;
  pageSize = 7;
  isLoading = false;
  isSaving = false;
  successMessage = '';
  errorMessage = '';
  positionToCancel: PositionItem | null = null;

  constructor(private readonly positionService: PositionMaintenanceService) {}

  ngOnInit(): void {
    this.loadPositions();
  }

  get filteredPositions(): PositionItem[] {
    const term = this.searchTerm.trim().toLowerCase();

    return this.positions.filter((position) => {
      const matchesStatus =
        this.statusFilter === 'all' ||
        (this.statusFilter === 'active' && !position.canceled) ||
        (this.statusFilter === 'inactive' && position.canceled);

      if (!matchesStatus) {
        return false;
      }

      if (!term) {
        return true;
      }

      return [
        position.code,
        position.name
      ].some((value) => String(value ?? '').toLowerCase().includes(term));
    });
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredPositions.length / this.pageSize));
  }

  get paginatedPositions(): PositionItem[] {
    const safePage = Math.min(this.currentPage, this.totalPages);
    const start = (safePage - 1) * this.pageSize;

    return this.filteredPositions.slice(start, start + this.pageSize);
  }

  get showingCount(): number {
    return this.paginatedPositions.length;
  }

  get cancelPositionMessage(): string {
    const positionName = this.positionToCancel?.name ?? 'este cargo';

    return `Esta seguro de que desea borrar ${positionName}?`;
  }

  loadPositions(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.positionService.getPositions().subscribe({
      next: (positions) => {
        this.positions = positions;
        this.currentPage = Math.min(this.currentPage, this.totalPages);
        this.selectedPositionId = positions.some((position) => position.id === this.selectedPositionId)
          ? this.selectedPositionId
          : null;
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.handleHttpError(error, 'No se pudo cargar el listado de cargos.');
      }
    });
  }

  onFiltersChange(): void {
    this.currentPage = 1;
  }

  setStatusFilter(filter: PositionStatusFilter): void {
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

  selectPosition(position: PositionItem): void {
    this.selectedPositionId = position.id;
  }

  askCancel(position: PositionItem): void {
    this.positionToCancel = position;
    this.successMessage = '';
    this.errorMessage = '';
  }

  closeCancelConfirm(): void {
    if (this.isSaving) {
      return;
    }

    this.positionToCancel = null;
  }

  confirmCancel(): void {
    if (!this.positionToCancel) {
      return;
    }

    const payload: CancelPositionRequest = {
      position_id: this.positionToCancel.id,
      canceled_by: this.getUsername()
    };

    this.isSaving = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.positionService.cancelPosition(payload).subscribe({
      next: () => {
        this.isSaving = false;
        this.positionToCancel = null;
        this.selectedPositionId = null;
        this.successMessage = 'Cargo anulado correctamente.';
        this.loadPositions();
      },
      error: (error) => {
        this.isSaving = false;
        this.handleHttpError(error, 'No se pudo anular el cargo.');
      }
    });
  }

  formatDate(value?: string | null): string {
    return formatDateTime(value);
  }

  trackByPositionId(_: number, position: PositionItem): number {
    return position.id;
  }

  trackByColumnKey(_: number, column: GridColumnConfig<PositionGridColumn>): PositionGridColumn {
    return column.key;
  }

  getColumnClass(column: GridColumnConfig<PositionGridColumn>): string {
    const classes = [`app-grid-col-${column.key}`];

    if (column.align === 'right') {
      classes.push('app-grid-col-right');
    }

    if (column.align === 'center') {
      classes.push('app-grid-col-center');
    }

    return classes.join(' ');
  }

  formatGridValue(position: PositionItem, key: PositionGridColumn): string {
    if (key === 'actions' || key === 'canceled') {
      return '';
    }

    const value = position[key];

    if (isDateLikeField(String(key))) {
      return formatDateTime(value as string | null | undefined);
    }

    return value === null || value === undefined || value === '' ? 'Sin registro' : String(value);
  }

  @HostListener('document:click')
  closeFiltersFromOutside(): void {
    this.filtersOpen = false;
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
