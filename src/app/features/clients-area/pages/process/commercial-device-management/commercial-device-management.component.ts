import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  ClipboardCheck,
  Edit3,
  Link2,
  LucideAngularModule,
  RefreshCcw,
  Search,
  SlidersHorizontal,
  Trash2,
  X
} from 'lucide-angular';
import { forkJoin } from 'rxjs';
import { ConfirmDialogComponent } from '../../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { DataGridPaginationComponent } from '../../../../../shared/components/data-grid-pagination/data-grid-pagination.component';
import { DebouncedSearchDirective } from '../../../../../shared/directives/debounced-search.directive';
import { EmptyStateComponent } from '../../../../../shared/components/empty-state/empty-state.component';
import { PageHeaderComponent } from '../../../../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../../../../shared/components/status-badge/status-badge.component';
import { GridColumnConfig, GridFilterOption } from '../../../../../shared/models/grid-view.model';
import { formatDateTime, isDateLikeField } from '../../../../../shared/utils/date-format.util';
import {
  CommercialDeviceAssignment,
  CommercialDeviceAssignmentStatus,
  CommercialDeviceOption,
  CommercialSellerOption
} from '../../../models/commercial-device-management.model';
import { SellerMaintenanceService } from '../../../services/seller-maintenance.service';
import { CommercialDeviceManagementService } from '../../../services/commercial-device-management.service';

type AssignmentStatusFilter = 'all' | CommercialDeviceAssignmentStatus;
type AssignmentGridColumn = keyof CommercialDeviceAssignment | 'actions';

interface AssignmentForm {
  seller_id: number | null;
  device_id: number | null;
}

@Component({
  selector: 'app-commercial-device-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
    ConfirmDialogComponent,
    DataGridPaginationComponent,
    DebouncedSearchDirective,
    EmptyStateComponent,
    PageHeaderComponent,
    StatusBadgeComponent
  ],
  templateUrl: './commercial-device-management.component.html',
  styleUrl: './commercial-device-management.component.scss'
})
export class CommercialDeviceManagementComponent implements OnInit {
  readonly pageIcon = Link2;
  readonly assignIcon = ClipboardCheck;
  readonly editIcon = Edit3;
  readonly refreshIcon = RefreshCcw;
  readonly searchIcon = Search;
  readonly filterIcon = SlidersHorizontal;
  readonly trashIcon = Trash2;
  readonly closeIcon = X;

  readonly gridColumns: readonly GridColumnConfig<AssignmentGridColumn>[] = [
    { key: 'id', label: 'ID', width: '76px' },
    { key: 'seller_code', label: 'Cod. vendedor', width: '150px' },
    { key: 'seller_name', label: 'Vendedor' },
    { key: 'device_code', label: 'Cod. equipo', width: '140px' },
    { key: 'device_name', label: 'Dispositivo/equipo' },
    { key: 'device_serial', label: 'Serie', width: '170px' },
    { key: 'status', label: 'Estado', width: '130px' },
    { key: 'assigned_at', label: 'Fecha asignacion', width: '180px' },
    { key: 'updated_at', label: 'Fecha actualizacion', width: '190px' },
    { key: 'actions', label: 'Acciones', width: '150px', align: 'right' }
  ];

  readonly statusFilterOptions: readonly GridFilterOption<AssignmentStatusFilter>[] = [
    { value: 'all', label: 'Todas' },
    { value: 'active', label: 'Activas' },
    { value: 'inactive', label: 'Inactivas' }
  ];

  assignments: CommercialDeviceAssignment[] = [];
  sellers: CommercialSellerOption[] = [];
  devices: CommercialDeviceOption[] = [];
  selectedAssignmentId: number | null = null;
  assignmentToCancel: CommercialDeviceAssignment | null = null;
  editingAssignment: CommercialDeviceAssignment | null = null;

  form: AssignmentForm = this.createEmptyForm();
  searchTerm = '';
  statusFilter: AssignmentStatusFilter = 'all';
  statusFilterDraft: AssignmentStatusFilter = 'all';
  filtersOpen = false;
  currentPage = 1;
  pageSize = 7;
  isLoading = false;
  isSaving = false;
  successMessage = '';
  errorMessage = '';
  formError = '';

  constructor(
    private readonly processService: CommercialDeviceManagementService,
    private readonly sellerService: SellerMaintenanceService
  ) {}

  ngOnInit(): void {
    this.loadProcess();
  }

