import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  BarChart3,
  Boxes,
  Building2,
  CheckCircle2,
  CircleDollarSign,
  ClipboardCheck,
  FileBarChart,
  FileText,
  FolderKanban,
  KeyRound,
  Landmark,
  LayoutDashboard,
  LucideAngularModule,
  LucideIconData,
  MonitorCog,
  Package,
  Save,
  Settings,
  ShieldCheck,
  Tags,
  UserRound,
  Users,
  Wrench
} from 'lucide-angular';
import { PageHeaderComponent } from '../../../../../shared/components/page-header/page-header.component';
import { StepItem, StepperComponent } from '../../../../../shared/components/stepper/stepper.component';

type PermissionAction = 'view' | 'create' | 'edit' | 'delete' | 'print' | 'export';

interface MockUser {
  id: number;
  name: string;
}

interface PermissionOption {
  id: string;
  label: string;
}

interface PermissionCategory {
  id: string;
  label: string;
  icon: LucideIconData;
  options: PermissionOption[];
}

interface PermissionModule {
  id: string;
  label: string;
  icon: LucideIconData;
  categories: PermissionCategory[];
}

interface PermissionArea {
  id: string;
  label: string;
  icon: LucideIconData;
  modules: PermissionModule[];
}

interface SelectedActionSummary {
  optionId: string;
  optionLabel: string;
  path: string;
  actions: string[];
}

interface PermissionPayload {
  userId: number | null;
  areas: string[];
  modules: string[];
  options: string[];
  actions: Array<{
    optionId: string;
    action: PermissionAction;
  }>;
}

const ACTION_OPTIONS: Array<{ id: PermissionAction; label: string }> = [
  { id: 'view', label: 'Ver' },
  { id: 'create', label: 'Crear' },
  { id: 'edit', label: 'Editar' },
  { id: 'delete', label: 'Eliminar' },
  { id: 'print', label: 'Imprimir' },
  { id: 'export', label: 'Exportar' }
];

const category = (
  moduleId: string,
  id: string,
  label: string,
  icon: LucideIconData,
  optionLabels: string[]
): PermissionCategory => ({
  id: `${moduleId}.${id}`,
  label,
  icon,
  options: optionLabels.map((optionLabel) => ({
    id: `${moduleId}.${id}.${optionLabel.toLowerCase().replace(/\s+/g, '-')}`,
    label: optionLabel
  }))
});

const simpleCategories = (moduleId: string, label: string): PermissionCategory[] => [
  category(moduleId, 'mantenimientos', 'Mantenimientos', Wrench, [
    'Catalogos',
    'Parametros',
    'Responsables'
  ]),
  category(moduleId, 'procesos', 'Procesos', Settings, ['Validacion', 'Seguimiento']),
  category(moduleId, 'documentos', 'Documentos', FileText, ['Soportes', 'Actas']),
  category(moduleId, 'informes', 'Informes', BarChart3, ['Resumen', 'Indicadores'])
];

