import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  ChevronLeft,
  ChevronRight,
  CirclePlus,
  Edit3,
  Eye,
  LucideAngularModule,
  MapPin,
  RefreshCcw,
  Search,
  SlidersHorizontal,
  Trash2,
  X
} from 'lucide-angular';
import * as L from 'leaflet';
import {
  CancelLocationRequest,
  InsertLocationRequest,
  LocationItem,
  UpdateLocationRequest
} from '../../../models/location-maintenance.model';
import { LocationMaintenanceService } from '../../../services/location-maintenance.service';
import { ConfirmDialogComponent } from '../../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { DataGridPaginationComponent } from '../../../../../shared/components/data-grid-pagination/data-grid-pagination.component';
import { DebouncedSearchDirective } from '../../../../../shared/directives/debounced-search.directive';
import { EmptyStateComponent } from '../../../../../shared/components/empty-state/empty-state.component';
import { PageHeaderComponent } from '../../../../../shared/components/page-header/page-header.component';
import { formatDateTime, isDateLikeField } from '../../../../../shared/utils/date-format.util';
import { StatusBadgeComponent } from '../../../../../shared/components/status-badge/status-badge.component';
import { GridColumnConfig, GridFilterOption } from '../../../../../shared/models/grid-view.model';

type LocationStatusFilter = 'all' | 'active' | 'inactive';
type LocationGridColumn = keyof LocationItem | 'actions';
type BackendErrorBody = Record<string, unknown>;

interface LocationForm {
  code: string;
  name: string;
  address: string;
}

interface EditLocationForm {
  code: string;
  name: string;
  address: string;
}

interface MapPoint {
  lat: number;
  lng: number;
}

