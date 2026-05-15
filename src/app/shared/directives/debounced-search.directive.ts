import { Directive, EventEmitter, HostListener, Input, OnDestroy, Output } from '@angular/core';
import { Subject, Subscription, debounceTime, distinctUntilChanged, map } from 'rxjs';

@Directive({
  selector: 'input[appDebouncedSearch]',
  standalone: true
})
export class DebouncedSearchDirective implements OnDestroy {
  @Input() debounceMs = 250;
  @Output() debouncedSearch = new EventEmitter<string>();

  private readonly searchInput$ = new Subject<string>();
  private subscription?: Subscription;

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const value = event.target instanceof HTMLInputElement ? event.target.value : '';

    this.ensureSubscription();
    this.searchInput$.next(value);
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  private ensureSubscription(): void {
    if (this.subscription) {
      return;
    }

    this.subscription = this.searchInput$
      .pipe(
        debounceTime(Math.max(0, this.debounceMs || 0)),
        map((value) => value.trim().replace(/\s+/g, ' ')),
        distinctUntilChanged()
      )
      .subscribe((value) => this.debouncedSearch.emit(value));
  }
}
