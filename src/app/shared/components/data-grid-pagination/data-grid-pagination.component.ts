import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

interface PaginationItem {
  type: 'page' | 'ellipsis';
  key: string;
  page: number;
}

@Component({
  selector: 'app-data-grid-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './data-grid-pagination.component.html',
  styleUrl: './data-grid-pagination.component.scss'
})
export class DataGridPaginationComponent {
  @Input() showing = 0;
  @Input() pageSize = 0;
  @Input() totalItems = 0;
  @Input() itemLabel = 'registros';
  @Input() currentPage = 1;
  @Input() totalPages = 1;

  @Output() pageChange = new EventEmitter<number>();

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

  get safePageSize(): number {
    const explicitPageSize = Math.max(0, this.pageSize || 0);

    if (explicitPageSize) {
      return explicitPageSize;
    }

    return Math.max(1, this.showing || 1);
  }

  get firstVisibleRecord(): number {
    if (!this.safeTotalItems || !this.showing) {
      return 0;
    }

    return (this.safeCurrentPage - 1) * this.safePageSize + 1;
  }

  get lastVisibleRecord(): number {
    if (!this.safeTotalItems || !this.showing) {
      return 0;
    }

    return Math.min(this.firstVisibleRecord + Math.max(0, this.showing) - 1, this.safeTotalItems);
  }

  get safeTotalItems(): number {
    return Math.max(0, this.totalItems || 0);
  }

  get rangeLabel(): string {
    const label = this.safeTotalItems === 1 ? 'registro' : this.itemLabel || 'registros';

    return `Mostrando ${this.firstVisibleRecord}-${this.lastVisibleRecord} de ${this.safeTotalItems} ${label}`;
  }

  get paginationItems(): PaginationItem[] {
    const total = this.safeTotalPages;
    const current = this.safeCurrentPage;

    if (total <= 6) {
      return this.createPageRange(1, total).map((page) => this.createPageItem(page));
    }

    const visiblePages = new Set<number>([1, total]);
    const windowStart = Math.max(2, current - 1);
    const windowEnd = Math.min(total - 1, current + 1);

    if (current <= 3) {
      this.createPageRange(1, 3).forEach((page) => visiblePages.add(page));
    } else if (current >= total - 2) {
      this.createPageRange(total - 2, total).forEach((page) => visiblePages.add(page));
    } else {
      this.createPageRange(windowStart, windowEnd).forEach((page) => visiblePages.add(page));
    }

    const orderedPages = Array.from(visiblePages).sort((left, right) => left - right);
    const items: PaginationItem[] = [];

    orderedPages.forEach((page, index) => {
      const previousPage = orderedPages[index - 1];

      if (previousPage && page - previousPage > 1) {
        items.push({ type: 'ellipsis', key: `ellipsis-${previousPage}-${page}`, page: 0 });
      }

      items.push(this.createPageItem(page));
    });

    return items;
  }

  get legacyCountLabel(): string {
    const total = Math.max(0, this.totalItems || 0);
    const label = total === 1 ? 'registro' : 'registros';

    return `${total} ${label}`;
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

  trackByPaginationItem(_: number, item: PaginationItem): string {
    return item.key;
  }

  private createPageRange(start: number, end: number): number[] {
    return Array.from({ length: Math.max(0, end - start + 1) }, (_, index) => start + index);
  }

  private createPageItem(page: number): PaginationItem {
    return {
      type: 'page',
      key: `page-${page}`,
      page
    };
  }
}
