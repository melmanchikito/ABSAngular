import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

export type StatusBadgeVariant = 'active' | 'inactive' | 'warning' | 'neutral';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './status-badge.component.html',
  styleUrl: './status-badge.component.scss'
})
export class StatusBadgeComponent {
  @Input({ required: true }) label = '';
  @Input() variant: StatusBadgeVariant = 'neutral';
}
