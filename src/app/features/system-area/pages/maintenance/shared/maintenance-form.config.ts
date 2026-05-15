import { map } from 'rxjs';
import { FIELD_LIMITS } from '../../../../../shared/constants/field-limits.constants';
import { ActionMaintenanceService } from '../../../services/action-maintenance.service';
import { BranchMaintenanceService } from '../../../services/branch-maintenance.service';
import { CompanyMaintenanceService } from '../../../services/company-maintenance.service';
import { EmployeeMaintenanceService } from '../../../services/employee-maintenance.service';
import { HelpdeskMaintenanceService } from '../../../services/helpdesk-maintenance.service';
import { LocationMaintenanceService } from '../../../services/location-maintenance.service';
import { ModuleMaintenanceService } from '../../../services/module-maintenance.service';
import { OptionMaintenanceService } from '../../../services/option-maintenance.service';
import { OptionTypeMaintenanceService } from '../../../services/option-type-maintenance.service';
import { ProductMaintenanceService } from '../../../services/product-maintenance.service';
import { UserMaintenanceService } from '../../../services/user-maintenance.service';
import { DepartmentMaintenanceService } from '../../../../rrhh-area/services/department-maintenance.service';
import { PositionMaintenanceService } from '../../../../rrhh-area/services/position-maintenance.service';
import { SellerMaintenanceService } from '../../../../clients-area/services/seller-maintenance.service';
import {
  FormFieldConfig,
  MaintenanceEntity,
  MaintenanceFormConfig
} from './maintenance-form.types';
import { cleanPayload } from './maintenance-form.helpers';

