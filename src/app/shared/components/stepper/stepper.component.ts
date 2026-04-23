import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface StepItem {
  label: string;
  icon: string;
}

@Component({
  selector: 'app-stepper',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stepper.component.html',
  styleUrl: './stepper.component.scss'
})
export class StepperComponent {
  @Input() steps: StepItem[] = [];
  @Input() activeStep = 0;
  @Output() activeStepChange = new EventEmitter<number>();

  setStep(index: number): void {
    this.activeStepChange.emit(index);
  }

  nextStep(): void {
    if (this.activeStep < this.steps.length - 1) {
      this.activeStepChange.emit(this.activeStep + 1);
    }
  }

  prevStep(): void {
    if (this.activeStep > 0) {
      this.activeStepChange.emit(this.activeStep - 1);
    }
  }
}