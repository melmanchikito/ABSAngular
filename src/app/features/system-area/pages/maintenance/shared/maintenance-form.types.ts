import { Observable } from 'rxjs';

export type MaintenanceEntity =
  | 'companies'
  | 'locations'
  | 'branches'
  | 'modules'
  | 'actions'
  | 'options'
  | 'optionTypes'
  | 'users'
  | 'helpdesks'
  | 'products';

export type MaintenanceMode = 'create' | 'edit';
export type FieldType = 'text' | 'email' | 'number' | 'password' | 'select' | 'textarea';
export type EntityRecord = Record<string, unknown>;
export type FormValue = string | number | null;

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface FormFieldConfig {
  key: string;
  label: string;
  type?: FieldType;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
  createOnly?: boolean;
  readonlyOnEdit?: boolean;
  numeric?: boolean;
  options?: readonly SelectOption[];
  optionsKey?: string;
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
