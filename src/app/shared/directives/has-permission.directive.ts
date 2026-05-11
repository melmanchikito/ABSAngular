import {
  Directive,
  Input,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewContainerRef
} from '@angular/core';
import { Subscription } from 'rxjs';
import { PermissionKey } from '../../core/models/permissions.model';
import { PermissionsService } from '../../core/services/permissions.service';

type PermissionMode = 'any' | 'all';

@Directive({
  selector: '[appHasPermission]',
  standalone: true
})
export class HasPermissionDirective implements OnInit, OnDestroy {
  @Input() set appHasPermission(value: PermissionKey | PermissionKey[] | null | undefined) {
    this.requiredPermissions = Array.isArray(value) ? value : value ? [value] : [];
    this.updateView();
  }

  @Input() set appHasPermissionMode(value: PermissionMode | null | undefined) {
    this.mode = value ?? 'any';
    this.updateView();
  }

  private requiredPermissions: PermissionKey[] = [];
  private mode: PermissionMode = 'any';
  private hasView = false;
  private subscription?: Subscription;

  constructor(
    private readonly templateRef: TemplateRef<unknown>,
    private readonly viewContainer: ViewContainerRef,
    private readonly permissionsService: PermissionsService
  ) {}

  ngOnInit(): void {
    this.subscription = this.permissionsService.permissions$.subscribe(() => this.updateView());
    this.updateView();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  private updateView(): void {
    const canShow =
      this.mode === 'all'
        ? this.permissionsService.hasEveryPermission(this.requiredPermissions)
        : this.permissionsService.hasAnyPermission(this.requiredPermissions);

    if (canShow && !this.hasView) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
      return;
    }

    if (!canShow && this.hasView) {
      this.viewContainer.clear();
      this.hasView = false;
    }
  }
}
