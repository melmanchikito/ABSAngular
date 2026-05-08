import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

export type StatCardTone = 'default' | 'active' | 'inactive' | 'warning';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stat-card.component.html',
  styleUrl: './stat-card.component.scss'
})
export class StatCardComponent {
  @Input() value: string | number = 0;
  @Input({ required: true }) label = '';
  @Input() tone: StatCardTone = 'default';
}
