import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  Building2,
  Check,
  ChevronDown,
  Circle,
  FolderKanban,
  KeyRound,
  LayoutDashboard,
  LucideAngularModule,
  RefreshCcw,
  Search,
  ShieldCheck
} from 'lucide-angular';
import { EmptyStateComponent } from '../../../../../shared/components/empty-state/empty-state.component';
import { PageHeaderComponent } from '../../../../../shared/components/page-header/page-header.component';
import { DebouncedSearchDirective } from '../../../../../shared/directives/debounced-search.directive';
import { UserItem } from '../../../models/user-maintenance.model';
import {
  PermissionActionNode,
  PermissionAreaNode,
  PermissionManagerService,
  PermissionModuleNode,
  PermissionOptionNode
} from '../../../services/permission-manager.service';
import { UserMaintenanceService } from '../../../services/user-maintenance.service';

interface PermissionTreeStats {
  areas: number;
  modules: number;
  options: number;
  actions: number;
  activeActions: number;
}

@Component({
  selector: 'app-permission-maintenance',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
    EmptyStateComponent,
    PageHeaderComponent,
    DebouncedSearchDirective
  ],
  templateUrl: './permission-maintenance.component.html',
  styleUrl: './permission-maintenance.component.scss'
})
export class PermissionMaintenanceComponent implements OnInit {
  readonly permissionIcon = ShieldCheck;
  readonly areaIcon = Building2;
  readonly moduleIcon = LayoutDashboard;
  readonly optionIcon = FolderKanban;
  readonly actionIcon = KeyRound;
  readonly activeIcon = Check;
  readonly inactiveIcon = Circle;
  readonly chevronIcon = ChevronDown;
  readonly refreshIcon = RefreshCcw;
  readonly searchIcon = Search;

  areas: PermissionAreaNode[] = [];
  visibleAreas: PermissionAreaNode[] = [];
  users: UserItem[] = [];
  selectedUserId: number | null = null;
  searchTerm = '';
  isLoadingUsers = false;
  isLoading = false;
  usersErrorMessage = '';
  errorMessage = '';

  readonly expandedAreaIds = new Set<number>();
  readonly expandedModuleIds = new Set<number>();
  readonly expandedOptionIds = new Set<number>();

