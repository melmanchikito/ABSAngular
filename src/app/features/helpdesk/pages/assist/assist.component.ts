import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StepperComponent, StepItem } from '../../../../shared/components/stepper/stepper.component';
import { ClientsComponent } from '../../components/clients/clients.component';
import { EquipmentComponent } from '../../components/equipment/equipment.component';
import { ProblemComponent } from '../../components/problem/problem.component';
import { ConfirmComponent } from '../../components/confirm/confirm.component';

@Component({
  selector: 'app-assist',
  standalone: true,
  imports: [
    CommonModule,
    StepperComponent,
    ClientsComponent,
    EquipmentComponent,
    ProblemComponent,
    ConfirmComponent
  ],
  templateUrl: './assist.component.html',
  styleUrl: './assist.component.scss'
})
export class AssistComponent {
  activeStep = 0;

  steps: StepItem[] = [
    { label: 'Datos', icon: '👤' },
    { label: 'Equipo', icon: '💻' },
    { label: 'Problema', icon: '⚠️' },
    { label: 'Confirmar', icon: '📨' }
  ];

  setActiveStep(step: number): void {
    this.activeStep = step;
  }
}