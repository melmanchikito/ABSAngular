import { Routes } from '@angular/router';
import { MainLayoutComponent } from '../../shared/layouts/main-layout/main-layout.component';
import { HomeComponent } from '../home/pages/home/home.component';
import { MailComponent } from '../mail/pages/mail/mail.component';
import { DepartmentMaintenanceComponent } from '../rrhh-area/pages/maintenance/department-maintenance/department-maintenance.component';
import { EmployeeMaintenanceComponent } from '../rrhh-area/pages/maintenance/employee-maintenance/employee-maintenance.component';
import { PositionMaintenanceComponent } from '../rrhh-area/pages/maintenance/position-maintenance/position-maintenance.component';
import { RrhhAreaComponent } from '../rrhh-area/pages/rrhh-area/rrhh-area.component';
import { ActionMaintenanceComponent } from '../system-area/pages/maintenance/action-maintenance/action-maintenance.component';
import { BranchMaintenanceComponent } from '../system-area/pages/maintenance/branch-maintenance/branch-maintenance.component';
import { CompanyMaintenanceComponent } from '../system-area/pages/maintenance/company-maintenance/company-maintenance.component';
import { LocationMaintenanceComponent } from '../system-area/pages/maintenance/location-maintenance/location-maintenance.component';
import { MaintenanceFormCreateComponent } from '../system-area/pages/maintenance/maintenance-form-create/maintenance-form-create.component';
import { MaintenanceFormEditComponent } from '../system-area/pages/maintenance/maintenance-form-edit/maintenance-form-edit.component';
import { ModuleMaintenanceComponent } from '../system-area/pages/maintenance/module-maintenance/module-maintenance.component';
import { OptionMaintenanceComponent } from '../system-area/pages/maintenance/option-maintenance/option-maintenance.component';
import { HelpdeskMaintenanceComponent } from '../system-area/pages/maintenance/helpdesk-maintenance/helpdesk-maintenance.component';
import { OptionTypeMaintenanceComponent } from '../system-area/pages/maintenance/option-type-maintenance/option-type-maintenance.component';
import { UserMaintenanceComponent } from '../system-area/pages/maintenance/user-maintenance/user-maintenance.component';
import { ProductMaintenanceComponent } from '../system-area/pages/maintenance/product-maintenance/product-maintenance.component';
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
        path: 'maintenance/empresas',
        redirectTo: 'modulo/sistema/configuracion/mantenimientos/empresas',
        pathMatch: 'full'
      },
      {
        path: 'maintenance/empresas/create',
        redirectTo: 'modulo/sistema/configuracion/mantenimientos/empresas/create',
        pathMatch: 'full'
      },
      {
        path: 'maintenance/empresas/edit/:id',
        redirectTo: 'modulo/sistema/configuracion/mantenimientos/empresas/edit/:id',
        pathMatch: 'full'
      },
      {
        path: 'maintenance/ubicaciones',
        redirectTo: 'modulo/sistema/configuracion/mantenimientos/ubicaciones',
        pathMatch: 'full'
      },
      {
        path: 'maintenance/ubicaciones/create',
        redirectTo: 'modulo/sistema/configuracion/mantenimientos/ubicaciones/create',
        pathMatch: 'full'
      },
      {
        path: 'maintenance/ubicaciones/edit/:id',
        redirectTo: 'modulo/sistema/configuracion/mantenimientos/ubicaciones/edit/:id',
        pathMatch: 'full'
      },
      {
        path: 'maintenance/sucursales',
        redirectTo: 'modulo/sistema/configuracion/sucursales',
        pathMatch: 'full'
      },
      {
        path: 'maintenance/sucursales/create',
        redirectTo: 'modulo/sistema/configuracion/sucursales/create',
        pathMatch: 'full'
      },
      {
        path: 'maintenance/sucursales/edit/:id',
        redirectTo: 'modulo/sistema/configuracion/sucursales/edit/:id',
        pathMatch: 'full'
      },
      {
        path: 'maintenance/modulos',
        redirectTo: 'modulo/sistema/configuracion/modulos',
        pathMatch: 'full'
      },
      {
        path: 'maintenance/modulos/create',
        redirectTo: 'modulo/sistema/configuracion/modulos/create',
        pathMatch: 'full'
      },
      {
        path: 'maintenance/modulos/edit/:id',
        redirectTo: 'modulo/sistema/configuracion/modulos/edit/:id',
        pathMatch: 'full'
      },
      {
        path: 'maintenance/opciones',
        redirectTo: 'modulo/sistema/configuracion/opciones',
        pathMatch: 'full'
      },
      {
        path: 'maintenance/opciones/create',
        redirectTo: 'modulo/sistema/configuracion/opciones/create',
        pathMatch: 'full'
      },
      {
        path: 'maintenance/opciones/edit/:id',
        redirectTo: 'modulo/sistema/configuracion/opciones/edit/:id',
        pathMatch: 'full'
      },
      {
        path: 'maintenance/tipo-opciones',
        redirectTo: 'modulo/sistema/configuracion/tipo-opciones',
        pathMatch: 'full'
      },
      {
        path: 'maintenance/tipo-opciones/create',
        redirectTo: 'modulo/sistema/configuracion/tipo-opciones/create',
        pathMatch: 'full'
      },
      {
        path: 'maintenance/tipo-opciones/edit/:id',
        redirectTo: 'modulo/sistema/configuracion/tipo-opciones/edit/:id',
        pathMatch: 'full'
      },
      {
        path: 'maintenance/user',
        redirectTo: 'modulo/sistema/configuracion/user',
        pathMatch: 'full'
      },
      {
        path: 'maintenance/user/create',
        redirectTo: 'modulo/sistema/configuracion/user/create',
        pathMatch: 'full'
      },
      {
        path: 'maintenance/user/edit/:id',
        redirectTo: 'modulo/sistema/configuracion/user/edit/:id',
        pathMatch: 'full'
      },
      {
        path: 'maintenance/acciones',
        redirectTo: 'modulo/sistema/configuracion/acciones',
        pathMatch: 'full'
      },
      {
        path: 'maintenance/acciones/create',
        redirectTo: 'modulo/sistema/configuracion/acciones/create',
        pathMatch: 'full'
      },
      {
        path: 'maintenance/acciones/edit/:id',
        redirectTo: 'modulo/sistema/configuracion/acciones/edit/:id',
        pathMatch: 'full'
      },
      {
        path: 'maintenance/helpdesk',
        redirectTo: 'modulo/sistema/help-desk/mantenimientos/helpdesk',
        pathMatch: 'full'
      },
      {
        path: 'maintenance/helpdesk/create',
        redirectTo: 'modulo/sistema/help-desk/mantenimientos/helpdesk/create',
        pathMatch: 'full'
      },
      {
        path: 'maintenance/helpdesk/edit/:id',
        redirectTo: 'modulo/sistema/help-desk/mantenimientos/helpdesk/edit/:id',
        pathMatch: 'full'
      },
      {
        path: 'maintenance/productos',
        redirectTo: 'modulo/producto/produccion-distribucion/productos',
        pathMatch: 'full'
      },
      {
        path: 'maintenance/productos/create',
        redirectTo: 'modulo/producto/produccion-distribucion/productos/create',
        pathMatch: 'full'
      },
      {
        path: 'maintenance/productos/edit/:id',
        redirectTo: 'modulo/producto/produccion-distribucion/productos/edit/:id',
        pathMatch: 'full'
      },
      {
        path: 'maintenance/cargos',
        redirectTo: 'modulo/rrhh/empleado/mantenimientos/cargos',
        pathMatch: 'full'
      },
      {
        path: 'maintenance/cargos/create',
        redirectTo: 'modulo/rrhh/empleado/mantenimientos/cargos/create',
        pathMatch: 'full'
      },
      {
        path: 'maintenance/cargos/edit/:id',
        redirectTo: 'modulo/rrhh/empleado/mantenimientos/cargos/edit/:id',
        pathMatch: 'full'
      },
      {
        path: 'maintenance/departamentos',
        redirectTo: 'modulo/rrhh/empleado/mantenimientos/departamentos',
        pathMatch: 'full'
      },
      {
        path: 'maintenance/departamentos/create',
        redirectTo: 'modulo/rrhh/empleado/mantenimientos/departamentos/create',
        pathMatch: 'full'
      },
      {
        path: 'maintenance/departamentos/edit/:id',
        redirectTo: 'modulo/rrhh/empleado/mantenimientos/departamentos/edit/:id',
        pathMatch: 'full'
      },
      {
        path: 'maintenance/empleados',
        redirectTo: 'modulo/rrhh/empleado/mantenimientos/empleados',
        pathMatch: 'full'
      },
      {
        path: 'maintenance/empleados/create',
        redirectTo: 'modulo/rrhh/empleado/mantenimientos/empleados/create',
        pathMatch: 'full'
      },
      {
        path: 'maintenance/empleados/edit/:id',
        redirectTo: 'modulo/rrhh/empleado/mantenimientos/empleados/edit/:id',
        pathMatch: 'full'
      },
      {
        path: 'modulo/sistema/configuracion/mantenimientos/empresas/create',
        component: MaintenanceFormCreateComponent,
        data: { entity: 'companies' }
      },
      {
        path: 'modulo/sistema/configuracion/mantenimientos/empresas/edit/:id',
        component: MaintenanceFormEditComponent,
        data: { entity: 'companies' }
      },
      {
        path: 'modulo/sistema/configuracion/mantenimientos/empresas',
        component: CompanyMaintenanceComponent
      },
      {
        path: 'modulo/sistema/configuracion/mantenimientos/ubicaciones/create',
        component: MaintenanceFormCreateComponent,
        data: { entity: 'locations' }
      },
      {
        path: 'modulo/sistema/configuracion/mantenimientos/ubicaciones/edit/:id',
        component: MaintenanceFormEditComponent,
        data: { entity: 'locations' }
      },
      {
        path: 'modulo/sistema/configuracion/mantenimientos/ubicaciones',
        component: LocationMaintenanceComponent
      },
      {
        path: 'modulo/sistema/configuracion/sucursales/create',
        component: MaintenanceFormCreateComponent,
        data: { entity: 'branches' }
      },
      {
        path: 'modulo/sistema/configuracion/sucursales/edit/:id',
        component: MaintenanceFormEditComponent,
        data: { entity: 'branches' }
      },
      {
        path: 'modulo/sistema/configuracion/sucursales',
        component: BranchMaintenanceComponent
      },
      {
        path: 'modulo/sistema/configuracion/modulos/create',
        component: MaintenanceFormCreateComponent,
        data: { entity: 'modules' }
      },
      {
        path: 'modulo/sistema/configuracion/modulos/edit/:id',
        component: MaintenanceFormEditComponent,
        data: { entity: 'modules' }
      },
      {
        path: 'modulo/sistema/configuracion/modulos',
        component: ModuleMaintenanceComponent
      },
      {
        path: 'modulo/sistema/configuracion/acciones/create',
        component: MaintenanceFormCreateComponent,
        data: { entity: 'actions' }
      },
      {
        path: 'modulo/sistema/configuracion/acciones/edit/:id',
        component: MaintenanceFormEditComponent,
        data: { entity: 'actions' }
      },
      {
        path: 'modulo/sistema/configuracion/acciones',
        component: ActionMaintenanceComponent
      },
      {
        path: 'modulo/sistema/configuracion/opciones/create',
        component: MaintenanceFormCreateComponent,
        data: { entity: 'options' }
      },
      {
        path: 'modulo/sistema/configuracion/opciones/edit/:id',
        component: MaintenanceFormEditComponent,
        data: { entity: 'options' }
      },
      {
        path: 'modulo/sistema/configuracion/opciones',
        component: OptionMaintenanceComponent
      },
      {
        path: 'modulo/sistema/configuracion/tipo-opciones/create',
        component: MaintenanceFormCreateComponent,
        data: { entity: 'optionTypes' }
      },
      {
        path: 'modulo/sistema/configuracion/tipo-opciones/edit/:id',
        component: MaintenanceFormEditComponent,
        data: { entity: 'optionTypes' }
      },
      {
        path: 'modulo/sistema/configuracion/tipo-opciones',
        component: OptionTypeMaintenanceComponent
      },
      {
        path: 'modulo/sistema/configuracion/user/create',
        component: MaintenanceFormCreateComponent,
        data: { entity: 'users' }
      },
      {
        path: 'modulo/sistema/configuracion/user/edit/:id',
        component: MaintenanceFormEditComponent,
        data: { entity: 'users' }
      },
      {
        path: 'modulo/sistema/configuracion/user',
        component: UserMaintenanceComponent
      },
      {
        path: 'modulo/sistema/help-desk/mantenimientos/helpdesk/create',
        component: MaintenanceFormCreateComponent,
        data: { entity: 'helpdesks' }
      },
      {
        path: 'modulo/sistema/help-desk/mantenimientos/helpdesk/edit/:id',
        component: MaintenanceFormEditComponent,
        data: { entity: 'helpdesks' }
      },
      {
        path: 'modulo/sistema/help-desk/mantenimientos/helpdesk',
        component: HelpdeskMaintenanceComponent
      },
      {
        path: 'modulo/producto/produccion-distribucion/productos/create',
        component: MaintenanceFormCreateComponent,
        data: { entity: 'products' }
      },
      {
        path: 'modulo/producto/produccion-distribucion/productos/edit/:id',
        component: MaintenanceFormEditComponent,
        data: { entity: 'products' }
      },
      {
        path: 'modulo/producto/produccion-distribucion/productos',
        component: ProductMaintenanceComponent
      },
      {
        path: 'modulo/rrhh',
        redirectTo: 'modulo/rrhh/empleado',
        pathMatch: 'full'
      },
      {
        path: 'modulo/rrhh/empleado/mantenimientos/cargos/create',
        component: MaintenanceFormCreateComponent,
        data: { entity: 'positions' }
      },
      {
        path: 'modulo/rrhh/empleado/mantenimientos/cargos/edit/:id',
        component: MaintenanceFormEditComponent,
        data: { entity: 'positions' }
      },
      {
        path: 'modulo/rrhh/empleado/mantenimientos/cargos',
        component: PositionMaintenanceComponent
      },
      {
        path: 'modulo/rrhh/empleado/mantenimientos/empleados/create',
        component: MaintenanceFormCreateComponent,
        data: { entity: 'employees' }
      },
      {
        path: 'modulo/rrhh/empleado/mantenimientos/empleados/edit/:id',
        component: MaintenanceFormEditComponent,
        data: { entity: 'employees' }
      },
      {
        path: 'modulo/rrhh/empleado/mantenimientos/empleados',
        component: EmployeeMaintenanceComponent
      },
      {
        path: 'modulo/rrhh/empleado/mantenimientos/departamentos/create',
        component: MaintenanceFormCreateComponent,
        data: { entity: 'departments' }
      },
      {
        path: 'modulo/rrhh/empleado/mantenimientos/departamentos/edit/:id',
        component: MaintenanceFormEditComponent,
        data: { entity: 'departments' }
      },
      {
        path: 'modulo/rrhh/empleado/mantenimientos/departamentos',
        component: DepartmentMaintenanceComponent
      },
      {
        path: 'modulo/rrhh/:submoduleKey',
        component: RrhhAreaComponent
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
