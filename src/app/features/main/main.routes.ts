import { Route, Routes } from '@angular/router';
import type { MaintenanceEntity } from '../system-area/pages/maintenance/shared/maintenance-form.types';

type ComponentLoader = NonNullable<Route['loadComponent']>;

interface MaintenanceRouteConfig {
  slug: string;
  path: string;
  entity: MaintenanceEntity;
  loadComponent: ComponentLoader;
}

const loadMaintenanceCreateComponent: ComponentLoader = () =>
  import('../system-area/pages/maintenance/maintenance-form-create/maintenance-form-create.component').then(
    (m) => m.MaintenanceFormCreateComponent
  );

const loadMaintenanceEditComponent: ComponentLoader = () =>
  import('../system-area/pages/maintenance/maintenance-form-edit/maintenance-form-edit.component').then(
    (m) => m.MaintenanceFormEditComponent
  );

/*
 * Estrategia de rutas:
 * - Mantener las URLs canonicas bajo /main/modulo para no romper sidebar, cards ni enlaces guardados.
 * - Generar create/edit/list de mantenimientos desde una sola lista para evitar rutas repetidas y drift.
 * - Conservar redirects legacy /main/maintenance y /main/area como compatibilidad.
 * - Cargar pantallas pesadas con loadComponent; una ruta dinamica total por mantenimiento queda como fase futura.
 */
const MAINTENANCE_ROUTES: readonly MaintenanceRouteConfig[] = [
  {
    slug: 'empresas',
    path: 'modulo/sistema/configuracion/mantenimientos/empresas',
    entity: 'companies',
    loadComponent: () =>
      import('../system-area/pages/maintenance/company-maintenance/company-maintenance.component').then(
        (m) => m.CompanyMaintenanceComponent
      )
  },
  {
    slug: 'ubicaciones',
    path: 'modulo/sistema/configuracion/mantenimientos/ubicaciones',
    entity: 'locations',
    loadComponent: () =>
      import('../system-area/pages/maintenance/location-maintenance/location-maintenance.component').then(
        (m) => m.LocationMaintenanceComponent
      )
  },
  {
    slug: 'sucursales',
    path: 'modulo/sistema/configuracion/sucursales',
    entity: 'branches',
    loadComponent: () =>
      import('../system-area/pages/maintenance/branch-maintenance/branch-maintenance.component').then(
        (m) => m.BranchMaintenanceComponent
      )
  },
  {
    slug: 'modulos',
    path: 'modulo/sistema/configuracion/modulos',
    entity: 'modules',
    loadComponent: () =>
      import('../system-area/pages/maintenance/module-maintenance/module-maintenance.component').then(
        (m) => m.ModuleMaintenanceComponent
      )
  },
  {
    slug: 'acciones',
    path: 'modulo/sistema/configuracion/acciones',
    entity: 'actions',
    loadComponent: () =>
      import('../system-area/pages/maintenance/action-maintenance/action-maintenance.component').then(
        (m) => m.ActionMaintenanceComponent
      )
  },
  {
    slug: 'opciones',
    path: 'modulo/sistema/configuracion/opciones',
    entity: 'options',
    loadComponent: () =>
      import('../system-area/pages/maintenance/option-maintenance/option-maintenance.component').then(
        (m) => m.OptionMaintenanceComponent
      )
  },
  {
    slug: 'tipo-opciones',
    path: 'modulo/sistema/configuracion/tipo-opciones',
    entity: 'optionTypes',
    loadComponent: () =>
      import('../system-area/pages/maintenance/option-type-maintenance/option-type-maintenance.component').then(
        (m) => m.OptionTypeMaintenanceComponent
      )
  },
  {
    slug: 'user',
    path: 'modulo/sistema/configuracion/user',
    entity: 'users',
    loadComponent: () =>
      import('../system-area/pages/maintenance/user-maintenance/user-maintenance.component').then(
        (m) => m.UserMaintenanceComponent
      )
  },
  {
    slug: 'helpdesk',
    path: 'modulo/sistema/help-desk/mantenimientos/helpdesk',
    entity: 'helpdesks',
    loadComponent: () =>
      import('../system-area/pages/maintenance/helpdesk-maintenance/helpdesk-maintenance.component').then(
        (m) => m.HelpdeskMaintenanceComponent
      )
  },
  {
    slug: 'productos',
    path: 'modulo/producto/produccion-distribucion/productos',
    entity: 'products',
    loadComponent: () =>
      import('../system-area/pages/maintenance/product-maintenance/product-maintenance.component').then(
        (m) => m.ProductMaintenanceComponent
      )
  },
  {
    slug: 'vendedores',
    path: 'modulo/clientes/comercial/mantenimientos/vendedores',
    entity: 'sellers',
    loadComponent: () =>
      import('../clients-area/pages/maintenance/seller-maintenance/seller-maintenance.component').then(
        (m) => m.SellerMaintenanceComponent
      )
  },
  {
    slug: 'cargos',
    path: 'modulo/rrhh/empleado/mantenimientos/cargos',
    entity: 'positions',
    loadComponent: () =>
      import('../rrhh-area/pages/maintenance/position-maintenance/position-maintenance.component').then(
        (m) => m.PositionMaintenanceComponent
      )
  },
  {
    slug: 'empleados',
    path: 'modulo/rrhh/empleado/mantenimientos/empleados',
    entity: 'employees',
    loadComponent: () =>
      import('../rrhh-area/pages/maintenance/employee-maintenance/employee-maintenance.component').then(
        (m) => m.EmployeeMaintenanceComponent
      )
  },
  {
    slug: 'departamentos',
    path: 'modulo/rrhh/empleado/mantenimientos/departamentos',
    entity: 'departments',
    loadComponent: () =>
      import('../rrhh-area/pages/maintenance/department-maintenance/department-maintenance.component').then(
        (m) => m.DepartmentMaintenanceComponent
      )
  }
];

