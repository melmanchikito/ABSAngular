import { CommonModule } from '@angular/common';
import { Component, DestroyRef, EventEmitter, Input, Output, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import {
  ChartColumn,
  ChevronRight,
  CircleDollarSign,
  LogOut,
  LucideAngularModule,
  Mail,
  MonitorCog,
  Package,
  Users,
} from 'lucide-angular';
import { filter } from 'rxjs';
import { NavigationService } from '../../../core/services/navigation.service';
import { PreferencesService } from '../../../core/services/preferences.service';
import { AppTheme } from '../../../core/models/preferences.model';
import { AuthApiService } from '../../../features/auth/services/auth-api.service';
import { TranslatePipe } from '@ngx-translate/core';
import {
  SystemAreaKey,
  SystemAreaSubmoduleKey,
} from '../../../features/system-area/models/system-area.model';

type SidebarIcon = typeof CircleDollarSign;

interface SidebarChild {
  label: string;
  translationKey: string;
  areaKey?: SystemAreaKey;
  submoduleKey?: SystemAreaSubmoduleKey;
}

interface SidebarArea {
  name: string;
  translationKey: string;
  icon: SidebarIcon;
  areaKey?: SystemAreaKey;
  children: SidebarChild[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, TranslatePipe],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  private static readonly defaultLogo = 'assets/auth/LogoAR.svg';
  private static readonly darkLogo = 'assets/auth/Autoradiador_grande(blanco)2.png';

  @Input() collapsed = false;
  @Output() selectSection = new EventEmitter<string>();
  @Output() optionSelected = new EventEmitter<void>();

  activeArea: string | null = null;
  activeChild: string | null = null;
  expandedArea: string | null = null;
  sidebarLogoSrc = SidebarComponent.defaultLogo;

  readonly chevronRightIcon = ChevronRight;
  readonly mailIcon = Mail;
  readonly logoutIcon = LogOut;

  private readonly destroyRef = inject(DestroyRef);
  private readonly preferencesService = inject(PreferencesService);

  readonly areas: SidebarArea[] = [
    {
      name: 'Finanzas',
      translationKey: 'SIDEBAR.FINANCE',
      icon: CircleDollarSign,
      areaKey: 'finanzas',
      children: [
        { label: 'Contable y SRI', translationKey: 'SIDEBAR.ACCOUNTING_SRI', areaKey: 'finanzas', submoduleKey: 'contable-sri' },
        { label: 'Caja y Tesoreria', translationKey: 'SIDEBAR.CASH_TREASURY', areaKey: 'finanzas', submoduleKey: 'caja-tesoreria' },
      ],
    },
    {
      name: 'RRHH',
      translationKey: 'SIDEBAR.HR',
      icon: Users,
      areaKey: 'rrhh',
      children: [
        { label: 'Empleado', translationKey: 'SIDEBAR.EMPLOYEE', areaKey: 'rrhh', submoduleKey: 'empleado' },
        { label: 'Proveedores', translationKey: 'SIDEBAR.SUPPLIERS', areaKey: 'rrhh', submoduleKey: 'proveedores' },
        { label: 'Administracion', translationKey: 'SIDEBAR.ADMINISTRATION', areaKey: 'rrhh', submoduleKey: 'administracion' },
      ],
    },
    {
      name: 'Clientes',
      translationKey: 'SIDEBAR.CLIENTS',
      icon: Users,
      areaKey: 'clientes',
      children: [
        { label: 'Marketing', translationKey: 'SIDEBAR.MARKETING', areaKey: 'clientes', submoduleKey: 'marketing' },
        { label: 'Cobranza', translationKey: 'SIDEBAR.COLLECTIONS', areaKey: 'clientes', submoduleKey: 'cobranza' },
        { label: 'Codigo IMP', translationKey: 'SIDEBAR.IMP_CODE', areaKey: 'clientes', submoduleKey: 'codigo-imp' },
        { label: 'Legal', translationKey: 'SIDEBAR.LEGAL', areaKey: 'clientes', submoduleKey: 'legal' },
        { label: 'Comercial', translationKey: 'SIDEBAR.COMMERCIAL', areaKey: 'clientes', submoduleKey: 'comercial' },
      ],
    },
    {
      name: 'Producto',
      translationKey: 'SIDEBAR.PRODUCT',
      icon: Package,
      areaKey: 'producto',
      children: [
        {
          label: 'Produccion y Distribucion',
          translationKey: 'SIDEBAR.PRODUCTION_DISTRIBUTION',
          areaKey: 'producto',
          submoduleKey: 'produccion-distribucion',
        },
        {
          label: 'Compras e Importaciones',
          translationKey: 'SIDEBAR.PURCHASES_IMPORTS',
          areaKey: 'producto',
          submoduleKey: 'compras-importaciones',
        },
      ],
    },
    {
      name: 'Analisis',
      translationKey: 'SIDEBAR.ANALYSIS',
      icon: ChartColumn,
      areaKey: 'analisis',
      children: [{ label: 'AM y R', translationKey: 'SIDEBAR.AM_R', areaKey: 'analisis', submoduleKey: 'am-r' }],
    },
    {
      name: 'Sistema',
      translationKey: 'SIDEBAR.SYSTEM',
      icon: MonitorCog,
      areaKey: 'sistema',
      children: [
        { label: 'Configuracion', translationKey: 'SIDEBAR.CONFIGURATION', areaKey: 'sistema', submoduleKey: 'configuracion' },
        { label: 'Helpdesk', translationKey: 'SIDEBAR.HELPDESK', areaKey: 'sistema', submoduleKey: 'help-desk' },
        { label: 'Developer', translationKey: 'SIDEBAR.DEVELOPER', areaKey: 'sistema', submoduleKey: 'developer' },
      ],
    },
  ];

  constructor(
    private readonly authApiService: AuthApiService,
    private readonly navigationService: NavigationService,
    private readonly router: Router,
  ) {
    this.sidebarLogoSrc = this.getLogoForTheme(this.preferencesService.snapshot.theme);

    this.preferencesService.preferences$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((preferences) => {
        this.sidebarLogoSrc = this.getLogoForTheme(preferences.theme);
      });

    this.syncActiveState(this.router.url);

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((event) => this.syncActiveState(event.urlAfterRedirects));
  }

  toggleArea(area: SidebarArea): void {
    this.activeArea = area.name;
    this.selectSection.emit(area.name);

    if (!area.children.length) {
      this.expandedArea = null;
      this.activeChild = null;

      if (area.areaKey) {
        void this.navigationService.goToArea(area.areaKey);
      }

      this.optionSelected.emit();
      return;
    }

    this.expandedArea = this.expandedArea === area.name ? null : area.name;
  }

  selectChild(area: SidebarArea, child: SidebarChild): void {
    this.activeArea = area.name;
    this.activeChild = child.label;
    this.expandedArea = area.name;
    this.selectSection.emit(child.label);
    this.optionSelected.emit();

    if (child.areaKey && child.submoduleKey) {
      void this.navigationService.goToAreaSubmodule(child.areaKey, child.submoduleKey);
      return;
    }

    if (child.areaKey) {
      void this.navigationService.goToArea(child.areaKey);
    }
  }

  goToMail(): void {
    this.activeArea = 'Correo';
    this.activeChild = null;
    this.expandedArea = null;
    this.selectSection.emit('Correo');
    this.optionSelected.emit();

    void this.navigationService.goToMail();
  }

  async logout(): Promise<void> {
    await this.authApiService.handleLogout();
  }

  private syncActiveState(url: string): void {
    const normalizedUrl = url.split('?')[0].split('#')[0];

    const moduleRoot = normalizedUrl.startsWith('/main/modulo/')
      ? '/main/modulo'
      : normalizedUrl.startsWith('/main/area/')
        ? '/main/area'
        : null;

    if (moduleRoot) {
      const activeArea = this.areas.find(
        (area) => area.areaKey && normalizedUrl.startsWith(`${moduleRoot}/${area.areaKey}`),
      );

      if (activeArea) {
        const activeChild = activeArea.children.find((child) =>
          child.submoduleKey
            ? normalizedUrl.includes(`${moduleRoot}/${activeArea.areaKey}/${child.submoduleKey}`)
            : false,
        );

        this.activeArea = activeArea.name;
        this.expandedArea = activeArea.name;
        this.activeChild = activeChild?.label ?? null;
      }

      return;
    }

    if (normalizedUrl.startsWith('/main/tickets') || normalizedUrl.startsWith('/main/helpdesk')) {
      const systemArea = this.areas.find((area) => area.areaKey === 'sistema');

      if (systemArea) {
        this.activeArea = systemArea.name;
        this.expandedArea = systemArea.name;
        this.activeChild = 'Helpdesk';
      }

      return;
    }

    if (normalizedUrl.startsWith('/main/correo')) {
      this.activeArea = 'Correo';
      this.activeChild = null;
      this.expandedArea = null;
      return;
    }
  }

  private getLogoForTheme(theme: AppTheme): string {
    const useDarkLogo =
      theme === 'dark' ||
      theme === 'liquid-glass' ||
      (theme === 'system' && this.prefersDarkScheme());

    return useDarkLogo ? SidebarComponent.darkLogo : SidebarComponent.defaultLogo;
  }

  private prefersDarkScheme(): boolean {
    return (
      typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
    );
  }
}
