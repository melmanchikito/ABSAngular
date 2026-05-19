import { CommonModule } from '@angular/common';
import { Component, DestroyRef, ElementRef, ViewChild, inject } from '@angular/core';
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
  categories: ClientsAreaCategory[] = [];
  activeCategory: ClientsAreaCategoryKey = 'mantenimientos';
  contentCategory: ClientsAreaCategoryKey = 'mantenimientos';
  pageIcon = this.area.icon;
  pageSubtitle = this.area.subtitle;
  pageBreadcrumb: string[] = [];
  activeCategoryConfig: ClientsAreaCategory = {
    key: 'mantenimientos',
    label: 'Mantenimientos',
    description: '',
    icon: this.area.icon,
    options: []
  };
  activeOptions: ClientsAreaOption[] = [];
  activeOptionCards: Array<{
    option: ClientsAreaOption;
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

  selectCategory(category: ClientsAreaCategory): void {
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

  async selectOption(option: ClientsAreaOption): Promise<void> {
    if (!option.route) {
      return;
    }

    await this.router.navigateByUrl(option.route);
  }

  trackCategory(_index: number, category: ClientsAreaCategory): ClientsAreaCategoryKey {
    return category.key;
  }

  trackOptionCard(
    _index: number,
    card: { key: string; option: ClientsAreaOption; animationDelay: number }
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
