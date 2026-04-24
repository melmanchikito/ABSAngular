import { Routes } from '@angular/router';
import { MainLayoutComponent } from '../../shared/layouts/main-layout/main-layout.component';

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
      }
    ]
  }
];