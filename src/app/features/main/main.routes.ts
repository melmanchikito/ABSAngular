import { Routes } from '@angular/router';
import { MainLayoutComponent } from '../../shared/layouts/main-layout/main-layout.component';
import { HomeComponent } from '../home/pages/home/home.component';
import { MailComponent } from '../mail/pages/mail/mail.component';
import { CompanyMaintenanceComponent } from '../system-area/pages/company-maintenance/company-maintenance.component';
import { LocationMaintenanceComponent } from '../system-area/pages/location-maintenance/location-maintenance.component';
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
        path: 'helpdesk',
        loadChildren: () =>
          import('../helpdesk/helpdesk.routes').then((m) => m.HELPDESK_ROUTES)
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
