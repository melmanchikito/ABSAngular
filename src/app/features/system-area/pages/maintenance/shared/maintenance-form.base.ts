import { Directive, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ArrowLeft, Save } from 'lucide-angular';
import { Observable, forkJoin } from 'rxjs';
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
import { DepartmentMaintenanceService } from '../../../../rrhh-area/services/department-maintenance.service';
import { UserMaintenanceService } from '../../../services/user-maintenance.service';
import { PositionMaintenanceService } from '../../../../rrhh-area/services/position-maintenance.service';
import { SellerMaintenanceService } from '../../../../clients-area/services/seller-maintenance.service';
import {
  createMaintenanceFormConfig,
  MaintenanceFormConfigServices
} from './maintenance-form.config';
import {
  EntityRecord,
  FormFieldConfig,
  FormValue,
  MaintenanceEntity,
  MaintenanceFormConfig,
  MaintenanceMode,
  SelectOption
} from './maintenance-form.types';
import {
  extractErrorMessage,
  getUsername,
  normalizeFormValue,
  toNumberValue,
  validateMaintenanceForm
} from './maintenance-form.helpers';

@Directive()
export abstract class MaintenanceFormBase {
  readonly backIcon = ArrowLeft;
  readonly saveIcon = Save;

  form: Record<string, FormValue> = {};
  errors: Record<string, string> = {};
  selectOptions: Record<string, readonly SelectOption[]> = {};
  pageError = '';
  isLoading = false;
  isSaving = false;
  submitted = false;

  config!: MaintenanceFormConfig;
  recordId: number | null = null;

  abstract readonly mode: MaintenanceMode;
  abstract get title(): string;
  abstract get subtitle(): string;

  protected readonly route = inject(ActivatedRoute);
  protected readonly router = inject(Router);
  private readonly companyService = inject(CompanyMaintenanceService);
  private readonly employeeService = inject(EmployeeMaintenanceService);
  private readonly locationService = inject(LocationMaintenanceService);
  private readonly branchService = inject(BranchMaintenanceService);
  private readonly moduleService = inject(ModuleMaintenanceService);
  private readonly actionService = inject(ActionMaintenanceService);
  private readonly optionService = inject(OptionMaintenanceService);
  private readonly optionTypeService = inject(OptionTypeMaintenanceService);
  private readonly userService = inject(UserMaintenanceService);
  private readonly helpdeskService = inject(HelpdeskMaintenanceService);
  private readonly productService = inject(ProductMaintenanceService);
  private readonly sellerService = inject(SellerMaintenanceService);
  private readonly positionService = inject(PositionMaintenanceService);
  private readonly departmentService = inject(DepartmentMaintenanceService);

  get visibleFields(): readonly FormFieldConfig[] {
    return this.config.fields.filter((field) => {
      if (this.mode === 'create') {
        return !field.hideOnCreate;
      }

      return !field.createOnly && !field.hideOnEdit;
    });
  }

  setupFormPage(): void {
    const entity = this.route.snapshot.data['entity'] as MaintenanceEntity;
    this.recordId = Number(this.route.snapshot.paramMap.get('id')) || null;
    this.config = createMaintenanceFormConfig(entity, this.getConfigServices());
    this.initializeForm();
    this.loadSelectOptions();
  }

  getFieldValue(key: string): FormValue {
    return this.form[key] ?? '';
  }

  setFieldValue(key: string, value: FormValue): void {
    const field = this.config.fields.find((item) => item.key === key);

    if (field?.numeric) {
      this.form[key] = toNumberValue(value);
      return;
    }

    if (field?.type === 'checkbox') {
      this.form[key] = Boolean(value);
      return;
    }

    const textValue = String(value ?? '');
    this.form[key] = field?.maxLength ? textValue.slice(0, field.maxLength) : textValue;
  }

  fieldOptions(field: FormFieldConfig): readonly SelectOption[] {
    const optionsKey = this.getOptionsKey(field);
    const options = field.options ?? (optionsKey ? this.selectOptions[optionsKey] ?? [] : []);
    const currentValue = this.form[field.key];

    if (
      currentValue === null ||
      currentValue === '' ||
      typeof currentValue === 'boolean' ||
      options.some((option) => String(option.value) === String(currentValue))
    ) {
      return options;
    }

    return [
      ...options,
      {
        value: currentValue,
        label: `${field.label} vinculado #${currentValue}`
      }
    ];
  }

  fieldHasEmptyOptions(field: FormFieldConfig): boolean {
    return Boolean(
      field.type === 'select' &&
      this.getOptionsKey(field) &&
      field.emptyOptionsMessage &&
      !this.fieldOptions(field).length
    );
  }

  fieldEmptyOptionsMessage(field: FormFieldConfig): string {
    return field.emptyOptionsMessage ?? '';
  }

  fieldInvalid(field: FormFieldConfig): boolean {
    return Boolean(this.submitted && this.errors[field.key]);
  }

  hasCharacterCounter(field: FormFieldConfig): boolean {
    return Boolean(field.maxLength && field.type !== 'select' && field.type !== 'number' && !field.numeric);
  }

