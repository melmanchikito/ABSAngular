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
  LucideAngularModule,
  RefreshCcw,
  Search,
  SlidersHorizontal,
  Trash2,
  X
} from 'lucide-angular';
import {
  CancelCompanyRequest,
  Company,
  InsertCompanyRequest,
  UpdateCompanyRequest
} from '../../../models/company-maintenance.model';
import { CompanyMaintenanceService } from '../../../services/company-maintenance.service';
import { StatusBadgeComponent } from '../../../../../shared/components/status-badge/status-badge.component';
import { GridColumnConfig, GridFilterOption } from '../../../../../shared/models/grid-view.model';
import { ConfirmDialogComponent } from '../../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { DataGridPaginationComponent } from '../../../../../shared/components/data-grid-pagination/data-grid-pagination.component';
import { PageHeaderComponent } from '../../../../../shared/components/page-header/page-header.component';
import { formatDateTime, isDateLikeField } from '../../../../../shared/utils/date-format.util';

type CompanyStatusFilter = 'all' | 'active' | 'inactive';
type CompanyGridColumn = keyof Company | 'actions';
type BackendErrorBody = Record<string, unknown>;

interface CompanyForm {
  code: string;
  name: string;
  phone: string;
  email: string;
  website: string;
}

interface EditCompanyForm {
  code: string;
  name: string;
  phone: string;
  email: string;
}

@Component({
  selector: 'app-company-maintenance',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    LucideAngularModule,
    PageHeaderComponent,
    StatusBadgeComponent,
    ConfirmDialogComponent,
    DataGridPaginationComponent
  ],
  templateUrl: './company-maintenance.component.html',
  styleUrl: './company-maintenance.component.scss'
})
export class CompanyMaintenanceComponent implements OnInit {
  readonly buildingIcon = Building2;
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
  readonly gridColumns: readonly GridColumnConfig<CompanyGridColumn>[] = [
    { key: 'id', label: 'ID', width: '88px' },
    { key: 'code', label: 'Codigo' },
    { key: 'name', label: 'Nombre' },
    { key: 'phone', label: 'Telefono' },
    { key: 'email', label: 'Correo' },
    { key: 'website', label: 'Sitio web' },
    { key: 'canceled', label: 'Estado', width: '140px' },
    { key: 'canceled_at', label: 'Fecha anulacion', width: '180px' },
    { key: 'created_at', label: 'Fecha creacion', width: '180px' },
    { key: 'updated_at', label: 'Fecha actualizacion', width: '190px' },
    { key: 'actions', label: 'Acciones', width: '170px', align: 'right' }
  ];
  readonly statusFilterOptions: readonly GridFilterOption<CompanyStatusFilter>[] = [
    { value: 'all', label: 'Todos' },
    { value: 'active', label: 'Activas' },
    { value: 'inactive', label: 'Inactivas' }
  ];

  companies: Company[] = [];
  selectedCompanyId: number | null = null;
  searchTerm = '';
  statusFilter: CompanyStatusFilter = 'all';
  statusFilterDraft: CompanyStatusFilter = 'all';
  filtersOpen = false;
  currentPage = 1;
  readonly pageSize = 5;
  isLoading = false;
  isSaving = false;
  successMessage = '';
  errorMessage = '';
  formError = '';

  editingCompany: Company | null = null;
  companyToCancel: Company | null = null;

  companyForm: CompanyForm = {
    code: '',
    name: '',
    phone: '',
    email: '',
    website: ''
  };

  editCompanyForm: EditCompanyForm = {
    code: '',
    name: '',
    phone: '',
    email: ''
  };

  constructor(private readonly companyService: CompanyMaintenanceService) {}

  ngOnInit(): void {
    this.loadCompanies();
  }

