import { Routes } from '@angular/router';
import { MainLayoutComponent } from '../../shared/layouts/main-layout/main-layout.component';
import { HomeComponent } from '../home/pages/home/home.component';
import { MailComponent } from '../mail/pages/mail/mail.component';
import { ActionMaintenanceComponent } from '../system-area/pages/action-maintenance/action-maintenance.component';
import { BranchMaintenanceComponent } from '../system-area/pages/branch-maintenance/branch-maintenance.component';
import { CompanyMaintenanceComponent } from '../system-area/pages/company-maintenance/company-maintenance.component';
import { LocationMaintenanceComponent } from '../system-area/pages/location-maintenance/location-maintenance.component';
import { ModuleMaintenanceComponent } from '../system-area/pages/module-maintenance/module-maintenance.component';
import { OptionMaintenanceComponent } from '../system-area/pages/option-maintenance/option-maintenance.component';
import { HelpdeskMaintenanceComponent } from '../system-area/pages/maintenance/helpdesk-maintenance/helpdesk-maintenance.component';
import { OptionTypeMaintenanceComponent } from '../system-area/pages/maintenance/option-type-maintenance/option-type-maintenance.component';
import { UserMaintenanceComponent } from '../system-area/pages/maintenance/user-maintenance/user-maintenance.component';
import { ProductMaintenanceComponent } from '../system-area/pages/product-maintenance/product-maintenance.component';
import { SystemAreaComponent } from '../system-area/pages/system-area/system-area.component';

export const MAIN_ROUTES: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      },
      {
        path: 'home',
        component: HomeComponent
      },
      {
        path: 'inicio',
        redirectTo: 'home',
        pathMatch: 'full'
      },
      {
        path: 'tickets',
        loadChildren: () =>
          import('../tickets/tickets.routes').then((m) => m.TICKETS_ROUTES)
      },
      {
        path: 'helpdesk',
        redirectTo: 'tickets',
        pathMatch: 'full'
      },
      {
        path: 'correo',
        component: MailComponent
      },
      {
        path: 'profile',
        loadChildren: () =>
          import('../profile/profile.routes').then((m) => m.PROFILE_ROUTES)
      },
      {
        path: 'system-area',
        redirectTo: 'modulo/sistema/configuracion',
        pathMatch: 'full'
      },
      {
        path: 'area',
        redirectTo: 'modulo/sistema/configuracion',
        pathMatch: 'full'
      },
      {
        path: 'area/sistema',
        redirectTo: 'modulo/sistema/configuracion',
        pathMatch: 'full'
      },
      {
        path: 'area/sistema/help-desk',
        redirectTo: 'modulo/sistema/help-desk',
        pathMatch: 'full'
      },
      {
        path: 'area/sistema/help-desk/mantenimientos/empresas',
        redirectTo: 'modulo/sistema/configuracion/mantenimientos/empresas',
        pathMatch: 'full'
      },
      {
        path: 'area/sistema/help-desk/mantenimientos/ubicaciones',
        redirectTo: 'modulo/sistema/configuracion/mantenimientos/ubicaciones',
        pathMatch: 'full'
      },
      {
        path: 'area/sistema/mantenimientos/empresas',
        redirectTo: 'modulo/sistema/configuracion/mantenimientos/empresas',
        pathMatch: 'full'
      },
      {
        path: 'area/sistema/mantenimientos/ubicaciones',
        redirectTo: 'modulo/sistema/configuracion/mantenimientos/ubicaciones',
        pathMatch: 'full'
      },
      {
        path: 'modulo',
        redirectTo: 'modulo/sistema/configuracion',
        pathMatch: 'full'
      },
      {
        path: 'modulo/sistema/configuracion/mantenimientos/empresas',
        component: CompanyMaintenanceComponent
      },
      {
        path: 'modulo/sistema/configuracion/mantenimientos/ubicaciones',
        component: LocationMaintenanceComponent
      },
      {
        path: 'modulo/sistema/configuracion/sucursales',
        component: BranchMaintenanceComponent
      },
      {
        path: 'modulo/sistema/configuracion/modulos',
        component: ModuleMaintenanceComponent
      },
      {
        path: 'modulo/sistema/configuracion/acciones',
        component: ActionMaintenanceComponent
      },
      {
        path: 'modulo/sistema/configuracion/opciones',
        component: OptionMaintenanceComponent
      },
      {
        path: 'modulo/sistema/configuracion/tipo-opciones',
        component: OptionTypeMaintenanceComponent
      },
      {
        path: 'modulo/sistema/configuracion/user',
        component: UserMaintenanceComponent
      },
      {
        path: 'modulo/sistema/help-desk/mantenimientos/helpdesk',
        component: HelpdeskMaintenanceComponent
      },
      {
        path: 'modulo/producto/produccion-distribucion/productos',
        component: ProductMaintenanceComponent
      },
      {
        path: 'modulo/:moduleKey/:submoduleKey',
        component: SystemAreaComponent
      },
      {
        path: 'modulo/:moduleKey',
        component: SystemAreaComponent
      },
      {
        path: 'area/:areaKey/:submoduleKey',
        redirectTo: 'modulo/:areaKey/:submoduleKey',
        pathMatch: 'full'
      },
      {
        path: 'area/:areaKey',
        redirectTo: 'modulo/:areaKey',
        pathMatch: 'full'
      }
    ]
  }
];
