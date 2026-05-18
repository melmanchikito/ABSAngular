import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { PreferencesService } from '../../../../core/services/preferences.service';
import {
  CLIENTS_AREA_CONFIG,
  DEFAULT_CLIENTS_SUBMODULE_KEY,
  isClientsAreaSubmoduleKey
} from '../../config/clients-area.config';
import {
  ClientsAreaCategory,
  ClientsAreaCategoryKey,
  ClientsAreaConfig,
  ClientsAreaOption,
  ClientsAreaSubmodule
} from '../../models/clients-area.model';

@Component({
  selector: 'app-clients-area',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './clients-area.component.html',
  styleUrl: './clients-area.component.scss'
})
export class ClientsAreaComponent {
  area: ClientsAreaConfig = CLIENTS_AREA_CONFIG;
  submodule: ClientsAreaSubmodule | null = null;
  activeCategory: ClientsAreaCategoryKey = 'mantenimientos';
  isCategoryExiting = false;
  contentAnimationCycle = 0;

  private readonly destroyRef = inject(DestroyRef);
  private categoryTransitionTimer?: ReturnType<typeof setTimeout>;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly preferencesService: PreferencesService
  ) {
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        const submoduleKey = params.get('submoduleKey');

        if (!submoduleKey) {
          void this.router.navigate([
            '/main/modulo/clientes',
            DEFAULT_CLIENTS_SUBMODULE_KEY
          ]);
          return;
        }

        if (!isClientsAreaSubmoduleKey(submoduleKey)) {
          void this.router.navigate([
            '/main/modulo/clientes',
            DEFAULT_CLIENTS_SUBMODULE_KEY
          ]);
          return;
        }

        this.submodule =
          this.area.submodules.find((item) => item.key === submoduleKey) ?? null;
        this.activeCategory = this.categories[0]?.key ?? 'mantenimientos';
        this.contentAnimationCycle += 1;
      });

    this.destroyRef.onDestroy(() => {
      if (this.categoryTransitionTimer) {
        clearTimeout(this.categoryTransitionTimer);
      }
    });
  }

  get categories(): ClientsAreaCategory[] {
    return this.submodule?.categories ?? [];
  }

  get pageIcon() {
    return this.submodule?.icon ?? this.area.icon;
  }

  get pageSubtitle(): string {
    return this.submodule?.description ?? this.area.subtitle;
  }

  get pageBreadcrumb(): string[] {
    return [this.area.title, this.submodule?.label ?? 'General'].filter(Boolean);
  }

  get activeCategoryConfig(): ClientsAreaCategory {
    return (
      this.categories.find((category) => category.key === this.activeCategory) ??
      this.categories[0]
    );
  }

  get activeOptions(): ClientsAreaOption[] {
    return this.activeCategoryConfig?.options ?? [];
  }

  selectCategory(category: ClientsAreaCategory): void {
    if (category.key === this.activeCategory) {
      return;
    }

    if (!this.preferencesService.snapshot.showAnimations) {
      this.activeCategory = category.key;
      this.contentAnimationCycle += 1;
      return;
    }

    if (this.categoryTransitionTimer) {
      clearTimeout(this.categoryTransitionTimer);
    }

    this.isCategoryExiting = true;

    this.categoryTransitionTimer = setTimeout(() => {
      this.activeCategory = category.key;
      this.contentAnimationCycle += 1;
      this.isCategoryExiting = false;
    }, 150);
  }

  async selectOption(option: ClientsAreaOption): Promise<void> {
    if (!option.route) {
      return;
    }

    await this.router.navigateByUrl(option.route);
  }
}
