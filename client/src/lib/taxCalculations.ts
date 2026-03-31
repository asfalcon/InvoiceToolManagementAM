export function toNum(value: string | number | undefined | null): number {
  if (value === null || value === undefined) return 0;
  return typeof value === "string" ? parseFloat(value) || 0 : value;
}

export function calculateTaxBreakdown(subtotal: number, discount: number = 0) {
  const base = subtotal;
  const igic = base * 0.07;
  const finalDiscount = discount;
  const total = base + igic - finalDiscount;

  return {
    subtotal: base,
    igic,
    discount: finalDiscount,
    total,
  };
}

export function formatCurrency(value: number | string, currency: string = "EUR"): string {
  const num = toNum(value);
  const roundUp = (n: number) => Math.ceil(n * 100) / 100;
  return `${roundUp(num).toLocaleString("es-ES", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })} ${currency === "EUR" ? "€" : currency}`;
}
