import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
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
import { AuthApiService } from '../../../features/auth/services/auth-api.service';
import { NavigationService } from '../../../core/services/navigation.service';
import { SystemAreaKey } from '../../../features/system-area/models/system-area.model';

type SidebarIcon = typeof CircleDollarSign;

interface SidebarChild {
  label: string;
  areaKey?: SystemAreaKey;
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
      name: 'Área Financiera',
      icon: CircleDollarSign,
      areaKey: 'financiera',
      children: []
    },
    {
      name: 'Área Administrativa',
      icon: Building2,
      areaKey: 'administrativa',
      children: []
    },
    {
      name: 'Área Operativa',
      icon: Settings,
      areaKey: 'operativa',
      children: [
        { label: 'Clientes', areaKey: 'operativa' },
        { label: 'Legal', areaKey: 'operativa' },
        { label: 'Cobranzas', areaKey: 'operativa' },
        { label: 'Productos', areaKey: 'operativa' },
        { label: 'Análisis de productos', areaKey: 'operativa' },
        { label: 'Compras', areaKey: 'operativa' },
        { label: 'Importaciones', areaKey: 'operativa' },
        { label: 'Logística & bodega', areaKey: 'operativa' },
        { label: 'Ventas', areaKey: 'operativa' },
        { label: 'Servicio al cliente', areaKey: 'operativa' },
        { label: 'Comisiones y bonos', areaKey: 'operativa' },
        { label: 'Servientrega', areaKey: 'operativa' },
        { label: 'Marketing', areaKey: 'operativa' },
        { label: 'Material Promocional', areaKey: 'operativa' }
      ]
    },
    {
      name: 'Área Gerencial',
      icon: ChartColumn,
      areaKey: 'gerencial',
      children: [
        { label: 'Gerencial', areaKey: 'gerencial' },
        { label: 'Business Intelligence', areaKey: 'gerencial' }
      ]
    },
    {
      name: 'Área del Sistema',
      icon: MonitorCog,
      areaKey: 'sistema',
      children: [
        { label: 'Desarrollo', areaKey: 'sistema' },
        { label: 'Generales', areaKey: 'sistema' },
        { label: 'Corrección de datos', areaKey: 'sistema' },
        { label: 'Help Desk', areaKey: 'sistema' },
        { label: 'Seguridad', areaKey: 'sistema' }
      ]
    }
  ];

  constructor(
    private readonly authApiService: AuthApiService,
    private readonly navigationService: NavigationService
  ) {}

  toggleArea(area: SidebarArea): void {
    this.activeArea = area.name;
    this.selectSection.emit(area.name);

    if (area.areaKey) {
      void this.navigationService.goToArea(area.areaKey);
    }

    if (!area.children.length) {
      this.expandedArea = null;
      this.activeChild = null;
      return;
    }

    this.expandedArea = this.expandedArea === area.name ? null : area.name;
  }

  selectChild(area: SidebarArea, child: SidebarChild): void {
    this.activeArea = area.name;
    this.activeChild = child.label;
    this.selectSection.emit(child.label);

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
}
