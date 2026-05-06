import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import {
  Building2,
  ChartColumn,
  ChevronRight,
  CircleDollarSign,
  LogOut,
  LucideAngularModule,
  MonitorCog,
  Settings,
  UserRound
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
  readonly profileIcon = UserRound;
  readonly logoutIcon = LogOut;

  readonly areas: SidebarArea[] = [
    {
      name: 'Area Financiera',
      icon: CircleDollarSign,
      areaKey: 'financiera',
      children: []
    },
    {
      name: 'Area Administrativa',
      icon: Building2,
      areaKey: 'administrativa',
      children: []
    },
    {
      name: 'Area Operativa',
      icon: Settings,
      areaKey: 'operativa',
      children: [
        { label: 'Clientes', areaKey: 'operativa' },
        { label: 'Legal', areaKey: 'operativa' },
        { label: 'Cobranzas', areaKey: 'operativa' },
        { label: 'Productos', areaKey: 'operativa' },
        { label: 'Analisis de productos', areaKey: 'operativa' },
        { label: 'Compras', areaKey: 'operativa' },
        { label: 'Importaciones', areaKey: 'operativa' },
        { label: 'Logistica & bodega', areaKey: 'operativa' },
        { label: 'Ventas', areaKey: 'operativa' },
        { label: 'Servicio al cliente', areaKey: 'operativa' },
        { label: 'Comisiones y bonos', areaKey: 'operativa' },
        { label: 'Servientrega', areaKey: 'operativa' },
        { label: 'Marketing', areaKey: 'operativa' },
        { label: 'Material Promocional', areaKey: 'operativa' }
      ]
    },
    {
      name: 'Area Gerencial',
      icon: ChartColumn,
      areaKey: 'gerencial',
      children: [
        { label: 'Gerencial', areaKey: 'gerencial' },
        { label: 'Business Intelligence', areaKey: 'gerencial' }
      ]
    },
    {
      name: 'Area del Sistema',
      icon: MonitorCog,
      areaKey: 'sistema',
      children: [
        { label: 'Desarrollo', areaKey: 'sistema', submoduleKey: 'desarrollo' },
        { label: 'Generales', areaKey: 'sistema', submoduleKey: 'generales' },
        { label: 'Correccion de datos', areaKey: 'sistema', submoduleKey: 'correccion-datos' },
        { label: 'Help Desk', areaKey: 'sistema', submoduleKey: 'help-desk' },
        { label: 'Seguridad', areaKey: 'sistema', submoduleKey: 'seguridad' }
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

  goToProfile(): void {
    this.activeArea = 'Perfil';
    this.activeChild = null;
    this.expandedArea = null;
    this.selectSection.emit('Perfil');

    void this.navigationService.goToProfile();
  }

  async logout(): Promise<void> {
    await this.authApiService.handleLogout();
  }

  private syncActiveState(url: string): void {
    const normalizedUrl = url.split('?')[0].split('#')[0];

    if (normalizedUrl.startsWith('/main/area/sistema')) {
      const systemArea = this.areas.find((area) => area.areaKey === 'sistema');
      const activeChild = systemArea?.children.find((child) =>
        child.submoduleKey
          ? normalizedUrl.includes(`/main/area/sistema/${child.submoduleKey}`)
          : false
      );

      if (systemArea) {
        this.activeArea = systemArea.name;
        this.expandedArea = systemArea.name;
        this.activeChild = activeChild?.label ?? null;
      }

      return;
    }

    if (normalizedUrl.startsWith('/main/helpdesk')) {
      const systemArea = this.areas.find((area) => area.areaKey === 'sistema');

      if (systemArea) {
        this.activeArea = systemArea.name;
        this.expandedArea = systemArea.name;
        this.activeChild = 'Help Desk';
      }

      return;
    }

    const activeArea = this.areas.find(
      (area) => area.areaKey && normalizedUrl.startsWith(`/main/area/${area.areaKey}`)
    );

    if (activeArea) {
      this.activeArea = activeArea.name;
      this.expandedArea = activeArea.children.length ? activeArea.name : null;
      this.activeChild = null;
    }
  }
}
