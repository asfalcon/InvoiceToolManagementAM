export function toNum(value: string | number | undefined | null): number {
  if (value === null || value === undefined) return 0;
  return typeof value === "string" ? parseFloat(value) || 0 : value;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

export function calculateTaxBreakdown(subtotal: number, discount: number = 0) {
  const base = round2(subtotal);
  const igic = round2(base * 0.07);
  const finalDiscount = round2(discount);
  const total = round2(base + igic - finalDiscount);

  return {
    subtotal: base,
    igic,
    discount: finalDiscount,
    total,
  };
}

export function formatCurrency(value: number | string, currency: string = "EUR"): string {
  const num = round2(toNum(value));
  return `${num.toLocaleString("es-ES", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })} ${currency === "EUR" ? "€" : currency}`;
}
