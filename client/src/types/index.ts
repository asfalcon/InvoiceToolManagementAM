export type Service = {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  taxIncrement: number; // Porcentaje de incremento por impuestos
  category: string;
};

export type Client = {
  id: string;
  name: string;
  nif: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  zipCode: string;
  country: string;
  billingType: "standard" | "simplified"; // Factura estándar o simplificada
  customFields: Record<string, string>; // Campos personalizados
  serviceRates: Record<string, number>; // Tarifas especiales por servicio
  customFieldDefinitions?: Array<{ key: string; label: string }>;
};

export type InvoiceItem = {
  id: string;
  serviceId?: string;
  description: string;
  quantity: number;
  basePrice: number;
  taxIncrement: number;
};

export type Invoice = {
  id: string;
  number: string;
  clientId: string;
  date: string;
  dueDate: string;
  items: InvoiceItem[];
  discount: number; // Descuento en porcentaje o cantidad fija
  notes: string;
  status: "draft" | "pending" | "paid" | "overdue";
};

export type CompanySettings = {
  name: string;
  nif: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  zipCode: string;
  country: string;
  website: string;
  bankAccount: string;
  bankCode: string;
  logo?: string; // Base64 o URL del logo
  legalNotes: string;
};

export type ThemeSettings = {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  fontSize: number;
};
