export function formatDateOnly(value: string | Date | null | undefined): string {
  const formattedValue = formatDateTime(value);

  return formattedValue === '-' ? formattedValue : formattedValue.slice(0, 10);
}

export function formatDateTime(value: string | Date | null | undefined): string {
  if (!value || value === '-') {
    return '-';
  }

  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) {
      return '-';
    }

    const yyyy = value.getFullYear();
    const mm = String(value.getMonth() + 1).padStart(2, '0');
    const dd = String(value.getDate()).padStart(2, '0');
    const hh = String(value.getHours()).padStart(2, '0');
    const mi = String(value.getMinutes()).padStart(2, '0');
    const ss = String(value.getSeconds()).padStart(2, '0');

    return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
  }

  const normalizedValue = String(value).trim();

  if (!normalizedValue) {
    return '-';
  }

  const cleanValue = normalizedValue.replace('T', ' ').replace(/Z$/i, '');
  const withoutMilliseconds = cleanValue.split('.')[0];
  const directDateMatch = withoutMilliseconds.match(/^(\d{4}-\d{2}-\d{2})(?:\s+(\d{2}:\d{2}:\d{2}))?/);

  if (directDateMatch?.[1]) {
    return directDateMatch[2] ? `${directDateMatch[1]} ${directDateMatch[2]}` : directDateMatch[1];
  }

  const date = new Date(normalizedValue);

  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return formatDateTime(date);
}

export function isDateLikeField(key: string): boolean {
  return /_at$|_expire_at$|date|fecha/i.test(key);
}
