import { useState, useEffect } from "react";
import { CompanySettings, ThemeSettings, Service, Client } from "@/types";

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
  legalNotes: "Factura emitida según la normativa vigente. Pago a 30 días.",
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

export function useSettings() {
  const [company, setCompany] = useState<CompanySettings>(DEFAULT_COMPANY);
  const [theme, setTheme] = useState<ThemeSettings>(DEFAULT_THEME);
  const [services, setServices] = useState<Service[]>(DEFAULT_SERVICES);
  const [clients, setClients] = useState<Client[]>(DEFAULT_CLIENTS);

  // Cargar desde localStorage
  useEffect(() => {
    const saved = localStorage.getItem("company-settings");
    if (saved) setCompany(JSON.parse(saved));
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("theme-settings");
    if (saved) setTheme(JSON.parse(saved));
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("services");
    if (saved) setServices(JSON.parse(saved));
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("clients");
    if (saved) setClients(JSON.parse(saved));
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

  return {
    company,
    saveCompany,
    theme,
    saveTheme,
    services,
    addService,
    updateService,
    deleteService,
    clients,
    addClient,
    updateClient,
    deleteClient,
  };
}

function applyTheme(theme: ThemeSettings) {
  const root = document.documentElement;
  root.style.setProperty("--primary", hexToHsl(theme.primaryColor));
  root.style.setProperty("--accent", hexToHsl(theme.accentColor));
}

function hexToHsl(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return "0 0% 0%";

  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0,
    s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}
