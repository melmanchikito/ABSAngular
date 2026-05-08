import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {
  BarChart3,
  Bell,
  Cake,
  ChartColumn,
  CircleDollarSign,
  Clock3,
  LucideAngularModule,
  MonitorCog,
  Package,
  Users
} from 'lucide-angular';
import { AuthService } from '../../../../core/services/auth.service';

interface HomeMetric {
  label: string;
  value: string;
  helper: string;
}

interface QuickAccess {
  label: string;
  description: string;
  route: string;
  icon: typeof CircleDollarSign;
}

interface RecentActivity {
  title: string;
  detail: string;
  time: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  readonly bellIcon = Bell;
  readonly birthdayIcon = Cake;
  readonly chartIcon = BarChart3;
  readonly clockIcon = Clock3;

  readonly metrics: HomeMetric[] = [
    { label: 'Modulos disponibles', value: '6', helper: 'Accesos principales' },
    { label: 'Notificaciones nuevas', value: '3', helper: 'Pendientes de revisar' },
    { label: 'Cumpleanos del dia', value: '2', helper: 'Personas hoy' },
    { label: 'Accesos rapidos', value: '6', helper: 'Rutas frecuentes' }
  ];

  readonly quickAccess: QuickAccess[] = [
    {
      label: 'Finanzas',
      description: 'Contable, SRI, caja y tesoreria.',
      route: '/main/modulo/finanzas/contable-sri',
      icon: CircleDollarSign
    },
    {
      label: 'RRHH',
      description: 'Empleado, proveedores y administracion.',
      route: '/main/modulo/rrhh/empleado',
      icon: Users
    },
    {
      label: 'Clientes',
      description: 'Marketing, cobranza y legal.',
      route: '/main/modulo/clientes/marketing',
      icon: Users
    },
    {
      label: 'Producto',
      description: 'Produccion, distribucion y compras.',
      route: '/main/modulo/producto/produccion-distribucion',
      icon: Package
    },
    {
      label: 'Analisis',
      description: 'Indicadores, medicion y reportes.',
      route: '/main/modulo/analisis/am-r',
      icon: ChartColumn
    },
    {
      label: 'Sistema',
      description: 'Configuracion, soporte y developer.',
      route: '/main/modulo/sistema/configuracion',
      icon: MonitorCog
    }
  ];

  readonly recentActivity: RecentActivity[] = [
    {
      title: 'Ticket asignado',
      detail: 'Se asigno un nuevo caso de mantenimiento.',
      time: 'Hace 5 min'
    },
    {
      title: 'Empresa registrada',
      detail: 'Se agrego una nueva empresa al sistema.',
      time: 'Hoy'
    },
    {
      title: 'Ubicacion actualizada',
      detail: 'Se modifico informacion de una ubicacion.',
      time: 'Ayer'
    }
  ];

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  get username(): string {
    return this.authService.getName() || localStorage.getItem('username') || 'Usuario';
  }

  navigate(route: string): void {
    void this.router.navigateByUrl(route);
  }
}
