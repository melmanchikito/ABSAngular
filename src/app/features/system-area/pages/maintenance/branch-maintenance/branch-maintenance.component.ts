import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  CirclePlus,
  Edit3,
  Eye,
  Landmark,
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
import { formatDateTime, isDateLikeField } from '../../../../../shared/utils/date-format.util';
import { StatusBadgeComponent } from '../../../../../shared/components/status-badge/status-badge.component';
import { GridColumnConfig, GridFilterOption } from '../../../../../shared/models/grid-view.model';
import {
  BranchItem,
  CancelBranchRequest,
  InsertBranchRequest,
  UpdateBranchRequest
} from '../../../models/branch-maintenance.model';
import { Company } from '../../../models/company-maintenance.model';
import { LocationItem } from '../../../models/location-maintenance.model';
import { BranchMaintenanceService } from '../../../services/branch-maintenance.service';
import { CompanyMaintenanceService } from '../../../services/company-maintenance.service';
import { LocationMaintenanceService } from '../../../services/location-maintenance.service';

type BranchStatusFilter = 'all' | 'active' | 'inactive';
type BranchGridColumn = keyof BranchItem | 'company_name' | 'location_name' | 'actions';
type BackendErrorBody = Record<string, unknown>;

interface BranchForm {
  code: string;
  name: string;
  company_id: number | null;
  location_id: number | null;
}

@Component({
  selector: 'app-branch-maintenance',
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
  templateUrl: './branch-maintenance.component.html',
  styleUrl: './branch-maintenance.component.scss'
})
export class BranchMaintenanceComponent implements OnInit {
  readonly branchIcon = Landmark;
  readonly addIcon = CirclePlus;
  readonly buildingIcon = Building2;
  readonly chevronLeftIcon = ChevronLeft;
  readonly chevronRightIcon = ChevronRight;
  readonly detailIcon = Eye;
  readonly editIcon = Edit3;
  readonly refreshIcon = RefreshCcw;
  readonly searchIcon = Search;
  readonly filterIcon = SlidersHorizontal;
  readonly trashIcon = Trash2;
  readonly closeIcon = X;
  readonly gridColumns: readonly GridColumnConfig<BranchGridColumn>[] = [
    { key: 'id', label: 'ID', width: '88px' },
    { key: 'code', label: 'Codigo' },
    { key: 'name', label: 'Nombre' },
    { key: 'company_id', label: 'Empresa ID', width: '130px' },
    { key: 'company_name', label: 'Empresa' },
    { key: 'location_id', label: 'Ubicacion ID', width: '140px' },
    { key: 'location_name', label: 'Ubicacion' },
    { key: 'canceled', label: 'Estado', width: '140px' },
    { key: 'canceled_at', label: 'Fecha anulacion', width: '180px' },
    { key: 'created_at', label: 'Fecha creacion', width: '180px' },
    { key: 'updated_at', label: 'Fecha actualizacion', width: '190px' },
    { key: 'actions', label: 'Acciones', width: '170px', align: 'right' }
  ];
  readonly statusFilterOptions: readonly GridFilterOption<BranchStatusFilter>[] = [
    { value: 'all', label: 'Todas' },
    { value: 'active', label: 'Activas' },
    { value: 'inactive', label: 'Inactivas' }
  ];

  allBranches: BranchItem[] = [];
  branches: BranchItem[] = [];
  companies: Company[] = [];
  locations: LocationItem[] = [];
  selectedBranchId: number | null = null;
  selectedCompanyFilter: number | 'all' = 'all';
  selectedCompanyFilterDraft: number | 'all' = 'all';
  searchTerm = '';
  statusFilter: BranchStatusFilter = 'all';
  statusFilterDraft: BranchStatusFilter = 'all';
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

  editingBranch: BranchItem | null = null;
  branchToCancel: BranchItem | null = null;

  branchForm: BranchForm = this.createEmptyForm();

  constructor(
    private readonly branchService: BranchMaintenanceService,
    private readonly companyService: CompanyMaintenanceService,
    private readonly locationService: LocationMaintenanceService
  ) {}

  ngOnInit(): void {
    this.loadCatalogs();
    this.loadBranches();
  }

