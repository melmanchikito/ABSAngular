import { Routes } from '@angular/router';
import { MainLayoutComponent } from '../../shared/layouts/main-layout/main-layout.component';
import { CompanyMaintenanceComponent } from '../system-area/pages/company-maintenance/company-maintenance.component';
import { SystemAreaComponent } from '../system-area/pages/system-area/system-area.component';

export const MAIN_ROUTES: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'helpdesk',
        pathMatch: 'full'
      },
      {
        path: 'helpdesk',
        loadChildren: () =>
          import('../helpdesk/helpdesk.routes').then((m) => m.HELPDESK_ROUTES)
      },
      {
        path: 'profile',
        loadChildren: () =>
          import('../profile/profile.routes').then((m) => m.PROFILE_ROUTES)
      },
      {
        path: 'system-area',
        redirectTo: 'area/sistema',
        pathMatch: 'full'
      },
      {
        path: 'area',
        redirectTo: 'area/sistema',
        pathMatch: 'full'
      },
      {
        path: 'area/sistema/mantenimientos/empresas',
        component: CompanyMaintenanceComponent
      },
      {
        path: 'area/:areaKey',
        component: SystemAreaComponent
      }
    ]
  }
];
