import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { CompanySettings, ThemeSettings, Service, Client, Invoice } from "@/types";

const DEFAULT_COMPANY: CompanySettings = {
  name: "Tu Empresa S.L.",
  nif: "B12345678",
  email: "contacto@tuempresa.com",
  phone: "+34 912 345 678",
  address: "Calle Tecnológica 10, Suite 4",
  city: "Madrid",
  zipCode: "28001",
  country: "España",
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

const DEFAULT_SERVICES: Service[] = [
  { id: "1", name: "Mantenimiento Mensual", description: "Servicio de mantenimiento técnico", basePrice: 150, taxIncrement: 0, category: "Mantenimiento" },
  { id: "2", name: "Consultoría IT", description: "Hora de consultoría tecnológica", basePrice: 80, taxIncrement: 0, category: "Consultoría" },
  { id: "3", name: "Desarrollo Web", description: "Desarrollo de funcionalidades", basePrice: 1200, taxIncrement: 5, category: "Desarrollo" },
];

const DEFAULT_CLIENTS: Client[] = [
  { id: "1", name: "Acme Corp", nif: "B87654321", email: "factura@acme.com", phone: "+34 931 234 567", address: "Polígono Industrial", city: "Barcelona", zipCode: "08001", country: "España", billingType: "standard", customFields: {}, serviceRates: {}, customFieldDefinitions: [] },
];

const DEFAULT_INVOICES: Invoice[] = [
  { 
    id: "1", 
    number: "241001", 
    clientId: "1", 
    date: "2024-03-01", 
    dueDate: "2024-03-31", 
    items: [
      { id: "i1", description: "Mantenimiento Mensual", quantity: 1, basePrice: 150, taxIncrement: 0 }
    ], 
    discount: 0, 
    notes: "", 
    status: "paid" 
  }
];

type SettingsContextType = {
  company: CompanySettings;
  saveCompany: (data: CompanySettings) => void;
  theme: ThemeSettings;
  saveTheme: (data: ThemeSettings) => void;
  services: Service[];
  addService: (service: Service) => void;
  updateService: (id: string, data: Partial<Service>) => void;
  deleteService: (id: string) => void;
  clients: Client[];
  addClient: (client: Client) => void;
  updateClient: (id: string, data: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  invoices: Invoice[];
  addInvoice: (invoice: Invoice) => void;
  updateInvoice: (id: string, data: Partial<Invoice>) => void;
  deleteInvoice: (id: string) => void;
  markInvoiceAsPaid: (id: string) => void;
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [company, setCompany] = useState<CompanySettings>(() => {
    const saved = localStorage.getItem("company-settings");
    return saved ? JSON.parse(saved) : DEFAULT_COMPANY;
  });
  
  const [theme, setTheme] = useState<ThemeSettings>(() => {
    const saved = localStorage.getItem("theme-settings");
    return saved ? JSON.parse(saved) : DEFAULT_THEME;
  });
  
  const [services, setServices] = useState<Service[]>(() => {
    const saved = localStorage.getItem("services");
    return saved ? JSON.parse(saved) : DEFAULT_SERVICES;
  });
  
  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem("clients");
    return saved ? JSON.parse(saved) : DEFAULT_CLIENTS;
  });
  
  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem("invoices");
    return saved ? JSON.parse(saved) : DEFAULT_INVOICES;
  });

  useEffect(() => {
    applyTheme(theme);
  }, []);

  const saveCompany = (data: CompanySettings) => {
    setCompany(data);
    localStorage.setItem("company-settings", JSON.stringify(data));
  };

  const saveTheme = (data: ThemeSettings) => {
    setTheme(data);
    localStorage.setItem("theme-settings", JSON.stringify(data));
    applyTheme(data);
  };

  const saveServices = (data: Service[]) => {
    setServices(data);
    localStorage.setItem("services", JSON.stringify(data));
  };

  const saveClients = (data: Client[]) => {
    setClients(data);
    localStorage.setItem("clients", JSON.stringify(data));
  };

  const saveInvoices = (data: Invoice[]) => {
    setInvoices(data);
    localStorage.setItem("invoices", JSON.stringify(data));
  };

  const addService = (service: Service) => {
    const updated = [...services, { ...service, id: Date.now().toString() }];
    saveServices(updated);
  };

  const updateService = (id: string, data: Partial<Service>) => {
    const updated = services.map(s => s.id === id ? { ...s, ...data } : s);
    saveServices(updated);
  };

  const deleteService = (id: string) => {
    const updated = services.filter(s => s.id !== id);
    saveServices(updated);
  };

  const addClient = (client: Client) => {
    const updated = [...clients, { ...client, id: Date.now().toString() }];
    saveClients(updated);
  };

  const updateClient = (id: string, data: Partial<Client>) => {
    const updated = clients.map(c => c.id === id ? { ...c, ...data } : c);
    saveClients(updated);
  };

  const deleteClient = (id: string) => {
    const updated = clients.filter(c => c.id !== id);
    saveClients(updated);
  };

  const addInvoice = (invoice: Invoice) => {
    const updated = [...invoices, { ...invoice, id: invoice.id || Date.now().toString() }];
    saveInvoices(updated);
  };

  const updateInvoice = (id: string, data: Partial<Invoice>) => {
    const updated = invoices.map(i => i.id === id ? { ...i, ...data } : i);
    saveInvoices(updated);
  };

  const deleteInvoice = (id: string) => {
    const updated = invoices.filter(i => i.id !== id);
    saveInvoices(updated);
  };

  const markInvoiceAsPaid = (id: string) => {
    const updated = invoices.map(i => i.id === id ? { ...i, status: "paid" as const } : i);
    saveInvoices(updated);
  };

  return (
    <SettingsContext.Provider value={{
      company, saveCompany, theme, saveTheme,
      services, addService, updateService, deleteService,
      clients, addClient, updateClient, deleteClient,
      invoices, addInvoice, updateInvoice, deleteInvoice, markInvoiceAsPaid
    }}>
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