  get filteredBranches(): BranchItem[] {
    const term = this.searchTerm.trim().toLowerCase();

    return this.branches.filter((branch) => {
      const matchesStatus =
        this.statusFilter === 'all' ||
        (this.statusFilter === 'active' && !branch.canceled) ||
        (this.statusFilter === 'inactive' && branch.canceled);

      if (!matchesStatus) {
        return false;
      }

      if (!term) {
        return true;
      }

      return [
        branch.code,
        branch.name,
        String(branch.company_id),
        String(branch.location_id),
        this.getCompanyName(branch.company_id),
        this.getLocationLabel(branch.location_id)
      ].some((value) => value.toLowerCase().includes(term));
    });
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredBranches.length / this.pageSize));
  }

  get paginatedBranches(): BranchItem[] {
    const safePage = Math.min(this.currentPage, this.totalPages);
    const start = (safePage - 1) * this.pageSize;

    return this.filteredBranches.slice(start, start + this.pageSize);
  }

  get showingCount(): number {
    return this.paginatedBranches.length;
  }

  get cancelBranchMessage(): string {
    const branchName = this.branchToCancel?.name ?? 'esta sucursal';

    return `Esta seguro de que desea borrar ${branchName}?`;
  }

  loadBranches(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.branchService.getBranches().subscribe({
      next: (branches) => {
        this.allBranches = branches;
        this.applyCompanyFilterFromCache();
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.handleHttpError(error, 'No se pudo cargar el listado de sucursales.');
      }
    });
  }

  loadCatalogs(): void {
    this.isLoadingCatalogs = true;

    this.companyService.getCompanies().subscribe({
      next: (companies) => {
        this.companies = companies.filter((company) => !company.canceled);
        this.finishCatalogLoad();
      },
      error: (error) => {
        this.finishCatalogLoad();
        this.handleHttpError(error, 'No se pudo cargar el listado de empresas.');
      }
    });

    this.locationService.getLocations().subscribe({
      next: (locations) => {
        this.locations = locations.filter((location) => !location.canceled);
        this.finishCatalogLoad();
      },
      error: (error) => {
        this.finishCatalogLoad();
        this.handleHttpError(error, 'No se pudo cargar el listado de ubicaciones.');
      }
    });
  }

  onFiltersChange(): void {
    this.currentPage = 1;
  }

  setStatusFilter(filter: BranchStatusFilter): void {
    this.statusFilter = filter;
    this.onFiltersChange();
  }

  toggleFilters(event?: MouseEvent): void {
    event?.stopPropagation();
    this.statusFilterDraft = this.statusFilter;
    this.selectedCompanyFilterDraft = this.selectedCompanyFilter;
    this.filtersOpen = !this.filtersOpen;
  }

  applyFilters(): void {
    this.statusFilter = this.statusFilterDraft;
    this.selectedCompanyFilter = this.selectedCompanyFilterDraft;
    this.onCompanyFilterChange();
    this.filtersOpen = false;
  }

  clearFilters(): void {
    this.statusFilterDraft = 'all';
    this.selectedCompanyFilterDraft = 'all';
    this.statusFilter = 'all';
    this.selectedCompanyFilter = 'all';
    this.onCompanyFilterChange();
    this.filtersOpen = false;
  }

  onCompanyFilterChange(): void {
    this.currentPage = 1;

    if (this.selectedCompanyFilter === 'all') {
      this.branches = [...this.allBranches];
      this.syncSelectedBranch();
      return;
    }

    const companyId = Number(this.selectedCompanyFilter);
    this.isLoading = true;

    this.branchService.getBranchesByCompany(companyId).subscribe({
      next: (branches) => {
        this.branches = branches;
        this.isLoading = false;
        this.syncSelectedBranch();
      },
      error: (error) => {
        console.error('Error completo:', error);
        console.error('Respuesta backend:', (error as { error?: unknown }).error);
        console.error(
          'Detalles validacion:',
          (error as { error?: { error?: { details_error?: unknown } } }).error?.error?.details_error
        );
        this.branches = this.allBranches.filter((branch) => branch.company_id === companyId);
        this.isLoading = false;
        this.syncSelectedBranch();
      }
    });
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

  selectBranch(branch: BranchItem): void {
    this.selectedBranchId = branch.id;
  }

  askCancel(branch: BranchItem): void {
    this.branchToCancel = branch;
    this.successMessage = '';
    this.errorMessage = '';
  }

  closeCancelConfirm(): void {
    if (this.isSaving) {
      return;
    }

    this.branchToCancel = null;
  }

  confirmCancel(): void {
    if (!this.branchToCancel) {
      return;
    }

    const payload: CancelBranchRequest = {
      branch_id: this.branchToCancel.id,
      canceled_by: this.getUsername()
    };

    this.isSaving = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.branchService.cancelBranch(payload).subscribe({
      next: () => {
        this.isSaving = false;
        this.branchToCancel = null;
        this.selectedBranchId = null;
        this.successMessage = 'Sucursal anulada correctamente.';
        this.loadBranches();
      },
      error: (error) => {
        this.isSaving = false;
        this.handleHttpError(error, 'No se pudo anular la sucursal.');
      }
    });
  }

  formatDate(value?: string | null): string {
    return formatDateTime(value);
  }

  getCompanyName(companyId: number): string {
    const company = this.companies.find((item) => item.id === companyId);

    return company?.name || `Empresa ${companyId}`;
  }

  getLocationLabel(locationId: number): string {
    const location = this.locations.find((item) => item.id === locationId);

    if (!location) {
      return `Ubicacion ${locationId}`;
    }

    return location.name || location.address || `Ubicacion ${locationId}`;
  }

  trackByBranchId(_: number, branch: BranchItem): number {
    return branch.id;
  }

  trackByCompanyId(_: number, company: Company): number {
    return company.id;
  }

  trackByLocationId(_: number, location: LocationItem): number {
    return location.id;
  }

  trackByColumnKey(_: number, column: GridColumnConfig<BranchGridColumn>): BranchGridColumn {
    return column.key;
  }

  getColumnClass(column: GridColumnConfig<BranchGridColumn>): string {
    const classes = [`app-grid-col-${column.key}`];

    if (column.align === 'right') {
      classes.push('app-grid-col-right');
    }

    if (column.align === 'center') {
      classes.push('app-grid-col-center');
    }

    return classes.join(' ');
  }

  formatGridValue(branch: BranchItem, key: BranchGridColumn): string {
    if (key === 'actions' || key === 'canceled') {
      return '';
    }

    if (key === 'company_name') {
      return this.getCompanyName(branch.company_id);
    }

    if (key === 'location_name') {
      return this.getLocationLabel(branch.location_id);
    }

    const value = branch[key];

    if (isDateLikeField(String(key))) {
      return formatDateTime(value as string | null | undefined);
    }

    return value === null || value === undefined || value === '' ? 'Sin registro' : String(value);
  }

  @HostListener('document:click')
  closeFiltersFromOutside(): void {
    this.filtersOpen = false;
  }

  private createEmptyForm(): BranchForm {
    return {
      code: '',
      name: '',
      company_id: null,
      location_id: null
    };
  }

  private createFormFromBranch(branch: BranchItem): BranchForm {
    return {
      code: branch.code ?? '',
      name: branch.name ?? '',
      company_id: branch.company_id ?? null,
      location_id: branch.location_id ?? null
    };
  }

  private applyCompanyFilterFromCache(): void {
    if (this.selectedCompanyFilter === 'all') {
      this.branches = [...this.allBranches];
    } else {
      const companyId = Number(this.selectedCompanyFilter);
      this.branches = this.allBranches.filter((branch) => branch.company_id === companyId);
    }

    this.currentPage = Math.min(this.currentPage, this.totalPages);
    this.syncSelectedBranch();
  }

  private syncSelectedBranch(): void {
    this.selectedBranchId = this.branches.some((branch) => branch.id === this.selectedBranchId)
      ? this.selectedBranchId
      : null;
  }

  private finishCatalogLoad(): void {
    this.isLoadingCatalogs = false;
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

      if (detail['company_id']?.includes('validation.required')) {
        messages.push('La empresa es obligatoria.');
      }

      if (detail['location_id']?.includes('validation.required')) {
        messages.push('La ubicacion es obligatoria.');
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