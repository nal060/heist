export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

export function formatPickupWindow(start: string, end: string): string {
  return `${formatTime(start)} - ${formatTime(end)}`;
}

export function isToday(dateStr: string): boolean {
  const today = new Date().toISOString().split('T')[0];
  return dateStr === today;
}

export function isTomorrow(dateStr: string): boolean {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return dateStr === tomorrow.toISOString().split('T')[0];
}

export function getPickupLabel(dateStr: string): string {
  if (isToday(dateStr)) return 'Hoy';
  if (isTomorrow(dateStr)) return 'Manana';
  return dateStr;
}
