import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, LucideIconData } from 'lucide-angular';

export interface StepItem {
  label: string;
  icon: LucideIconData;
}

@Component({
  selector: 'app-stepper',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './stepper.component.html',
  styleUrl: './stepper.component.scss'
})
export class StepperComponent {
  @Input() steps: StepItem[] = [];
  @Input() activeStep = 0;
  @Input() canGoNext = true;
  @Input() enabledSteps: boolean[] = [];
  @Input() validationMessage = '';
  @Output() activeStepChange = new EventEmitter<number>();

  isStepEnabled(index: number): boolean {
    return this.enabledSteps[index] ?? index <= this.activeStep;
  }

  setStep(index: number): void {
    if (!this.isStepEnabled(index)) {
      return;
    }

    this.activeStepChange.emit(index);
  }

  nextStep(): void {
    if (this.activeStep < this.steps.length - 1 && this.canGoNext) {
      this.activeStepChange.emit(this.activeStep + 1);
    }
  }

  prevStep(): void {
    if (this.activeStep > 0) {
      this.activeStepChange.emit(this.activeStep - 1);
    }
  }
}
