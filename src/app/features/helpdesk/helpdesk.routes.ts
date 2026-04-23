import { Routes } from '@angular/router';
import { MainLayoutComponent } from '../../shared/layouts/main-layout/main-layout.component';
import { AssistComponent } from './pages/assist/assist.component';

export const HELPDESK_ROUTES: Routes = [
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
        component: AssistComponent
      }
    ]
  }
];