  constructor(
    private readonly permissionService: PermissionManagerService,
    private readonly userService: UserMaintenanceService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  get stats(): PermissionTreeStats {
    return this.countTree(this.areas);
  }

  get visibleStats(): PermissionTreeStats {
    return this.countTree(this.visibleAreas);
  }

  get selectedUser(): UserItem | undefined {
    return this.users.find((user) => user.id === this.selectedUserId);
  }

  get selectedUserLabel(): string {
    return this.selectedUser ? this.getUserLabel(this.selectedUser) : '';
  }

  loadPermissions(): void {
    if (this.selectedUserId === null) {
      this.areas = [];
      this.visibleAreas = [];
      this.errorMessage = '';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.permissionService.getPermissionsTree(this.selectedUserId).subscribe({
      next: (areas) => {
        this.areas = areas;
        this.applySearch(this.searchTerm);
        this.expandVisibleTree();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error cargando arbol de permisos:', error);
        console.error('Respuesta backend:', (error as { error?: unknown }).error);
        this.areas = [];
        this.visibleAreas = [];
        this.errorMessage = this.getPermissionErrorMessage(error);
        this.isLoading = false;
      }
    });
  }

  onUserChange(userId: number | null): void {
    this.selectedUserId = userId;
    this.searchTerm = '';
    this.expandedAreaIds.clear();
    this.expandedModuleIds.clear();
    this.expandedOptionIds.clear();
    this.loadPermissions();
  }

  onSearchChange(term: string): void {
    this.searchTerm = term;
    this.applySearch(term);
    this.expandVisibleTree();
  }

  toggleArea(areaId: number): void {
    this.toggleSet(this.expandedAreaIds, areaId);
  }

  toggleModule(moduleId: number): void {
    this.toggleSet(this.expandedModuleIds, moduleId);
  }

  toggleOption(optionId: number): void {
    this.toggleSet(this.expandedOptionIds, optionId);
  }

  isAreaExpanded(areaId: number): boolean {
    return this.expandedAreaIds.has(areaId);
  }

  isModuleExpanded(moduleId: number): boolean {
    return this.expandedModuleIds.has(moduleId);
  }

  isOptionExpanded(optionId: number): boolean {
    return this.expandedOptionIds.has(optionId);
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

  formatValue(value: unknown): string {
    return value === null || value === undefined || value === '' ? '-' : String(value);
  }

  formatActionName(action: PermissionActionNode): string {
    const value = String(action.name ?? '').trim();
    return value || '-';
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

  trackByUserId(_: number, user: UserItem): number {
    return user.id;
  }

  getUserLabel(user: UserItem): string {
    return [user.name, user.lastname].filter(Boolean).join(' ').trim() || user.username || user.email || `Usuario ${user.id}`;
  }

  private loadUsers(): void {
    this.isLoadingUsers = true;
    this.usersErrorMessage = '';

    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users = users.filter((user) => !user.canceled);
        this.isLoadingUsers = false;
      },
      error: (error) => {
        console.error('Error cargando usuarios para mantenimiento Permisos:', error);
        console.error('Respuesta backend:', (error as { error?: unknown }).error);
        this.users = [];
        this.usersErrorMessage = 'No se pudo cargar el listado de usuarios.';
        this.isLoadingUsers = false;
      }
    });
  }

  private applySearch(term: string): void {
    this.visibleAreas = this.filterAreas(this.areas, this.normalize(term));
  }

  private filterAreas(areas: PermissionAreaNode[], term: string): PermissionAreaNode[] {
    if (!term) {
      return areas;
    }

    return areas.reduce<PermissionAreaNode[]>((result, area) => {
      const areaMatches = this.includesTerm(area.name, term);

      if (areaMatches) {
        result.push(area);
        return result;
      }

      const modules = this.safeModules(area).reduce<PermissionModuleNode[]>((moduleResult, moduleItem) => {
        const moduleMatches = this.includesTerm(moduleItem.name, term);

        if (moduleMatches) {
          moduleResult.push(moduleItem);
          return moduleResult;
        }

        const options = this.safeOptions(moduleItem).reduce<PermissionOptionNode[]>((optionResult, option) => {
          const optionMatches = this.includesTerm(option.name, term);

          if (optionMatches) {
            optionResult.push(option);
            return optionResult;
          }

          const actions = this.safeActions(option).filter((action) => this.includesTerm(action.name, term));

          if (actions.length) {
            optionResult.push({ ...option, actions });
          }

          return optionResult;
        }, []);

        if (options.length) {
          moduleResult.push({ ...moduleItem, options });
        }

        return moduleResult;
      }, []);

      if (modules.length) {
        result.push({ ...area, modules });
      }

      return result;
    }, []);
  }

  private expandVisibleTree(): void {
    this.visibleAreas.forEach((area) => {
      this.expandedAreaIds.add(area.id);

      this.safeModules(area).forEach((moduleItem) => {
        this.expandedModuleIds.add(moduleItem.id);

        this.safeOptions(moduleItem).forEach((option) => {
          this.expandedOptionIds.add(option.id);
        });
      });
    });
  }

  private countTree(areas: PermissionAreaNode[]): PermissionTreeStats {
    return areas.reduce<PermissionTreeStats>(
      (stats, area) => {
        stats.areas += 1;

        this.safeModules(area).forEach((moduleItem) => {
          stats.modules += 1;

          this.safeOptions(moduleItem).forEach((option) => {
            stats.options += 1;

            this.safeActions(option).forEach((action) => {
              stats.actions += 1;

              if (action.has_permission) {
                stats.activeActions += 1;
              }
            });
          });
        });

        return stats;
      },
      { areas: 0, modules: 0, options: 0, actions: 0, activeActions: 0 }
    );
  }

  private includesTerm(value: unknown, term: string): boolean {
    return this.normalize(value).includes(term);
  }

  private normalize(value: unknown): string {
    return String(value ?? '').trim().toLowerCase();
  }

  private getPermissionErrorMessage(error: { status?: number } | null | undefined): string {
    if (error?.status === 0) {
      return 'Problema de conexion o permisos CORS.';
    }

    if (error?.status === 404) {
      return 'No se pudo cargar el arbol de permisos. Verifique el endpoint.';
    }

    return 'No se pudo cargar el arbol de permisos.';
  }

  private toggleSet(set: Set<number>, value: number): void {
    if (set.has(value)) {
      set.delete(value);
      return;
    }

    set.add(value);
  }
}