@Component({
  selector: 'app-permission-manager',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, PageHeaderComponent, StepperComponent],
  templateUrl: './permission-manager.component.html',
  styleUrl: './permission-manager.component.scss'
})
export class PermissionManagerComponent {
  readonly pageIcon = ShieldCheck;
  readonly saveIcon = Save;
  readonly steps: StepItem[] = [
    { label: 'Usuario', icon: UserRound },
    { label: 'Areas', icon: Building2 },
    { label: 'Modulos', icon: LayoutDashboard },
    { label: 'Opciones', icon: FolderKanban },
    { label: 'Acciones', icon: KeyRound },
    { label: 'Confirmar', icon: CheckCircle2 }
  ];
  readonly users: MockUser[] = [
    { id: 1, name: 'German' },
    { id: 2, name: 'Danna' },
    { id: 3, name: 'Cesar' }
  ];
  readonly actionOptions = ACTION_OPTIONS;
  readonly permissionAreas: PermissionArea[] = [
    {
      id: 'finanzas',
      label: 'Finanzas',
      icon: CircleDollarSign,
      modules: [
        {
          id: 'finanzas.contable-sri',
          label: 'Contable y SRI',
          icon: Landmark,
          categories: simpleCategories('finanzas.contable-sri', 'Contable y SRI')
        },
        {
          id: 'finanzas.caja-tesoreria',
          label: 'Caja y Tesoreria',
          icon: CircleDollarSign,
          categories: simpleCategories('finanzas.caja-tesoreria', 'Caja y Tesoreria')
        }
      ]
    },
    {
      id: 'rrhh',
      label: 'RRHH',
      icon: Users,
      modules: [
        {
          id: 'rrhh.empleado',
          label: 'Empleado',
          icon: Users,
          categories: simpleCategories('rrhh.empleado', 'Empleado')
        },
        {
          id: 'rrhh.proveedores',
          label: 'Proveedores',
          icon: Building2,
          categories: simpleCategories('rrhh.proveedores', 'Proveedores')
        },
        {
          id: 'rrhh.administracion',
          label: 'Administracion',
          icon: ClipboardCheck,
          categories: simpleCategories('rrhh.administracion', 'Administracion')
        }
      ]
    },
    {
      id: 'clientes',
      label: 'Clientes',
      icon: Users,
      modules: [
        {
          id: 'clientes.marketing',
          label: 'Marketing',
          icon: BarChart3,
          categories: simpleCategories('clientes.marketing', 'Marketing')
        },
        {
          id: 'clientes.cobranza',
          label: 'Cobranza',
          icon: CircleDollarSign,
          categories: simpleCategories('clientes.cobranza', 'Cobranza')
        },
        {
          id: 'clientes.codigo-imp',
          label: 'Codigo IMP',
          icon: Tags,
          categories: simpleCategories('clientes.codigo-imp', 'Codigo IMP')
        },
        {
          id: 'clientes.legal',
          label: 'Legal',
          icon: Landmark,
          categories: simpleCategories('clientes.legal', 'Legal')
        },
        {
          id: 'clientes.comercial',
          label: 'Comercial',
          icon: Users,
          categories: [
            category('clientes.comercial', 'mantenimientos', 'Mantenimientos', Wrench, [
              'Vendedor'
            ]),
            category('clientes.comercial', 'procesos', 'Procesos', Settings, [
              'Gestion comercial de dispositivos',
              'Gestor de permisos',
              'Gestion comercial'
            ]),
            category('clientes.comercial', 'documentos', 'Documentos', FileText, [
              'Contratos comerciales',
              'Soportes de venta'
            ]),
            category('clientes.comercial', 'informes', 'Informes', BarChart3, [
              'Vendedores activos',
              'Actividad comercial'
            ])
          ]
        }
      ]
    },
    {
      id: 'producto',
      label: 'Producto',
      icon: Package,
      modules: [
        {
          id: 'producto.produccion-distribucion',
          label: 'Produccion y Distribucion',
          icon: Boxes,
          categories: simpleCategories('producto.produccion-distribucion', 'Produccion y Distribucion')
        },
        {
          id: 'producto.compras-importaciones',
          label: 'Compras e Importaciones',
          icon: Package,
          categories: simpleCategories('producto.compras-importaciones', 'Compras e Importaciones')
        }
      ]
    },
    {
      id: 'analisis',
      label: 'Analisis',
      icon: FileBarChart,
      modules: [
        {
          id: 'analisis.am-r',
          label: 'AM y R',
          icon: BarChart3,
          categories: simpleCategories('analisis.am-r', 'AM y R')
        }
      ]
    },
    {
      id: 'sistema',
      label: 'Sistema',
      icon: MonitorCog,
      modules: [
        {
          id: 'sistema.configuracion',
          label: 'Configuracion',
          icon: Settings,
          categories: [
            category('sistema.configuracion', 'mantenimientos', 'Mantenimientos', Wrench, [
              'Empresas',
              'Ubicacion',
              'Sucursal',
              'Modulos',
              'Opciones',
              'User',
              'Acciones',
              'Preferencia'
            ]),
            category('sistema.configuracion', 'procesos', 'Procesos', Settings, [
              'Auditoria de cambios',
              'Validacion de parametros'
            ]),
            category('sistema.configuracion', 'documentos', 'Documentos', FileText, [
              'Parametros generales',
              'Actas de cambios'
            ]),
            category('sistema.configuracion', 'informes', 'Informes', BarChart3, [
              'Resumen de configuracion',
              'Cambios por periodo'
            ])
          ]
        },
        {
          id: 'sistema.helpdesk',
          label: 'Helpdesk',
          icon: ClipboardCheck,
          categories: simpleCategories('sistema.helpdesk', 'Helpdesk')
        },
        {
          id: 'sistema.developer',
          label: 'Developer',
          icon: Settings,
          categories: simpleCategories('sistema.developer', 'Developer')
        }
      ]
    }
  ];

