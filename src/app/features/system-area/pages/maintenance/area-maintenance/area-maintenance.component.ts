import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  CirclePlus,
  Edit3,
  Eye,
  FolderKanban,
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
import { GridColumnConfig, GridFilterOption } from '../../../../../shared/models/grid-view.model';
import { PageHeaderComponent } from '../../../../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../../../../shared/components/status-badge/status-badge.component';
import { formatDateTime, isDateLikeField } from '../../../../../shared/utils/date-format.util';
import { AreaItem, CancelAreaRequest } from '../../../models/area-maintenance.model';
import { AreaMaintenanceService } from '../../../services/area-maintenance.service';

type AreaStatusFilter = 'all' | 'active' | 'inactive';
type AreaGridColumn = keyof AreaItem | 'actions';
type BackendErrorBody = Record<string, unknown>;

@Component({
  selector: 'app-area-maintenance',
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
  templateUrl: './area-maintenance.component.html',
  styleUrl: './area-maintenance.component.scss'
})
export class AreaMaintenanceComponent implements OnInit {
  readonly areaIcon = FolderKanban;
  readonly addIcon = CirclePlus;
  readonly detailIcon = Eye;
  readonly editIcon = Edit3;
  readonly refreshIcon = RefreshCcw;
  readonly searchIcon = Search;
  readonly filterIcon = SlidersHorizontal;
  readonly trashIcon = Trash2;
  readonly closeIcon = X;
  readonly gridColumns: readonly GridColumnConfig<AreaGridColumn>[] = [
    { key: 'id', label: 'ID', width: '88px' },
    { key: 'code', label: 'Codigo' },
    { key: 'name', label: 'Nombre' },
    { key: 'order', label: 'Orden', width: '110px' },
    { key: 'canceled', label: 'Estado', width: '140px' },
    { key: 'created_at', label: 'Fecha creacion', width: '180px' },
    { key: 'updated_at', label: 'Fecha actualizacion', width: '190px' },
    { key: 'canceled_at', label: 'Fecha anulacion', width: '180px' },
    { key: 'actions', label: 'Acciones', width: '170px', align: 'right' }
  ];
  readonly statusFilterOptions: readonly GridFilterOption<AreaStatusFilter>[] = [
    { value: 'all', label: 'Todas' },
    { value: 'active', label: 'Activas' },
    { value: 'inactive', label: 'Inactivas' }
  ];

  areas: AreaItem[] = [];
  selectedAreaId: number | null = null;
  searchTerm = '';
  statusFilter: AreaStatusFilter = 'all';
  statusFilterDraft: AreaStatusFilter = 'all';
  filtersOpen = false;
  currentPage = 1;
  pageSize = 6;
  isLoading = false;
  isSaving = false;
  successMessage = '';
  errorMessage = '';
  areaToCancel: AreaItem | null = null;

  constructor(private readonly areaService: AreaMaintenanceService) {}

  ngOnInit(): void {
    this.loadAreas();
  }

  get filteredAreas(): AreaItem[] {
    const term = this.searchTerm.trim().toLowerCase();

    return this.areas.filter((area) => {
      const matchesStatus =
        this.statusFilter === 'all' ||
        (this.statusFilter === 'active' && !area.canceled) ||
        (this.statusFilter === 'inactive' && area.canceled);

      if (!matchesStatus) {
        return false;
      }

      if (!term) {
        return true;
      }

      return [
        area.code,
        area.name,
        String(area.order ?? '')
      ].some((value) => String(value ?? '').toLowerCase().includes(term));
    });
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredAreas.length / this.pageSize));
  }

  get paginatedAreas(): AreaItem[] {
    const safePage = Math.min(this.currentPage, this.totalPages);
    const start = (safePage - 1) * this.pageSize;

    return this.filteredAreas.slice(start, start + this.pageSize);
  }

  get showingCount(): number {
    return this.paginatedAreas.length;
  }

  get cancelAreaMessage(): string {
    const areaName = this.areaToCancel?.name ?? 'esta area';

    return `Esta seguro de que desea anular ${areaName}?`;
  }

  loadAreas(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.areaService.getAreas().subscribe({
      next: (areas) => {
        this.areas = areas;
        this.currentPage = Math.min(this.currentPage, this.totalPages);
        this.selectedAreaId = areas.some((area) => area.id === this.selectedAreaId)
          ? this.selectedAreaId
          : null;
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.handleHttpError(error, 'No se pudo cargar el listado de areas.');
      }
    });
  }

  onFiltersChange(): void {
    this.currentPage = 1;
  }

  setStatusFilter(filter: AreaStatusFilter): void {
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

  selectArea(area: AreaItem): void {
    this.selectedAreaId = area.id;
  }

  askCancel(area: AreaItem): void {
    this.areaToCancel = area;
    this.successMessage = '';
    this.errorMessage = '';
  }

  closeCancelConfirm(): void {
    if (this.isSaving) {
      return;
    }

    this.areaToCancel = null;
  }

  confirmCancel(): void {
    if (!this.areaToCancel) {
      return;
    }

    const payload: CancelAreaRequest = {
      area_id: this.areaToCancel.id,
      canceled_by: this.getUsername()
    };

    this.isSaving = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.areaService.cancelArea(payload).subscribe({
      next: () => {
        this.isSaving = false;
        this.areaToCancel = null;
        this.selectedAreaId = null;
        this.successMessage = 'Area anulada correctamente.';
        this.loadAreas();
      },
      error: (error) => {
        this.isSaving = false;
        this.handleHttpError(error, 'No se pudo anular el area.');
      }
    });
  }

  trackByAreaId(_: number, area: AreaItem): number {
    return area.id;
  }

  trackByColumnKey(_: number, column: GridColumnConfig<AreaGridColumn>): AreaGridColumn {
    return column.key;
  }

  getColumnClass(column: GridColumnConfig<AreaGridColumn>): string {
    const classes = [`app-grid-col-${column.key}`];

    if (column.align === 'right') {
      classes.push('app-grid-col-right');
    }

    if (column.align === 'center') {
      classes.push('app-grid-col-center');
    }

    return classes.join(' ');
  }

  formatGridValue(area: AreaItem, key: AreaGridColumn): string {
    if (key === 'actions' || key === 'canceled') {
      return '';
    }

    const value = area[key];

    if (isDateLikeField(String(key))) {
      return formatDateTime(value as string | null | undefined);
    }

    return value === null || value === undefined || value === '' ? '-' : String(value);
  }

  @HostListener('document:click')
  closeFiltersFromOutside(): void {
    this.filtersOpen = false;
  }

  private handleHttpError(error: unknown, fallback: string): void {
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
