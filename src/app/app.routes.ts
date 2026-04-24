import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES)
  },
  /*{
    path: 'main',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/main/main.routes').then((m) => m.MAIN_ROUTES)
  },*/
  {
  path: 'main',
  loadChildren: () =>
    import('./features/main/main.routes').then((m) => m.MAIN_ROUTES)
},
  {
    path: '**',
    redirectTo: 'auth/login'
  }
];