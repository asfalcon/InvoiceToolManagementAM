# S&A - Financial Management

## Descripción
Aplicación de gestión de facturación para pequeñas empresas en Canarias. Permite crear y gestionar facturas, clientes y servicios con exportación a PDF. El sistema fiscal usa IGIC 7% (sumado al subtotal, siempre aplicado). Soporta 2 empresas emisoras de facturas (Empresa 1 y Empresa 2).

## Arquitectura

### Stack
- **Frontend**: React + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Backend**: Express.js + TypeScript
- **Base de datos**: PostgreSQL via Drizzle ORM
- **Estado del servidor**: TanStack Query (React Query)
- **Routing frontend**: wouter

### Estructura de carpetas
```
client/src/
  pages/          # Páginas principales
  contexts/       # SettingsContext (fuente de verdad global)
  components/     # Componentes UI compartidos
  lib/            # Utilidades (taxCalculations, queryClient)
  types/          # Tipos TypeScript compartidos
server/
  index.ts        # Entry point Express
  routes.ts       # API routes (prefijo /api)
  storage.ts      # Interface de acceso a datos (DatabaseStorage)
  db.ts           # Conexión Drizzle + PostgreSQL
shared/
  schema.ts       # Esquema de tablas Drizzle + tipos Zod
```

## Páginas
- `/` → InvoicesList — Registro de facturas con filtros y búsqueda
- `/dashboard` → Dashboard — Análisis y estadísticas de facturación
- `/create` → CreateInvoice — Crear nueva factura
- `/export/:id` → ExportInvoice — Vista previa e impresión PDF
- `/clients` → ClientsManagement — Gestión de clientes
- `/services` → ServicesManagement — Gestión de servicios/conceptos
- `/settings` → Settings — Configuración de empresa y tema

## API Endpoints
- `GET/POST /api/settings/company` — Configuración de empresa
- `GET/POST /api/settings/theme` — Configuración de tema
- `GET/POST /api/clients` — Listado y creación de clientes
- `PATCH/DELETE /api/clients/:id` — Actualización y borrado de cliente
- `GET/POST /api/services` — Listado y creación de servicios
- `PATCH/DELETE /api/services/:id` — Actualización y borrado de servicio
- `GET/POST /api/invoices` — Listado y creación de facturas
- `PATCH/DELETE /api/invoices/:id` — Actualización y borrado de factura

## Tablas de la base de datos
- `clients` — Clientes con campos personalizados y tarifas por servicio
- `services` — Servicios/conceptos facturables
- `invoices` — Cabeceras de facturas
- `invoice_items` — Líneas de detalle de cada factura
- `company_settings` — Configuración de la empresa (fila única id=1)
- `theme_settings` — Personalización del tema (fila única id=1)

## Lógica de impuestos
- **Fórmula**: Total = Subtotal + IRPF(15%) - Descuento
- **Sin IGIC ni IVA** en el cálculo final
- Formato moneda: `X.XXX,XX €` (locale es-ES, € al final)
- Redondeo al alza (Math.ceil) a 2 decimales

## Nomenclatura de facturas
- Formato: `XX1YYY` (ej: `261001`)
- `XX` = 2 últimos dígitos del año
- `YYY` = numeración correlativa (001, 002...)

## PDF Export
- Usa `window.print()` nativo (no html2pdf)
- Diseño A4 minimalista con colores marrones
- Encabezado tabla: marrón claro `#bda193`, texto negro negrita
- Fila Total: fondo marrón oscuro `#4d3c34`, texto blanco
- Sidebar y controles ocultos en impresión (`print:hidden`)

## Archivos de imagen
- `client/public/favicon.jpeg` — Icono de la aplicación
- `client/public/logo-admin.png` — Logo en la cabecera del PDF