  activeStep = 0;
  selectedUserId: number | null = null;
  selectedAreas: Record<string, boolean> = {};
  selectedModules: Record<string, boolean> = {};
  selectedOptions: Record<string, boolean> = {};
  selectedActions: Record<string, Partial<Record<PermissionAction, boolean>>> = {};
  validationMessage = '';
  savedMessage = '';

  selectedAreaSummary: string[] = [];
  selectedModuleSummary: string[] = [];
  selectedOptionSummary: string[] = [];
  selectedActionSummary: SelectedActionSummary[] = [];
  visibleModules: Array<PermissionModule & { areaLabel: string }> = [];
  visibleOptionGroups: Array<{
    areaLabel: string;
    module: PermissionModule;
    categories: PermissionCategory[];
  }> = [];
  visibleActionOptions: Array<{
    path: string;
    option: PermissionOption;
  }> = [];

  get canGoNext(): boolean {
    return this.isStepValid(this.activeStep);
  }

  get enabledSteps(): boolean[] {
    return this.steps.map((_, index) => index === 0 || this.arePreviousStepsValid(index));
  }

  get selectedUser(): MockUser | undefined {
    return this.users.find((user) => user.id === this.selectedUserId);
  }

  setActiveStep(step: number): void {
    if (step <= this.activeStep || this.arePreviousStepsValid(step)) {
      this.validationMessage = '';
      this.activeStep = step;
      return;
    }

    this.validationMessage = this.stepValidationMessage(this.firstInvalidStepBefore(step));
  }

  toggleArea(area: PermissionArea): void {
    const nextValue = !this.selectedAreas[area.id];
    this.selectedAreas = { ...this.selectedAreas, [area.id]: nextValue };

    if (!nextValue) {
      area.modules.forEach((item) => this.clearModule(item));
    }

    this.refreshDerivedState();
  }

  toggleModule(moduleItem: PermissionModule): void {
    const nextValue = !this.selectedModules[moduleItem.id];
    this.selectedModules = { ...this.selectedModules, [moduleItem.id]: nextValue };

    if (!nextValue) {
      this.clearModule(moduleItem);
    }

    this.refreshDerivedState();
  }

  toggleOption(option: PermissionOption): void {
    const nextValue = !this.selectedOptions[option.id];
    this.selectedOptions = { ...this.selectedOptions, [option.id]: nextValue };

    if (!nextValue) {
      const { [option.id]: _removed, ...remainingActions } = this.selectedActions;
      this.selectedActions = remainingActions;
    }

    this.refreshDerivedState();
  }

  toggleAction(option: PermissionOption, action: PermissionAction): void {
    const optionActions = this.selectedActions[option.id] ?? {};

    this.selectedActions = {
      ...this.selectedActions,
      [option.id]: {
        ...optionActions,
        [action]: !optionActions[action]
      }
    };

    this.refreshDerivedState();
  }

  savePermissions(): void {
    const payload = this.createPayload();

    console.log('Mock permission payload', payload);
    this.savedMessage = 'Permisos mock preparados. Revisa la consola para ver el payload.';
  }

  trackByArea(_: number, area: PermissionArea): string {
    return area.id;
  }

  trackByModule(_: number, moduleItem: PermissionModule): string {
    return moduleItem.id;
  }

  trackByCategory(_: number, category: PermissionCategory): string {
    return category.id;
  }

  trackByOption(_: number, option: PermissionOption): string {
    return option.id;
  }

  trackByOptionGroup(
    _: number,
    group: { areaLabel: string; module: PermissionModule; categories: PermissionCategory[] }
  ): string {
    return group.module.id;
  }

  trackByActionOption(_: number, item: { path: string; option: PermissionOption }): string {
    return item.option.id;
  }

