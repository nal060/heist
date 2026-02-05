const MONTHS_ES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

const DAYS_ES = [
  'domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado',
];

export function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr);
  const day = date.getDate();
  const month = MONTHS_ES[date.getMonth()];
  return `${day} de ${month}`;
}

export function formatDateLong(dateStr: string): string {
  const date = new Date(dateStr);
  const dayName = DAYS_ES[date.getDay()];
  const day = date.getDate();
  const month = MONTHS_ES[date.getMonth()];
  return `${dayName}, ${day} de ${month}`;
}

export function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Hoy';
  if (diffDays === 1) return 'Ayer';
  if (diffDays < 7) return `Hace ${diffDays} dias`;
  return formatDateShort(dateStr);
}
