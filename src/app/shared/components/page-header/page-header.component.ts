import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { LucideAngularModule, LucideIconData } from 'lucide-angular';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './page-header.component.html',
  styleUrl: './page-header.component.scss'
})
export class PageHeaderComponent {
  @Input({ required: true }) title = '';
  @Input() subtitle = '';
  @Input() eyebrow = '';
  @Input() breadcrumb: readonly string[] | string | null = null;
  @Input() icon: LucideIconData | null = null;

  constructor(private readonly router: Router) {}

  get breadcrumbParts(): string[] {
    const explicitParts = this.normalizeBreadcrumb(this.breadcrumb);
    const baseParts = explicitParts.length
      ? explicitParts
      : this.normalizeBreadcrumb(this.eyebrow).length
        ? this.normalizeBreadcrumb(this.eyebrow)
        : this.createBreadcrumbFromUrl();

    const parts = [...baseParts, this.title]
      .map((part) => part.trim())
      .filter(Boolean);

    return parts.filter((part, index) => index === 0 || part !== parts[index - 1]);
  }

  private normalizeBreadcrumb(value: readonly string[] | string | null | undefined): string[] {
    if (Array.isArray(value)) {
      return value.map((part) => String(part).trim()).filter(Boolean);
    }

    return String(value ?? '')
      .split('/')
      .map((part) => part.trim())
      .filter(Boolean);
  }

  private createBreadcrumbFromUrl(): string[] {
    return this.router.url
      .split('?')[0]
      .split('/')
      .filter((segment) => segment && !['main', 'modulo', 'area'].includes(segment))
      .map((segment) => this.humanizeSegment(segment));
  }

  private humanizeSegment(segment: string): string {
    return decodeURIComponent(segment)
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }
}
