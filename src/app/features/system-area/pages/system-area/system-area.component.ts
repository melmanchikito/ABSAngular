import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import {
  DEFAULT_SYSTEM_SUBMODULE_KEY,
  DEFAULT_SYSTEM_AREA_KEY,
  isSystemAreaKey,
  isSystemAreaSubmoduleKey,
  SYSTEM_AREA_CONFIG
} from '../../config/system-area.config';
import {
  SystemAreaCategory,
  SystemAreaCategoryKey,
  SystemAreaConfig,
  SystemAreaOption,
  SystemAreaSubmodule
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
  submodule: SystemAreaSubmodule | null = null;
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
        const submoduleKey = params.get('submoduleKey');

        if (!isSystemAreaKey(areaKey)) {
          void this.router.navigate([
            '/main/area',
            DEFAULT_SYSTEM_AREA_KEY,
            DEFAULT_SYSTEM_SUBMODULE_KEY
          ]);
          return;
        }

        this.area = SYSTEM_AREA_CONFIG[areaKey];

        if (this.area.submodules?.length && !submoduleKey) {
          void this.router.navigate([
            '/main/area',
            areaKey,
            this.area.defaultSubmoduleKey ?? DEFAULT_SYSTEM_SUBMODULE_KEY
          ]);
          return;
        }

        if (submoduleKey && !isSystemAreaSubmoduleKey(areaKey, submoduleKey)) {
          void this.router.navigate([
            '/main/area',
            areaKey,
            this.area.defaultSubmoduleKey ?? DEFAULT_SYSTEM_SUBMODULE_KEY
          ]);
          return;
        }

        this.submodule =
          this.area.submodules?.find((item) => item.key === submoduleKey) ?? null;
        this.activeCategory = this.categories[0]?.key ?? 'mantenimientos';
      });
  }

  get categories(): SystemAreaCategory[] {
    return this.submodule?.categories ?? this.area.categories;
  }

  get pageIcon() {
    return this.submodule?.icon ?? this.area.icon;
  }

  get pageSubtitle(): string {
    return this.submodule?.description ?? this.area.subtitle;
  }

  get activeCategoryConfig(): SystemAreaCategory {
    return (
      this.categories.find((category) => category.key === this.activeCategory) ??
      this.categories[0]
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
