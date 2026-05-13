import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { PageHeaderComponent } from '../../../../../shared/components/page-header/page-header.component';
import { MaintenanceFormBase } from '../shared/maintenance-form.base';

@Component({
  selector: 'app-maintenance-form-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, PageHeaderComponent],
  templateUrl: './maintenance-form-edit.component.html',
  styleUrl: './maintenance-form-edit.component.scss'
})
export class MaintenanceFormEditComponent extends MaintenanceFormBase implements OnInit {
  readonly mode = 'edit';
  readonly modeLabel = 'Edicion';

  get title(): string {
    return this.config.editTitle;
  }

  get subtitle(): string {
    return this.config.editSubtitle;
  }

  ngOnInit(): void {
    this.setupFormPage();
    this.loadRecord();
  }

  save(): void {
    if (!this.validateCurrentForm()) {
      return;
    }

    const payload = this.buildUpdatePayload();

    if (!payload) {
      return;
    }

    this.isSaving = true;

    this.config.update(payload).subscribe({
      next: () => this.handleSaveSuccess(),
      error: (error) => this.handleSaveError(error, 'No se pudo actualizar el registro.')
    });
  }
}