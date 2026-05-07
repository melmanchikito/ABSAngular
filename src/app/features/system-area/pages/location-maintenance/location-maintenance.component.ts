import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  ChevronLeft,
  ChevronRight,
  CirclePlus,
  Edit3,
  LucideAngularModule,
  MapPin,
  Search,
  Trash2,
  X
} from 'lucide-angular';
import * as L from 'leaflet';
import {
  CancelLocationRequest,
  InsertLocationRequest,
  LocationItem,
  UpdateLocationRequest
} from '../../models/location-maintenance.model';
import { LocationMaintenanceService } from '../../services/location-maintenance.service';

type LocationModalMode = 'create' | 'edit';
type LocationStatusFilter = 'all' | 'active' | 'inactive';
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
  imports: [CommonModule, FormsModule, LucideAngularModule],
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
  readonly editIcon = Edit3;
  readonly searchIcon = Search;
  readonly trashIcon = Trash2;
  readonly closeIcon = X;

  locations: LocationItem[] = [];
  selectedLocationId: number | null = null;
  searchTerm = '';
  statusFilter: LocationStatusFilter = 'all';
  currentPage = 1;
  readonly pageSize = 6;
  isLoading = false;
  isSaving = false;
  successMessage = '';
  errorMessage = '';
  formError = '';

  modalOpen = false;
  modalMode: LocationModalMode = 'create';
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

  get modalTitle(): string {
    return this.modalMode === 'create' ? 'Nueva ubicacion' : 'Editar ubicacion';
  }

  get totalLocations(): number {
    return this.locations.length;
  }

  get activeLocations(): number {
    return this.locations.filter((location) => !location.canceled).length;
  }

  get inactiveLocations(): number {
    return this.locations.filter((location) => location.canceled).length;
  }

  get selectedLocation(): LocationItem | null {
    if (!this.selectedLocationId) {
      return null;
    }

    return this.locations.find((location) => location.id === this.selectedLocationId) ?? null;
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

  previousPage(): void {
    this.currentPage = Math.max(1, this.currentPage - 1);
  }

  nextPage(): void {
    this.currentPage = Math.min(this.totalPages, this.currentPage + 1);
  }

  selectLocation(location: LocationItem): void {
    this.selectedLocationId = location.id;
    this.focusMainMap(this.defaultPoint);
    setTimeout(() => this.invalidateMaps(), 0);
  }

  openCreateModal(): void {
    this.modalMode = 'create';
    this.editingLocation = null;
    this.locationForm = {
      code: '',
      name: '',
      address: ''
    };
    this.editLocationForm = {
      code: '',
      name: '',
      address: ''
    };
    this.formPoint = null;
    this.formError = '';
    this.successMessage = '';
    this.errorMessage = '';
    this.modalOpen = true;
    setTimeout(() => this.initFormMap(), 0);
  }

  openEditModal(location: LocationItem): void {
    this.modalMode = 'edit';
    this.editingLocation = location;
    this.editLocationForm = {
      code: location.code,
      name: location.name,
      address: location.address
    };
    this.formPoint = null;
    this.formError = '';
    this.successMessage = '';
    this.errorMessage = '';
    this.modalOpen = true;
    setTimeout(() => this.initFormMap(), 0);
  }

  closeModal(): void {
    if (this.isSaving) {
      return;
    }

    this.modalOpen = false;
    this.editingLocation = null;
    this.formError = '';
    this.destroyFormMap();
  }

  saveLocation(): void {
    this.successMessage = '';
    this.errorMessage = '';
    this.formError = '';

    if (this.modalMode === 'create') {
      const code = this.locationForm.code.trim();
      const name = this.locationForm.name.trim();
      const address = this.locationForm.address.trim();

      if (!code) {
        this.formError = 'El codigo es obligatorio.';
        return;
      }

      if (!name) {
        this.formError = 'El nombre es obligatorio.';
        return;
      }

      if (!address) {
        this.formError = 'La direccion es obligatoria.';
        return;
      }

      this.isSaving = true;

      const payload: InsertLocationRequest = {
        code,
        name,
        address,
        created_by: this.getUsername()
      };

      this.locationService.insertLocation(payload).subscribe({
        next: () => this.afterSuccessfulSave('Ubicacion creada correctamente.'),
        error: (error) => this.handleSaveError(error, 'No se pudo crear la ubicacion.')
      });

      return;
    }

    if (!this.editingLocation) {
      this.formError = 'No se encontro la ubicacion seleccionada.';
      return;
    }

    const name = this.editLocationForm.name.trim();
    const address = this.editLocationForm.address.trim();

    if (!name) {
      this.formError = 'El nombre es obligatorio.';
      return;
    }

    if (!address) {
      this.formError = 'La direccion es obligatoria.';
      return;
    }

    this.isSaving = true;

    const payload: UpdateLocationRequest = {
      location_id: this.editingLocation.id,
      name,
      address,
      updated_by: this.getUsername()
    };

    this.locationService.updateLocation(payload).subscribe({
      next: () => this.afterSuccessfulSave('Ubicacion actualizada correctamente.'),
      error: (error) => this.handleSaveError(error, 'No se pudo actualizar la ubicacion.')
    });
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
    return value || 'Sin registro';
  }

  formatTime(value?: string | null): string {
    if (!value) {
      return 'Sin registro';
    }

    const timePart = value.split(' ')[1];
    return timePart || 'Sin registro';
  }

  getLocationInitial(location: LocationItem): string {
    return (location.name || location.code || '?').trim().charAt(0).toUpperCase();
  }

  formatPoint(point: MapPoint | null): string {
    if (!point) {
      return 'Sin punto seleccionado';
    }

    return `${point.lat.toFixed(6)}, ${point.lng.toFixed(6)}`;
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

  private afterSuccessfulSave(message: string): void {
    this.isSaving = false;
    this.modalOpen = false;
    this.editingLocation = null;
    this.successMessage = message;
    this.destroyFormMap();
    this.loadLocations();
  }

  private handleSaveError(error: unknown, fallback: string): void {
    this.isSaving = false;
    this.handleHttpError(error, fallback, true);
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
