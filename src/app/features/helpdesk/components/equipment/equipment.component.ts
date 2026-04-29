import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

import { AssistFormService } from '../../state/assist-form.service';
import { MasterDataService } from '../../services/master-data.service';
import {
  Device,
  EquipmentWithDevices
} from '../../../../core/models/master-data.model';

type DeviceComponent = NonNullable<Device['components']>[number];

@Component({
  selector: 'app-equipment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './equipment.component.html',
  styleUrl: './equipment.component.scss'
})
export class EquipmentComponent implements OnInit, OnDestroy {
  activeComponentId: number | null = null;
  equipments: EquipmentWithDevices[] = [];

  isLoadingEquipments = false;
  equipmentError = '';

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

    console.log('Eliminar componente:', component.id);
  }

  addEquipment(): void {
    console.log('Agregar equipo');
  }

  deleteEquipment(): void {
    const deviceId = this.selectedDevice?.id;

    if (!deviceId) {
      return;
    }

    console.log('Eliminar equipo:', deviceId);
  }

  addComponent(): void {
    const deviceId = this.selectedDevice?.id;

    if (!deviceId) {
      return;
    }

    console.log('Agregar componente al equipo:', deviceId);
  }
}