  fieldLength(field: FormFieldConfig): number {
    return String(this.form[field.key] ?? '').length;
  }

  fieldCounterClass(field: FormFieldConfig): string {
    if (!field.maxLength) {
      return '';
    }

    const used = this.fieldLength(field);

    if (used >= field.maxLength) {
      return 'is-limit';
    }

    if (used >= Math.floor(field.maxLength * 0.9)) {
      return 'is-warning';
    }

    return '';
  }

  isReadonly(field: FormFieldConfig): boolean {
    return this.mode === 'edit' && Boolean(field.readonlyOnEdit);
  }

  goBack(): void {
    void this.router.navigateByUrl(this.config.listUrl);
  }

  cancel(): void {
    this.goBack();
  }

  protected validateCurrentForm(): boolean {
    this.submitted = true;
    this.errors = validateMaintenanceForm(this.visibleFields, this.form, this.config.entity, this.mode);

    if (Object.keys(this.errors).length) {
      this.pageError = 'Revise los campos obligatorios antes de guardar.';
      return false;
    }

    this.pageError = '';
    return true;
  }

  protected loadRecord(): void {
    if (!this.recordId || !this.config.load) {
      this.pageError = 'No se encontro el registro seleccionado.';
      return;
    }

    this.isLoading = true;

    this.config.load(this.recordId).subscribe({
      next: (loadedRecord) => {
        const record = loadedRecord as EntityRecord;

        for (const field of this.config.fields) {
          const value = this.getRecordFieldValue(record, field);
          this.form[field.key] = normalizeFormValue(value, field);
        }

        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.pageError = extractErrorMessage(error, 'No se pudo cargar el registro seleccionado.');
      }
    });
  }

  protected buildCreatePayload(): EntityRecord {
    return this.config.toCreatePayload(this.form, getUsername());
  }

  protected buildUpdatePayload(): EntityRecord | null {
    if (!this.recordId) {
      this.pageError = 'No se encontro el registro seleccionado.';
      return null;
    }

    return this.config.toUpdatePayload(this.recordId, this.form, getUsername());
  }

  protected handleSaveSuccess(): void {
    this.isSaving = false;
    this.goBack();
  }

  protected handleSaveError(error: unknown, fallback: string): void {
    this.isSaving = false;
    this.pageError = extractErrorMessage(error, fallback);
  }

  private initializeForm(): void {
    for (const field of this.config.fields) {
      this.form[field.key] = field.numeric ? null : field.type === 'checkbox' ? false : '';
    }
  }

  private getRecordFieldValue(record: EntityRecord, field: FormFieldConfig): unknown {
    if (Object.prototype.hasOwnProperty.call(record, field.key)) {
      const value = record[field.key];

      if (value !== undefined && value !== null && value !== '') {
        return value;
      }
    }

    for (const sourceKey of field.sourceKeys ?? []) {
      const value = this.getRecordValueByPath(record, sourceKey);

      if (value !== undefined) {
        return value;
      }
    }

    return undefined;
  }

  private getRecordValueByPath(record: EntityRecord, path: string): unknown {
    const segments = path.split('.');
    let currentValue: unknown = record;

    for (const segment of segments) {
      if (!currentValue || typeof currentValue !== 'object') {
        return undefined;
      }

      const currentRecord = currentValue as EntityRecord;

      if (!Object.prototype.hasOwnProperty.call(currentRecord, segment)) {
        return undefined;
      }

      currentValue = currentRecord[segment];
    }

    return currentValue;
  }

  private loadSelectOptions(): void {
    const loaders = this.config.optionLoaders;

    if (!loaders) {
      return;
    }

    const requiredOptionKeys = new Set(
      this.visibleFields
        .map((field) => this.getOptionsKey(field))
        .filter((key): key is string => Boolean(key))
    );

    const entries = Object
      .entries(loaders)
      .filter(([key]) => requiredOptionKeys.has(key));

    if (!entries.length) {
      return;
    }

    forkJoin(
      entries.reduce<Record<string, Observable<readonly SelectOption[]>>>((acc, [key, loader]) => {
        acc[key] = loader();
        return acc;
      }, {})
    ).subscribe({
      next: (options) => {
        this.selectOptions = options;
      },
      error: () => {
        this.pageError = 'No se pudieron cargar todos los catalogos del formulario.';
      }
    });
  }

  private getConfigServices(): MaintenanceFormConfigServices {
    return {
      companyService: this.companyService,
      employeeService: this.employeeService,
      locationService: this.locationService,
      branchService: this.branchService,
      moduleService: this.moduleService,
      actionService: this.actionService,
      optionService: this.optionService,
      optionTypeService: this.optionTypeService,
      userService: this.userService,
      helpdeskService: this.helpdeskService,
      productService: this.productService,
      sellerService: this.sellerService,
      positionService: this.positionService,
      departmentService: this.departmentService
    };
  }

  private getOptionsKey(field: FormFieldConfig): string | undefined {
    if (this.mode === 'create') {
      return field.createOptionsKey ?? field.optionsKey;
    }

    return field.editOptionsKey ?? field.optionsKey;
  }
}
