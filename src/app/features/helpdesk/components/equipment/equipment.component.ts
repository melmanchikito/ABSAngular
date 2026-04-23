import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AssistFormService } from '../../state/assist-form.service';
import { MasterDataService } from '../../services/master-data.service';
import { EquipmentWithDevices } from '../../../../core/models/master-data.model';

@Component({
  selector: 'app-equipment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './equipment.component.html',
  styleUrl: './equipment.component.scss'
})
export class EquipmentComponent implements OnInit {
  activeComponentId: number | null = null;
  equipments: EquipmentWithDevices[] = [];

  constructor(
    public readonly assistFormService: AssistFormService,
    private readonly masterDataService: MasterDataService
  ) {}

  ngOnInit(): void {
    const ownerId = this.assistFormService.snapshot.isOwner
      ? this.assistFormService.snapshot.employeeId ?? 0
      : this.assistFormService.snapshot.ownerId ?? 0;

    this.masterDataService.getEquipmentWithDevices(ownerId).subscribe((data) => {
      this.equipments = data;
    });
  }

  toggleComponent(id: number): void {
    this.activeComponentId = this.activeComponentId === id ? null : id;
  }

  get devices() {
    return this.equipments.flatMap((eq) => eq.devices ?? []);
  }

  get selectedDeviceId(): number | undefined {
    return this.assistFormService.snapshot.selectedDevice?.id as number | undefined;
  }

  get selectedDevice() {
    return this.devices.find((d) => d.id === this.selectedDeviceId);
  }

  onDeviceChange(deviceId: number): void {
    const selected = this.devices.find((d) => d.id === deviceId);
    this.assistFormService.setSelectedDevice(selected);
  }
}