export interface MaintenanceFormConfigServices {
  companyService: CompanyMaintenanceService;
  employeeService: EmployeeMaintenanceService;
  locationService: LocationMaintenanceService;
  branchService: BranchMaintenanceService;
  moduleService: ModuleMaintenanceService;
  actionService: ActionMaintenanceService;
  optionService: OptionMaintenanceService;
  optionTypeService: OptionTypeMaintenanceService;
  userService: UserMaintenanceService;
  helpdeskService: HelpdeskMaintenanceService;
  productService: ProductMaintenanceService;
  sellerService: SellerMaintenanceService;
  positionService: PositionMaintenanceService;
  departmentService: DepartmentMaintenanceService;
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
        { key: 'name', label: 'Nombre', required: true, minLength: 2 },
        { key: 'email', label: 'Email', type: 'email', required: true },
        { key: 'role_id', label: 'Rol ID', type: 'number', required: true, numeric: true, hideOnCreate: true, hideOnEdit: true },
        {
          key: 'state',
          label: 'Estado',
          type: 'select',
          required: true,
          hideOnCreate: true,
          hideOnEdit: true,
          options: [
            { value: 'active', label: 'Activo' },
            { value: 'inactive', label: 'Inactivo' }
          ]
        },
        { key: 'phone', label: 'Celular', required: true, minLength: 7 },
        {
          key: 'employee_id',
          label: 'Empleado',
          type: 'select',
          required: true,
          numeric: true,
          createOptionsKey: 'employeesWithoutUser',
          editOptionsKey: 'employees',
          sourceKeys: ['employee.id'],
          emptyOptionsMessage: 'No existen empleados disponibles para vincular.'
        },
        { key: 'is_developer', label: 'Desarrollador', type: 'checkbox', sourceKeys: ['developer'] }
      ],
      optionLoaders: {
        employees: () =>
          services.employeeService.getEmployees().pipe(
            map((items) => items.map(toCatalogOption))
          ),
        employeesWithoutUser: () =>
          services.employeeService.getEmployeesWithoutUser().pipe(
            map((items) => items.map(toCatalogOption))
          )
      },
      load: (id) => services.userService.getUserById(id),
      create: (payload) => services.userService.insertUser(payload as never),
      update: (payload) => services.userService.updateUser(payload as never),
      toCreatePayload: (form, username) =>
        cleanPayload({
          name: form['name'],
          email: form['email'],
          phone: form['phone'],
          is_developer: Boolean(form['is_developer']),
          employee_id: toEmployeeIdPayloadValue(form['employee_id']),
          created_by: toAuditUser(username)
        }),
      toUpdatePayload: (id, form, username) =>
        cleanPayload({
          user_id: id,
          name: form['name'],
          email: form['email'],
          phone: form['phone'],
          is_developer: Boolean(form['is_developer']),
          employee_id: toEmployeeIdPayloadValue(form['employee_id']),
          updated_by: username
        })
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
    },
    sellers: {
      entity,
      eyebrow: 'Clientes',
      listTitle: 'Mantenimiento - Vendedores',
      createTitle: 'Crear vendedor',
      editTitle: 'Editar vendedor',
      createSubtitle: 'Registra un nuevo vendedor del area comercial.',
      editSubtitle: 'Actualiza el vendedor seleccionado.',
      listUrl: '/main/modulo/clientes/comercial/mantenimientos/vendedores',
      idParam: 'seller_id',
      fields: [baseFields.code, baseFields.name],
      load: (id) => services.sellerService.getSellerById(id),
      create: (payload) => services.sellerService.insertSeller(payload as never),
      update: (payload) => services.sellerService.updateSeller(payload as never),
      toCreatePayload: (form, username) => cleanPayload({ ...form, created_by: username }),
      toUpdatePayload: (id, form, username) =>
        cleanPayload({ seller_id: id, name: form['name'], updated_by: username })
    },
    employees: {
      entity,
      eyebrow: 'RRHH',
      listTitle: 'Mantenimiento - Empleados',
      createTitle: 'Crear empleado',
      editTitle: 'Editar empleado',
      createSubtitle: 'Registra un nuevo empleado de recursos humanos.',
      editSubtitle: 'Actualiza el empleado seleccionado.',
      listUrl: '/main/modulo/rrhh/empleado/mantenimientos/empleados',
      idParam: 'employee_id',
      fields: [
        { ...baseFields.code, readonlyOnEdit: false, maxLength: 20 },
        { key: 'first_name', label: 'Primer nombre', required: true, minLength: 2, maxLength: 50 },
        { key: 'middle_name', label: 'Segundo nombre', maxLength: 50 },
        { key: 'first_surname', label: 'Primer apellido', required: true, minLength: 2, maxLength: 50 },
        { key: 'second_surname', label: 'Segundo apellido', maxLength: 50 },
        { key: 'cedula', label: 'Cedula', required: true, minLength: 6, maxLength: 12 },
        { key: 'email', label: 'Email', type: 'email', required: true, maxLength: 30 },
        { key: 'phone', label: 'Celular', required: true, minLength: 7, maxLength: 15 },
        { key: 'address', label: 'Direccion', type: 'textarea', required: true, maxLength: 255 },
        {
          key: 'sex',
          label: 'Sexo',
          type: 'select',
          required: true,
          options: [
            { value: 'M', label: 'Masculino' },
            { value: 'F', label: 'Femenino' }
          ]
        },
        { key: 'birthdate', label: 'Fecha de nacimiento', type: 'date', required: true },
        { key: 'integration_date', label: 'Fecha de ingreso', type: 'date', required: true },
        {
          key: 'company_id',
          label: 'Empresa',
          type: 'select',
          required: true,
          numeric: true,
          optionsKey: 'companies',
          sourceKeys: ['company.id']
        },
        {
          key: 'branch_id',
          label: 'Sucursal',
          type: 'select',
          required: true,
          numeric: true,
          optionsKey: 'branches',
          sourceKeys: ['branch.id']
        },
        {
          key: 'department_id',
          label: 'Departamento',
          type: 'select',
          required: true,
          numeric: true,
          optionsKey: 'departments',
          sourceKeys: ['department.id']
        },
        {
          key: 'position_id',
          label: 'Cargo',
          type: 'select',
          required: true,
          numeric: true,
          optionsKey: 'positions',
          sourceKeys: ['position.id']
        }
      ],
      optionLoaders: {
        companies: () => services.companyService.getCompanies().pipe(map((items) => items.map(toCatalogOption))),
        branches: () => services.branchService.getBranches().pipe(map((items) => items.map(toCatalogOption))),
        departments: () => services.departmentService.getDepartments().pipe(map((items) => items.map(toCatalogOption))),
        positions: () => services.positionService.getPositions().pipe(map((items) => items.map(toCatalogOption)))
      },
      load: (id) => services.employeeService.getEmployeeById(id),
      create: (payload) => services.employeeService.insertEmployee(payload as never),
      update: (payload) => services.employeeService.updateEmployee(payload as never),
      toCreatePayload: (form, username) => toEmployeeCreatePayload(form, username),
      toUpdatePayload: (id, form, username) => toEmployeeUpdatePayload(id, form, username)
    },
    positions: {
      entity,
      eyebrow: 'RRHH',
      listTitle: 'Mantenimiento - Cargos',
      createTitle: 'Crear cargo',
      editTitle: 'Editar cargo',
      createSubtitle: 'Registra un nuevo cargo de recursos humanos.',
      editSubtitle: 'Actualiza el cargo seleccionado.',
      listUrl: '/main/modulo/rrhh/empleado/mantenimientos/cargos',
      idParam: 'position_id',
      fields: [baseFields.code, baseFields.name],
      load: (id) => services.positionService.getPositionById(id),
      create: (payload) => services.positionService.insertPosition(payload as never),
      update: (payload) => services.positionService.updatePosition(payload as never),
      toCreatePayload: (form, username) => cleanPayload({ ...form, created_by: username }),
      toUpdatePayload: (id, form, username) =>
        cleanPayload({ position_id: id, name: form['name'], updated_by: username })
    },
    departments: {
      entity,
      eyebrow: 'RRHH',
      listTitle: 'Mantenimiento - Departamentos',
      createTitle: 'Crear departamento',
      editTitle: 'Editar departamento',
      createSubtitle: 'Registra un nuevo departamento de recursos humanos.',
      editSubtitle: 'Actualiza el departamento seleccionado.',
      listUrl: '/main/modulo/rrhh/empleado/mantenimientos/departamentos',
      idParam: 'department_id',
      fields: [baseFields.code, baseFields.name],
      load: (id) => services.departmentService.getDepartmentById(id),
      create: (payload) => services.departmentService.insertDepartment(payload as never),
      update: (payload) => services.departmentService.updateDepartment(payload as never),
      toCreatePayload: (form, username) => cleanPayload({ ...form, created_by: username }),
      toUpdatePayload: (id, form, username) =>
        cleanPayload({ department_id: id, name: form['name'], updated_by: username })
    }
  };

  const config = configs[entity] ?? configs.companies;

  return {
    ...config,
    fields: config.fields.map(applyDefaultMaxLength)
  };
}

