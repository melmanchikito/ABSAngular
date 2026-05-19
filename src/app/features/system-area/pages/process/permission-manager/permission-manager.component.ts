import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  Building2,
  CheckCircle2,
  CircleAlert,
  FolderKanban,
  KeyRound,
  LayoutDashboard,
  LucideAngularModule,
  Save,
  ShieldCheck,
  UserRound
} from 'lucide-angular';
import { PageHeaderComponent } from '../../../../../shared/components/page-header/page-header.component';
import { StepItem, StepperComponent } from '../../../../../shared/components/stepper/stepper.component';
import { UserItem } from '../../../models/user-maintenance.model';
import {
  PermissionActionNode,
  PermissionAreaNode,
  PermissionManagerService,
  PermissionModuleNode,
  PermissionOptionNode
} from '../../../services/permission-manager.service';
import { UserMaintenanceService } from '../../../services/user-maintenance.service';

interface SelectedActionSummary {
  key: string;
  actionId: number;
  actionLabel: string;
  path: string;
  hasPermission: boolean;
  changed: boolean;
}

interface PermissionPayload {
  user_id: number | null;
  permissions: Array<{
    option_id: number;
    actions: Array<{
      action_id: number;
      has_permission: boolean;
    }>;
  }>;
}

@Component({
  selector: 'app-permission-manager',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, PageHeaderComponent, StepperComponent],
  templateUrl: './permission-manager.component.html',
  styleUrl: './permission-manager.component.scss'
})
export class PermissionManagerComponent implements OnInit {
  readonly pageIcon = ShieldCheck;
  readonly saveIcon = Save;
  readonly alertIcon = CircleAlert;
  readonly steps: StepItem[] = [
    { label: 'Usuario', icon: UserRound },
    { label: 'Areas', icon: Building2 },
    { label: 'Modulos', icon: LayoutDashboard },
    { label: 'Opciones', icon: FolderKanban },
    { label: 'Acciones', icon: KeyRound },
    { label: 'Confirmar', icon: CheckCircle2 }
  ];
  users: UserItem[] = [];

  activeStep = 0;
  selectedUserId: number | null = null;
  permissionAreas: PermissionAreaNode[] = [];
  selectedAreaIds = new Set<number>();
  selectedModuleIds = new Set<number>();
  selectedOptionIds = new Set<number>();
  actionState: Record<string, boolean> = {};
  originalActionState: Record<string, boolean> = {};
  validationMessage = '';
  savedMessage = '';
  loadError = '';
  loadErrorDetail = '';
  usersError = '';
  isLoadingUsers = false;
  isLoadingPermissions = false;
  permissionsLoaded = false;

