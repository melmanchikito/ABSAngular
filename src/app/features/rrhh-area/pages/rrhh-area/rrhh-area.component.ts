import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { PreferencesService } from '../../../../core/services/preferences.service';
import {
  DEFAULT_RRHH_SUBMODULE_KEY,
  isRrhhAreaSubmoduleKey,
  RRHH_AREA_CONFIG
} from '../../config/rrhh-area.config';
import {
  RrhhAreaCategory,
  RrhhAreaCategoryKey,
  RrhhAreaConfig,
  RrhhAreaOption,
  RrhhAreaSubmodule
} from '../../models/rrhh-area.model';

@Component({
  selector: 'app-rrhh-area',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './rrhh-area.component.html',
  styleUrl: './rrhh-area.component.scss'
})
export class RrhhAreaComponent {
  area: RrhhAreaConfig = RRHH_AREA_CONFIG;
  submodule: RrhhAreaSubmodule | null = null;
  activeCategory: RrhhAreaCategoryKey = 'mantenimientos';
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
            '/main/modulo/rrhh',
            DEFAULT_RRHH_SUBMODULE_KEY
          ]);
          return;
        }

        if (!isRrhhAreaSubmoduleKey(submoduleKey)) {
          void this.router.navigate([
            '/main/modulo/rrhh',
            DEFAULT_RRHH_SUBMODULE_KEY
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

  get categories(): RrhhAreaCategory[] {
    return this.submodule?.categories ?? [];
  }

  get pageIcon() {
    return this.submodule?.icon ?? this.area.icon;
  }

  get pageSubtitle(): string {
    return this.submodule?.description ?? this.area.subtitle;
  }

  get activeCategoryConfig(): RrhhAreaCategory {
    return (
      this.categories.find((category) => category.key === this.activeCategory) ??
      this.categories[0]
    );
  }

  get activeOptions(): RrhhAreaOption[] {
    return this.activeCategoryConfig?.options ?? [];
  }

  selectCategory(category: RrhhAreaCategory): void {
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

  async selectOption(option: RrhhAreaOption): Promise<void> {
    if (!option.route) {
      return;
    }

    await this.router.navigateByUrl(option.route);
  }
}
