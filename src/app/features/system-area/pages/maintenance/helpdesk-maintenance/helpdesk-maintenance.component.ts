import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  computed,
  inject,
  signal
} from '@angular/core';
import {
  FormControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  CirclePlus,
  Edit3,
  Eye,
  LifeBuoy,
  LucideAngularModule,
  RefreshCcw,
  Search,
  SlidersHorizontal,
  X
} from 'lucide-angular';
import { finalize } from 'rxjs';
import { DataGridPaginationComponent } from '../../../../../shared/components/data-grid-pagination/data-grid-pagination.component';
import { EmptyStateComponent } from '../../../../../shared/components/empty-state/empty-state.component';

import { PageHeaderComponent } from '../../../../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../../../../shared/components/status-badge/status-badge.component';
import { DebouncedSearchDirective } from '../../../../../shared/directives/debounced-search.directive';
import { formatDateTime } from '../../../../../shared/utils/date-format.util';
import {
  HelpdeskItem,
  InsertHelpdeskRequest,
  UpdateHelpdeskRequest
} from '../../../models/helpdesk-maintenance.model';
import { HelpdeskMaintenanceService } from '../../../services/helpdesk-maintenance.service';

type HelpdeskStatusFilter = 'all' | 'active' | 'inactive';
type HelpdeskFormField = 'name' | 'user_id';
type BackendErrorBody = Record<string, unknown>;

interface ToastState {
  type: 'success' | 'error';
  message: string;
}

interface HelpdeskForm {
  name: FormControl<string>;
  user_id: FormControl<number>;
}

