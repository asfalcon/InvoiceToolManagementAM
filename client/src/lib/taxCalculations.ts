export function calculateTaxBreakdown(subtotal: number, discount: number = 0) {
  // Subtotal base
  const base = subtotal;

  // IRPF: 15% del subtotal
  const irpf = base * 0.15;

  // Aplicar descuento al subtotal + IRPF
  const subtotalAfterIRPF = base + irpf;
  const finalDiscount = discount;
  const taxableBase = subtotalAfterIRPF - finalDiscount;

  // IGIC: 7% del subtotal + IRPF - descuento
  const igic = taxableBase * 0.07;

  // Total
  const total = base + irpf - finalDiscount + igic;

  return {
    subtotal: base,
    irpf,
    discount: finalDiscount,
    taxableBase,
    igic,
    total,
  };
}

export function formatCurrency(value: number, currency: string = "EUR"): string {
  return value.toLocaleString("es-ES", {
    style: "currency",
    currency: currency,
  });
}
