import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { PageHeaderComponent } from '../../../../../shared/components/page-header/page-header.component';
import { MaintenanceFormBase } from '../shared/maintenance-form.base';

@Component({
  selector: 'app-maintenance-form-create',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, PageHeaderComponent],
  templateUrl: './maintenance-form-create.component.html',
  styleUrl: './maintenance-form-create.component.scss'
})
export class MaintenanceFormCreateComponent extends MaintenanceFormBase implements OnInit {
  readonly mode = 'create';
  readonly modeLabel = 'Nuevo registro';

  get title(): string {
    return this.config.createTitle;
  }

  get subtitle(): string {
    return this.config.createSubtitle;
  }

  ngOnInit(): void {
    this.setupFormPage();
  }

  save(): void {
    if (!this.validateCurrentForm()) {
      return;
    }

    this.isSaving = true;

    this.config.create(this.buildCreatePayload()).subscribe({
      next: () => this.handleSaveSuccess(),
      error: (error) => this.handleSaveError(error, 'No se pudo crear el registro.')
    });
  }
}