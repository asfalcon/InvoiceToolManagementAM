export function calculateTaxBreakdown(subtotal: number, discount: number = 0) {
  // Subtotal base
  const base = subtotal;

  // IRPF: 15% del subtotal
  const irpf = base * 0.15;

  // Total (Solo Subtotal - Descuento + IRPF según la nueva especificación)
  const finalDiscount = discount;
  const total = base - finalDiscount + irpf;

  return {
    subtotal: base,
    irpf,
    discount: finalDiscount,
    // Eliminamos IGIC y Base Imponible del cálculo, mantenemos 0 por compatibilidad de tipos
    taxableBase: 0,
    igic: 0,
    total,
  };
}

export function formatCurrency(value: number, currency: string = "EUR"): string {
  const roundUp = (num: number) => Math.ceil(num * 100) / 100;
  return `${roundUp(value).toLocaleString("es-ES", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })} ${currency === "EUR" ? "€" : currency}`;
}
