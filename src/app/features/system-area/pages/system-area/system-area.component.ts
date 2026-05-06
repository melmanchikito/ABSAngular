import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import {
  DEFAULT_SYSTEM_AREA_KEY,
  isSystemAreaKey,
  SYSTEM_AREA_CONFIG
} from '../../config/system-area.config';
import {
  SystemAreaCategory,
  SystemAreaCategoryKey,
  SystemAreaConfig,
  SystemAreaOption
} from '../../models/system-area.model';

@Component({
  selector: 'app-system-area',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './system-area.component.html',
  styleUrl: './system-area.component.scss'
})
export class SystemAreaComponent {
  area: SystemAreaConfig = SYSTEM_AREA_CONFIG[DEFAULT_SYSTEM_AREA_KEY];
  activeCategory: SystemAreaCategoryKey = 'mantenimientos';

  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        const areaKey = params.get('areaKey');

        if (!isSystemAreaKey(areaKey)) {
          this.area = SYSTEM_AREA_CONFIG[DEFAULT_SYSTEM_AREA_KEY];
          this.activeCategory = this.area.categories[0]?.key ?? 'mantenimientos';
          return;
        }

        this.area = SYSTEM_AREA_CONFIG[areaKey];
        this.activeCategory = this.area.categories[0]?.key ?? 'mantenimientos';
      });
  }

  get activeCategoryConfig(): SystemAreaCategory {
    return (
      this.area.categories.find((category) => category.key === this.activeCategory) ??
      this.area.categories[0]
    );
  }

  get activeOptions(): SystemAreaOption[] {
    return this.activeCategoryConfig?.options ?? [];
  }

  selectCategory(category: SystemAreaCategory): void {
    this.activeCategory = category.key;
  }

  async selectOption(option: SystemAreaOption): Promise<void> {
    if (!option.route) {
      return;
    }

    await this.router.navigateByUrl(option.route);
  }
}
