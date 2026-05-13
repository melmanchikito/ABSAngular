import { map } from 'rxjs';
import { ActionMaintenanceService } from '../../../services/action-maintenance.service';
import { BranchMaintenanceService } from '../../../services/branch-maintenance.service';
import { CompanyMaintenanceService } from '../../../services/company-maintenance.service';
import { HelpdeskMaintenanceService } from '../../../services/helpdesk-maintenance.service';
import { LocationMaintenanceService } from '../../../services/location-maintenance.service';
import { ModuleMaintenanceService } from '../../../services/module-maintenance.service';
import { OptionMaintenanceService } from '../../../services/option-maintenance.service';
import { OptionTypeMaintenanceService } from '../../../services/option-type-maintenance.service';
import { ProductMaintenanceService } from '../../../services/product-maintenance.service';
import { UserMaintenanceService } from '../../../services/user-maintenance.service';
import {
  FormFieldConfig,
  MaintenanceEntity,
  MaintenanceFormConfig
} from './maintenance-form.types';
import { cleanPayload } from './maintenance-form.helpers';

export interface MaintenanceFormConfigServices {
  companyService: CompanyMaintenanceService;
  locationService: LocationMaintenanceService;
  branchService: BranchMaintenanceService;
  moduleService: ModuleMaintenanceService;
  actionService: ActionMaintenanceService;
  optionService: OptionMaintenanceService;
  optionTypeService: OptionTypeMaintenanceService;
  userService: UserMaintenanceService;
  helpdeskService: HelpdeskMaintenanceService;
  productService: ProductMaintenanceService;
}

