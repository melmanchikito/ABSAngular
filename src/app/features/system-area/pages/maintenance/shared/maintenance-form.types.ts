import { Observable } from 'rxjs';

export type MaintenanceEntity =
  | 'companies'
  | 'areas'
  | 'locations'
  | 'branches'
  | 'modules'
  | 'actions'
  | 'options'
  | 'optionTypes'
  | 'users'
  | 'helpdesks'
  | 'products'
  | 'sellers'
  | 'positions'
  | 'departments'
  | 'employees';

export type MaintenanceMode = 'create' | 'edit';
export type FieldType = 'text' | 'email' | 'number' | 'password' | 'select' | 'textarea' | 'checkbox' | 'date';
export type EntityRecord = Record<string, unknown>;
export type FormValue = string | number | boolean | null;

export interface SelectOption {
  value: string | number;
  label: string;
  translationKey?: string;
}

export interface FormFieldConfig {
  key: string;
  label: string;
  translationKey?: string;
  type?: FieldType;
  placeholder?: string;
  placeholderKey?: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  createOnly?: boolean;
  hideOnCreate?: boolean;
  hideOnEdit?: boolean;
  readonlyOnEdit?: boolean;
  numeric?: boolean;
  sourceKeys?: readonly string[];
  options?: readonly SelectOption[];
  optionsKey?: string;
  createOptionsKey?: string;
  editOptionsKey?: string;
  emptyOptionsMessage?: string;
  emptyOptionsMessageKey?: string;
}

export interface MaintenanceFormConfig {
  entity: MaintenanceEntity;
  eyebrow: string;
  listTitle: string;
  createTitle: string;
  editTitle: string;
  createSubtitle: string;
  editSubtitle: string;
  listUrl: string;
  idParam: string;
  fields: readonly FormFieldConfig[];
  load?: (id: number) => Observable<unknown>;
  create: (payload: EntityRecord) => Observable<unknown>;
  update: (payload: EntityRecord) => Observable<unknown>;
  optionLoaders?: Record<string, () => Observable<readonly SelectOption[]>>;
  toCreatePayload: (form: EntityRecord, username: string) => EntityRecord;
  toUpdatePayload: (id: number, form: EntityRecord, username: string) => EntityRecord;
}
