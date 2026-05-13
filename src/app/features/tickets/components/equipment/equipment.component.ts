import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  CirclePlus,
  LucideAngularModule,
  Monitor,
  Trash2,
  X
} from 'lucide-angular';
import { Subscription } from 'rxjs';

import { formatDateTime } from '../../../../shared/utils/date-format.util';
import { ComponentItem, Device, EquipmentWithDevices, RemovedEquipment } from '../../models/helpdesk.model';
import { AssistFormService } from '../../state/assist-form.service';
import {
  InsertComponentRequest,
  InsertDeviceRequest,
  HelpdeskDataService
} from '../../services/helpdesk-data.service';

type DeviceComponent = NonNullable<Device['components']>[number];

interface AddEquipmentForm {
  code: string;
  name: string;
  model: string;
  description: string;
  type: string;
  state: string;
  serialNumber: string;
  equipmentId: string;
}

interface AddComponentForm {
  code: string;
  name: string;
  model: string;
  type: string;
  state: string;
  serialNumber: string;
  capacity: string;
  volts: string;
  amps: string;
  watts: string;
  reusable: boolean;
}

@Component({
  selector: 'app-equipment',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './equipment.component.html',
  styleUrl: './equipment.component.scss'
})
export class EquipmentComponent implements OnInit, OnDestroy {
  readonly addIcon = CirclePlus;
  readonly monitorIcon = Monitor;
  readonly trashIcon = Trash2;
  readonly closeIcon = X;

  activeComponentId: number | null = null;
  equipments: EquipmentWithDevices[] = [];

  isLoadingEquipments = false;
  isSavingEquipment = false;
  isCancelingEquipment = false;
  isSavingComponent = false;
  equipmentError = '';
  equipmentActionMessage = '';
  componentMessage = '';

  showAddEquipmentPanel = false;
  showRemoveEquipmentPanel = false;
  showAddComponentPanel = false;
  addEquipmentForm: AddEquipmentForm = this.createEmptyAddEquipmentForm();
  addComponentForm: AddComponentForm = this.createEmptyAddComponentForm();
  removeEquipmentForm = {
    deviceId: '',
    reason: ''
  };
  addEquipmentError = '';
  addComponentError = '';
  removeEquipmentError = '';

  private formSubscription?: Subscription;
  private currentOwnerId?: number;

  constructor(
    public readonly assistFormService: AssistFormService,
    private readonly helpdeskDataService: HelpdeskDataService
  ) {}

  ngOnInit(): void {
    this.formSubscription = this.assistFormService.form$.subscribe((form) => {
      const ownerId = form.isOwner ? form.employeeId : form.ownerId;

      if (ownerId !== this.currentOwnerId) {
        this.currentOwnerId = ownerId;
        this.loadEquipments(ownerId);
      }
    });
  }

  ngOnDestroy(): void {
    this.formSubscription?.unsubscribe();
  }

  get form() {
    return this.assistFormService.snapshot;
  }

  get equipmentOwnerId(): number | undefined {
    return this.form.isOwner ? this.form.employeeId : this.form.ownerId;
  }

  get devices(): Device[] {
    return this.equipments.flatMap((eq) => eq.devices ?? []);
  }

  get selectedDeviceId(): number | '' {
    return this.form.selectedDevice?.id ?? '';
  }

  get selectedDevice(): Partial<Device> | undefined {
    return this.form.selectedDevice;
  }

  get defaultEquipmentId(): number | undefined {
    return this.selectedDevice?.equipment_id ?? this.equipments[0]?.id;
  }

  get removedEquipments(): RemovedEquipment[] {
    return this.form.removedEquipments;
  }

  loadEquipments(ownerId?: number, preferredDeviceId?: number): void {
    this.equipmentError = '';
    this.equipments = [];
    this.activeComponentId = null;
    this.assistFormService.setSelectedDevice(undefined);

    if (!ownerId) {
      this.equipmentError = 'Primero seleccione el solicitante o dueño del equipo.';
      return;
    }

    this.isLoadingEquipments = true;

    this.helpdeskDataService.getEquipmentWithDevices(ownerId).subscribe({
      next: (data) => {
        this.equipments = data;
        this.isLoadingEquipments = false;

        if (this.devices.length === 0) {
          this.equipmentActionMessage = 'No hay equipos asignados. Para crear un dispositivo, el backend todavía requiere un equipo base.';
          return;
        }

        if (preferredDeviceId) {
          const selected = this.devices.find((device) => device.id === preferredDeviceId);
          this.assistFormService.setSelectedDevice(selected);
        }
      },
      error: (error) => {
        console.error('Error cargando equipos:', error);
        this.equipmentError = 'No se pudieron cargar los equipos.';
        this.isLoadingEquipments = false;
      }
    });
  }