@Component({
  selector: 'app-helpdesk-maintenance',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    LucideAngularModule,
    DataGridPaginationComponent,
    EmptyStateComponent,
    PageHeaderComponent,
    StatusBadgeComponent,
    DebouncedSearchDirective
  ],
  templateUrl: './helpdesk-maintenance.component.html',
  styleUrl: './helpdesk-maintenance.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HelpdeskMaintenanceComponent {
  readonly helpdeskIcon = LifeBuoy;
  readonly addIcon = CirclePlus;
  readonly editIcon = Edit3;
  readonly refreshIcon = RefreshCcw;
  readonly searchIcon = Search;
  readonly filterIcon = SlidersHorizontal;
  readonly viewIcon = Eye;
  readonly closeIcon = X;
  readonly statusFilterOptions: readonly { value: HelpdeskStatusFilter; label: string }[] = [
    { value: 'all', label: 'Todos' },
    { value: 'active', label: 'Activos' },
    { value: 'inactive', label: 'Inactivos' }
  ];

  readonly pageSize = 7;
  readonly helpdesks = signal<HelpdeskItem[]>([]);
  readonly searchTerm = signal('');
  readonly statusFilter = signal<HelpdeskStatusFilter>('all');
  readonly statusFilterDraft = signal<HelpdeskStatusFilter>('all');
  readonly filtersOpen = signal(false);
  readonly currentPage = signal(1);
  readonly selectedHelpdeskId = signal<number | null>(null);
  readonly isLoading = signal(false);
  readonly isSaving = signal(false);
  readonly isLoadingDetail = signal(false);
  readonly editingHelpdesk = signal<HelpdeskItem | null>(null);
  readonly toast = signal<ToastState | null>(null);
  readonly formError = signal('');

  readonly filteredHelpdesks = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const status = this.statusFilter();

    return this.helpdesks().filter((item) => {
      const matchesStatus =
        status === 'all' ||
        (status === 'active' && !item.canceled) ||
        (status === 'inactive' && item.canceled);

      if (!matchesStatus) {
        return false;
      }

      if (!term) {
        return true;
      }

      return [
        String(item.id),
        item.name,
        String(item.user_id)
      ].some((value) => value.toLowerCase().includes(term));
    });
  });

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredHelpdesks().length / this.pageSize))
  );

  readonly paginatedHelpdesks = computed(() => {
    const safePage = Math.min(this.currentPage(), this.totalPages());
    const start = (safePage - 1) * this.pageSize;

    return this.filteredHelpdesks().slice(start, start + this.pageSize);
  });

  readonly showingCount = computed(() => this.paginatedHelpdesks().length);

  readonly selectedHelpdesk = computed(() => {
    const selectedId = this.selectedHelpdeskId();

    if (!selectedId) {
      return null;
    }

    return this.helpdesks().find((item) => item.id === selectedId) ?? null;
  });

  private readonly fb = inject(NonNullableFormBuilder);
  readonly helpdeskForm = this.fb.group<HelpdeskForm>({
    name: this.fb.control('', [
      Validators.required,
      Validators.minLength(3)
    ]),
    user_id: this.fb.control(0, [
      Validators.required,
      Validators.min(1)
    ])
  });

  private readonly helpdeskService = inject(HelpdeskMaintenanceService);
  private toastTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.loadHelpdesks();
  }

  loadHelpdesks(): void {
    this.isLoading.set(true);

    this.helpdeskService
      .getHelpdesks()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (helpdesks) => {
          this.helpdesks.set(helpdesks);
          this.currentPage.set(Math.min(this.currentPage(), this.totalPages()));
          this.selectedHelpdeskId.set(
            helpdesks.some((item) => item.id === this.selectedHelpdeskId())
              ? this.selectedHelpdeskId()
              : null
          );
        },
        error: (error) => this.handleHttpError(error, 'No se pudo cargar el listado de helpdesk.')
      });
  }

  updateSearchTerm(value: string): void {
    this.searchTerm.set(value);
    this.currentPage.set(1);
  }

  setStatusFilter(filter: HelpdeskStatusFilter): void {
    this.statusFilter.set(filter);
    this.currentPage.set(1);
  }

  toggleFilters(event?: MouseEvent): void {
    event?.stopPropagation();
    this.statusFilterDraft.set(this.statusFilter());
    this.filtersOpen.update((open) => !open);
  }

  updateStatusFilterDraft(filter: HelpdeskStatusFilter): void {
    this.statusFilterDraft.set(filter);
  }

  applyFilters(): void {
    this.setStatusFilter(this.statusFilterDraft());
    this.filtersOpen.set(false);
  }

  clearFilters(): void {
    this.statusFilterDraft.set('all');
    this.setStatusFilter('all');
    this.filtersOpen.set(false);
  }

  previousPage(): void {
    this.currentPage.set(Math.max(1, this.currentPage() - 1));
  }

  nextPage(): void {
    this.currentPage.set(Math.min(this.totalPages(), this.currentPage() + 1));
  }

  setPage(page: number): void {
    this.currentPage.set(Math.min(Math.max(1, page), this.totalPages()));
  }

  viewDetail(helpdesk: HelpdeskItem): void {
    this.selectedHelpdeskId.set(helpdesk.id);
    this.isLoadingDetail.set(true);

    this.helpdeskService
      .getHelpdeskById(helpdesk.id)
      .pipe(finalize(() => this.isLoadingDetail.set(false)))
      .subscribe({
        next: (loadedHelpdesk) => this.upsertHelpdesk(loadedHelpdesk),
        error: (error) => this.handleHttpError(error, 'No se pudo cargar el detalle del helpdesk.')
      });
  }

  fieldInvalid(field: HelpdeskFormField): boolean {
    const control = this.helpdeskForm.controls[field];

    return control.invalid && (control.touched || control.dirty);
  }

  fieldMessage(field: HelpdeskFormField): string {
    const control = this.helpdeskForm.controls[field];

    if (control.hasError('required')) {
      return field === 'name' ? 'El nombre es obligatorio.' : 'El usuario ID es obligatorio.';
    }

    if (control.hasError('minlength')) {
      return 'El nombre debe tener al menos 3 caracteres.';
    }

    if (control.hasError('min')) {
      return 'El usuario ID debe ser mayor a 0.';
    }

    return '';
  }

  formatDate(value?: string | null): string {
    return formatDateTime(value);
  }

  trackByHelpdeskId(_: number, helpdesk: HelpdeskItem): number {
    return helpdesk.id;
  }

  @HostListener('document:click')
  closeFiltersFromOutside(): void {
    if (this.filtersOpen()) {
      this.filtersOpen.set(false);
    }
  }

  private upsertHelpdesk(helpdesk: HelpdeskItem): void {
    const current = this.helpdesks();
    const exists = current.some((item) => item.id === helpdesk.id);

    this.helpdesks.set(
      exists
        ? current.map((item) => (item.id === helpdesk.id ? helpdesk : item))
        : [helpdesk, ...current]
    );
    this.selectedHelpdeskId.set(helpdesk.id);
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
      this.formError.set(message);
      return;
    }

    this.setToast('error', message);
  }

  private getErrorBody(error: unknown): BackendErrorBody | null {
    if (!error || typeof error !== 'object') {
      return null;
    }

    const body = (error as BackendErrorBody)['error'];

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

      if (detail['name']?.includes('validation.required')) {
        messages.push('El nombre es obligatorio.');
      }

      if (detail['user_id']?.includes('validation.required')) {
        messages.push('El usuario ID es obligatorio.');
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

  private setToast(type: ToastState['type'], message: string): void {
    this.toast.set({ type, message });

    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
    }

    this.toastTimer = setTimeout(() => this.toast.set(null), 4200);
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
