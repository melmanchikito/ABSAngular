import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PermissionKey, UserPermissions } from '../models/permissions.model';

@Injectable({
  providedIn: 'root'
})
export class PermissionsService {
  private readonly permissionsSubject = new BehaviorSubject<UserPermissions | null>(null);
  readonly permissions$ = this.permissionsSubject.asObservable();

  constructor() {
    this.loadPermissionsFromStorage();
  }

  setPermissions(data: UserPermissions): void {
    this.permissionsSubject.next(data);
    localStorage.setItem('userPermissions', JSON.stringify(data));
  }

  getPermissionsSnapshot(): UserPermissions | null {
    return this.permissionsSubject.value;
  }

  getAllPermissions(): PermissionKey[] {
    const permissions = this.getPermissionsSnapshot();

    return [
      ...(permissions?.priorityPermissions ?? []),
      ...(permissions?.permissions ?? [])
    ];
  }

  hasPermission(permission: PermissionKey): boolean {
    return this.getAllPermissions().includes(permission);
  }

  hasAnyPermission(permissions: PermissionKey[]): boolean {
    if (!permissions.length) {
      return true;
    }

    return permissions.some((permission) => this.hasPermission(permission));
  }

  hasEveryPermission(permissions: PermissionKey[]): boolean {
    if (!permissions.length) {
      return true;
    }

    return permissions.every((permission) => this.hasPermission(permission));
  }

  loadPermissionsFromStorage(): void {
    const stored = localStorage.getItem('userPermissions');
    if (!stored) {
      return;
    }

    try {
      const parsed = JSON.parse(stored) as UserPermissions;
      this.permissionsSubject.next(parsed);
    } catch {
      localStorage.removeItem('userPermissions');
    }
  }

  clearPermissions(): void {
    this.permissionsSubject.next(null);
    localStorage.removeItem('userPermissions');
  }
}
