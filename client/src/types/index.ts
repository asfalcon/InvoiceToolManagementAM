export type Service = {
  id: string;
  name: string;
  description: string;
  basePrice: string | number;
  taxIncrement: string | number;
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
  billingType: "standard" | "simplified";
  customFields: Record<string, string>;
  serviceRates: Record<string, number>;
  customFieldDefinitions?: Array<{ key: string; label: string }>;
};

export type InvoiceItem = {
  id: string;
  invoiceId?: string;
  serviceId?: string;
  description: string;
  quantity: number;
  basePrice: string | number;
  taxIncrement: string | number;
};

export type Invoice = {
  id: string;
  number: string;
  clientId: string;
  date: string;
  dueDate: string;
  items: InvoiceItem[];
  discount: string | number;
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
  province?: string;
  website: string;
  bankAccount: string;
  bankCode: string;
  logo?: string;
  legalNotes: string;
};

export type ThemeSettings = {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  fontSize: number;
};
