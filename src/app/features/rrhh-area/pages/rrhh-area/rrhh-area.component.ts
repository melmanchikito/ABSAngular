import { CommonModule } from '@angular/common';
import { Component, DestroyRef, ElementRef, ViewChild, inject } from '@angular/core';
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
  categories: RrhhAreaCategory[] = [];
  activeCategory: RrhhAreaCategoryKey = 'mantenimientos';
  contentCategory: RrhhAreaCategoryKey = 'mantenimientos';
  pageIcon = this.area.icon;
  pageSubtitle = this.area.subtitle;
  pageBreadcrumb: string[] = [];
  activeCategoryConfig: RrhhAreaCategory = {
    key: 'mantenimientos',
    label: 'Mantenimientos',
    description: '',
    icon: this.area.icon,
    options: []
  };
  activeOptions: RrhhAreaOption[] = [];
  activeOptionCards: Array<{
    option: RrhhAreaOption;
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

        this.submodule = this.area.submodules.find((item) => item.key === submoduleKey) ?? null;
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

  selectCategory(category: RrhhAreaCategory): void {
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

  async selectOption(option: RrhhAreaOption): Promise<void> {
    if (!option.route) {
      return;
    }

    await this.router.navigateByUrl(option.route);
  }

  trackCategory(_index: number, category: RrhhAreaCategory): RrhhAreaCategoryKey {
    return category.key;
  }

  trackOptionCard(
    _index: number,
    card: { key: string; option: RrhhAreaOption; animationDelay: number }
  ): string {
    return card.key;
  }

  private syncAreaView(): void {
    this.clearCategoryTimers();
    this.isCategoryExiting = false;
    this.isCategoryEntering = false;
    this.contentMinHeight = 0;
    this.categories = this.submodule?.categories ?? [];
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