function applyDefaultMaxLength(field: FormFieldConfig): FormFieldConfig {
  if (field.maxLength || field.numeric || field.type === 'number' || field.type === 'select') {
    return field;
  }

  const maxLength = FIELD_LIMITS[field.key];

  return maxLength ? { ...field, maxLength } : field;
}

function toEmployeeIdPayloadValue(value: unknown): number {
  const numericValue = Number(String(value ?? '').trim());

  return Number.isFinite(numericValue) ? numericValue : Number.NaN;
}

function toAuditUser(value: unknown): string {
  const username = String(value ?? '').trim();

  return username && username !== 'Usuario' ? username : 'admin';
}

function toCatalogOption(item: { id: number; code?: string | null; name?: string | null }): { value: number; label: string } {
  const code = String(item.code ?? '').trim();
  const name = String(item.name ?? '').trim();

  return {
    value: item.id,
    label: code && name ? `${code} - ${name}` : name || code || String(item.id)
  };
}

function toEmployeeCreatePayload(form: Record<string, unknown>, username: string): Record<string, unknown> {
  return {
    code: toTrimmedString(form['code']),
    first_name: toTrimmedString(form['first_name']),
    middle_name: toTrimmedString(form['middle_name']),
    first_surname: toTrimmedString(form['first_surname']),
    second_surname: toTrimmedString(form['second_surname']),
    cedula: toTrimmedString(form['cedula']),
    email: toTrimmedString(form['email']),
    phone: toTrimmedString(form['phone']),
    address: toTrimmedString(form['address']),
    sex: toTrimmedString(form['sex']),
    birthdate: toTrimmedString(form['birthdate']),
    integration_date: toTrimmedString(form['integration_date']),
    company_id: toNumberPayloadValue(form['company_id']),
    branch_id: toNumberPayloadValue(form['branch_id']),
    department_id: toNumberPayloadValue(form['department_id']),
    position_id: toNumberPayloadValue(form['position_id']),
    created_by: toAuditUser(username)
  };
}

function toEmployeeUpdatePayload(id: number, form: Record<string, unknown>, username: string): Record<string, unknown> {
  return {
    employee_id: id,
    code: toTrimmedString(form['code']),
    first_name: toTrimmedString(form['first_name']),
    middle_name: toTrimmedString(form['middle_name']),
    first_surname: toTrimmedString(form['first_surname']),
    second_surname: toTrimmedString(form['second_surname']),
    cedula: toTrimmedString(form['cedula']),
    email: toTrimmedString(form['email']),
    phone: toTrimmedString(form['phone']),
    address: toTrimmedString(form['address']),
    sex: toTrimmedString(form['sex']),
    birthdate: toTrimmedString(form['birthdate']),
    integration_date: toTrimmedString(form['integration_date']),
    company_id: toNumberPayloadValue(form['company_id']),
    branch_id: toNumberPayloadValue(form['branch_id']),
    department_id: toNumberPayloadValue(form['department_id']),
    position_id: toNumberPayloadValue(form['position_id']),
    updated_by: username
  };
}

function toTrimmedString(value: unknown): string {
  return String(value ?? '').trim();
}

function toNumberPayloadValue(value: unknown): number {
  const numericValue = Number(String(value ?? '').trim());

  return Number.isFinite(numericValue) ? numericValue : Number.NaN;
}