  get filteredCompanies(): Company[] {
    const term = this.searchTerm.trim().toLowerCase();

    return this.companies.filter((company) => {
      const matchesStatus =
        this.statusFilter === 'all' ||
        (this.statusFilter === 'active' && !company.canceled) ||
        (this.statusFilter === 'inactive' && company.canceled);

      if (!matchesStatus) {
        return false;
      }

      if (!term) {
        return true;
      }

      return [
        company.code,
        company.name,
        company.phone ?? '',
        company.email ?? ''
      ].some((value) => value.toLowerCase().includes(term));
    });
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredCompanies.length / this.pageSize));
  }

  get paginatedCompanies(): Company[] {
    const safePage = Math.min(this.currentPage, this.totalPages);
    const start = (safePage - 1) * this.pageSize;

    return this.filteredCompanies.slice(start, start + this.pageSize);
  }

  get showingCount(): number {
    return this.paginatedCompanies.length;
  }

  get cancelCompanyMessage(): string {
    const companyName = this.companyToCancel?.name ?? 'esta empresa';

    return `Esta seguro de que desea borrar ${companyName}? Quedara anulada y no se eliminara fisicamente.`;
  }

  loadCompanies(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.companyService.getCompanies().subscribe({
      next: (companies) => {
        this.companies = companies;
        this.currentPage = Math.min(this.currentPage, this.totalPages);
        this.selectedCompanyId = companies.some((company) => company.id === this.selectedCompanyId)
          ? this.selectedCompanyId
          : null;
        this.isLoading = false;
      },
      error: (error) => {
        this.handleHttpError(error, 'No se pudo cargar el listado de empresas.');
        this.isLoading = false;
      }
    });
  }

  onFiltersChange(): void {
    this.currentPage = 1;
  }

  toggleFilters(event?: MouseEvent): void {
    event?.stopPropagation();
    this.statusFilterDraft = this.statusFilter;
    this.filtersOpen = !this.filtersOpen;
  }

  applyFilters(): void {
    this.statusFilter = this.statusFilterDraft;
    this.onFiltersChange();
    this.filtersOpen = false;
  }

  clearFilters(): void {
    this.statusFilterDraft = 'all';
    this.statusFilter = 'all';
    this.onFiltersChange();
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

  selectCompany(company: Company): void {
    this.selectedCompanyId = company.id;
  }

  askCancel(company: Company): void {
    this.companyToCancel = company;
    this.successMessage = '';
    this.errorMessage = '';
  }

  closeCancelConfirm(): void {
    if (this.isSaving) {
      return;
    }

    this.companyToCancel = null;
  }

  confirmCancel(): void {
    if (!this.companyToCancel) {
      return;
    }

    const payload: CancelCompanyRequest = {
      company_id: this.companyToCancel.id,
      canceled_by: this.getUsername()
    };

    this.isSaving = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.companyService.cancelCompany(payload).subscribe({
      next: () => {
        this.isSaving = false;
        this.companyToCancel = null;
        this.selectedCompanyId = null;
        this.successMessage = 'Empresa anulada correctamente.';
        this.loadCompanies();
      },
      error: (error) => {
        this.isSaving = false;
        this.handleHttpError(error, 'No se pudo anular la empresa.');
      }
    });
  }

  formatDate(value?: string | null): string {
    return formatDateTime(value);
  }

  trackByCompanyId(_: number, company: Company): number {
    return company.id;
  }

  trackByColumnKey(_: number, column: GridColumnConfig<CompanyGridColumn>): CompanyGridColumn {
    return column.key;
  }

  getColumnClass(column: GridColumnConfig<CompanyGridColumn>): string {
    const classes = [`app-grid-col-${column.key}`];

    if (column.align === 'right') {
      classes.push('app-grid-col-right');
    }

    if (column.align === 'center') {
      classes.push('app-grid-col-center');
    }

    return classes.join(' ');
  }

  formatGridValue(company: Company, key: CompanyGridColumn): string {
    if (key === 'actions' || key === 'canceled') {
      return '';
    }

    const value = company[key];

    if (isDateLikeField(String(key))) {
      return formatDateTime(value as string | null | undefined);
    }

    return value === null || value === undefined || value === '' ? 'Sin registro' : String(value);
  }

  @HostListener('document:click')
  closeFiltersFromOutside(): void {
    this.filtersOpen = false;
  }

  private handleHttpError(error: unknown, fallback: string, formError = false): void {
    console.error('Error completo:', error);

    const errorBody = this.getErrorBody(error);
    console.error('Respuesta backend:', (error as { error?: unknown }).error);
    console.error('Detalle validacion:', this.getValidationDetail(errorBody));

    const message = this.extractErrorMessage(errorBody, fallback);

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
    const details = this.getDetailsError(errorBody);
    const detail = this.getValidationDetail(errorBody);

    if (detail) {
      const messages: string[] = [];

      if (detail['code']?.includes('validation.unique')) {
        messages.push('El codigo ya existe. Use un codigo diferente.');
      }

      if (detail['code']?.includes('validation.required')) {
        messages.push('El codigo es obligatorio.');
      }

      if (detail['name']?.includes('validation.required')) {
        messages.push('El nombre es obligatorio.');
      }

      if (detail['phone']?.includes('validation.required')) {
        messages.push('El telefono es obligatorio.');
      }

      if (detail['email']?.includes('validation.required')) {
        messages.push('El email es obligatorio.');
      }

      if (detail['website']?.includes('validation.required')) {
        messages.push('El sitio web es obligatorio.');
      }

      if (messages.length) {
        return messages.join(' ');
      }
    }

    const nestedError = this.isRecord(errorBody?.['error']) ? errorBody?.['error'] : null;
    const detailsMessage = details?.['error_message'];
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

  private getDetailsError(errorBody: BackendErrorBody | null): BackendErrorBody | null {
    if (!errorBody) {
      return null;
    }

    const nestedError = this.isRecord(errorBody['error']) ? errorBody['error'] : null;
    const nestedDetails = nestedError?.['details_error'];
    const directDetails = errorBody['details_error'];

    if (this.isRecord(nestedDetails)) {
      return nestedDetails;
    }

    return this.isRecord(directDetails) ? directDetails : null;
  }

  private getValidationDetail(errorBody: BackendErrorBody | null): Record<string, string[]> | null {
    const details = this.getDetailsError(errorBody);
    const detail = details?.['error_detail'];

    return this.isStringArrayRecord(detail) ? detail : null;
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
      'adminUser'
    );
  }
}