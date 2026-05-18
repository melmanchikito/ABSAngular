import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  CirclePlus,
  Edit3,
  Eye,
  LucideAngularModule,
  RefreshCcw,
  Search,
  SlidersHorizontal,
  Trash2,
  UserRoundCheck,
  X
} from 'lucide-angular';
import { ConfirmDialogComponent } from '../../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { DataGridPaginationComponent } from '../../../../../shared/components/data-grid-pagination/data-grid-pagination.component';
import { DebouncedSearchDirective } from '../../../../../shared/directives/debounced-search.directive';
import { EmptyStateComponent } from '../../../../../shared/components/empty-state/empty-state.component';
import { PageHeaderComponent } from '../../../../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../../../../shared/components/status-badge/status-badge.component';
import { GridColumnConfig, GridFilterOption } from '../../../../../shared/models/grid-view.model';
import { formatDateTime, isDateLikeField } from '../../../../../shared/utils/date-format.util';
import {
  CancelSellerRequest,
  SellerItem
} from '../../../models/seller-maintenance.model';
import { SellerMaintenanceService } from '../../../services/seller-maintenance.service';

type SellerStatusFilter = 'all' | 'active' | 'inactive';
type SellerGridColumn = keyof SellerItem | 'actions';
type BackendErrorBody = Record<string, unknown>;

@Component({
  selector: 'app-seller-maintenance',
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
  templateUrl: './seller-maintenance.component.html',
  styleUrl: './seller-maintenance.component.scss'
})
export class SellerMaintenanceComponent implements OnInit {
  readonly sellerIcon = UserRoundCheck;
  readonly addIcon = CirclePlus;
  readonly detailIcon = Eye;
  readonly editIcon = Edit3;
  readonly refreshIcon = RefreshCcw;
  readonly searchIcon = Search;
  readonly filterIcon = SlidersHorizontal;
  readonly trashIcon = Trash2;
  readonly closeIcon = X;

  readonly gridColumns: readonly GridColumnConfig<SellerGridColumn>[] = [
    { key: 'id', label: 'ID', width: '88px' },
    { key: 'code', label: 'Codigo' },
    { key: 'name', label: 'Nombre' },
    { key: 'canceled', label: 'Estado', width: '140px' },
    { key: 'created_at', label: 'Fecha creacion', width: '180px' },
    { key: 'updated_at', label: 'Fecha actualizacion', width: '190px' },
    { key: 'canceled_at', label: 'Fecha anulacion', width: '180px' },
    { key: 'actions', label: 'Acciones', width: '170px', align: 'right' }
  ];

  readonly statusFilterOptions: readonly GridFilterOption<SellerStatusFilter>[] = [
    { value: 'all', label: 'Todos' },
    { value: 'active', label: 'Activos' },
    { value: 'inactive', label: 'Inactivos' }
  ];

  sellers: SellerItem[] = [];
  selectedSellerId: number | null = null;
  searchTerm = '';
  statusFilter: SellerStatusFilter = 'all';
  statusFilterDraft: SellerStatusFilter = 'all';
  filtersOpen = false;
  currentPage = 1;
  pageSize = 7;
  isLoading = false;
  isSaving = false;
  successMessage = '';
  errorMessage = '';
  sellerToCancel: SellerItem | null = null;

  constructor(private readonly sellerService: SellerMaintenanceService) {}

  ngOnInit(): void {
    this.loadSellers();
  }

  get filteredSellers(): SellerItem[] {
    const term = this.searchTerm.trim().toLowerCase();

    return this.sellers.filter((seller) => {
      const matchesStatus =
        this.statusFilter === 'all' ||
        (this.statusFilter === 'active' && !seller.canceled) ||
        (this.statusFilter === 'inactive' && seller.canceled);

      if (!matchesStatus) {
        return false;
      }

      if (!term) {
        return true;
      }

      return [
        seller.code,
        seller.name
      ].some((value) => String(value ?? '').toLowerCase().includes(term));
    });
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredSellers.length / this.pageSize));
  }

  get paginatedSellers(): SellerItem[] {
    const safePage = Math.min(this.currentPage, this.totalPages);
    const start = (safePage - 1) * this.pageSize;

    return this.filteredSellers.slice(start, start + this.pageSize);
  }

  get showingCount(): number {
    return this.paginatedSellers.length;
  }

  get cancelSellerMessage(): string {
    const sellerName = this.sellerToCancel?.name ?? 'este vendedor';

    return `Esta seguro de que desea anular ${sellerName}?`;
  }

  loadSellers(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.sellerService.getSellers().subscribe({
      next: (sellers) => {
        this.sellers = sellers;
        this.currentPage = Math.min(this.currentPage, this.totalPages);
        this.selectedSellerId = sellers.some((seller) => seller.id === this.selectedSellerId)
          ? this.selectedSellerId
          : null;
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.handleHttpError(error, 'No se pudo cargar el listado de vendedores.');
      }
    });
  }

  onFiltersChange(): void {
    this.currentPage = 1;
  }

  setStatusFilter(filter: SellerStatusFilter): void {
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

  selectSeller(seller: SellerItem): void {
    this.selectedSellerId = seller.id;
  }

  askCancel(seller: SellerItem): void {
    this.sellerToCancel = seller;
    this.successMessage = '';
    this.errorMessage = '';
  }

  closeCancelConfirm(): void {
    if (this.isSaving) {
      return;
    }

    this.sellerToCancel = null;
  }

  confirmCancel(): void {
    if (!this.sellerToCancel) {
      return;
    }

    const payload: CancelSellerRequest = {
      seller_id: this.sellerToCancel.id,
      canceled_by: this.getUsername()
    };

    this.isSaving = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.sellerService.cancelSeller(payload).subscribe({
      next: () => {
        this.isSaving = false;
        this.sellerToCancel = null;
        this.selectedSellerId = null;
        this.successMessage = 'Vendedor anulado correctamente.';
        this.loadSellers();
      },
      error: (error) => {
        this.isSaving = false;
        this.handleHttpError(error, 'No se pudo anular el vendedor.');
      }
    });
  }

  trackBySellerId(_: number, seller: SellerItem): number {
    return seller.id;
  }

  trackByColumnKey(_: number, column: GridColumnConfig<SellerGridColumn>): SellerGridColumn {
    return column.key;
  }

  getColumnClass(column: GridColumnConfig<SellerGridColumn>): string {
    const classes = [`app-grid-col-${column.key}`];

    if (column.align === 'right') {
      classes.push('app-grid-col-right');
    }

    if (column.align === 'center') {
      classes.push('app-grid-col-center');
    }

    return classes.join(' ');
  }

  formatGridValue(seller: SellerItem, key: SellerGridColumn): string {
    if (key === 'actions' || key === 'canceled') {
      return '';
    }

    const value = seller[key];

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