export function createMaintenanceFormConfig(
  entity: MaintenanceEntity,
  services: MaintenanceFormConfigServices
): MaintenanceFormConfig {
  const listBase = '/main/modulo/sistema/configuracion';

  const baseFields = {
    code: { key: 'code', label: 'Codigo', required: true, minLength: 2, readonlyOnEdit: true },
    name: { key: 'name', label: 'Nombre', required: true, minLength: 2 }
  } satisfies Record<string, FormFieldConfig>;

  const configs: Record<MaintenanceEntity, MaintenanceFormConfig> = {
    companies: {
      entity,
      eyebrow: 'Sistema',
      listTitle: 'Mantenimiento - Empresas',
      createTitle: 'Crear empresa',
      editTitle: 'Editar empresa',
      createSubtitle: 'Registra una nueva empresa en el sistema.',
      editSubtitle: 'Actualiza los datos principales de la empresa.',
      listUrl: `${listBase}/mantenimientos/empresas`,
      idParam: 'company_id',
      fields: [
        { ...baseFields.code, readonlyOnEdit: false },
        baseFields.name,
        { key: 'phone', label: 'Telefono', required: true, minLength: 7 },
        { key: 'email', label: 'Email', type: 'email', required: true },
        { key: 'website', label: 'Sitio web', required: true, createOnly: true }
      ],
      load: (id) => services.companyService.getCompanyById(id),
      create: (payload) => services.companyService.insertCompany(payload as never),
      update: (payload) => services.companyService.updateCompany(payload as never),
      toCreatePayload: (form, username) => cleanPayload({ ...form, created_by: username }),
      toUpdatePayload: (id, form, username) =>
        cleanPayload({
          company_id: id,
          code: form['code'],
          name: form['name'],
          phone: form['phone'],
          email: form['email'],
          updated_by: username
        })
    },
    locations: {
      entity,
      eyebrow: 'Sistema',
      listTitle: 'Mantenimiento - Ubicaciones',
      createTitle: 'Crear ubicacion',
      editTitle: 'Editar ubicacion',
      createSubtitle: 'Registra una nueva ubicacion fisica.',
      editSubtitle: 'Actualiza los datos de la ubicacion seleccionada.',
      listUrl: `${listBase}/mantenimientos/ubicaciones`,
      idParam: 'location_id',
      fields: [baseFields.code, baseFields.name, { key: 'address', label: 'Direccion', type: 'textarea', required: true }],
      load: (id) => services.locationService.getLocationById(id),
      create: (payload) => services.locationService.insertLocation(payload as never),
      update: (payload) => services.locationService.updateLocation(payload as never),
      toCreatePayload: (form, username) => cleanPayload({ ...form, created_by: username }),
      toUpdatePayload: (id, form, username) =>
        cleanPayload({ location_id: id, name: form['name'], address: form['address'], updated_by: username })
    },
    branches: {
      entity,
      eyebrow: 'Sistema',
      listTitle: 'Mantenimiento - Sucursal',
      createTitle: 'Crear sucursal',
      editTitle: 'Editar sucursal',
      createSubtitle: 'Registra una nueva sucursal.',
      editSubtitle: 'Actualiza empresa, ubicacion y nombre de la sucursal.',
      listUrl: `${listBase}/sucursales`,
      idParam: 'branch_id',
      fields: [
        baseFields.code,
        baseFields.name,
        { key: 'company_id', label: 'Empresa', type: 'select', required: true, numeric: true, optionsKey: 'companies' },
        { key: 'location_id', label: 'Ubicacion', type: 'select', required: true, numeric: true, optionsKey: 'locations' }
      ],
      optionLoaders: {
        companies: () => services.companyService.getCompanies().pipe(map((items) => items.map((item) => ({ value: item.id, label: item.name })))),
        locations: () => services.locationService.getLocations().pipe(map((items) => items.map((item) => ({ value: item.id, label: item.name }))))
      },
      load: (id) => services.branchService.getBranchById(id),
      create: (payload) => services.branchService.insertBranch(payload as never),
      update: (payload) => services.branchService.updateBranch(payload as never),
      toCreatePayload: (form, username) => cleanPayload({ ...form, created_by: username }),
      toUpdatePayload: (id, form, username) =>
        cleanPayload({
          branch_id: id,
          name: form['name'],
          company_id: form['company_id'],
          location_id: form['location_id'],
          updated_by: username
        })
    },
    modules: {
      entity,
      eyebrow: 'Sistema',
      listTitle: 'Mantenimiento - Modulos',
      createTitle: 'Crear modulo',
      editTitle: 'Editar modulo',
      createSubtitle: 'Registra un modulo administrativo.',
      editSubtitle: 'Actualiza el modulo seleccionado.',
      listUrl: `${listBase}/modulos`,
      idParam: 'module_id',
      fields: [baseFields.code, baseFields.name, { key: 'order', label: 'Orden', type: 'number', required: true, numeric: true }],
      load: (id) => services.moduleService.getModuleById(id),
      create: (payload) => services.moduleService.insertModule(payload as never),
      update: (payload) => services.moduleService.updateModule(payload as never),
      toCreatePayload: (form, username) => cleanPayload({ ...form, created_by: username }),
      toUpdatePayload: (id, form, username) =>
        cleanPayload({ module_id: id, name: form['name'], order: form['order'], updated_by: username })
    },
    actions: {
      entity,
      eyebrow: 'Sistema',
      listTitle: 'Mantenimiento - Acciones',
      createTitle: 'Crear accion',
      editTitle: 'Editar accion',
      createSubtitle: 'Registra una accion disponible.',
      editSubtitle: 'Actualiza la accion seleccionada.',
      listUrl: `${listBase}/acciones`,
      idParam: 'action_id',
      fields: [baseFields.code, baseFields.name],
      load: (id) => services.actionService.getActionById(id),
      create: (payload) => services.actionService.insertAction(payload as never),
      update: (payload) => services.actionService.updateAction(payload as never),
      toCreatePayload: (form, username) => cleanPayload({ ...form, created_by: username }),
      toUpdatePayload: (id, form, username) => cleanPayload({ action_id: id, name: form['name'], updated_by: username })
    },
    optionTypes: {
      entity,
      eyebrow: 'Sistema',
      listTitle: 'Mantenimiento - Tipo de opciones',
      createTitle: 'Crear tipo de opcion',
      editTitle: 'Editar tipo de opcion',
      createSubtitle: 'Registra una clasificacion para opciones.',
      editSubtitle: 'Actualiza el tipo de opcion seleccionado.',
      listUrl: `${listBase}/tipo-opciones`,
      idParam: 'option_type_id',
      fields: [baseFields.code, baseFields.name],
      load: (id) => services.optionTypeService.getOptionTypeById(id),
      create: (payload) => services.optionTypeService.insertOptionType(payload as never),
      update: (payload) => services.optionTypeService.updateOptionType(payload as never),
      toCreatePayload: (form, username) => cleanPayload({ ...form, created_by: username }),
      toUpdatePayload: (id, form, username) => cleanPayload({ option_type_id: id, name: form['name'], updated_by: username })
    },
    options: {
      entity,
      eyebrow: 'Sistema',
      listTitle: 'Mantenimiento - Opciones',
      createTitle: 'Crear opcion',
      editTitle: 'Editar opcion',
      createSubtitle: 'Registra una opcion por modulo y tipo.',
      editSubtitle: 'Actualiza la opcion seleccionada.',
      listUrl: `${listBase}/opciones`,
      idParam: 'option_id',
      fields: [
        baseFields.code,
        baseFields.name,
        { key: 'order', label: 'Orden', type: 'number', required: true, numeric: true },
        { key: 'module_id', label: 'Modulo', type: 'select', required: true, numeric: true, optionsKey: 'modules' },
        { key: 'type_id', label: 'Tipo', type: 'select', required: true, numeric: true, optionsKey: 'optionTypes' }
      ],
      optionLoaders: {
        modules: () => services.moduleService.getModules().pipe(map((items) => items.map((item) => ({ value: item.id, label: item.name })))),
        optionTypes: () => services.optionTypeService.getOptionTypes().pipe(map((items) => items.map((item) => ({ value: item.id, label: item.name }))))
      },
      load: (id) => services.optionService.getOptionById(id),
      create: (payload) => services.optionService.insertOption(payload as never),
      update: (payload) => services.optionService.updateOption(payload as never),
      toCreatePayload: (form, username) => cleanPayload({ ...form, created_by: username }),
      toUpdatePayload: (id, form, username) =>
        cleanPayload({
          option_id: id,
          name: form['name'],
          order: form['order'],
          module_id: form['module_id'],
          type_id: form['type_id'],
          updated_by: username
        })
    },
    users: {
      entity,
      eyebrow: 'Sistema',
      listTitle: 'Mantenimiento - User',
      createTitle: 'Crear usuario',
      editTitle: 'Editar usuario',
      createSubtitle: 'Registra un nuevo usuario administrativo.',
      editSubtitle: 'Actualiza el usuario seleccionado.',
      listUrl: `${listBase}/user`,
      idParam: 'user_id',
      fields: [
        { key: 'username', label: 'Usuario', required: true, minLength: 3 },
        baseFields.name,
        { key: 'lastname', label: 'Apellido', required: true, minLength: 2 },
        { key: 'email', label: 'Email', type: 'email', required: true },
        { key: 'password', label: 'Contrasena', type: 'password', required: false, minLength: 8 },
        { key: 'confirm_password', label: 'Confirmar contrasena', type: 'password', required: false },
        { key: 'role_id', label: 'Rol ID', type: 'number', required: true, numeric: true },
        {
          key: 'state',
          label: 'Estado',
          type: 'select',
          required: true,
          options: [
            { value: 'active', label: 'Activo' },
            { value: 'inactive', label: 'Inactivo' },
            { value: 'blocked', label: 'Bloqueado' },
            { value: 'pending', label: 'Pendiente' }
          ]
        },
        { key: 'phone', label: 'Telefono', required: true, minLength: 7 },
        { key: 'identification', label: 'Identificacion', required: true, minLength: 6 }
      ],
      load: (id) => services.userService.getUserById(id),
      create: (payload) => services.userService.insertUser(payload as never),
      update: (payload) => services.userService.updateUser(payload as never),
      toCreatePayload: (form, username) => cleanPayload({ ...form, created_by: username }),
      toUpdatePayload: (id, form, username) => {
        const payload = cleanPayload({
          user_id: id,
          username: form['username'],
          name: form['name'],
          lastname: form['lastname'],
          email: form['email'],
          role_id: form['role_id'],
          state: form['state'],
          phone: form['phone'],
          identification: form['identification'],
          updated_by: username
        });

        if (form['password']) {
          payload['password'] = form['password'];
          payload['confirm_password'] = form['confirm_password'];
        }

        return payload;
      }
    },
    helpdesks: {
      entity,
      eyebrow: 'Sistema',
      listTitle: 'Mantenimiento - Helpdesk',
      createTitle: 'Crear helpdesk',
      editTitle: 'Editar helpdesk',
      createSubtitle: 'Registra un responsable de helpdesk.',
      editSubtitle: 'Actualiza el responsable seleccionado.',
      listUrl: '/main/modulo/sistema/help-desk/mantenimientos/helpdesk',
      idParam: 'helpdesk_id',
      fields: [baseFields.name, { key: 'user_id', label: 'Usuario ID', type: 'number', required: true, numeric: true }],
      load: (id) => services.helpdeskService.getHelpdeskById(id),
      create: (payload) => services.helpdeskService.insertHelpdesk(payload as never),
      update: (payload) => services.helpdeskService.updateHelpdesk(payload as never),
      toCreatePayload: (form, username) => cleanPayload({ ...form, created_by: username }),
      toUpdatePayload: (id, form, username) => cleanPayload({ helpdesk_id: id, ...form, updated_by: username })
    },
    products: {
      entity,
      eyebrow: 'Producto',
      listTitle: 'Mantenimiento - Productos',
      createTitle: 'Crear producto',
      editTitle: 'Editar producto',
      createSubtitle: 'Registra un producto para produccion y distribucion.',
      editSubtitle: 'Actualiza el producto seleccionado.',
      listUrl: '/main/modulo/producto/produccion-distribucion/productos',
      idParam: 'product_id',
      fields: [
        { ...baseFields.code, readonlyOnEdit: false },
        baseFields.name,
        { key: 'short_name', label: 'Nombre corto', required: true },
        { key: 'description', label: 'Descripcion', type: 'textarea', required: true },
        { key: 'cost_price', label: 'Costo', type: 'number', required: true, numeric: true },
        { key: 'price_mayor', label: 'Precio mayor', type: 'number', required: true, numeric: true },
        { key: 'price_public', label: 'Precio publico', type: 'number', required: true, numeric: true },
        { key: 'oem', label: 'OEM', required: true },
        { key: 'currency', label: 'Moneda', required: true },
        {
          key: 'status',
          label: 'Estado',
          type: 'select',
          required: true,
          options: [
            { value: 'activo venta', label: 'Activo venta' },
            { value: 'inactivo venta', label: 'Inactivo venta' },
            { value: 'descontinuado venta', label: 'Descontinuado venta' }
          ]
        }
      ],
      load: (id) => services.productService.getProductById(id),
      create: (payload) => services.productService.insertProduct(payload as never),
      update: (payload) => services.productService.updateProduct(payload as never),
      toCreatePayload: (form, username) => cleanPayload({ ...form, created_by: username }),
      toUpdatePayload: (id, form, username) => cleanPayload({ product_id: id, ...form, updated_by: username })
    }
  };

  return configs[entity] ?? configs.companies;
}