  onDeviceChange(value: string | number): void {
    const deviceId = Number(value);

    if (!deviceId) {
      this.assistFormService.setSelectedDevice(undefined);
      this.activeComponentId = null;
      return;
    }

    const selected = this.devices.find((d) => d.id === deviceId);

    this.assistFormService.setSelectedDevice(selected);
    this.activeComponentId = null;
  }

  toggleComponent(id: number): void {
    this.activeComponentId = this.activeComponentId === id ? null : id;
  }

  deleteComponent(event: Event, component: DeviceComponent): void {
    event.stopPropagation();
    this.componentMessage = `Componente "${component.name}" marcado para revisión.`;
  }

  addEquipment(): void {
    this.addEquipmentError = '';
    this.equipmentActionMessage = '';
    this.showAddEquipmentPanel = true;
    this.showRemoveEquipmentPanel = false;
    this.showAddComponentPanel = false;
    this.addEquipmentForm.equipmentId = '';
  }

  deleteEquipment(): void {
    const deviceId = this.selectedDevice?.id;

    this.removeEquipmentError = '';
    this.equipmentActionMessage = '';
    this.showRemoveEquipmentPanel = true;
    this.showAddEquipmentPanel = false;
    this.showAddComponentPanel = false;
    this.removeEquipmentForm.deviceId = deviceId ? String(deviceId) : '';
  }

  cancelAddEquipment(): void {
    this.showAddEquipmentPanel = false;
    this.addEquipmentError = '';
    this.addEquipmentForm = this.createEmptyAddEquipmentForm();
  }

  confirmAddEquipment(): void {
    const payload = this.buildInsertDevicePayload();

    if (!payload) {
      return;
    }

    this.isSavingEquipment = true;

    this.helpdeskDataService.insertDevice(payload).subscribe((result) => {
      this.isSavingEquipment = false;

      if (!result.success) {
        this.addEquipmentError = result.message;
        return;
      }

      this.equipmentActionMessage = result.message;
      this.cancelAddEquipment();
      this.reloadCurrentEquipments();
    });
  }

  addComponent(): void {
    const deviceId = this.selectedDevice?.id;

    this.addComponentError = '';
    this.componentMessage = '';

    if (!deviceId) {
      this.componentMessage = 'Seleccione un equipo antes de agregar componentes.';
      return;
    }

    this.showAddComponentPanel = true;
    this.showAddEquipmentPanel = false;
    this.showRemoveEquipmentPanel = false;
  }

  cancelAddComponent(): void {
    this.showAddComponentPanel = false;
    this.addComponentError = '';
    this.addComponentForm = this.createEmptyAddComponentForm();
  }

  confirmAddComponent(): void {
    const payload = this.buildInsertComponentPayload();
    const selectedDeviceId = this.selectedDevice?.id;

    if (!payload || !selectedDeviceId) {
      return;
    }

    this.isSavingComponent = true;
    this.addComponentError = '';

    this.helpdeskDataService.insertComponent(payload).subscribe({
      next: (result) => {
        this.isSavingComponent = false;

        if (!result.success) {
          this.addComponentError = result.message || 'No se pudo crear el componente.';
          return;
        }

        this.componentMessage = result.message || 'Componente creado correctamente.';
        this.cancelAddComponent();
        this.reloadCurrentEquipments(selectedDeviceId);
      },
      error: (error) => {
        this.isSavingComponent = false;

        const backendError = error.error?.error;
        const detailsError = backendError?.details_error;

        this.addComponentError =
          detailsError?.error_message ||
          backendError?.message ||
          'Error al crear el componente.';
      }
    });
  }
  cancelRemoveEquipment(): void {
    this.showRemoveEquipmentPanel = false;
    this.removeEquipmentError = '';
    this.removeEquipmentForm = {
      deviceId: '',
      reason: ''
    };
  }

  confirmRemoveEquipment(): void {
    const deviceId = Number(this.removeEquipmentForm.deviceId);
    const reason = this.removeEquipmentForm.reason.trim();
    const device = this.devices.find((item) => item.id === deviceId);

    if (!device) {
      this.removeEquipmentError = 'Seleccione el equipo que desea anular.';
      return;
    }

    if (!reason) {
      this.removeEquipmentError = 'Ingrese la descripción o motivo de anulación.';
      return;
    }

    this.isCancelingEquipment = true;

    this.helpdeskDataService.cancelDevice({
      device_id: device.id,
      canceled_by: this.getUsername()
    }).subscribe((result) => {
      this.isCancelingEquipment = false;

      if (!result.success) {
        this.removeEquipmentError = result.message;
        return;
      }

      this.assistFormService.addRemovedEquipment({
        id: this.createLocalId(),
        device,
        reason,
        removedAt: new Date().toISOString()
      });

      this.equipmentActionMessage = result.message;
      this.cancelRemoveEquipment();
      this.reloadCurrentEquipments();
    });
  }

  removeRemovedEquipment(id: string): void {
    this.assistFormService.removeRemovedEquipment(id);
  }