@Component({
  selector: 'app-location-maintenance',
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
  templateUrl: './location-maintenance.component.html',
  styleUrl: './location-maintenance.component.scss'
})
export class LocationMaintenanceComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('locationsMap') private readonly locationsMapRef?: ElementRef<HTMLDivElement>;
  @ViewChild('formMap') private readonly formMapRef?: ElementRef<HTMLDivElement>;

  readonly mapIcon = MapPin;
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
  readonly gridColumns: readonly GridColumnConfig<LocationGridColumn>[] = [
    { key: 'id', label: 'ID', width: '88px' },
    { key: 'code', label: 'Codigo' },
    { key: 'name', label: 'Nombre' },
    { key: 'address', label: 'Direccion' },
    { key: 'canceled', label: 'Estado', width: '140px' },
    { key: 'canceled_at', label: 'Fecha anulacion', width: '180px' },
    { key: 'created_at', label: 'Fecha creacion', width: '180px' },
    { key: 'updated_at', label: 'Fecha actualizacion', width: '190px' },
    { key: 'actions', label: 'Acciones', width: '170px', align: 'right' }
  ];
  readonly statusFilterOptions: readonly GridFilterOption<LocationStatusFilter>[] = [
    { value: 'all', label: 'Todas' },
    { value: 'active', label: 'Activas' },
    { value: 'inactive', label: 'Inactivas' }
  ];

  locations: LocationItem[] = [];
  selectedLocationId: number | null = null;
  searchTerm = '';
  statusFilter: LocationStatusFilter = 'all';
  statusFilterDraft: LocationStatusFilter = 'all';
  filtersOpen = false;
  currentPage = 1;
  readonly pageSize = 6;
  isLoading = false;
  isSaving = false;
  successMessage = '';
  errorMessage = '';
  formError = '';

  editingLocation: LocationItem | null = null;
  locationToCancel: LocationItem | null = null;

  locationForm: LocationForm = {
    code: '',
    name: '',
    address: ''
  };

  editLocationForm: EditLocationForm = {
    code: '',
    name: '',
    address: ''
  };

  formPoint: MapPoint | null = null;

  private readonly defaultPoint: MapPoint = {
    lat: -2.1894,
    lng: -79.8891
  };
  private mainMap: L.Map | null = null;
  private mainMarker: L.Marker | null = null;
  private formMap: L.Map | null = null;
  private formMarker: L.Marker | null = null;

  constructor(private readonly locationService: LocationMaintenanceService) {}

  ngOnInit(): void {
    this.loadLocations();
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.initMainMap(), 0);
  }

  ngOnDestroy(): void {
    this.mainMap?.remove();
    this.formMap?.remove();
  }

  get cancelLocationMessage(): string {
    const locationName = this.locationToCancel?.name ?? 'esta ubicacion';

    return `Esta seguro de que desea borrar ${locationName}? Quedara anulada y no se eliminara fisicamente.`;
  }

  get filteredLocations(): LocationItem[] {
    const term = this.searchTerm.trim().toLowerCase();

    return this.locations.filter((location) => {
      const matchesStatus =
        this.statusFilter === 'all' ||
        (this.statusFilter === 'active' && !location.canceled) ||
        (this.statusFilter === 'inactive' && location.canceled);

      if (!matchesStatus) {
        return false;
      }

      if (!term) {
        return true;
      }

      return [
        location.code,
        location.name,
        location.address
      ].some((value) => value.toLowerCase().includes(term));
    });
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredLocations.length / this.pageSize));
  }

  get paginatedLocations(): LocationItem[] {
    const safePage = Math.min(this.currentPage, this.totalPages);
    const start = (safePage - 1) * this.pageSize;

    return this.filteredLocations.slice(start, start + this.pageSize);
  }

  get showingCount(): number {
    return this.paginatedLocations.length;
  }

  loadLocations(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.locationService.getLocations().subscribe({
      next: (locations) => {
        this.locations = locations;
        this.currentPage = Math.min(this.currentPage, this.totalPages);
        this.selectedLocationId = locations.some((location) => location.id === this.selectedLocationId)
          ? this.selectedLocationId
          : null;
        this.isLoading = false;
        setTimeout(() => this.invalidateMaps(), 0);
      },
      error: (error) => {
        this.isLoading = false;
        this.handleHttpError(error, 'No se pudo cargar el listado de ubicaciones.');
      }
    });
  }

  onFiltersChange(): void {
    this.currentPage = 1;
  }

  setStatusFilter(filter: LocationStatusFilter): void {
    this.statusFilter = filter;
    this.onFiltersChange();
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

  selectLocation(location: LocationItem): void {
    this.selectedLocationId = location.id;
    this.focusMainMap(this.defaultPoint);
    setTimeout(() => this.invalidateMaps(), 0);
  }

  askCancel(location: LocationItem): void {
    this.locationToCancel = location;
    this.successMessage = '';
    this.errorMessage = '';
  }

  closeCancelConfirm(): void {
    if (this.isSaving) {
      return;
    }

    this.locationToCancel = null;
  }

  confirmCancel(): void {
    if (!this.locationToCancel) {
      return;
    }

    const payload: CancelLocationRequest = {
      location_id: this.locationToCancel.id,
      canceled_by: this.getUsername()
    };

    this.isSaving = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.locationService.cancelLocation(payload).subscribe({
      next: () => {
        this.isSaving = false;
        this.locationToCancel = null;
        this.selectedLocationId = null;
        this.successMessage = 'Ubicacion anulada correctamente.';
        this.loadLocations();
      },
      error: (error) => {
        this.isSaving = false;
        this.handleHttpError(error, 'No se pudo anular la ubicacion.');
      }
    });
  }

  formatDate(value?: string | null): string {
    return formatDateTime(value);
  }

  formatTime(value?: string | null): string {
    if (!value) {
      return 'Sin registro';
    }

    const timePart = value.split(' ')[1];
    return timePart || 'Sin registro';
  }

  trackByLocationId(_: number, location: LocationItem): number {
    return location.id;
  }

  trackByColumnKey(_: number, column: GridColumnConfig<LocationGridColumn>): LocationGridColumn {
    return column.key;
  }

  getColumnClass(column: GridColumnConfig<LocationGridColumn>): string {
    const classes = [`app-grid-col-${column.key}`];

    if (column.align === 'right') {
      classes.push('app-grid-col-right');
    }

    if (column.align === 'center') {
      classes.push('app-grid-col-center');
    }

    return classes.join(' ');
  }

  formatGridValue(location: LocationItem, key: LocationGridColumn): string {
    if (key === 'actions' || key === 'canceled') {
      return '';
    }

    const value = location[key];

    if (isDateLikeField(String(key))) {
      return formatDateTime(value as string | null | undefined);
    }

    return value === null || value === undefined || value === '' ? 'Sin registro' : String(value);
  }

  formatPoint(point: MapPoint | null): string {
    if (!point) {
      return 'Sin punto seleccionado';
    }

    return `${point.lat.toFixed(6)}, ${point.lng.toFixed(6)}`;
  }

  @HostListener('document:click')
  closeFiltersFromOutside(): void {
    this.filtersOpen = false;
  }

  private initMainMap(): void {
    if (!this.locationsMapRef?.nativeElement || this.mainMap) {
      this.invalidateMaps();
      return;
    }

    this.mainMap = this.createMap(this.locationsMapRef.nativeElement, this.defaultPoint);
    this.mainMarker = this.createMarker(this.defaultPoint).addTo(this.mainMap);
  }

  private initFormMap(): void {
    if (!this.formMapRef?.nativeElement) {
      return;
    }

    if (!this.formMap) {
      this.formMap = this.createMap(this.formMapRef.nativeElement, this.formPoint ?? this.defaultPoint);
      this.formMap.on('click', (event: L.LeafletMouseEvent) => {
        this.setFormPoint({
          lat: event.latlng.lat,
          lng: event.latlng.lng
        });
      });
    }

    this.formMap.invalidateSize();
    this.formMap.setView(this.formPoint ?? this.defaultPoint, 13);

    if (this.formPoint) {
      this.updateFormMarker(this.formPoint);
    }
  }

  private createMap(element: HTMLElement, point: MapPoint): L.Map {
    const map = L.map(element, {
      center: [point.lat, point.lng],
      zoom: 13,
      zoomControl: true
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    setTimeout(() => map.invalidateSize(), 0);

    return map;
  }

  private createMarker(point: MapPoint): L.Marker {
    return L.marker([point.lat, point.lng], {
      icon: L.divIcon({
        className: 'abs-location-marker',
        html: '<span></span>',
        iconSize: [28, 28],
        iconAnchor: [14, 28]
      })
    });
  }

  private setFormPoint(point: MapPoint): void {
    this.formPoint = point;
    this.updateFormMarker(point);
  }

  private updateFormMarker(point: MapPoint): void {
    if (!this.formMap) {
      return;
    }

    if (!this.formMarker) {
      this.formMarker = this.createMarker(point).addTo(this.formMap);
      return;
    }

    this.formMarker.setLatLng([point.lat, point.lng]);
  }

  private focusMainMap(point: MapPoint): void {
    if (!this.mainMap) {
      return;
    }

    this.mainMap.setView([point.lat, point.lng], 13);

    if (!this.mainMarker) {
      this.mainMarker = this.createMarker(point).addTo(this.mainMap);
      return;
    }

    this.mainMarker.setLatLng([point.lat, point.lng]);
  }

  private invalidateMaps(): void {
    this.mainMap?.invalidateSize();
    this.formMap?.invalidateSize();
  }

  private destroyFormMap(): void {
    this.formMap?.remove();
    this.formMap = null;
    this.formMarker = null;
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

      if (detail['address']?.includes('validation.required')) {
        messages.push('La direccion es obligatoria.');
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
      'adminUser'
    );
  }
}