  trackByAction(_: number, action: { id: PermissionAction; label: string }): PermissionAction {
    return action.id;
  }

  trackByActionSummary(_: number, item: SelectedActionSummary): string {
    return item.optionId;
  }

  private refreshDerivedState(): void {
    this.visibleModules = this.permissionAreas.flatMap((area) =>
      this.selectedAreas[area.id]
        ? area.modules.map((item) => ({ ...item, areaLabel: area.label }))
        : []
    );

    this.visibleOptionGroups = this.permissionAreas.flatMap((area) =>
      area.modules
        .filter((item) => this.selectedModules[item.id])
        .map((item) => ({
          areaLabel: area.label,
          module: item,
          categories: item.categories
        }))
    );

    this.visibleActionOptions = this.visibleOptionGroups.flatMap((group) =>
      group.categories.flatMap((item) =>
        item.options
          .filter((option) => this.selectedOptions[option.id])
          .map((option) => ({
            path: `${group.areaLabel} > ${group.module.label} > ${item.label}`,
            option
          }))
      )
    );

    this.selectedAreaSummary = this.permissionAreas
      .filter((area) => this.selectedAreas[area.id])
      .map((area) => area.label);
    this.selectedModuleSummary = this.visibleModules
      .filter((item) => this.selectedModules[item.id])
      .map((item) => `${item.areaLabel} > ${item.label}`);
    this.selectedOptionSummary = this.visibleActionOptions.map((item) => `${item.path} > ${item.option.label}`);
    this.selectedActionSummary = this.visibleActionOptions
      .map((item) => ({
        optionId: item.option.id,
        optionLabel: item.option.label,
        path: item.path,
        actions: ACTION_OPTIONS.filter((action) => this.selectedActions[item.option.id]?.[action.id]).map(
          (action) => action.label
        )
      }))
      .filter((item) => item.actions.length);
  }

  private clearModule(moduleItem: PermissionModule): void {
    this.selectedModules = { ...this.selectedModules, [moduleItem.id]: false };

    moduleItem.categories.forEach((item) => {
      item.options.forEach((option) => {
        this.selectedOptions = { ...this.selectedOptions, [option.id]: false };
        const { [option.id]: _removed, ...remainingActions } = this.selectedActions;
        this.selectedActions = remainingActions;
      });
    });
  }

  private arePreviousStepsValid(step: number): boolean {
    for (let index = 0; index < step; index++) {
      if (!this.isStepValid(index)) {
        return false;
      }
    }

    return true;
  }

  private firstInvalidStepBefore(step: number): number {
    for (let index = 0; index < step; index++) {
      if (!this.isStepValid(index)) {
        return index;
      }
    }

    return 0;
  }

  private isStepValid(step: number): boolean {
    switch (step) {
      case 0:
        return this.selectedUserId !== null;
      case 1:
        return this.selectedAreaSummary.length > 0;
      case 2:
        return this.selectedModuleSummary.length > 0;
      case 3:
        return this.selectedOptionSummary.length > 0;
      case 4:
        return this.selectedActionSummary.length > 0;
      case 5:
        return this.arePreviousStepsValid(5);
      default:
        return false;
    }
  }

  private stepValidationMessage(step: number): string {
    const messages = [
      'Seleccione un usuario para iniciar la asignacion de permisos.',
      'Marque al menos un area disponible para el usuario.',
      'Seleccione uno o mas modulos de las areas permitidas.',
      'Seleccione al menos una opcion interna.',
      'Marque al menos una accion para las opciones seleccionadas.',
      'Revise el resumen antes de guardar.'
    ];

    return messages[step] ?? 'Complete la informacion requerida.';
  }

  private createPayload(): PermissionPayload {
    return {
      userId: this.selectedUserId,
      areas: this.permissionAreas.filter((area) => this.selectedAreas[area.id]).map((area) => area.id),
      modules: this.visibleModules.filter((item) => this.selectedModules[item.id]).map((item) => item.id),
      options: this.visibleActionOptions.map((item) => item.option.id),
      actions: this.visibleActionOptions.flatMap((item) =>
        ACTION_OPTIONS.filter((action) => this.selectedActions[item.option.id]?.[action.id]).map((action) => ({
          optionId: item.option.id,
          action: action.id
        }))
      )
    };
  }
}