  get filteredAssignments(): CommercialDeviceAssignment[] {
    const term = this.searchTerm.trim().toLowerCase();

    return this.assignments.filter((assignment) => {
      const matchesStatus = this.statusFilter === 'all' || assignment.status === this.statusFilter;

      if (!matchesStatus) {
        return false;
      }

      if (!term) {
        return true;
      }

      return [
        assignment.seller_code,
        assignment.seller_name,
        assignment.device_code,
        assignment.device_name,
        assignment.device_serial
      ].some((value) => String(value ?? '').toLowerCase().includes(term));
    });
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredAssignments.length / this.pageSize));
  }

  get paginatedAssignments(): CommercialDeviceAssignment[] {
    const safePage = Math.min(this.currentPage, this.totalPages);
    const start = (safePage - 1) * this.pageSize;

    return this.filteredAssignments.slice(start, start + this.pageSize);
  }

  get showingCount(): number {
    return this.paginatedAssignments.length;
  }

  get formTitle(): string {
    return this.editingAssignment ? 'Editar vinculacion' : 'Nueva vinculacion';
  }

  get saveLabel(): string {
    if (this.isSaving) {
      return 'Guardando...';
    }

    return this.editingAssignment ? 'Actualizar vinculacion' : 'Asignar equipo';
  }

  get cancelAssignmentMessage(): string {
    const seller = this.assignmentToCancel?.seller_name ?? 'este vendedor';
    const device = this.assignmentToCancel?.device_name ?? 'este equipo';

    return `Esta seguro de que desea cancelar la vinculacion entre ${seller} y ${device}?`;
  }

  loadProcess(): void {
    this.isLoading = true;
    this.errorMessage = '';

    forkJoin({
      assignments: this.processService.getAssignments(),
      devices: this.processService.getDevices(),
      sellers: this.sellerService.getSellers()
    }).subscribe({
      next: ({ assignments, devices, sellers }) => {
        this.assignments = assignments;
        this.devices = devices;
        this.sellers = sellers.map((seller) => ({
          id: seller.id,
          code: seller.code,
          name: seller.name
        }));
        this.currentPage = Math.min(this.currentPage, this.totalPages);
        this.selectedAssignmentId = assignments.some((assignment) => assignment.id === this.selectedAssignmentId)
          ? this.selectedAssignmentId
          : null;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'No se pudo cargar la informacion del proceso comercial.';
      }
    });
  }

  saveAssignment(): void {
    this.formError = '';
    this.successMessage = '';
    this.errorMessage = '';

    const seller = this.sellers.find((item) => item.id === this.form.seller_id);
    const device = this.devices.find((item) => item.id === this.form.device_id);

    if (!seller || !device) {
      this.formError = 'Seleccione un vendedor y un dispositivo para continuar.';
      return;
    }

    this.isSaving = true;

    this.processService
      .saveAssignment(
        {
          seller_id: seller.id,
          device_id: device.id,
          updated_by: this.getUsername()
        },
        seller,
        device,
        this.editingAssignment?.id
      )
      .subscribe({
        next: () => {
          this.isSaving = false;
          this.successMessage = this.editingAssignment
            ? 'Vinculacion comercial actualizada correctamente.'
            : 'Equipo asignado correctamente.';
          this.clearForm();
          this.loadProcess();
        },
        error: () => {
          this.isSaving = false;
          this.formError = 'No se pudo guardar la vinculacion comercial.';
        }
      });
  }

  editAssignment(assignment: CommercialDeviceAssignment): void {
    this.editingAssignment = assignment;
    this.form = {
      seller_id: assignment.seller_id,
      device_id: assignment.device_id
    };
    this.selectedAssignmentId = assignment.id;
    this.formError = '';
  }

  clearForm(): void {
    this.form = this.createEmptyForm();
    this.editingAssignment = null;
    this.formError = '';
  }

  askCancel(assignment: CommercialDeviceAssignment): void {
    this.assignmentToCancel = assignment;
    this.successMessage = '';
    this.errorMessage = '';
  }

  closeCancelConfirm(): void {
    if (this.isSaving) {
      return;
    }

    this.assignmentToCancel = null;
  }

  confirmCancel(): void {
    if (!this.assignmentToCancel) {
      return;
    }

    this.isSaving = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.processService.cancelAssignment(this.assignmentToCancel.id).subscribe({
      next: () => {
        this.isSaving = false;
        this.assignmentToCancel = null;
        this.selectedAssignmentId = null;
        this.successMessage = 'Vinculacion comercial cancelada correctamente.';
        this.loadProcess();
      },
      error: () => {
        this.isSaving = false;
        this.errorMessage = 'No se pudo cancelar la vinculacion comercial.';
      }
    });
  }

  onFiltersChange(): void {
    this.currentPage = 1;
  }

  setStatusFilter(filter: AssignmentStatusFilter): void {
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

  selectAssignment(assignment: CommercialDeviceAssignment): void {
    this.selectedAssignmentId = assignment.id;
  }

  trackByAssignmentId(_: number, assignment: CommercialDeviceAssignment): number {
    return assignment.id;
  }

  trackByColumnKey(_: number, column: GridColumnConfig<AssignmentGridColumn>): AssignmentGridColumn {
    return column.key;
  }

  trackByOptionId(_: number, option: CommercialSellerOption | CommercialDeviceOption): number {
    return option.id;
  }

  getColumnClass(column: GridColumnConfig<AssignmentGridColumn>): string {
    const classes = [`app-grid-col-${column.key}`];

    if (column.align === 'right') {
      classes.push('app-grid-col-right');
    }

    if (column.align === 'center') {
      classes.push('app-grid-col-center');
    }

    return classes.join(' ');
  }

  formatGridValue(assignment: CommercialDeviceAssignment, key: AssignmentGridColumn): string {
    if (key === 'actions' || key === 'status') {
      return '';
    }

    const value = assignment[key];

    if (isDateLikeField(String(key)) || key === 'assigned_at') {
      return formatDateTime(value as string | null | undefined);
    }

    return value === null || value === undefined || value === '' ? '-' : String(value);
  }

  formatOption(option: CommercialSellerOption | CommercialDeviceOption): string {
    const code = String(option.code ?? '').trim();
    const name = String(option.name ?? '').trim();

    return code && name ? `${code} - ${name}` : name || code || String(option.id);
  }

  @HostListener('document:click')
  closeFiltersFromOutside(): void {
    this.filtersOpen = false;
  }

  private createEmptyForm(): AssignmentForm {
    return {
      seller_id: null,
      device_id: null
    };
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
