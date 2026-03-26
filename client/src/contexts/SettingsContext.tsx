import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

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
  legalNotes: string;
};

export type ThemeSettings = {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  fontSize: number;
};

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

const DEFAULT_COMPANY: CompanySettings = {
  name: "Tu Empresa S.L.",
  nif: "B12345678",
  email: "contacto@tuempresa.com",
  phone: "+34 912 345 678",
  address: "Calle Tecnológica 10, Suite 4",
  city: "Madrid",
  zipCode: "28001",
  country: "España",
  province: "",
  website: "www.tuempresa.com",
  bankAccount: "ES00 0000 0000 0000 0000 0000",
  bankCode: "XXXESEXX",
  legalNotes: "Factura emitida según la normativa vigente. El pago debe realizarse antes de los 30 días posteriores a la fecha de emisión.",
};

const DEFAULT_THEME: ThemeSettings = {
  primaryColor: "#1e40af",
  secondaryColor: "#f3f4f6",
  accentColor: "#0ea5e9",
  fontFamily: "Inter",
  fontSize: 14,
};

type MutationCallbacks = { onSuccess?: () => void; onError?: (err: any) => void };

type SettingsContextType = {
  company: CompanySettings;
  saveCompany: (data: CompanySettings, cb?: MutationCallbacks) => void;
  theme: ThemeSettings;
  saveTheme: (data: ThemeSettings, cb?: MutationCallbacks) => void;
  services: Service[];
  addService: (service: Partial<Service>, cb?: MutationCallbacks) => void;
  updateService: (id: string, data: Partial<Service>, cb?: MutationCallbacks) => void;
  deleteService: (id: string, cb?: MutationCallbacks) => void;
  clients: Client[];
  addClient: (client: Partial<Client>, cb?: MutationCallbacks) => void;
  updateClient: (id: string, data: Partial<Client>, cb?: MutationCallbacks) => void;
  deleteClient: (id: string, cb?: MutationCallbacks) => void;
  invoices: Invoice[];
  addInvoice: (invoice: Omit<Invoice, "id">, cb?: MutationCallbacks) => void;
  updateInvoice: (id: string, data: Partial<Invoice>, cb?: MutationCallbacks) => void;
  deleteInvoice: (id: string, cb?: MutationCallbacks) => void;
  markInvoiceAsPaid: (id: string, cb?: MutationCallbacks) => void;
  isLoading: boolean;
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const qc = useQueryClient();
  const [company, setCompany] = useState<CompanySettings>(DEFAULT_COMPANY);
  const [theme, setTheme] = useState<ThemeSettings>(DEFAULT_THEME);

  const { data: companyData, isLoading: loadingCompany } = useQuery<CompanySettings>({
    queryKey: ["/api/settings/company"],
    staleTime: Infinity,
  });

  const { data: themeData, isLoading: loadingTheme } = useQuery<ThemeSettings>({
    queryKey: ["/api/settings/theme"],
    staleTime: Infinity,
  });

  const { data: servicesData = [], isLoading: loadingServices } = useQuery<Service[]>({
    queryKey: ["/api/services"],
    staleTime: Infinity,
  });

  const { data: clientsData = [], isLoading: loadingClients } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
    staleTime: Infinity,
  });

  const { data: invoicesData = [], isLoading: loadingInvoices } = useQuery<Invoice[]>({
    queryKey: ["/api/invoices"],
    staleTime: Infinity,
  });

  const isLoading = loadingCompany || loadingTheme || loadingServices || loadingClients || loadingInvoices;

  useEffect(() => {
    if (companyData) setCompany(companyData);
  }, [companyData]);

  useEffect(() => {
    if (themeData) {
      setTheme(themeData);
      applyTheme(themeData);
    }
  }, [themeData]);

  const saveCompanyMutation = useMutation({
    mutationFn: (data: CompanySettings) => apiRequest("POST", "/api/settings/company", data).then(r => r.json()),
    onSuccess: (data) => {
      setCompany(data);
      qc.invalidateQueries({ queryKey: ["/api/settings/company"] });
    },
  });

  const saveThemeMutation = useMutation({
    mutationFn: (data: ThemeSettings) => apiRequest("POST", "/api/settings/theme", data).then(r => r.json()),
    onSuccess: (data) => {
      setTheme(data);
      applyTheme(data);
      qc.invalidateQueries({ queryKey: ["/api/settings/theme"] });
    },
  });

  const addServiceMutation = useMutation({
    mutationFn: (data: Partial<Service>) => apiRequest("POST", "/api/services", {
      name: data.name, description: data.description, basePrice: String(data.basePrice || 0),
      taxIncrement: String(data.taxIncrement || 0), category: data.category || "",
    }).then(r => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/services"] }),
  });

  const updateServiceMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Service> }) =>
      apiRequest("PATCH", `/api/services/${id}`, {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.basePrice !== undefined && { basePrice: String(data.basePrice) }),
        ...(data.taxIncrement !== undefined && { taxIncrement: String(data.taxIncrement) }),
        ...(data.category !== undefined && { category: data.category }),
      }).then(r => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/services"] }),
  });

  const deleteServiceMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/services/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/services"] }),
  });

  const addClientMutation = useMutation({
    mutationFn: (data: Partial<Client>) => apiRequest("POST", "/api/clients", {
      name: data.name, nif: data.nif, email: data.email, phone: data.phone || "",
      address: data.address || "", city: data.city || "", zipCode: data.zipCode || "",
      country: data.country || "España", billingType: data.billingType || "standard",
      customFields: data.customFields || {}, serviceRates: data.serviceRates || {},
      customFieldDefinitions: data.customFieldDefinitions || [],
    }).then(r => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/clients"] }),
  });

  const updateClientMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Client> }) =>
      apiRequest("PATCH", `/api/clients/${id}`, data).then(r => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/clients"] }),
  });

  const deleteClientMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/clients/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/clients"] }),
  });

  const addInvoiceMutation = useMutation({
    mutationFn: (invoice: Omit<Invoice, "id">) => apiRequest("POST", "/api/invoices", {
      number: invoice.number, clientId: invoice.clientId, date: invoice.date,
      dueDate: invoice.dueDate || "", discount: String(invoice.discount || 0),
      notes: invoice.notes || "", status: invoice.status || "pending",
      items: invoice.items.map(item => ({
        serviceId: item.serviceId,
        description: item.description,
        quantity: item.quantity,
        basePrice: String(item.basePrice),
        taxIncrement: String(item.taxIncrement || 0),
      })),
    }).then(r => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/invoices"] }),
  });

  const updateInvoiceMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Invoice> }) =>
      apiRequest("PATCH", `/api/invoices/${id}`, data).then(r => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/invoices"] }),
  });

  const deleteInvoiceMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/invoices/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/invoices"] }),
  });

  const value: SettingsContextType = {
    company,
    saveCompany: (data, cb) => saveCompanyMutation.mutate(data, cb),
    theme,
    saveTheme: (data, cb) => saveThemeMutation.mutate(data, cb),
    services: servicesData,
    addService: (data, cb) => addServiceMutation.mutate(data, cb),
    updateService: (id, data, cb) => updateServiceMutation.mutate({ id, data }, cb),
    deleteService: (id, cb) => deleteServiceMutation.mutate(id, cb),
    clients: clientsData,
    addClient: (data, cb) => addClientMutation.mutate(data, cb),
    updateClient: (id, data, cb) => updateClientMutation.mutate({ id, data }, cb),
    deleteClient: (id, cb) => deleteClientMutation.mutate(id, cb),
    invoices: invoicesData,
    addInvoice: (invoice, cb) => addInvoiceMutation.mutate(invoice, cb),
    updateInvoice: (id, data, cb) => updateInvoiceMutation.mutate({ id, data }, cb),
    deleteInvoice: (id, cb) => deleteInvoiceMutation.mutate(id, cb),
    markInvoiceAsPaid: (id, cb) => updateInvoiceMutation.mutate({ id, data: { status: "paid" } }, cb),
    isLoading,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}

function applyTheme(theme: ThemeSettings) {
  const root = document.documentElement;
  root.style.setProperty("--primary", hexToHsl(theme.primaryColor));
  root.style.setProperty("--accent", hexToHsl(theme.accentColor));
  if (theme.fontFamily) {
    root.style.setProperty("--font-sans", `"${theme.fontFamily}", sans-serif`);
  }
}

function hexToHsl(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return "0 0% 0%";
  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}