  constructor(
    private readonly permissionService: PermissionManagerService,
    private readonly userService: UserMaintenanceService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  get canGoNext(): boolean {
    return this.isStepValid(this.activeStep);
  }

  get enabledSteps(): boolean[] {
    return this.steps.map((_, index) => index === 0 || this.arePreviousStepsValid(index));
  }

  get selectedUser(): UserItem | undefined {
    return this.users.find((user) => user.id === this.selectedUserId);
  }

  get selectedUserLabel(): string {
    return this.selectedUser ? this.getUserLabel(this.selectedUser) : 'Sin usuario';
  }

  get selectedAreas(): PermissionAreaNode[] {
    return this.permissionAreas.filter((area) => this.isAreaSelected(area));
  }

  get selectedAreaSummary(): string[] {
    return this.permissionAreas
      .filter((area) => this.isAreaSelected(area))
      .map((area) => area.name);
  }

  get selectedModuleSummary(): string[] {
    return this.permissionAreas.flatMap((area) =>
      this.safeModules(area)
        .filter((moduleItem) => this.isModuleSelected(moduleItem))
        .map((moduleItem) => `${area.name} > ${moduleItem.name}`)
    );
  }

  get selectedOptionSummary(): string[] {
    return this.permissionAreas.flatMap((area) =>
      this.safeModules(area).flatMap((moduleItem) =>
        this.safeOptions(moduleItem)
          .filter((option) => this.isOptionSelected(option))
          .map((option) => `${area.name} > ${moduleItem.name} > ${option.name}`)
      )
    );
  }

  get selectedActionSummary(): SelectedActionSummary[] {
    return this.permissionAreas.flatMap((area) =>
      this.safeModules(area).flatMap((moduleItem) =>
        this.safeOptions(moduleItem).flatMap((option) =>
          this.safeActions(option)
            .filter((action) => this.isActionSelected(option, action))
            .map((action) => ({
              key: this.actionKey(option.id, action.id),
              actionId: action.id,
              actionLabel: action.name,
              path: `${area.name} > ${moduleItem.name} > ${option.name}`,
              hasPermission: this.isActionSelected(option, action),
              changed: this.actionChanged(option, action)
            }))
        )
      )
    );
  }

  get changedActionCount(): number {
    return Object.keys(this.actionState).filter((key) => this.actionState[key] !== this.originalActionState[key]).length;
  }

  onUserChange(userId: number | null): void {
    this.selectedUserId = userId;
    this.validationMessage = '';
    this.savedMessage = '';
    this.loadError = '';
    this.loadErrorDetail = '';
    this.permissionAreas = [];
    this.selectedAreaIds.clear();
    this.selectedModuleIds.clear();
    this.selectedOptionIds.clear();
    this.actionState = {};
    this.originalActionState = {};
    this.permissionsLoaded = false;
    this.activeStep = 0;

    if (userId === null) {
      return;
    }

    this.loadUserPermissions(userId);
  }

  setActiveStep(step: number): void {
    if (step <= this.activeStep || this.arePreviousStepsValid(step)) {
      this.validationMessage = '';
      this.activeStep = step;
      return;
    }

    this.validationMessage = this.stepValidationMessage(this.firstInvalidStepBefore(step));
  }

  toggleArea(area: PermissionAreaNode): void {
    if (this.isAreaSelected(area)) {
      this.selectedAreaIds.delete(area.id);
      this.clearAreaSelection(area);
      this.savedMessage = '';
      return;
    }

    this.selectedAreaIds.add(area.id);
    this.savedMessage = '';
  }

  toggleModule(area: PermissionAreaNode, moduleItem: PermissionModuleNode): void {
    if (this.isModuleSelected(moduleItem)) {
      this.selectedModuleIds.delete(moduleItem.id);
      this.clearModuleSelection(moduleItem);
      this.savedMessage = '';
      return;
    }

    this.selectedAreaIds.add(area.id);
    this.selectedModuleIds.add(moduleItem.id);
    this.savedMessage = '';
  }

  toggleOption(area: PermissionAreaNode, moduleItem: PermissionModuleNode, option: PermissionOptionNode): void {
    if (this.isOptionSelected(option)) {
      this.selectedOptionIds.delete(option.id);
      this.clearOptionSelection(option);
      this.savedMessage = '';
      return;
    }

    this.selectedAreaIds.add(area.id);
    this.selectedModuleIds.add(moduleItem.id);
    this.selectedOptionIds.add(option.id);
    this.savedMessage = '';
  }

  toggleAction(
    area: PermissionAreaNode,
    moduleItem: PermissionModuleNode,
    option: PermissionOptionNode,
    action: PermissionActionNode
  ): void {
    const key = this.actionKey(option.id, action.id);

    this.selectedAreaIds.add(area.id);
    this.selectedModuleIds.add(moduleItem.id);
    this.selectedOptionIds.add(option.id);
    this.actionState = {
      ...this.actionState,
      [key]: !this.actionState[key]
    };
    this.savedMessage = '';
  }

  savePermissions(): void {
    const payload = this.createPayload();

    console.log('Permission payload', payload);
    this.savedMessage = 'Payload de permisos preparado. Revisa la consola para ver los cambios locales.';
  }

  areaHasPermission(area: PermissionAreaNode): boolean {
    return this.safeModules(area).some((moduleItem) => this.moduleHasPermission(moduleItem));
  }

  moduleHasPermission(moduleItem: PermissionModuleNode): boolean {
    return this.safeOptions(moduleItem).some((option) => this.optionHasPermission(option));
  }

  optionHasPermission(option: PermissionOptionNode): boolean {
    return this.safeActions(option).some((action) => this.actionState[this.actionKey(option.id, action.id)]);
  }

  isAreaSelected(area: PermissionAreaNode): boolean {
    return this.selectedAreaIds.has(area.id);
  }

  isModuleSelected(moduleItem: PermissionModuleNode): boolean {
    return this.selectedModuleIds.has(moduleItem.id);
  }

  isOptionSelected(option: PermissionOptionNode): boolean {
    return this.selectedOptionIds.has(option.id);
  }

  isActionSelected(option: PermissionOptionNode, action: PermissionActionNode): boolean {
    return Boolean(this.actionState[this.actionKey(option.id, action.id)]);
  }

  actionChanged(option: PermissionOptionNode, action: PermissionActionNode): boolean {
    const key = this.actionKey(option.id, action.id);
    return this.actionState[key] !== this.originalActionState[key];
  }

  selectedModulesForArea(area: PermissionAreaNode): PermissionModuleNode[] {
    return this.safeModules(area).filter((moduleItem) => this.isModuleSelected(moduleItem));
  }

  selectedOptionsForModule(moduleItem: PermissionModuleNode): PermissionOptionNode[] {
    return this.safeOptions(moduleItem).filter((option) => this.isOptionSelected(option));
  }

  safeModules(area: PermissionAreaNode): PermissionModuleNode[] {
    return Array.isArray(area.modules) ? area.modules : [];
  }

  safeOptions(moduleItem: PermissionModuleNode): PermissionOptionNode[] {
    return Array.isArray(moduleItem.options) ? moduleItem.options : [];
  }

  safeActions(option: PermissionOptionNode): PermissionActionNode[] {
    return Array.isArray(option.actions) ? option.actions : [];
  }

  trackByArea(_: number, area: PermissionAreaNode): number {
    return area.id;
  }

  trackByModule(_: number, moduleItem: PermissionModuleNode): number {
    return moduleItem.id;
  }

  trackByOption(_: number, option: PermissionOptionNode): number {
    return option.id;
  }

  trackByAction(_: number, action: PermissionActionNode): number {
    return action.id;
  }

  trackByActionSummary(_: number, item: SelectedActionSummary): string {
    return item.key;
  }

  trackByUserId(_: number, user: UserItem): number {
    return user.id;
  }

  getUserLabel(user: UserItem): string {
    return [user.name, user.lastname].filter(Boolean).join(' ').trim() || user.username || user.email || `Usuario ${user.id}`;
  }

  private loadUsers(): void {
    this.isLoadingUsers = true;
    this.usersError = '';

    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users = users.filter((user) => !user.canceled);
        this.isLoadingUsers = false;
      },
      error: (error) => {
        console.error('Error cargando usuarios para Gestor de permisos:', error);
        console.error('Respuesta backend:', (error as { error?: unknown }).error);
        this.users = [];
        this.usersError = 'No se pudo cargar el listado de usuarios.';
        this.isLoadingUsers = false;
      }
    });
  }

  private loadUserPermissions(userId: number): void {
    this.isLoadingPermissions = true;

    console.group('GESTOR PERMISOS COMPONENT LOAD');
    console.log('User ID:', userId);
    console.log('Inicio de carga de permisos desde el componente.');
    console.trace();
    console.groupEnd();

    this.permissionService.getUserPermissions(userId).subscribe({
      next: (areas) => {
        this.permissionAreas = areas;
        this.hydrateActionState(areas);
        this.permissionsLoaded = true;
        this.isLoadingPermissions = false;

        console.group('GESTOR PERMISOS COMPONENT SUCCESS');
        console.log('User ID:', userId);
        console.log('Areas renderizadas:', areas);
        console.log('Estado local de acciones:', this.actionState);
        console.log('Permisos cargados:', this.permissionsLoaded);
        console.trace();
        console.groupEnd();
      },
      error: (error) => {
        console.group('GESTOR PERMISOS COMPONENT ERROR');
        console.log('User ID:', userId);
        console.log('Error completo:', error);
        console.log('Status:', error?.status);
        console.log('StatusText:', error?.statusText);
        console.log('Message:', error?.message);
        console.log('URL:', error?.url);
        console.log('Error body:', error?.error);

        if (error?.error) {
          console.log('error.error:', error.error);
        }

        if (error?.headers) {
          console.log('Headers:', error.headers);
        }

        console.log('Stack/error object:', error?.stack ?? error);
        console.trace();
        console.groupEnd();

        this.loadError = 'Error al cargar permisos';
        this.loadErrorDetail = this.getPermissionErrorDetail(error);
        this.permissionsLoaded = false;
        this.isLoadingPermissions = false;
      }
    });
  }

  private hydrateActionState(areas: PermissionAreaNode[]): void {
    const nextState: Record<string, boolean> = {};
    this.selectedAreaIds.clear();
    this.selectedModuleIds.clear();
    this.selectedOptionIds.clear();

    areas.forEach((area) => {
      this.safeModules(area).forEach((moduleItem) => {
        this.safeOptions(moduleItem).forEach((option) => {
          this.safeActions(option).forEach((action) => {
            const hasPermission = Boolean(action.has_permission);
            nextState[this.actionKey(option.id, action.id)] = hasPermission;

            if (hasPermission) {
              this.selectedAreaIds.add(area.id);
              this.selectedModuleIds.add(moduleItem.id);
              this.selectedOptionIds.add(option.id);
            }
          });
        });
      });
    });

    this.actionState = nextState;
    this.originalActionState = { ...nextState };
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
        return Boolean(this.selectedUserId && this.permissionsLoaded && !this.isLoadingPermissions);
      case 1:
      case 2:
      case 3:
      case 4:
      case 5:
        return this.permissionsLoaded;
      default:
        return false;
    }
  }

  private stepValidationMessage(step: number): string {
    const messages = [
      'Seleccione un usuario y espere la carga de permisos antes de continuar.',
      'Revise las areas cargadas antes de continuar.',
      'Revise los modulos cargados antes de continuar.',
      'Revise las opciones cargadas antes de continuar.',
      'Revise o ajuste las acciones antes de confirmar.',
      'Revise el resumen antes de guardar.'
    ];

    return messages[step] ?? 'Complete la informacion requerida.';
  }

  private getPermissionErrorDetail(error: { status?: number } | null | undefined): string {
    if (error?.status === 0) {
      return 'Problema de conexion o permisos CORS.';
    }

    if (error?.status === 404) {
      return 'No se pudo cargar el arbol de permisos. Verifique el endpoint.';
    }

    return 'No se pudo cargar el arbol de permisos del usuario.';
  }

  private createPayload(): PermissionPayload {
    const permissions = this.permissionAreas.flatMap((area) =>
      this.safeModules(area).flatMap((moduleItem) =>
        this.safeOptions(moduleItem)
          .filter((option) => this.isOptionSelected(option) || this.optionHasChanges(option))
          .map((option) => ({
            option_id: option.id,
            actions: this.safeActions(option).map((action) => ({
              action_id: action.id,
              has_permission: this.isActionSelected(option, action)
            }))
          }))
      )
    );

    return {
      user_id: this.selectedUserId,
      permissions
    };
  }

  private clearAreaSelection(area: PermissionAreaNode): void {
    this.safeModules(area).forEach((moduleItem) => {
      this.selectedModuleIds.delete(moduleItem.id);
      this.clearModuleSelection(moduleItem);
    });
  }

  private clearModuleSelection(moduleItem: PermissionModuleNode): void {
    this.safeOptions(moduleItem).forEach((option) => {
      this.selectedOptionIds.delete(option.id);
      this.clearOptionSelection(option);
    });
  }

  private clearOptionSelection(option: PermissionOptionNode): void {
    const nextState = { ...this.actionState };

    this.safeActions(option).forEach((action) => {
      nextState[this.actionKey(option.id, action.id)] = false;
    });

    this.actionState = nextState;
  }

  private optionHasChanges(option: PermissionOptionNode): boolean {
    return this.safeActions(option).some((action) => this.actionChanged(option, action));
  }

  private actionKey(optionId: number, actionId: number): string {
    return `${optionId}:${actionId}`;
  }
}
