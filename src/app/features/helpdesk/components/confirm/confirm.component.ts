import { Component } from '@angular/core';
import { CommonModule, JsonPipe } from '@angular/common';
import { AssistFormService } from '../../state/assist-form.service';

@Component({
  selector: 'app-confirm',
  standalone: true,
  imports: [CommonModule, JsonPipe],
  templateUrl: './confirm.component.html',
  styleUrl: './confirm.component.scss'
})
export class ConfirmComponent {
  constructor(public readonly assistFormService: AssistFormService) {}
}