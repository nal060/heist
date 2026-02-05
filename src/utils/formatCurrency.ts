export function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

export function getDiscountPercentage(original: number, discounted: number): number {
  if (original <= 0) return 0;
  return Math.round(((original - discounted) / original) * 100);
}
