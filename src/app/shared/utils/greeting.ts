export function prettyName(value?: string | null): string {
  if (!value) return '';
  const local = value.includes('@') ? value.split('@')[0] : value;
  return local
    .split(/[-_.]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function greetName(
  firstName: string,
  lastName: string,
  fallbackUsername?: string | null,
): string {
  const fromNames = prettyName(firstName) || prettyName(lastName);
  if (fromNames) return fromNames.split(' ')[0];
  return prettyName(fallbackUsername).split(' ')[0] || 'Emprendedor';
}
