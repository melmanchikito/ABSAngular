import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Camera, CircleCheck, Monitor, UserRound, Wrench } from 'lucide-angular';
import { StepperComponent, StepItem } from '../../../../shared/components/stepper/stepper.component';
import { ClientsComponent } from '../../components/clients/clients.component';
import { EquipmentComponent } from '../../components/equipment/equipment.component';
import { ProblemComponent } from '../../components/problem/problem.component';
import { ImagesComponent } from '../../components/images/images.component';
import { ConfirmComponent } from '../../components/confirm/confirm.component';
import { NavigationService } from '../../../../core/services/navigation.service';
import { AssistFormService } from '../../state/assist-form.service';

@Component({
  selector: 'app-assist',
  standalone: true,
  imports: [
    CommonModule,
    StepperComponent,
    ClientsComponent,
    EquipmentComponent,
    ProblemComponent,
    ImagesComponent,
    ConfirmComponent
  ],
  templateUrl: './assist.component.html',
  styleUrl: './assist.component.scss'
})
export class AssistComponent {
  activeStep = 0;
  validationMessage = '';

  steps: StepItem[] = [
    { label: 'Datos', icon: UserRound },
    { label: 'Equipo', icon: Monitor },
    { label: 'Problema', icon: Wrench },
    { label: 'Imágenes', icon: Camera },
    { label: 'Confirmar', icon: CircleCheck }
  ];

  constructor(
    private readonly navigationService: NavigationService,
    public readonly assistFormService: AssistFormService
  ) {}

  setActiveStep(step: number): void {
    if (step <= this.activeStep) {
      this.validationMessage = '';
      this.activeStep = step;
      return;
    }

    if (!this.canReachStep(step)) {
      return;
    }

    this.validationMessage = '';
    this.activeStep = step;
  }

  get canGoNext(): boolean {
    return this.isStepValid(this.activeStep);
  }

  get enabledSteps(): boolean[] {
    return this.steps.map((_, index) => index === 0 || this.arePreviousStepsValid(index));
  }

  get canSave(): boolean {
    return this.arePreviousStepsValid(this.steps.length - 1);
  }

  goToSystemArea(): void {
    void this.navigationService.goToSystemArea();
  }

  private canReachStep(step: number): boolean {
    if (this.arePreviousStepsValid(step)) {
      return true;
    }

    this.validationMessage = this.getStepMessage(this.firstInvalidStepBefore(step));
    return false;
  }

  private arePreviousStepsValid(step: number): boolean {
    for (let index = 0; index < step; index++) {
      if (!this.isStepValid(index)) {
        return false;
      }
    }

    return true;
  }

  private firstInvalidStepBefore(step: number): number {
    for (let index = 0; index < step; index++) {
      if (!this.isStepValid(index)) {
        return index;
      }
    }

    return 0;
  }

  private isStepValid(step: number): boolean {
    const form = this.assistFormService.snapshot;

    switch (step) {
      case 0:
        return Boolean(
          form.dateInit &&
          form.dateEnd &&
          form.employeeId &&
          form.companyId &&
          form.branchId &&
          form.departmentId &&
          form.priority &&
          (form.isOwner || form.ownerId)
        );

      case 1:
        return Boolean(form.selectedDevice?.id);

      case 2:
        return Boolean(
          form.selectedCategory?.id &&
          form.selectedProblem?.id &&
          form.selectedTicketDt?.issue_description?.trim() &&
          form.selectedTicketDt?.solution_description?.trim() &&
          form.selectedTicketDt?.observation?.trim()
        );

      case 3:
        return true;

      case 4:
        return this.arePreviousStepsValid(4);

      default:
        return false;
    }
  }

  private getStepMessage(step: number): string {
    const messages = [
      'Completa todos los datos del solicitante antes de continuar.',
      'Selecciona un equipo antes de pasar al problema.',
      'Completa categoría, problema, descripción, solución y observación.',
      'Puedes agregar imágenes o continuar sin adjuntos.',
      'Revisa la información antes de guardar.'
    ];

    return messages[step] ?? 'Completa la información requerida.';
  }
}
