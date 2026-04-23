export interface ValidateDateResult {
  valid: boolean;
  message?: string;
  field?: 'start' | 'end';
}

export function validateDate(dateCreated: string, dateEnd: string): ValidateDateResult {
  if (!dateCreated || !dateEnd) {
    return {
      valid: false,
      message: 'Ambas fechas son requeridas.',
      field: !dateCreated ? 'start' : 'end'
    };
  }

  const start = new Date(dateCreated);
  const end = new Date(dateEnd);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return {
      valid: false,
      message: 'Formato de fecha inválido.',
      field: 'start'
    };
  }

  if (end < start) {
    return {
      valid: false,
      message: 'La fecha de cierre debe ser posterior a la inicial.',
      field: 'end'
    };
  }

  return { valid: true };
}

export const countChar = (text: string): number => text.length;