const createMaintenanceRoutes = ({ path, entity, loadComponent }: MaintenanceRouteConfig): Routes => [
  {
    path: `${path}/create`,
    loadComponent: loadMaintenanceCreateComponent,
    data: { entity }
  },
  {
    path: `${path}/edit/:id`,
    loadComponent: loadMaintenanceEditComponent,
    data: { entity }
  },
  {
    path,
    loadComponent
  }
];

const createLegacyMaintenanceRedirects = ({ slug, path }: MaintenanceRouteConfig): Routes => [
  {
    path: `maintenance/${slug}`,
    redirectTo: path,
    pathMatch: 'full'
  },
  {
    path: `maintenance/${slug}/create`,
    redirectTo: `${path}/create`,
    pathMatch: 'full'
  },
  {
    path: `maintenance/${slug}/edit/:id`,
    redirectTo: `${path}/edit/:id`,
    pathMatch: 'full'
  }
];

const LEGACY_AREA_REDIRECTS: Routes = [
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
  }
];

const maintenanceRoutes = MAINTENANCE_ROUTES.flatMap(createMaintenanceRoutes);
const legacyMaintenanceRedirects = MAINTENANCE_ROUTES.flatMap(createLegacyMaintenanceRedirects);

export const MAIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('../../shared/layouts/main-layout/main-layout.component').then((m) => m.MainLayoutComponent),
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      },
      {
        path: 'home',
        loadComponent: () => import('../home/pages/home/home.component').then((m) => m.HomeComponent)
      },
      {
        path: 'inicio',
        redirectTo: 'home',
        pathMatch: 'full'
      },
      {
        path: 'tickets',
        loadChildren: () => import('../tickets/tickets.routes').then((m) => m.TICKETS_ROUTES)
      },
      {
        path: 'helpdesk',
        redirectTo: 'tickets',
        pathMatch: 'full'
      },
      {
        path: 'correo',
        loadComponent: () => import('../mail/pages/mail/mail.component').then((m) => m.MailComponent)
      },
      {
        path: 'profile',
        loadChildren: () => import('../profile/profile.routes').then((m) => m.PROFILE_ROUTES)
      },
      ...LEGACY_AREA_REDIRECTS,
      ...legacyMaintenanceRedirects,
      ...maintenanceRoutes,
      {
        path: 'modulo/clientes/comercial/procesos/gestion-comercial-dispositivos',
        loadComponent: () =>
          import(
            '../clients-area/pages/process/commercial-device-management/commercial-device-management.component'
          ).then((m) => m.CommercialDeviceManagementComponent)
      },
      {
        path: 'modulo/clientes/comercial/procesos/gestor-permisos',
        loadComponent: () =>
          import('../clients-area/pages/process/permission-manager/permission-manager.component').then(
            (m) => m.PermissionManagerComponent
          )
      },
      {
        path: 'modulo/rrhh',
        redirectTo: 'modulo/rrhh/empleado',
        pathMatch: 'full'
      },
      {
        path: 'modulo/clientes',
        redirectTo: 'modulo/clientes/comercial',
        pathMatch: 'full'
      },
      {
        path: 'modulo/rrhh/:submoduleKey',
        loadComponent: () =>
          import('../rrhh-area/pages/rrhh-area/rrhh-area.component').then((m) => m.RrhhAreaComponent)
      },
      {
        path: 'modulo/clientes/:submoduleKey',
        loadComponent: () =>
          import('../clients-area/pages/clients-area/clients-area.component').then((m) => m.ClientsAreaComponent)
      },
      {
        path: 'modulo/:moduleKey/:submoduleKey',
        loadComponent: () =>
          import('../system-area/pages/system-area/system-area.component').then((m) => m.SystemAreaComponent)
      },
      {
        path: 'modulo/:moduleKey',
        loadComponent: () =>
          import('../system-area/pages/system-area/system-area.component').then((m) => m.SystemAreaComponent)
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
