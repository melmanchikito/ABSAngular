import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { UserPermissions } from '../models/permissions.model';

@Injectable({
  providedIn: 'root'
})
export class PermissionsService {
  private readonly permissionsSubject = new BehaviorSubject<UserPermissions | null>(null);
  readonly permissions$ = this.permissionsSubject.asObservable();

  setPermissions(data: UserPermissions): void {
    this.permissionsSubject.next(data);
    localStorage.setItem('userPermissions', JSON.stringify(data));
  }

  getPermissionsSnapshot(): UserPermissions | null {
    return this.permissionsSubject.value;
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