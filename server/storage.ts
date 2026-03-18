import { db } from "./db";
import {
  clients, services, invoices, invoiceItems, companySettings, themeSettings,
  type Client, type InsertClient,
  type Service, type InsertService,
  type Invoice, type InsertInvoice,
  type InvoiceItem, type InsertInvoiceItem,
  type CompanySettings, type InsertCompanySettings,
  type ThemeSettings, type InsertThemeSettings,
} from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  // Clients
  getClients(): Promise<Client[]>;
  getClient(id: string): Promise<Client | undefined>;
  createClient(data: InsertClient): Promise<Client>;
  updateClient(id: string, data: Partial<InsertClient>): Promise<Client | undefined>;
  deleteClient(id: string): Promise<void>;

  // Services
  getServices(): Promise<Service[]>;
  getService(id: string): Promise<Service | undefined>;
  createService(data: InsertService): Promise<Service>;
  updateService(id: string, data: Partial<InsertService>): Promise<Service | undefined>;
  deleteService(id: string): Promise<void>;

  // Invoices
  getInvoices(): Promise<(Invoice & { items: InvoiceItem[] })[]>;
  getInvoice(id: string): Promise<(Invoice & { items: InvoiceItem[] }) | undefined>;
  createInvoice(data: InsertInvoice, items: Omit<InsertInvoiceItem, "invoiceId">[]): Promise<Invoice & { items: InvoiceItem[] }>;
  updateInvoice(id: string, data: Partial<InsertInvoice>): Promise<Invoice | undefined>;
  deleteInvoice(id: string): Promise<void>;

  // Company settings
  getCompanySettings(): Promise<CompanySettings | undefined>;
  saveCompanySettings(data: InsertCompanySettings): Promise<CompanySettings>;

  // Theme settings
  getThemeSettings(): Promise<ThemeSettings | undefined>;
  saveThemeSettings(data: InsertThemeSettings): Promise<ThemeSettings>;
}

export class DatabaseStorage implements IStorage {
  async getClients(): Promise<Client[]> {
    return db.select().from(clients).orderBy(clients.name);
  }

  async getClient(id: string): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.id, id));
    return client;
  }

  async createClient(data: InsertClient): Promise<Client> {
    const [client] = await db.insert(clients).values(data).returning();
    return client;
  }

  async updateClient(id: string, data: Partial<InsertClient>): Promise<Client | undefined> {
    const [client] = await db.update(clients).set(data).where(eq(clients.id, id)).returning();
    return client;
  }

  async deleteClient(id: string): Promise<void> {
    await db.delete(clients).where(eq(clients.id, id));
  }

  async getServices(): Promise<Service[]> {
    return db.select().from(services).orderBy(services.name);
  }

  async getService(id: string): Promise<Service | undefined> {
    const [service] = await db.select().from(services).where(eq(services.id, id));
    return service;
  }

  async createService(data: InsertService): Promise<Service> {
    const [service] = await db.insert(services).values(data).returning();
    return service;
  }

  async updateService(id: string, data: Partial<InsertService>): Promise<Service | undefined> {
    const [service] = await db.update(services).set(data).where(eq(services.id, id)).returning();
    return service;
  }

  async deleteService(id: string): Promise<void> {
    await db.delete(services).where(eq(services.id, id));
  }

  async getInvoices(): Promise<(Invoice & { items: InvoiceItem[] })[]> {
    const allInvoices = await db.select().from(invoices).orderBy(invoices.createdAt);
    const allItems = await db.select().from(invoiceItems);

    return allInvoices.map(inv => ({
      ...inv,
      items: allItems.filter(item => item.invoiceId === inv.id),
    }));
  }

  async getInvoice(id: string): Promise<(Invoice & { items: InvoiceItem[] }) | undefined> {
    const [invoice] = await db.select().from(invoices).where(eq(invoices.id, id));
    if (!invoice) return undefined;
    const items = await db.select().from(invoiceItems).where(eq(invoiceItems.invoiceId, id));
    return { ...invoice, items };
  }

  async createInvoice(data: InsertInvoice, itemsData: Omit<InsertInvoiceItem, "invoiceId">[]): Promise<Invoice & { items: InvoiceItem[] }> {
    const [invoice] = await db.insert(invoices).values(data).returning();
    let items: InvoiceItem[] = [];
    if (itemsData.length > 0) {
      items = await db.insert(invoiceItems).values(
        itemsData.map(item => ({ ...item, invoiceId: invoice.id }))
      ).returning();
    }
    return { ...invoice, items };
  }

  async updateInvoice(id: string, data: Partial<InsertInvoice>): Promise<Invoice | undefined> {
    const [invoice] = await db.update(invoices).set(data).where(eq(invoices.id, id)).returning();
    return invoice;
  }

  async deleteInvoice(id: string): Promise<void> {
    await db.delete(invoiceItems).where(eq(invoiceItems.invoiceId, id));
    await db.delete(invoices).where(eq(invoices.id, id));
  }

  async getCompanySettings(): Promise<CompanySettings | undefined> {
    const [settings] = await db.select().from(companySettings).where(eq(companySettings.id, 1));
    return settings;
  }

  async saveCompanySettings(data: InsertCompanySettings): Promise<CompanySettings> {
    const existing = await this.getCompanySettings();
    if (existing) {
      const [updated] = await db.update(companySettings).set(data).where(eq(companySettings.id, 1)).returning();
      return updated;
    }
    const [created] = await db.insert(companySettings).values({ ...data, id: 1 }).returning();
    return created;
  }

  async getThemeSettings(): Promise<ThemeSettings | undefined> {
    const [settings] = await db.select().from(themeSettings).where(eq(themeSettings.id, 1));
    return settings;
  }

  async saveThemeSettings(data: InsertThemeSettings): Promise<ThemeSettings> {
    const existing = await this.getThemeSettings();
    if (existing) {
      const [updated] = await db.update(themeSettings).set(data).where(eq(themeSettings.id, 1)).returning();
      return updated;
    }
    const [created] = await db.insert(themeSettings).values({ ...data, id: 1 }).returning();
    return created;
  }
}

export const storage = new DatabaseStorage();
