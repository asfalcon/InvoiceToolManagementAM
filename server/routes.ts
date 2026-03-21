import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertClientSchema, insertServiceSchema, insertInvoiceSchema, insertCompanySettingsSchema, insertThemeSettingsSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // --- CLIENTS ---
  app.get("/api/clients", async (_req, res) => {
    try {
      const data = await storage.getClients();
      res.json(data);
    } catch (err) {
      res.status(500).json({ message: "Error al obtener clientes" });
    }
  });

  app.get("/api/clients/:id", async (req, res) => {
    try {
      const client = await storage.getClient(req.params.id);
      if (!client) return res.status(404).json({ message: "Cliente no encontrado" });
      res.json(client);
    } catch (err) {
      res.status(500).json({ message: "Error al obtener cliente" });
    }
  });

  app.post("/api/clients", async (req, res) => {
    try {
      const parsed = insertClientSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Datos inválidos", errors: parsed.error.errors });
      const client = await storage.createClient(parsed.data);
      res.status(201).json(client);
    } catch (err) {
      res.status(500).json({ message: "Error al crear cliente" });
    }
  });

  app.patch("/api/clients/:id", async (req, res) => {
    try {
      const parsed = insertClientSchema.partial().safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Datos inválidos", errors: parsed.error.errors });
      const client = await storage.updateClient(req.params.id, parsed.data);
      if (!client) return res.status(404).json({ message: "Cliente no encontrado" });
      res.json(client);
    } catch (err) {
      res.status(500).json({ message: "Error al actualizar cliente" });
    }
  });

  app.delete("/api/clients/:id", async (req, res) => {
    try {
      await storage.deleteClient(req.params.id);
      res.status(204).send();
    } catch (err) {
      res.status(500).json({ message: "Error al eliminar cliente" });
    }
  });

  // --- SERVICES ---
  app.get("/api/services", async (_req, res) => {
    try {
      const data = await storage.getServices();
      res.json(data);
    } catch (err) {
      res.status(500).json({ message: "Error al obtener servicios" });
    }
  });

  app.post("/api/services", async (req, res) => {
    try {
      const parsed = insertServiceSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Datos inválidos", errors: parsed.error.errors });
      const service = await storage.createService(parsed.data);
      res.status(201).json(service);
    } catch (err) {
      res.status(500).json({ message: "Error al crear servicio" });
    }
  });

  app.patch("/api/services/:id", async (req, res) => {
    try {
      const parsed = insertServiceSchema.partial().safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Datos inválidos", errors: parsed.error.errors });
      const service = await storage.updateService(req.params.id, parsed.data);
      if (!service) return res.status(404).json({ message: "Servicio no encontrado" });
      res.json(service);
    } catch (err) {
      res.status(500).json({ message: "Error al actualizar servicio" });
    }
  });

  app.delete("/api/services/:id", async (req, res) => {
    try {
      await storage.deleteService(req.params.id);
      res.status(204).send();
    } catch (err) {
      res.status(500).json({ message: "Error al eliminar servicio" });
    }
  });

  // --- INVOICES ---
  app.get("/api/invoices", async (_req, res) => {
    try {
      const data = await storage.getInvoices();
      res.json(data);
    } catch (err) {
      res.status(500).json({ message: "Error al obtener facturas" });
    }
  });

  app.get("/api/invoices/:id", async (req, res) => {
    try {
      const invoice = await storage.getInvoice(req.params.id);
      if (!invoice) return res.status(404).json({ message: "Factura no encontrada" });
      res.json(invoice);
    } catch (err) {
      res.status(500).json({ message: "Error al obtener factura" });
    }
  });

  const invoiceWithItemsSchema = z.object({
    number: z.string(),
    clientId: z.string(),
    date: z.string(),
    dueDate: z.string().optional().default(""),
    discount: z.union([z.string(), z.number()]).transform(v => String(v)).optional().default("0"),
    notes: z.string().optional().default(""),
    status: z.enum(["draft", "pending", "paid", "overdue"]).optional().default("pending"),
    items: z.array(z.object({
      serviceId: z.string().optional(),
      description: z.string(),
      quantity: z.number().int().default(1),
      basePrice: z.union([z.string(), z.number()]).transform(v => String(v)),
      taxIncrement: z.union([z.string(), z.number()]).transform(v => String(v)).optional().default("0"),
    })),
  });

  app.post("/api/invoices", async (req, res) => {
    try {
      const parsed = invoiceWithItemsSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Datos inválidos", errors: parsed.error.errors });
      const { items, ...invoiceData } = parsed.data;
      const invoice = await storage.createInvoice(invoiceData, items);
      res.status(201).json(invoice);
    } catch (err: any) {
      if (err.code === "23505") return res.status(409).json({ message: "El número de factura ya existe" });
      res.status(500).json({ message: "Error al crear factura" });
    }
  });

  const invoicePatchSchema = z.object({
    clientId: z.string().optional(),
    date: z.string().optional(),
    dueDate: z.string().optional(),
    discount: z.union([z.string(), z.number()]).transform(v => String(v)).optional(),
    notes: z.string().optional(),
    status: z.enum(["draft", "pending", "paid", "overdue"]).optional(),
    items: z.array(z.object({
      serviceId: z.string().optional(),
      description: z.string(),
      quantity: z.number().int().default(1),
      basePrice: z.union([z.string(), z.number()]).transform(v => String(v)),
      taxIncrement: z.union([z.string(), z.number()]).transform(v => String(v)).optional().default("0"),
    })).optional(),
  });

  app.patch("/api/invoices/:id", async (req, res) => {
    try {
      const parsed = invoicePatchSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Datos inválidos", errors: parsed.error.errors });
      const { items, ...invoiceData } = parsed.data;
      const invoice = await storage.updateInvoice(req.params.id, invoiceData, items);
      if (!invoice) return res.status(404).json({ message: "Factura no encontrada" });
      res.json(invoice);
    } catch (err) {
      res.status(500).json({ message: "Error al actualizar factura" });
    }
  });

  app.delete("/api/invoices/:id", async (req, res) => {
    try {
      await storage.deleteInvoice(req.params.id);
      res.status(204).send();
    } catch (err) {
      res.status(500).json({ message: "Error al eliminar factura" });
    }
  });

  // --- COMPANY SETTINGS ---
  app.get("/api/settings/company", async (_req, res) => {
    try {
      const settings = await storage.getCompanySettings();
      res.json(settings || null);
    } catch (err) {
      res.status(500).json({ message: "Error al obtener configuración" });
    }
  });

  app.post("/api/settings/company", async (req, res) => {
    try {
      const parsed = insertCompanySettingsSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Datos inválidos", errors: parsed.error.errors });
      const settings = await storage.saveCompanySettings(parsed.data);
      res.json(settings);
    } catch (err) {
      res.status(500).json({ message: "Error al guardar configuración" });
    }
  });

  // --- THEME SETTINGS ---
  app.get("/api/settings/theme", async (_req, res) => {
    try {
      const settings = await storage.getThemeSettings();
      res.json(settings || null);
    } catch (err) {
      res.status(500).json({ message: "Error al obtener tema" });
    }
  });

  app.post("/api/settings/theme", async (req, res) => {
    try {
      const parsed = insertThemeSettingsSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Datos inválidos", errors: parsed.error.errors });
      const settings = await storage.saveThemeSettings(parsed.data);
      res.json(settings);
    } catch (err) {
      res.status(500).json({ message: "Error al guardar tema" });
    }
  });

  return httpServer;
}
