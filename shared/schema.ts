import { sql } from "drizzle-orm";
import { pgTable, text, varchar, numeric, integer, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const clients = pgTable("clients", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  nif: text("nif").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull().default(""),
  address: text("address").notNull().default(""),
  city: text("city").notNull().default(""),
  zipCode: text("zip_code").notNull().default(""),
  country: text("country").notNull().default("España"),
  billingType: text("billing_type").notNull().default("standard"),
  customFields: jsonb("custom_fields").notNull().default({}),
  serviceRates: jsonb("service_rates").notNull().default({}),
  customFieldDefinitions: jsonb("custom_field_definitions").notNull().default([]),
  createdAt: timestamp("created_at").defaultNow(),
});

export const services = pgTable("services", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  basePrice: numeric("base_price", { precision: 12, scale: 2 }).notNull().default("0"),
  taxIncrement: numeric("tax_increment", { precision: 5, scale: 2 }).notNull().default("0"),
  category: text("category").notNull().default(""),
  createdAt: timestamp("created_at").defaultNow(),
});

export const invoiceItems = pgTable("invoice_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  invoiceId: varchar("invoice_id").notNull(),
  serviceId: varchar("service_id"),
  description: text("description").notNull(),
  quantity: integer("quantity").notNull().default(1),
  basePrice: numeric("base_price", { precision: 12, scale: 2 }).notNull().default("0"),
  taxIncrement: numeric("tax_increment", { precision: 5, scale: 2 }).notNull().default("0"),
});

export const invoices = pgTable("invoices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  number: text("number").notNull().unique(),
  clientId: varchar("client_id").notNull(),
  date: text("date").notNull(),
  dueDate: text("due_date").notNull().default(""),
  discount: numeric("discount", { precision: 12, scale: 2 }).notNull().default("0"),
  notes: text("notes").notNull().default(""),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const companySettings = pgTable("company_settings", {
  id: integer("id").primaryKey().default(1),
  name: text("name").notNull().default(""),
  nif: text("nif").notNull().default(""),
  email: text("email").notNull().default(""),
  phone: text("phone").notNull().default(""),
  address: text("address").notNull().default(""),
  city: text("city").notNull().default(""),
  zipCode: text("zip_code").notNull().default(""),
  country: text("country").notNull().default("España"),
  province: text("province").notNull().default(""),
  website: text("website").notNull().default(""),
  bankAccount: text("bank_account").notNull().default(""),
  bankCode: text("bank_code").notNull().default(""),
  legalNotes: text("legal_notes").notNull().default(""),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const themeSettings = pgTable("theme_settings", {
  id: integer("id").primaryKey().default(1),
  primaryColor: text("primary_color").notNull().default("#1e40af"),
  secondaryColor: text("secondary_color").notNull().default("#f3f4f6"),
  accentColor: text("accent_color").notNull().default("#0ea5e9"),
  fontFamily: text("font_family").notNull().default("Inter"),
  fontSize: integer("font_size").notNull().default(14),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertClientSchema = createInsertSchema(clients).omit({ id: true, createdAt: true });
export const insertServiceSchema = createInsertSchema(services).omit({ id: true, createdAt: true });
export const insertInvoiceSchema = createInsertSchema(invoices).omit({ id: true, createdAt: true });
export const insertInvoiceItemSchema = createInsertSchema(invoiceItems).omit({ id: true });
export const insertCompanySettingsSchema = createInsertSchema(companySettings).omit({ id: true, updatedAt: true });
export const insertThemeSettingsSchema = createInsertSchema(themeSettings).omit({ id: true, updatedAt: true });

export type InsertClient = z.infer<typeof insertClientSchema>;
export type Client = typeof clients.$inferSelect;
export type InsertService = z.infer<typeof insertServiceSchema>;
export type Service = typeof services.$inferSelect;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoiceItem = z.infer<typeof insertInvoiceItemSchema>;
export type InvoiceItem = typeof invoiceItems.$inferSelect;
export type InsertCompanySettings = z.infer<typeof insertCompanySettingsSchema>;
export type CompanySettings = typeof companySettings.$inferSelect;
export type InsertThemeSettings = z.infer<typeof insertThemeSettingsSchema>;
export type ThemeSettings = typeof themeSettings.$inferSelect;
