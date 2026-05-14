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

    const payload = this.buildCreatePayload();

    if (this.config.entity === 'users') {
      console.log('CREATE USER PAYLOAD:', payload);
    }

    this.config.create(payload).subscribe({
      next: (response) => {
        if (this.config.entity === 'users') {
          console.log('CREATE USER RESPONSE:', response);
        }

        this.handleSaveSuccess();
      },
      error: (error) => {
        if (this.config.entity === 'users') {
          this.logCreateUserError(error);
        }

        this.handleSaveError(error, 'No se pudo crear el registro.');
      }
    });
  }

  private logCreateUserError(error: unknown): void {
    const httpError = error as {
      error?: {
        message?: unknown;
        errors?: unknown;
      };
      status?: unknown;
      statusText?: unknown;
    };

    console.error('CREATE USER ERROR:', error);
    console.error('CREATE USER ERROR RESPONSE:', httpError.error);
    console.error('CREATE USER VALIDATION:', httpError.error?.message);
    console.error('CREATE USER VALIDATION ERRORS:', httpError.error?.errors);
    console.error('CREATE USER STATUS:', httpError.status);
    console.error('CREATE USER STATUS TEXT:', httpError.statusText);
  }
}
