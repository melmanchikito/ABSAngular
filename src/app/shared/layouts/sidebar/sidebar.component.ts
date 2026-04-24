import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PermissionsService } from '../../../core/services/permissions.service';
import { AuthApiService } from '../../../features/auth/services/auth-api.service';
import { PERMISSION_ICONS } from '../../../core/constants/permission-icons.constants';
import { NavigationService } from '../../../core/services/navigation.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  @Output() selectSection = new EventEmitter<string>();

  activePerm: string | null = 'HelpDesk';
  readonly permissionIcons = PERMISSION_ICONS;

  constructor(
    public readonly permissionsService: PermissionsService,
    private readonly authApiService: AuthApiService,
    private readonly navigationService: NavigationService
  ) {}

  onSelect(permission: string): void {
    this.activePerm = permission;
    this.selectSection.emit(permission);

    if (permission === 'HelpDesk') {
      void this.navigationService.goToHelpdesk();
    }
  }

  goToProfile(): void {
    this.activePerm = 'Perfil';
    void this.navigationService.goToProfile();
  }

  async logout(): Promise<void> {
    await this.authApiService.handleLogout();
  }

  get permissions(): string[] {
    return this.permissionsService.getPermissionsSnapshot()?.permissions ?? ['HelpDesk'];
  }
}