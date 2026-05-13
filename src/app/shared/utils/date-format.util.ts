export function formatDateOnly(value: string | Date | null | undefined): string {
  if (!value || value === 'Sin registro') {
    return 'Sin registro';
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? 'Sin registro' : value.toISOString().slice(0, 10);
  }

  const normalizedValue = String(value).trim();

  if (!normalizedValue) {
    return 'Sin registro';
  }

  const directDateMatch = normalizedValue.match(/^(\d{4}-\d{2}-\d{2})/);

  if (directDateMatch?.[1]) {
    return directDateMatch[1];
  }

  const date = new Date(normalizedValue);

  if (Number.isNaN(date.getTime())) {
    return 'Sin registro';
  }

  return date.toISOString().slice(0, 10);
}

export function isDateLikeField(key: string): boolean {
  return /(^|_)(created|updated|canceled)_at$|date|fecha/i.test(key);
}
