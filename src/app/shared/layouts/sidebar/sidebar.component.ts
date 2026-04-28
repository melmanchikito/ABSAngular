import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthApiService } from '../../../features/auth/services/auth-api.service';
import { NavigationService } from '../../../core/services/navigation.service';

interface SidebarChild {
  label: string;
  route?: 'system-area';
}

interface SidebarArea {
  name: string;
  icon: string;
  children: SidebarChild[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  @Input() collapsed = false;
  @Output() selectSection = new EventEmitter<string>();

  activeArea: string | null = null;
  activeChild: string | null = null;
  expandedArea: string | null = null;

  readonly areas: SidebarArea[] = [
    {
      name: 'Área Financiera',
      icon: '💰',
      children: []
    },
    {
      name: 'Área Administrativa',
      icon: '🏢',
      children: []
    },
    {
      name: 'Área Operativa',
      icon: '⚙️',
      children: [
        { label: 'Clientes' },
        { label: 'Legal' },
        { label: 'Cobranzas' },
        { label: 'Productos' },
        { label: 'Análisis de productos' },
        { label: 'Compras' },
        { label: 'Importaciones' },
        { label: 'Logística & bodega' },
        { label: 'Ventas' },
        { label: 'Servicio al cliente' },
        { label: 'Comisiones y bonos' },
        { label: 'Servientrega' },
        { label: 'Marketing' },
        { label: 'Material Promocional' }
      ]
    },
    {
      name: 'Área Gerencial',
      icon: '📊',
      children: [
        { label: 'Gerencial' },
        { label: 'Business Intelligence' }
      ]
    },
    {
      name: 'Área del Sistema',
      icon: '🖥️',
      children: [
        { label: 'Desarrollo', route: 'system-area' },
        { label: 'Generales', route: 'system-area' },
        { label: 'Corrección de datos', route: 'system-area' },
        { label: 'Help Desk', route: 'system-area' },
        { label: 'Seguridad', route: 'system-area' }
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

    if (child.route === 'system-area') {
      void this.navigationService.goToSystemArea();
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