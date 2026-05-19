import { CommonModule } from '@angular/common';
import { Component, DestroyRef, ElementRef, ViewChild, inject } from '@angular/core';
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
import { PreferencesService } from '../../../../core/services/preferences.service';

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
  categories: SystemAreaCategory[] = [];
  activeCategory: SystemAreaCategoryKey = 'mantenimientos';
  contentCategory: SystemAreaCategoryKey = 'mantenimientos';
  pageIcon = this.area.icon;
  pageSubtitle = this.area.subtitle;
  pageBreadcrumb: string[] = [];
  activeCategoryConfig: SystemAreaCategory = {
    key: 'mantenimientos',
    label: 'Mantenimientos',
    description: '',
    icon: this.area.icon,
    options: []
  };
  activeOptions: SystemAreaOption[] = [];
  activeOptionCards: Array<{
    option: SystemAreaOption;
    animationDelay: number;
    key: string;
  }> = [];
  isCategoryExiting = false;
  isCategoryEntering = false;
  contentAnimationCycle = 0;
  contentMinHeight = 0;

  @ViewChild('contentCard')
  private readonly contentCard?: ElementRef<HTMLElement>;

  private readonly destroyRef = inject(DestroyRef);
  private categoryTransitionTimer?: ReturnType<typeof setTimeout>;
  private categoryEnterTimer?: ReturnType<typeof setTimeout>;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly preferencesService: PreferencesService
  ) {
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        const areaKey = params.get('moduleKey') ?? params.get('areaKey');
        const submoduleKey = params.get('submoduleKey');

        if (!isSystemAreaKey(areaKey)) {
          void this.router.navigate([
            '/main/modulo',
            DEFAULT_SYSTEM_AREA_KEY,
            DEFAULT_SYSTEM_SUBMODULE_KEY
          ]);
          return;
        }

        this.area = SYSTEM_AREA_CONFIG[areaKey];

        if (this.area.submodules?.length && !submoduleKey) {
          void this.router.navigate([
            '/main/modulo',
            areaKey,
            this.area.defaultSubmoduleKey ?? DEFAULT_SYSTEM_SUBMODULE_KEY
          ]);
          return;
        }

        if (submoduleKey && !isSystemAreaSubmoduleKey(areaKey, submoduleKey)) {
          void this.router.navigate([
            '/main/modulo',
            areaKey,
            this.area.defaultSubmoduleKey ?? DEFAULT_SYSTEM_SUBMODULE_KEY
          ]);
          return;
        }

        this.submodule = this.area.submodules?.find((item) => item.key === submoduleKey) ?? null;
        this.syncAreaView();
        this.contentAnimationCycle += 1;
      });

    this.destroyRef.onDestroy(() => {
      if (this.categoryTransitionTimer) {
        clearTimeout(this.categoryTransitionTimer);
      }

      if (this.categoryEnterTimer) {
        clearTimeout(this.categoryEnterTimer);
      }
    });
  }

  selectCategory(category: SystemAreaCategory): void {
    if (category.key === this.activeCategory) {
      return;
    }

    if (!this.preferencesService.snapshot.showAnimations) {
      this.activeCategory = category.key;
      this.contentCategory = category.key;
      this.isCategoryExiting = false;
      this.isCategoryEntering = false;
      this.contentMinHeight = 0;
      this.syncActiveContent();
      this.contentAnimationCycle += 1;
      return;
    }

    this.clearCategoryTimers();
    this.lockContentHeight();

    this.activeCategory = category.key;
    this.isCategoryExiting = true;
    this.isCategoryEntering = false;

    this.categoryTransitionTimer = setTimeout(() => {
      this.contentCategory = category.key;
      this.syncActiveContent();
      this.contentAnimationCycle += 1;
      this.isCategoryExiting = false;
      this.isCategoryEntering = true;

      this.categoryEnterTimer = setTimeout(() => {
        this.isCategoryEntering = false;
        this.contentMinHeight = 0;
      }, 560);
    }, 180);
  }

  async selectOption(option: SystemAreaOption): Promise<void> {
    if (!option.route) {
      return;
    }

    await this.router.navigateByUrl(option.route);
  }

  trackCategory(_index: number, category: SystemAreaCategory): SystemAreaCategoryKey {
    return category.key;
  }

  trackOptionCard(
    _index: number,
    card: { key: string; option: SystemAreaOption; animationDelay: number }
  ): string {
    return card.key;
  }

  private syncAreaView(): void {
    this.clearCategoryTimers();
    this.isCategoryExiting = false;
    this.isCategoryEntering = false;
    this.contentMinHeight = 0;
    this.categories = this.submodule?.categories ?? this.area.categories;
    this.activeCategory = this.categories[0]?.key ?? 'mantenimientos';
    this.contentCategory = this.activeCategory;
    this.pageIcon = this.submodule?.icon ?? this.area.icon;
    this.pageSubtitle = this.submodule?.description ?? this.area.subtitle;
    this.pageBreadcrumb = [this.area.title, this.submodule?.label ?? 'General'].filter(Boolean);
    this.syncActiveContent();
  }

  private syncActiveContent(): void {
    this.activeCategoryConfig =
      this.categories.find((category) => category.key === this.contentCategory) ??
      this.categories[0] ??
      this.activeCategoryConfig;
    this.activeOptions = this.activeCategoryConfig.options;
    this.activeOptionCards = this.activeOptions.map((option, index) => ({
      option,
      animationDelay: 45 + index * 55,
      key: `${option.route ?? 'static'}-${option.label}-${index}`
    }));
  }

  private lockContentHeight(): void {
    this.contentMinHeight = this.contentCard?.nativeElement.offsetHeight ?? 0;
  }

  private clearCategoryTimers(): void {
    if (this.categoryTransitionTimer) {
      clearTimeout(this.categoryTransitionTimer);
      this.categoryTransitionTimer = undefined;
    }

    if (this.categoryEnterTimer) {
      clearTimeout(this.categoryEnterTimer);
      this.categoryEnterTimer = undefined;
    }
  }
}