  private buildInsertDevicePayload(): InsertDeviceRequest | null {
    const code = this.addEquipmentForm.code.trim();
    const name = this.addEquipmentForm.name.trim();
    const equipmentId = Number(this.addEquipmentForm.equipmentId || 0);
    const companyId = Number(this.form.companyId ?? this.selectedDevice?.company_id ?? 0);

    if (!code) {
      this.addEquipmentError = 'Ingrese el código del equipo.';
      return null;
    }

    if (!name) {
      this.addEquipmentError = 'Ingrese el nombre del equipo que desea agregar.';
      return null;
    }

    if (!equipmentId) {
      this.addEquipmentError = 'Seleccione un equipo base. La API lo marca como obligatorio para crear el dispositivo.';
      return null;
    }

    if (!companyId) {
      this.addEquipmentError = 'No se encontró la compañía del solicitante.';
      return null;
    }

    const now = this.formatApiDate(new Date());

    return {
      code,
      name,
      model: this.addEquipmentForm.model.trim(),
      description: this.addEquipmentForm.description.trim(),
      type: this.addEquipmentForm.type.trim(),
      state: this.addEquipmentForm.state.trim(),
      serial_number: this.addEquipmentForm.serialNumber.trim(),
      assignment_at: now,
      last_maintenance_at: now,
      warranty_expire_at: now,
      supplier_id: Number(this.selectedDevice?.supplier_id ?? 1),
      company_id: companyId,
      brand_id: Number(this.selectedDevice?.brand_id ?? 1),
      equipment_id: equipmentId,
      helpdesk_id: Number(this.selectedDevice?.helpdesk_id ?? 1),
      created_by: this.getUsername()
    };
  }

private buildInsertComponentPayload(): InsertComponentRequest | null {
  const code = String(this.addComponentForm.code || '').trim();
  const name = String(this.addComponentForm.name || '').trim();

  const deviceId = Number(this.selectedDevice?.id ?? 0);
  const helpdeskId = Number(this.selectedDevice?.helpdesk_id ?? 1);
  const brandId = Number(this.selectedDevice?.brand_id ?? 0);
  const supplierId = Number(this.selectedDevice?.supplier_id ?? 0);

  if (!deviceId) {
    this.addComponentError = 'Seleccione un equipo antes de crear el componente.';
    return null;
  }

  if (!brandId) {
    this.addComponentError = 'El equipo seleccionado no tiene marca asignada.';
    return null;
  }

  if (!supplierId) {
    this.addComponentError = 'El equipo seleccionado no tiene proveedor asignado.';
    return null;
  }

  if (!code) {
    this.addComponentError = 'Ingrese el código del componente.';
    return null;
  }

  if (!name) {
    this.addComponentError = 'Ingrese el nombre del componente.';
    return null;
  }

  const now = this.formatApiDate(new Date());

  return {
    code,
    name,
    model: String(this.addComponentForm.model || '').trim(),
    type: String(this.addComponentForm.type || '').trim(),
    state: String(this.addComponentForm.state || '').trim(),
    serial_number: String(this.addComponentForm.serialNumber || '').trim(),
    capacity: String(this.addComponentForm.capacity || '').trim(),
    volts: String(this.addComponentForm.volts || '').trim(),
    amps: String(this.addComponentForm.amps || '').trim(),
    watts: String(this.addComponentForm.watts || '').trim(),
    assignment_at: now,
    warranty_expire_at: now,
    device_id: deviceId,
    helpdesk_id: helpdeskId,
    brand_id: brandId,
    supplier_id: supplierId,
    reusable: Boolean(this.addComponentForm.reusable),
    created_by: String(this.getUsername() || 'adminUser').trim()
  };
}
  private reloadCurrentEquipments(preferredDeviceId?: number): void {
    this.loadEquipments(this.equipmentOwnerId, preferredDeviceId);
  }

  private createEmptyAddEquipmentForm(): AddEquipmentForm {
    return {
      code: '',
      name: '',
      model: '',
      description: '',
      type: '',
      state: '',
      serialNumber: '',
      equipmentId: ''
    };
  }

  private createEmptyAddComponentForm(): AddComponentForm {
    return {
      code: '',
      name: '',
      model: '',
      type: '',
      state: '',
      serialNumber: '',
      capacity: '',
      volts: '',
      amps: '',
      watts: '',
      reusable: false
    };
  }

  private createLocalId(): string {
    const randomPart = globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2);
    return `${Date.now()}-${randomPart}`;
  }

  private formatApiDate(date: Date): string {
    const pad = (value: number) => String(value).padStart(2, '0');

    return [
      date.getFullYear(),
      pad(date.getMonth() + 1),
      pad(date.getDate())
    ].join('-') + ` ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  }

  formatDisplayDate(value?: string | Date | null): string {
    return formatDateTime(value);
  }

  private getUsername(): string {
    return (
      localStorage.getItem('username') ||
      localStorage.getItem('user') ||
      localStorage.getItem('email') ||
      'adminUser'
    );
  }
}
