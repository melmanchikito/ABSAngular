import {
  EntityRecord,
  FormFieldConfig,
  FormValue,
  MaintenanceEntity,
  MaintenanceMode
} from './maintenance-form.types';

export function toNumberValue(value: string): number | null {
  if (value === '') {
    return null;
  }

  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : null;
}

export function normalizeFormValue(value: unknown, field: FormFieldConfig): FormValue {
  if (value === null || value === undefined) {
    return field.numeric ? null : '';
  }

  return field.numeric ? toNumberValue(String(value)) : String(value);
}

export function cleanPayload(payload: EntityRecord): EntityRecord {
  return Object.entries(payload).reduce<EntityRecord>((acc, [key, value]) => {
    if (value === undefined || value === null || value === '') {
      return acc;
    }

    acc[key] = typeof value === 'string' ? value.trim() : value;
    return acc;
  }, {});
}

export function validateMaintenanceForm(
  fields: readonly FormFieldConfig[],
  form: Record<string, FormValue>,
  entity: MaintenanceEntity,
  mode: MaintenanceMode
): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const field of fields) {
    const value = form[field.key];
    const textValue = String(value ?? '').trim();

    if (field.required && !textValue) {
      errors[field.key] = `${field.label} es obligatorio.`;
      continue;
    }

    if (field.minLength && textValue && textValue.length < field.minLength) {
      errors[field.key] = `${field.label} debe tener al menos ${field.minLength} caracteres.`;
      continue;
    }

    if (field.type === 'email' && textValue && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(textValue)) {
      errors[field.key] = 'Ingrese un email valido.';
      continue;
    }

    if (field.numeric && textValue && !Number.isFinite(Number(value))) {
      errors[field.key] = `${field.label} debe ser numerico.`;
    }
  }

  if (entity === 'users') {
    const password = String(form['password'] ?? '');
    const confirmPassword = String(form['confirm_password'] ?? '');
    const passwordRequired = mode === 'create';

    if (passwordRequired && !password) {
      errors['password'] = 'Contrasena es obligatoria.';
    }

    if (password && password.length < 8) {
      errors['password'] = 'Contrasena debe tener al menos 8 caracteres.';
    }

    if ((passwordRequired || password) && password !== confirmPassword) {
      errors['confirm_password'] = 'Las contrasenas no coinciden.';
    }
  }

  return errors;
}

export function extractErrorMessage(error: unknown, fallback: string): string {
  if (!error || typeof error !== 'object') {
    return fallback;
  }

  const errorBody = (error as EntityRecord)['error'];
  const body = errorBody && typeof errorBody === 'object' ? (errorBody as EntityRecord) : null;
  const nested = body?.['error'] && typeof body['error'] === 'object' ? (body['error'] as EntityRecord) : null;
  const details = nested?.['details_error'] ?? body?.['details_error'];
  const detailsRecord = details && typeof details === 'object' ? (details as EntityRecord) : null;
  const detailsMessage = detailsRecord?.['error_message'];
  const bodyMessage = body?.['message'];
  const nestedMessage = nested?.['message'];

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

export function getUsername(): string {
  return (
    localStorage.getItem('username') ||
    localStorage.getItem('userName') ||
    localStorage.getItem('user') ||
    localStorage.getItem('email') ||
    'Usuario'
  );
}
