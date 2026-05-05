import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import {
  CircleCheck,
  ClipboardList,
  Image,
  LucideAngularModule,
  Monitor,
  Save,
  UserRound,
  Wrench
} from 'lucide-angular';
import { HelpdeskFormData } from '../../../../core/models/master-data.model';
import { AssistFormService } from '../../state/assist-form.service';

@Component({
  selector: 'app-confirm',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './confirm.component.html',
  styleUrl: './confirm.component.scss'
})
export class ConfirmComponent {
  @Input() canSave = false;

  readonly checkIcon = CircleCheck;
  readonly clipboardIcon = ClipboardList;
  readonly imageIcon = Image;
  readonly monitorIcon = Monitor;
  readonly saveIcon = Save;
  readonly userIcon = UserRound;
  readonly wrenchIcon = Wrench;

  saveMessage = '';

  constructor(public readonly assistFormService: AssistFormService) {}

  get form(): HelpdeskFormData {
    return this.assistFormService.snapshot;
  }

  saveTicket(): void {
    if (!this.canSave) {
      this.saveMessage = 'Complete todos los pasos antes de guardar la solicitud.';
      return;
    }

    this.saveMessage = 'Solicitud lista para guardar.';
  }

  formatSize(size: number): string {
    if (size < 1024 * 1024) {
      return `${Math.max(1, Math.round(size / 1024))} KB`;
    }

    return `${(size / 1024 / 1024).toFixed(1)} MB`;
  }
}
