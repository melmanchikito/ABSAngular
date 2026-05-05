import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  CirclePlus,
  LucideAngularModule,
  Monitor,
  Trash2,
  X
} from 'lucide-angular';
import { Subscription } from 'rxjs';

import { AssistFormService } from '../../state/assist-form.service';
import { MasterDataService } from '../../services/master-data.service';
import {
  AddedEquipment,
  Device,
  EquipmentWithDevices,
  RemovedEquipment
} from '../../../../core/models/master-data.model';

type DeviceComponent = NonNullable<Device['components']>[number];

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
  equipmentError = '';
  componentMessage = '';

  showAddEquipmentPanel = false;
  showRemoveEquipmentPanel = false;
  addEquipmentForm = {
    code: '',
    name: '',
    description: ''
  };
  removeEquipmentForm = {
    deviceId: '',
    reason: ''
  };
  addEquipmentError = '';
  removeEquipmentError = '';

  private formSubscription?: Subscription;
  private currentOwnerId?: number;

  constructor(
    public readonly assistFormService: AssistFormService,
    private readonly masterDataService: MasterDataService
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

  get addedEquipments(): AddedEquipment[] {
    return this.form.addedEquipments;
  }

  get removedEquipments(): RemovedEquipment[] {
    return this.form.removedEquipments;
  }

  loadEquipments(ownerId?: number): void {
    this.equipmentError = '';
    this.equipments = [];
    this.activeComponentId = null;
    this.assistFormService.setSelectedDevice(undefined);

    if (!ownerId) {
      this.equipmentError = 'Primero seleccione el solicitante o dueño del equipo.';
      return;
    }

    this.isLoadingEquipments = true;

    this.masterDataService.getEquipmentWithDevices(ownerId).subscribe({
      next: (data) => {
        this.equipments = data;
        this.isLoadingEquipments = false;

        if (this.devices.length === 0) {
          this.equipmentError = 'No se encontraron equipos asignados.';
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
    this.showAddEquipmentPanel = true;
    this.showRemoveEquipmentPanel = false;
  }

  deleteEquipment(): void {
    const deviceId = this.selectedDevice?.id;

    this.removeEquipmentError = '';
    this.showRemoveEquipmentPanel = true;
    this.showAddEquipmentPanel = false;
    this.removeEquipmentForm.deviceId = deviceId ? String(deviceId) : '';
  }

  cancelAddEquipment(): void {
    this.showAddEquipmentPanel = false;
    this.addEquipmentError = '';
    this.addEquipmentForm = {
      code: '',
      name: '',
      description: ''
    };
  }

  confirmAddEquipment(): void {
    const name = this.addEquipmentForm.name.trim();

    if (!name) {
      this.addEquipmentError = 'Ingrese el nombre del equipo que desea agregar.';
      return;
    }

    this.assistFormService.addEquipment({
      id: this.createLocalId(),
      code: this.addEquipmentForm.code.trim(),
      name,
      description: this.addEquipmentForm.description.trim()
    });

    this.cancelAddEquipment();
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
      this.removeEquipmentError = 'Seleccione el equipo que desea eliminar.';
      return;
    }

    if (!reason) {
      this.removeEquipmentError = 'Ingrese la descripción o motivo de eliminación.';
      return;
    }

    this.assistFormService.addRemovedEquipment({
      id: this.createLocalId(),
      device,
      reason,
      removedAt: new Date().toISOString()
    });

    this.cancelRemoveEquipment();
  }

  removeAddedEquipment(id: string): void {
    this.assistFormService.removeAddedEquipment(id);
  }

  removeRemovedEquipment(id: string): void {
    this.assistFormService.removeRemovedEquipment(id);
  }

  addComponent(): void {
    const deviceId = this.selectedDevice?.id;

    if (!deviceId) {
      this.componentMessage = 'Seleccione un equipo antes de agregar componentes.';
      return;
    }

    this.componentMessage = 'La solicitud ya quedó vinculada al equipo seleccionado.';
  }

  private createLocalId(): string {
    const randomPart = globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2);
    return `${Date.now()}-${randomPart}`;
  }
}
