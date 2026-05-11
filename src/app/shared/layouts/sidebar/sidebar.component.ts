import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
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
  Users
} from 'lucide-angular';
import { filter } from 'rxjs';
import { NavigationService } from '../../../core/services/navigation.service';
import { AuthApiService } from '../../../features/auth/services/auth-api.service';
import {
  SystemAreaKey,
  SystemAreaSubmoduleKey
} from '../../../features/system-area/models/system-area.model';

type SidebarIcon = typeof CircleDollarSign;

interface SidebarChild {
  label: string;
  areaKey?: SystemAreaKey;
  submoduleKey?: SystemAreaSubmoduleKey;
}

interface SidebarArea {
  name: string;
  icon: SidebarIcon;
  areaKey?: SystemAreaKey;
  children: SidebarChild[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  @Input() collapsed = false;
  @Output() selectSection = new EventEmitter<string>();

  activeArea: string | null = null;
  activeChild: string | null = null;
  expandedArea: string | null = null;

  readonly chevronRightIcon = ChevronRight;
  readonly mailIcon = Mail;
  readonly logoutIcon = LogOut;

  readonly areas: SidebarArea[] = [
    {
      name: 'Finanzas',
      icon: CircleDollarSign,
      areaKey: 'finanzas',
      children: [
        { label: 'Contable y SRI', areaKey: 'finanzas', submoduleKey: 'contable-sri' },
        { label: 'Caja y Tesoreria', areaKey: 'finanzas', submoduleKey: 'caja-tesoreria' }
      ]
    },
    {
      name: 'RRHH',
      icon: Users,
      areaKey: 'rrhh',
      children: [
        { label: 'Empleado', areaKey: 'rrhh', submoduleKey: 'empleado' },
        { label: 'Proveedores', areaKey: 'rrhh', submoduleKey: 'proveedores' },
        { label: 'Administracion', areaKey: 'rrhh', submoduleKey: 'administracion' }
      ]
    },
    {
      name: 'Clientes',
      icon: Users,
      areaKey: 'clientes',
      children: [
        { label: 'Marketing', areaKey: 'clientes', submoduleKey: 'marketing' },
        { label: 'Cobranza', areaKey: 'clientes', submoduleKey: 'cobranza' },
        { label: 'Codigo IMP', areaKey: 'clientes', submoduleKey: 'codigo-imp' },
        { label: 'Legal', areaKey: 'clientes', submoduleKey: 'legal' }
      ]
    },
    {
      name: 'Producto',
      icon: Package,
      areaKey: 'producto',
      children: [
        {
          label: 'Produccion y Distribucion',
          areaKey: 'producto',
          submoduleKey: 'produccion-distribucion'
        },
        {
          label: 'Compras e Importaciones',
          areaKey: 'producto',
          submoduleKey: 'compras-importaciones'
        }
      ]
    },
    {
      name: 'Analisis',
      icon: ChartColumn,
      areaKey: 'analisis',
      children: [
        { label: 'AM y R', areaKey: 'analisis', submoduleKey: 'am-r' }
      ]
    },
    {
      name: 'Sistema',
      icon: MonitorCog,
      areaKey: 'sistema',
      children: [
        { label: 'Configuracion', areaKey: 'sistema', submoduleKey: 'configuracion' },
        { label: 'Helpdesk', areaKey: 'sistema', submoduleKey: 'help-desk' },
        { label: 'Developer', areaKey: 'sistema', submoduleKey: 'developer' }
      ]
    }
  ];

  constructor(
    private readonly authApiService: AuthApiService,
    private readonly navigationService: NavigationService,
    private readonly router: Router
  ) {
    this.syncActiveState(this.router.url);

    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
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

      return;
    }

    this.expandedArea = this.expandedArea === area.name ? null : area.name;
  }

  selectChild(area: SidebarArea, child: SidebarChild): void {
    this.activeArea = area.name;
    this.activeChild = child.label;
    this.expandedArea = area.name;
    this.selectSection.emit(child.label);

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
        (area) => area.areaKey && normalizedUrl.startsWith(`${moduleRoot}/${area.areaKey}`)
      );

      if (activeArea) {
        const activeChild = activeArea.children.find((child) =>
          child.submoduleKey
            ? normalizedUrl.includes(`${moduleRoot}/${activeArea.areaKey}/${child.submoduleKey}`)
            : false
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
}
