import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal
} from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';
import {
  CirclePlus,
  Edit3,
  Eye,
  LucideAngularModule,
  RefreshCcw,
  Search,
  Trash2,
  UserRound,
  X
} from 'lucide-angular';
import { finalize } from 'rxjs';
import { ConfirmDialogComponent } from '../../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { DataGridPaginationComponent } from '../../../../../shared/components/data-grid-pagination/data-grid-pagination.component';
import { EmptyStateComponent } from '../../../../../shared/components/empty-state/empty-state.component';
import { PageHeaderComponent } from '../../../../../shared/components/page-header/page-header.component';
import { StatCardComponent } from '../../../../../shared/components/stat-card/stat-card.component';
import { StatusBadgeComponent } from '../../../../../shared/components/status-badge/status-badge.component';
import {
  CancelUserRequest,
  InsertUserRequest,
  UpdateUserRequest,
  UserItem
} from '../../../models/user-maintenance.model';
import { UserMaintenanceService } from '../../../services/user-maintenance.service';

type UserStatusFilter = 'all' | 'active' | 'inactive';
type UserModalMode = 'create' | 'edit';
type UserFormField =
  | 'username'
  | 'name'
  | 'lastname'
  | 'email'
  | 'password'
  | 'confirm_password'
  | 'role_id'
  | 'state'
  | 'phone'
  | 'identification';
type BackendErrorBody = Record<string, unknown>;

interface ToastState {
  type: 'success' | 'error';
  message: string;
}

interface UserForm {
  username: FormControl<string>;
  name: FormControl<string>;
  lastname: FormControl<string>;
  email: FormControl<string>;
  password: FormControl<string>;
  confirm_password: FormControl<string>;
  role_id: FormControl<number | null>;
  state: FormControl<string>;
  phone: FormControl<string>;
  identification: FormControl<string>;
}

