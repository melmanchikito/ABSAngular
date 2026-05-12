import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  ChevronsLeft,
  ChevronLeft,
  ChevronsRight,
  ChevronRight,
  LucideAngularModule
} from 'lucide-angular';

@Component({
  selector: 'app-data-grid-pagination',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './data-grid-pagination.component.html',
  styleUrl: './data-grid-pagination.component.scss'
})
export class DataGridPaginationComponent {
  @Input() showing = 0;
  @Input() totalItems = 0;
  @Input() itemLabel = 'registros';
  @Input() currentPage = 1;
  @Input() totalPages = 1;

  @Output() pageChange = new EventEmitter<number>();

  readonly firstIcon = ChevronsLeft;
  readonly previousIcon = ChevronLeft;
  readonly nextIcon = ChevronRight;
  readonly lastIcon = ChevronsRight;

  get safeCurrentPage(): number {
    return Math.min(Math.max(1, this.currentPage || 1), this.safeTotalPages);
  }

  get safeTotalPages(): number {
    return Math.max(1, this.totalPages || 1);
  }

  get isFirstPage(): boolean {
    return this.safeCurrentPage <= 1;
  }

  get isLastPage(): boolean {
    return this.safeCurrentPage >= this.safeTotalPages;
  }

  goToPage(page: number): void {
    const nextPage = Math.min(Math.max(1, page), this.safeTotalPages);

    if (nextPage === this.safeCurrentPage) {
      return;
    }

    this.pageChange.emit(nextPage);
  }

  goToFirst(): void {
    this.goToPage(1);
  }

  goBackFive(): void {
    this.goToPage(this.safeCurrentPage - 5);
  }

  goToPrevious(): void {
    this.goToPage(this.safeCurrentPage - 1);
  }

  goToNext(): void {
    this.goToPage(this.safeCurrentPage + 1);
  }

  goForwardFive(): void {
    this.goToPage(this.safeCurrentPage + 5);
  }

  goToLast(): void {
    this.goToPage(this.safeTotalPages);
  }
}
