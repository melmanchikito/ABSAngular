import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  CirclePlus,
  Edit3,
  LucideAngularModule,
  RefreshCcw,
  Search,
  Trash2,
  X
} from 'lucide-angular';
import {
  CancelCompanyRequest,
  Company,
  InsertCompanyRequest,
  UpdateCompanyRequest
} from '../../models/company-maintenance.model';
import { CompanyMaintenanceService } from '../../services/company-maintenance.service';

type CompanyModalMode = 'create' | 'edit';
type CompanyStatusFilter = 'all' | 'active' | 'inactive';
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
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './company-maintenance.component.html',
  styleUrl: './company-maintenance.component.scss'
})
export class CompanyMaintenanceComponent implements OnInit {
  readonly buildingIcon = Building2;
  readonly addIcon = CirclePlus;
  readonly chevronLeftIcon = ChevronLeft;
  readonly chevronRightIcon = ChevronRight;
  readonly editIcon = Edit3;
  readonly refreshIcon = RefreshCcw;
  readonly searchIcon = Search;
  readonly trashIcon = Trash2;
  readonly closeIcon = X;

  companies: Company[] = [];
  searchTerm = '';
  statusFilter: CompanyStatusFilter = 'all';
  currentPage = 1;
  readonly pageSize = 5;
  isLoading = false;
  isSaving = false;
  successMessage = '';
  errorMessage = '';
  formError = '';

  modalOpen = false;
  modalMode: CompanyModalMode = 'create';
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

  get modalTitle(): string {
    return this.modalMode === 'create' ? 'Nueva empresa' : 'Editar empresa';
  }

  get totalCompanies(): number {
    return this.companies.length;
  }

  get activeCompanies(): number {
    return this.companies.filter((company) => !company.canceled).length;
  }

  get inactiveCompanies(): number {
    return this.companies.filter((company) => company.canceled).length;
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

  loadCompanies(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.companyService.getCompanies().subscribe({
      next: (companies) => {
        this.companies = companies;
        this.currentPage = Math.min(this.currentPage, this.totalPages);
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

  previousPage(): void {
    this.currentPage = Math.max(1, this.currentPage - 1);
  }

  nextPage(): void {
    this.currentPage = Math.min(this.totalPages, this.currentPage + 1);
  }

  getCompanyInitial(company: Company): string {
    return (company.name || company.code || '?').trim().charAt(0).toUpperCase();
  }

  openCreateModal(): void {
    this.modalMode = 'create';
    this.editingCompany = null;
    this.companyForm = {
      code: '',
      name: '',
      phone: '',
      email: '',
      website: ''
    };
    this.editCompanyForm = {
      code: '',
      name: '',
      phone: '',
      email: ''
    };
    this.formError = '';
    this.successMessage = '';
    this.errorMessage = '';
    this.modalOpen = true;
  }

  openEditModal(company: Company): void {
    this.modalMode = 'edit';
    this.editingCompany = company;
    this.editCompanyForm = {
      code: company.code,
      name: company.name,
      phone: company.phone ?? '',
      email: company.email ?? ''
    };
    this.formError = '';
    this.successMessage = '';
    this.errorMessage = '';
    this.modalOpen = true;
  }

  closeModal(): void {
    if (this.isSaving) {
      return;
    }

    this.modalOpen = false;
    this.editingCompany = null;
    this.formError = '';
  }

  saveCompany(): void {
    this.successMessage = '';
    this.errorMessage = '';
    this.formError = '';

    if (this.modalMode === 'create') {
      const code = this.companyForm.code.trim();
      const name = this.companyForm.name.trim();
      const phone = this.companyForm.phone.trim();
      const email = this.companyForm.email.trim();
      const website = this.companyForm.website.trim();

      if (!code) {
        this.formError = 'El codigo es obligatorio.';
        return;
      }

      if (!name) {
        this.formError = 'El nombre es obligatorio.';
        return;
      }

      if (!phone) {
        this.formError = 'El telefono es obligatorio.';
        return;
      }

      if (!email) {
        this.formError = 'El email es obligatorio.';
        return;
      }

      if (!website) {
        this.formError = 'El sitio web es obligatorio.';
        return;
      }

      this.isSaving = true;

      const payload: InsertCompanyRequest = {
        code,
        name,
        phone,
        email,
        website,
        created_by: this.getUsername()
      };

      console.log('Payload empresa enviado:', JSON.stringify(payload, null, 2));

      this.companyService.insertCompany(payload).subscribe({
        next: () => this.afterSuccessfulSave('Empresa creada correctamente.'),
        error: (error) => this.handleSaveError(error, 'No se pudo crear la empresa.')
      });

      return;
    }

    if (!this.editingCompany) {
      this.isSaving = false;
      this.formError = 'No se encontro la empresa seleccionada.';
      return;
    }

    const code = this.editCompanyForm.code.trim();
    const name = this.editCompanyForm.name.trim();
    const phone = this.editCompanyForm.phone.trim();
    const email = this.editCompanyForm.email.trim();

    if (!code) {
      this.formError = 'El codigo es obligatorio.';
      return;
    }

    if (!name) {
      this.formError = 'El nombre es obligatorio.';
      return;
    }

    if (!phone) {
      this.formError = 'El telefono es obligatorio.';
      return;
    }

    if (!email) {
      this.formError = 'El email es obligatorio.';
      return;
    }

    this.isSaving = true;

    const payload: UpdateCompanyRequest = {
      company_id: this.editingCompany.id,
      code,
      name,
      phone,
      email,
      updated_by: this.getUsername()
    };

    console.log('Payload actualizar empresa:', JSON.stringify(payload, null, 2));

    this.companyService.updateCompany(payload).subscribe({
      next: () => this.afterSuccessfulSave('Empresa actualizada correctamente.'),
      error: (error) => {
        console.error('Error actualizando empresa:', error);
        console.error('Respuesta backend:', (error as { error?: unknown }).error);
        this.handleSaveError(error, 'No se pudo actualizar la empresa.');
      }
    });
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
    return value || 'Sin registro';
  }

  private afterSuccessfulSave(message: string): void {
    this.isSaving = false;
    this.modalOpen = false;
    this.editingCompany = null;
    this.successMessage = message;
    this.loadCompanies();
  }

  private handleSaveError(error: unknown, fallback: string): void {
    this.isSaving = false;
    this.handleHttpError(error, fallback, true);
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