@Component({
  selector: 'app-user-maintenance',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LucideAngularModule,
    ConfirmDialogComponent,
    DataGridPaginationComponent,
    EmptyStateComponent,
    PageHeaderComponent,
    StatCardComponent,
    StatusBadgeComponent
  ],
  templateUrl: './user-maintenance.component.html',
  styleUrl: './user-maintenance.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserMaintenanceComponent {
  readonly userIcon = UserRound;
  readonly addIcon = CirclePlus;
  readonly detailIcon = Eye;
  readonly editIcon = Edit3;
  readonly refreshIcon = RefreshCcw;
  readonly searchIcon = Search;
  readonly trashIcon = Trash2;
  readonly closeIcon = X;

  readonly pageSize = 7;
  readonly users = signal<UserItem[]>([]);
  readonly searchTerm = signal('');
  readonly statusFilter = signal<UserStatusFilter>('all');
  readonly currentPage = signal(1);
  readonly selectedUserId = signal<number | null>(null);
  readonly isLoading = signal(false);
  readonly isSaving = signal(false);
  readonly isLoadingDetail = signal(false);
  readonly modalOpen = signal(false);
  readonly modalMode = signal<UserModalMode>('create');
  readonly editingUser = signal<UserItem | null>(null);
  readonly userToCancel = signal<UserItem | null>(null);
  readonly toast = signal<ToastState | null>(null);
  readonly formError = signal('');

  readonly userForm = new FormGroup<UserForm>(
    {
      username: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(3)]
      }),
      name: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(2)]
      }),
      lastname: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(2)]
      }),
      email: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.email]
      }),
      password: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(8)]
      }),
      confirm_password: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required]
      }),
      role_id: new FormControl<number | null>(null, {
        validators: [Validators.required]
      }),
      state: new FormControl('active', {
        nonNullable: true,
        validators: [Validators.required]
      }),
      phone: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(7)]
      }),
      identification: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(6)]
      })
    },
    {
      validators: [this.passwordsMatchValidator]
    }
  );

  readonly totalUsers = computed(() => this.users().length);
  readonly activeUsersCount = computed(
    () => this.users().filter((user) => this.isUserActive(user)).length
  );
  readonly inactiveUsersCount = computed(
    () => this.users().filter((user) => !this.isUserActive(user)).length
  );

  readonly filteredUsers = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const status = this.statusFilter();

    return this.users().filter((user) => {
      const isActive = this.isUserActive(user);
      const matchesStatus =
        status === 'all' ||
        (status === 'active' && isActive) ||
        (status === 'inactive' && !isActive);

      if (!matchesStatus) {
        return false;
      }

      if (!term) {
        return true;
      }

      return [
        String(user.id),
        user.username,
        this.getFullName(user),
        user.email,
        String(user.role_id ?? ''),
        String(user.state ?? ''),
        user.phone ?? '',
        user.identification ?? ''
      ].some((value) => value.toLowerCase().includes(term));
    });
  });

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredUsers().length / this.pageSize))
  );

  readonly paginatedUsers = computed(() => {
    const safePage = Math.min(this.currentPage(), this.totalPages());
    const start = (safePage - 1) * this.pageSize;

    return this.filteredUsers().slice(start, start + this.pageSize);
  });

  readonly showingCount = computed(() => this.paginatedUsers().length);

  readonly selectedUser = computed(() => {
    const selectedId = this.selectedUserId();

    if (!selectedId) {
      return null;
    }

    return this.users().find((user) => user.id === selectedId) ?? null;
  });

  readonly cancelUserMessage = computed(() => {
    const username = this.userToCancel()?.username ?? 'este usuario';

    return `Esta seguro de que desea borrar ${username}?`;
  });

  readonly modalTitle = computed(() =>
    this.modalMode() === 'create' ? 'Nuevo usuario' : 'Editar usuario'
  );

  private readonly userService = inject(UserMaintenanceService);
  private toastTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading.set(true);

    this.userService
      .getUsers()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (users) => {
          this.users.set(users);
          this.currentPage.set(Math.min(this.currentPage(), this.totalPages()));
          this.selectedUserId.set(
            users.some((user) => user.id === this.selectedUserId())
              ? this.selectedUserId()
              : null
          );
        },
        error: (error) => this.handleHttpError(error, 'No se pudo cargar el listado de usuarios.')
      });
  }

  updateSearchTerm(value: string): void {
    this.searchTerm.set(value);
    this.currentPage.set(1);
  }

  setStatusFilter(filter: UserStatusFilter): void {
    this.statusFilter.set(filter);
    this.currentPage.set(1);
  }

  previousPage(): void {
    this.currentPage.set(Math.max(1, this.currentPage() - 1));
  }

  nextPage(): void {
    this.currentPage.set(Math.min(this.totalPages(), this.currentPage() + 1));
  }

  setPage(page: number): void {
    this.currentPage.set(Math.min(Math.max(1, page), this.totalPages()));
  }

  selectUser(user: UserItem): void {
    this.selectedUserId.set(user.id);
  }

  openCreateModal(): void {
    this.modalMode.set('create');
    this.editingUser.set(null);
    this.formError.set('');
    this.setPasswordValidators(true);
    this.userForm.reset({
      username: '',
      name: '',
      lastname: '',
      email: '',
      password: '',
      confirm_password: '',
      role_id: null,
      state: 'active',
      phone: '',
      identification: ''
    });
    this.userForm.controls.username.enable();
    this.modalOpen.set(true);
  }

  openEditModal(user: UserItem): void {
    this.modalMode.set('edit');
    this.editingUser.set(user);
    this.formError.set('');
    this.setPasswordValidators(false);
    this.patchForm(user);
    this.userForm.controls.username.enable();
    this.modalOpen.set(true);
    this.isLoadingDetail.set(true);

    this.userService
      .getUserById(user.id)
      .pipe(finalize(() => this.isLoadingDetail.set(false)))
      .subscribe({
        next: (loadedUser) => {
          this.editingUser.set(loadedUser);
          this.patchForm(loadedUser);
        },
        error: (error) =>
          this.handleHttpError(
            error,
            'No se pudo cargar el usuario seleccionado.',
            true
          )
      });
  }

  closeModal(): void {
    if (this.isSaving()) {
      return;
    }

    this.modalOpen.set(false);
    this.editingUser.set(null);
    this.formError.set('');
    this.isLoadingDetail.set(false);
  }

  saveUser(): void {
    this.formError.set('');
    this.userForm.markAllAsTouched();

    if (this.userForm.invalid) {
      this.formError.set('Revise los campos obligatorios antes de guardar.');
      return;
    }

    const roleId = Number(this.userForm.controls.role_id.value);

    if (!Number.isFinite(roleId) || roleId <= 0) {
      this.formError.set('El rol es obligatorio y debe ser numerico.');
      return;
    }

    this.isSaving.set(true);

    if (this.modalMode() === 'create') {
      const payload: InsertUserRequest = {
        username: this.userForm.controls.username.getRawValue().trim(),
        name: this.userForm.controls.name.getRawValue().trim(),
        lastname: this.userForm.controls.lastname.getRawValue().trim(),
        email: this.userForm.controls.email.getRawValue().trim(),
        password: this.userForm.controls.password.getRawValue(),
        confirm_password: this.userForm.controls.confirm_password.getRawValue(),
        role_id: roleId,
        state: this.userForm.controls.state.getRawValue(),
        phone: this.userForm.controls.phone.getRawValue().trim(),
        identification: this.userForm.controls.identification.getRawValue().trim(),
        created_by: this.getUsername()
      };

      this.userService
        .insertUser(payload)
        .pipe(finalize(() => this.isSaving.set(false)))
        .subscribe({
          next: () => this.afterSuccessfulSave('Usuario creado correctamente.'),
          error: (error) => this.handleHttpError(error, 'No se pudo crear el usuario.', true)
        });

      return;
    }

    const editing = this.editingUser();

    if (!editing) {
      this.isSaving.set(false);
      this.formError.set('No se encontro el usuario seleccionado.');
      return;
    }

    const payload: UpdateUserRequest = {
      user_id: editing.id,
      username: this.userForm.controls.username.getRawValue().trim(),
      name: this.userForm.controls.name.getRawValue().trim(),
      lastname: this.userForm.controls.lastname.getRawValue().trim(),
      email: this.userForm.controls.email.getRawValue().trim(),
      role_id: roleId,
      state: this.userForm.controls.state.getRawValue(),
      phone: this.userForm.controls.phone.getRawValue().trim(),
      identification: this.userForm.controls.identification.getRawValue().trim(),
      updated_by: this.getUsername()
    };

    const password = this.userForm.controls.password.getRawValue();
    const confirmPassword = this.userForm.controls.confirm_password.getRawValue();

    if (password) {
      payload.password = password;
      payload.confirm_password = confirmPassword;
    }

    this.userService
      .updateUser(payload)
      .pipe(finalize(() => this.isSaving.set(false)))
      .subscribe({
        next: () => this.afterSuccessfulSave('Usuario actualizado correctamente.'),
        error: (error) => this.handleHttpError(error, 'No se pudo actualizar el usuario.', true)
      });
  }

  askCancel(user: UserItem): void {
    this.userToCancel.set(user);
  }

  closeCancelConfirm(): void {
    if (this.isSaving()) {
      return;
    }

    this.userToCancel.set(null);
  }

  confirmCancel(): void {
    const user = this.userToCancel();

    if (!user) {
      return;
    }

    const payload: CancelUserRequest = {
      user_id: user.id,
      canceled_by: this.getUsername()
    };

    this.isSaving.set(true);

    this.userService
      .cancelUser(payload)
      .pipe(finalize(() => this.isSaving.set(false)))
      .subscribe({
        next: () => {
          this.userToCancel.set(null);
          this.selectedUserId.set(null);
          this.setToast('success', 'Usuario anulado correctamente.');
          this.loadUsers();
        },
        error: (error) => this.handleHttpError(error, 'No se pudo anular el usuario.')
      });
  }

  fieldInvalid(field: UserFormField): boolean {
    const control = this.userForm.controls[field];

    if (field === 'confirm_password' && this.userForm.hasError('passwordMismatch')) {
      return control.touched || control.dirty;
    }

    return control.invalid && (control.touched || control.dirty);
  }

  fieldMessage(field: UserFormField): string {
    const control = this.userForm.controls[field];

    if (field === 'confirm_password' && this.userForm.hasError('passwordMismatch')) {
      return 'Las contrasenas no coinciden.';
    }

    if (control.hasError('required')) {
      return this.requiredFieldMessage(field);
    }

    if (control.hasError('email')) {
      return 'Ingrese un email valido.';
    }

    if (control.hasError('minlength')) {
      return this.minLengthFieldMessage(field);
    }

    return '';
  }

  formatDate(value?: string | null): string {
    return value || 'Sin registro';
  }

  getFullName(user: UserItem): string {
    return [user.name, user.lastname].filter(Boolean).join(' ').trim() || user.username;
  }

  getUserInitial(user: UserItem): string {
    return (user.name || user.username || '?').trim().charAt(0).toUpperCase();
  }

  getStateLabel(user: UserItem): string {
    if (user.canceled) {
      return 'Inactivo';
    }

    const state = String(user.state ?? 'active').toLowerCase();

    if (['inactive', 'inactivo', '0', 'false', 'canceled', 'cancelado'].includes(state)) {
      return 'Inactivo';
    }

    if (['blocked', 'bloqueado'].includes(state)) {
      return 'Bloqueado';
    }

    if (['pending', 'pendiente'].includes(state)) {
      return 'Pendiente';
    }

    return 'Activo';
  }

  getStateVariant(user: UserItem): 'active' | 'inactive' | 'warning' | 'neutral' {
    const label = this.getStateLabel(user);

    if (label === 'Activo') {
      return 'active';
    }

    if (label === 'Inactivo') {
      return 'inactive';
    }

    if (label === 'Pendiente' || label === 'Bloqueado') {
      return 'warning';
    }

    return 'neutral';
  }

  isUserActive(user: UserItem): boolean {
    return this.getStateLabel(user) === 'Activo';
  }

  trackByUserId(_: number, user: UserItem): number {
    return user.id;
  }

  private patchForm(user: UserItem): void {
    this.userForm.reset({
      username: user.username ?? '',
      name: user.name ?? '',
      lastname: user.lastname ?? '',
      email: user.email ?? '',
      password: '',
      confirm_password: '',
      role_id: user.role_id ?? null,
      state: String(user.state ?? (user.canceled ? 'inactive' : 'active')),
      phone: user.phone ?? '',
      identification: user.identification ?? ''
    });
  }

  private setPasswordValidators(required: boolean): void {
    this.userForm.controls.password.setValidators(
      required ? [Validators.required, Validators.minLength(8)] : [Validators.minLength(8)]
    );
    this.userForm.controls.confirm_password.setValidators(
      required ? [Validators.required] : []
    );
    this.userForm.controls.password.updateValueAndValidity({ emitEvent: false });
    this.userForm.controls.confirm_password.updateValueAndValidity({ emitEvent: false });
    this.userForm.updateValueAndValidity({ emitEvent: false });
  }

  private passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value as string | null;
    const confirmPassword = control.get('confirm_password')?.value as string | null;

    if (!password && !confirmPassword) {
      return null;
    }

    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  private afterSuccessfulSave(message: string): void {
    this.modalOpen.set(false);
    this.editingUser.set(null);
    this.setToast('success', message);
    this.loadUsers();
  }

  private handleHttpError(error: unknown, fallback: string, formError = false): void {
    const message = this.extractErrorMessage(this.getErrorBody(error), fallback);

    if (formError) {
      this.formError.set(message);
      return;
    }

    this.setToast('error', message);
  }

  private getErrorBody(error: unknown): BackendErrorBody | null {
    if (!error || typeof error !== 'object') {
      return null;
    }

    const body = (error as BackendErrorBody)['error'];

    return this.isRecord(body) ? body : null;
  }

  private extractErrorMessage(errorBody: BackendErrorBody | null, fallback: string): string {
    const nestedError = this.isRecord(errorBody?.['error']) ? errorBody?.['error'] : null;
    const details = this.isRecord(nestedError?.['details_error'])
      ? nestedError?.['details_error']
      : errorBody?.['details_error'];
    const detail = this.isRecord(details) ? details['error_detail'] : null;

    if (this.isStringArrayRecord(detail)) {
      const messages = Object.entries(detail)
        .map(([field, validations]) => this.validationMessage(field, validations))
        .filter((message): message is string => Boolean(message));

      if (messages.length) {
        return messages.join(' ');
      }
    }

    const detailsMessage = this.isRecord(details) ? details['error_message'] : null;
    const bodyMessage = errorBody?.['message'];
    const nestedMessage = nestedError?.['message'];

    if (typeof detailsMessage === 'string') {
      return detailsMessage;
    }

    if (typeof bodyMessage === 'string') {
      return bodyMessage;
    }

    if (typeof nestedMessage === 'string') {
      return nestedMessage;
    }

    return fallback;
  }

  private validationMessage(field: string, validations: string[]): string | null {
    if (!validations.includes('validation.required')) {
      return null;
    }

    const labels: Record<string, string> = {
      username: 'El usuario es obligatorio.',
      name: 'El nombre es obligatorio.',
      lastname: 'El apellido es obligatorio.',
      email: 'El email es obligatorio.',
      password: 'La contrasena es obligatoria.',
      confirm_password: 'La confirmacion de contrasena es obligatoria.',
      role_id: 'El rol es obligatorio.',
      state: 'El estado es obligatorio.',
      phone: 'El telefono es obligatorio.',
      identification: 'La identificacion es obligatoria.'
    };

    return labels[field] ?? `${field} es obligatorio.`;
  }

  private requiredFieldMessage(field: UserFormField): string {
    const messages: Record<UserFormField, string> = {
      username: 'El usuario es obligatorio.',
      name: 'El nombre es obligatorio.',
      lastname: 'El apellido es obligatorio.',
      email: 'El email es obligatorio.',
      password: 'La contrasena es obligatoria.',
      confirm_password: 'La confirmacion de contrasena es obligatoria.',
      role_id: 'El rol es obligatorio.',
      state: 'El estado es obligatorio.',
      phone: 'El telefono es obligatorio.',
      identification: 'La identificacion es obligatoria.'
    };

    return messages[field];
  }

  private minLengthFieldMessage(field: UserFormField): string {
    const messages: Partial<Record<UserFormField, string>> = {
      username: 'El usuario debe tener al menos 3 caracteres.',
      name: 'El nombre debe tener al menos 2 caracteres.',
      lastname: 'El apellido debe tener al menos 2 caracteres.',
      password: 'La contrasena debe tener al menos 8 caracteres.',
      phone: 'El telefono debe tener al menos 7 caracteres.',
      identification: 'La identificacion debe tener al menos 6 caracteres.'
    };

    return messages[field] ?? 'El valor ingresado es demasiado corto.';
  }

  private isRecord(value: unknown): value is BackendErrorBody {
    return Boolean(value && typeof value === 'object' && !Array.isArray(value));
  }

  private isStringArrayRecord(value: unknown): value is Record<string, string[]> {
    if (!this.isRecord(value)) {
      return false;
    }

    return Object.values(value).every(
      (item) => Array.isArray(item) && item.every((entry) => typeof entry === 'string')
    );
  }

  private setToast(type: ToastState['type'], message: string): void {
    this.toast.set({ type, message });

    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
    }

    this.toastTimer = setTimeout(() => this.toast.set(null), 4200);
  }

  private getUsername(): string {
    return (
      localStorage.getItem('username') ||
      localStorage.getItem('userName') ||
      localStorage.getItem('user') ||
      localStorage.getItem('email') ||
      'Usuario'
    );
  }
}
