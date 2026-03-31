import { useState } from "react";
import { Plus, Search, Filter, MoreHorizontal, Users, FileText, Printer } from "lucide-react";
import logo_adminp from "@assets/logo_adminp.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { useLocation } from "wouter";
import { useSettings } from "@/contexts/SettingsContext";
import { calculateTaxBreakdown, formatCurrency } from "@/lib/taxCalculations";

const getStatusColor = (status: string) => {
  switch (status) {
    case "paid": return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "pending": return "bg-amber-100 text-amber-800 border-amber-200";
    case "overdue": return "bg-rose-100 text-rose-800 border-rose-200";
    case "draft": return "bg-slate-100 text-slate-800 border-slate-200";
    default: return "bg-slate-100 text-slate-800 border-slate-200";
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case "paid": return "Pagada";
    case "pending": return "Pendiente";
    case "overdue": return "Vencida";
    case "draft": return "Borrador";
    default: return "Desconocido";
  }
};

export default function InvoicesList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [, setLocation] = useLocation();
  const { invoices, clients, markInvoiceAsPaid, updateInvoice, company } = useSettings();

  const getClientName = (clientId: string) =>
    clients.find(c => c.id === clientId)?.name || "Cliente Desconocido";

  const getClient = (clientId: string) =>
    clients.find(c => c.id === clientId);

  const getInvoiceTotal = (invoice: any) => {
    const subtotal = invoice.items.reduce((sum: number, item: any) => sum + (item.quantity * parseFloat(item.basePrice || 0)), 0);
    const applyIrpfFlag = invoice.applyIrpf === false || invoice.applyIrpf === "false" ? false : true;
    const rawBreakdown = calculateTaxBreakdown(subtotal, parseFloat(invoice.discount || 0));
    if (applyIrpfFlag) return rawBreakdown.total;
    return Math.ceil((subtotal - parseFloat(invoice.discount || 0)) * 100) / 100;
  };

  const filteredInvoices = invoices.filter(inv => {
    const search = searchTerm.toLowerCase();
    const clientName = getClientName(inv.clientId).toLowerCase();
    const matchesSearch =
      clientName.includes(search) ||
      inv.number.toLowerCase().includes(search) ||
      new Date(inv.date).toLocaleDateString('es-ES').includes(search) ||
      formatCurrency(getInvoiceTotal(inv)).includes(search) ||
      getStatusLabel(inv.status).toLowerCase().includes(search);
    const matchesStatus = statusFilter === "all" || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalFilteredAmount = filteredInvoices.reduce((sum, inv) => sum + getInvoiceTotal(inv), 0);

  const allVisibleSelected = filteredInvoices.length > 0 && filteredInvoices.every(inv => selectedIds.has(inv.id));
  const someSelected = filteredInvoices.some(inv => selectedIds.has(inv.id));

  const toggleSelectAll = () => {
    if (allVisibleSelected) {
      setSelectedIds(prev => {
        const next = new Set(prev);
        filteredInvoices.forEach(inv => next.delete(inv.id));
        return next;
      });
    } else {
      setSelectedIds(prev => {
        const next = new Set(prev);
        filteredInvoices.forEach(inv => next.add(inv.id));
        return next;
      });
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectedInvoices = invoices.filter(inv => selectedIds.has(inv.id));

  // ─── Helpers de formato para HTML ───────────────────────────────────────────
  const roundUp = (n: number) => Math.ceil(n * 100) / 100;
  const fmtEur = (n: number) =>
    `${roundUp(n).toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;

  const buildInvoicePage = (inv: any, isLast: boolean): string => {
    const client = getClient(inv.clientId);
    if (!client) return "";

    const subtotal = inv.items.reduce((s: number, it: any) => s + it.quantity * parseFloat(it.basePrice || 0), 0);
    const discount = parseFloat(inv.discount || 0);
    const applyIrpf = !(inv.applyIrpf === false || inv.applyIrpf === "false");
    const rawB = calculateTaxBreakdown(subtotal, discount);
    const breakdown = applyIrpf
      ? rawB
      : { ...rawB, irpf: 0, total: roundUp(subtotal - discount) };

    const emptyRows = Math.max(0, 3 - inv.items.length);

    const itemRowsHtml = inv.items.map((it: any) => `
      <tr>
        <td class="py-3 px-4 border-r-2 border-white text-left text-slate-800 align-top font-medium">${it.description}</td>
        <td class="py-3 px-2 border-r-2 border-white text-slate-700 align-top">${it.quantity}</td>
        <td class="py-3 px-2 border-r-2 border-white text-slate-700 align-top">${fmtEur(parseFloat(it.basePrice || 0))}</td>
        <td class="py-3 px-2 text-slate-800 font-bold align-top">${fmtEur(it.quantity * parseFloat(it.basePrice || 0))}</td>
      </tr>`).join('');

    const emptyRowsHtml = Array.from({ length: emptyRows }).map(() => `
      <tr>
        <td class="py-3 px-4 border-r-2 border-white text-transparent">.</td>
        <td class="py-3 px-2 border-r-2 border-white text-transparent">.</td>
        <td class="py-3 px-2 border-r-2 border-white text-transparent">.</td>
        <td class="py-3 px-2 text-transparent">.</td>
      </tr>`).join('');

    const discountRowHtml = discount > 0
      ? `<div class="flex justify-between py-2 px-4 border-b border-slate-200">
           <span>Descuento</span><span>-${fmtEur(discount)}</span>
         </div>` : '';

    const irpfRowHtml = applyIrpf
      ? `<div class="flex justify-between py-2 px-4 text-slate-800">
           <span>IRPF (15%)</span><span>-${fmtEur(breakdown.irpf)}</span>
         </div>` : '';

    const notesHtml = inv.notes
      ? `<div class="text-slate-600 mt-4">
           <h4 class="text-[11px] font-bold uppercase text-slate-400 tracking-widest mb-2">Observaciones:</h4>
           <p class="text-[12px] leading-relaxed italic">${inv.notes}</p>
         </div>` : '';

    const bankCodeHtml = company.bankCode
      ? `<p class="mt-1">Banco: ${company.bankCode}</p>` : '';

    const pageBreakStyle = isLast ? '' : 'style="page-break-after:always;"';

    return `
    <div ${pageBreakStyle}>
      <div class="bg-white text-slate-900 p-10 w-[210mm] min-h-[297mm] max-h-[297mm] text-[11px] flex flex-col font-sans overflow-hidden">

        <!-- Header -->
        <div class="flex justify-between items-start mb-5">
          <div class="w-[48%]">
            <img src="${logo_adminp}" alt="LogoAdmin" class="max-h-24 mb-2 object-contain" />
            <div class="text-xs leading-relaxed text-slate-700 font-sans mt-2">
              <span class="font-bold text-slate-900 text-[16px]">Admin+</span><br>
              ${company.name}<br>
              ${company.nif ? `${company.nif}<br>` : ''}
              ${company.address}<br>
              ${company.zipCode} ${company.city}, ${company.province || company.country}<br>
              ${company.email ? `${company.email}<br>` : ''}
              ${company.phone || ''}
            </div>
          </div>
          <div class="w-[48%] text-right">
            <div class="text-[36px] font-normal tracking-[0.15em] uppercase text-slate-900 mb-3">FACTURA</div>
            <div class="text-slate-500 mb-1 text-[10px] uppercase tracking-wider font-semibold">Fecha de Emisión:</div>
            <div class="font-semibold text-sm text-slate-800 mb-3">
              ${new Date(inv.date).toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" })}
            </div>
            <div class="font-bold text-base text-slate-800 mb-1">${client.name}</div>
            <div class="text-xs leading-relaxed text-slate-700 font-sans">
              <span class="font-semibold">NIF:</span> ${client.nif}<br>
              ${client.address}<br>
              ${client.zipCode} ${client.city}, ${client.country}<br>
              ${client.email ? `<span>${client.email}</span>` : ''}
            </div>
          </div>
        </div>

        <!-- Nº Factura -->
        <div class="flex justify-start gap-12 mb-5 border-b border-t border-slate-200 py-3">
          <div>
            <div class="text-slate-500 mb-1 text-[11px] uppercase tracking-wider font-semibold">Nº de Factura:</div>
            <div class="font-semibold text-sm text-slate-800">${inv.number}</div>
          </div>
        </div>

        <!-- Items -->
        <div class="mb-4 flex-grow">
          <table class="w-full text-center border-collapse">
            <thead>
              <tr class="bg-[#C5B8A9] text-black uppercase text-[10px] tracking-widest font-bold">
                <th class="py-2.5 px-4 border-r border-white text-left w-[55%]">Descripción</th>
                <th class="py-2.5 px-2 border-r border-white w-[15%]">Cant.</th>
                <th class="py-2.5 px-2 border-r border-white w-[15%]">Precio</th>
                <th class="py-2.5 px-2 w-[15%]">Subtotal</th>
              </tr>
            </thead>
            <tbody class="text-sm font-sans">
              ${itemRowsHtml}${emptyRowsHtml}
            </tbody>
          </table>

          <!-- Totals -->
          <div class="flex">
            <div class="w-[55%] pt-4 pr-4">
              ${notesHtml}
            </div>
            <div class="w-[45%]">
              <div class="text-[13px] text-slate-600">
                <div class="flex justify-between py-2 px-4 border-b border-slate-200">
                  <span>Subtotal</span><span>${fmtEur(breakdown.subtotal)}</span>
                </div>
                ${discountRowHtml}
                ${irpfRowHtml}
              </div>
              <div class="text-white flex justify-between items-center py-3 px-4 font-bold bg-[#A3988B]">
                <span class="uppercase tracking-widest text-xs">Total</span>
                <span class="text-lg">${fmtEur(breakdown.total)}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="mt-auto pt-4 border-t border-slate-200 text-[10px] text-slate-500 font-sans">
          <div class="grid grid-cols-2 gap-8">
            <div>
              <h4 class="font-bold text-slate-700 mb-2 uppercase tracking-widest">Información de Pago</h4>
              <p class="mb-1 text-[#1d293d]">Método: Transferencia Bancaria</p>
              <p class="text-slate-800 mt-1 font-normal">IBAN: ${company.bankAccount}</p>
              ${bankCodeHtml}
            </div>
            <div>
              <h4 class="font-bold text-slate-700 mb-2 uppercase tracking-widest">Información Legal</h4>
              <p class="text-justify text-[9px] text-[#1d293d]">${company.legalNotes}</p>
            </div>
          </div>
        </div>

      </div>
    </div>`;
  };

  const handlePrintSelected = () => {
    if (selectedInvoices.length === 0) return;

    // Extraer todo el CSS compilado del documento actual (incluye Tailwind)
    const allStyles = Array.from(document.styleSheets).reduce((css, sheet) => {
      try {
        return css + Array.from(sheet.cssRules).map(r => r.cssText).join('\n');
      } catch {
        return css;
      }
    }, '');

    const pages = selectedInvoices
      .map((inv, idx) => buildInvoicePage(inv, idx === selectedInvoices.length - 1))
      .join('');

    const html = `<!DOCTYPE html>
<html lang="es"><head><meta charset="utf-8">
<title>Facturas_${selectedInvoices.map(i => i.number).join('_')}</title>
<style>
  ${allStyles}
  * { -webkit-print-color-adjust:exact !important; print-color-adjust:exact !important; }
  @page { size:A4 portrait; margin:0; }
  body { background:#f1f5f9; margin:0; padding:20px; display:flex; flex-direction:column; align-items:center; }
  @media print {
    body { background:#fff; padding:0; display:block; }
    body > * { display:block !important; }
    .invoice-print-root { position:static !important; height:auto !important; overflow:visible !important; }
  }
</style>
</head>
<body>
  ${pages}
  <script>window.onload = function(){ window.print(); setTimeout(function(){ window.close(); }, 500); }<\/script>
</body></html>`;

    const printWindow = window.open('', '_blank', 'width=900,height=700');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
    }
  };

  const handlePrintList = () => {
    const dateNow = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });
    const filterLabel = statusFilter === 'all' ? 'Todos los estados' : getStatusLabel(statusFilter);
    const searchLabel = searchTerm ? ` · Búsqueda: "${searchTerm}"` : '';

    const statusColors: Record<string, string> = {
      paid: '#065f46', pending: '#92400e', overdue: '#991b1b', draft: '#374151',
    };
    const statusBgs: Record<string, string> = {
      paid: '#d1fae5', pending: '#fef3c7', overdue: '#fee2e2', draft: '#f3f4f6',
    };

    const rows = filteredInvoices.map((inv, idx) => {
      const total = getInvoiceTotal(inv);
      const color = statusColors[inv.status] || '#374151';
      const bg = statusBgs[inv.status] || '#f3f4f6';
      const rowBg = idx % 2 === 1 ? '#f8fafc' : '#ffffff';
      return `
        <tr style="background:${rowBg};">
          <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-weight:600;font-family:monospace;">${inv.number}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">${getClientName(inv.clientId)}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">${new Date(inv.date).toLocaleDateString('es-ES')}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:right;font-weight:600;">${formatCurrency(total)}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">
            <span style="display:inline-block;padding:2px 10px;border-radius:9999px;font-size:11px;font-weight:600;background:${bg};color:${color};-webkit-print-color-adjust:exact;print-color-adjust:exact;">${getStatusLabel(inv.status)}</span>
          </td>
        </tr>`;
    }).join('');

    const html = `<!DOCTYPE html>
<html lang="es"><head><meta charset="utf-8">
<title>Registro_Facturas_${new Date().toLocaleDateString('es-ES').replace(/\//g, '-')}</title>
<style>
  @page { size: A4 portrait; margin: 18mm 16mm; }
  * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 12px; color: #1e293b; margin: 0; background: #fff; }
  h1 { font-size: 22px; font-weight: 700; margin: 0 0 4px; }
  .meta { color: #64748b; font-size: 11px; margin-bottom: 20px; border-bottom: 2px solid #C5B8A9; padding-bottom: 10px; }
  table { width: 100%; border-collapse: collapse; }
  thead tr { background: #C5B8A9 !important; }
  thead th { padding: 9px 12px; text-align: left; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; }
  thead th.right { text-align: right; }
  .total-row { margin-top: 20px; text-align: right; font-size: 14px; color: #374151; border-top: 2px solid #C5B8A9; padding-top: 10px; }
  .total-row strong { font-size: 17px; color: #1e293b; }
  .footer { margin-top: 20px; font-size: 10px; color: #94a3b8; border-top: 1px solid #e5e7eb; padding-top: 8px; }
</style></head>
<body>
  <h1>Registro de Facturas</h1>
  <div class="meta">
    <strong>${company.name}</strong> &nbsp;·&nbsp; Generado el ${dateNow}
    &nbsp;·&nbsp; Filtro: ${filterLabel}${searchLabel}
    &nbsp;·&nbsp; ${filteredInvoices.length} factura${filteredInvoices.length !== 1 ? 's' : ''}
  </div>
  <table>
    <thead><tr>
      <th>Nº Factura</th><th>Cliente</th><th>Fecha</th>
      <th class="right">Importe</th><th>Estado</th>
    </tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <div class="total-row">Total mostrado: <strong>${formatCurrency(totalFilteredAmount)}</strong></div>
  <div class="footer">${company.name} &mdash; ${company.nif} &mdash; ${company.address}, ${company.zipCode} ${company.city}</div>
  <script>window.onload = function(){ window.print(); setTimeout(function(){ window.close(); }, 500); }<\/script>
</body></html>`;

    const printWindow = window.open('', '_blank', 'width=900,height=700');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Registro de Facturas</h1>
          <p className="text-muted-foreground mt-1">Gestiona y visualiza todas tus facturas emitidas.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setLocation("/dashboard")} className="gap-2">
            <Users className="w-4 h-4" />
            Dashboard
          </Button>
          <Button onClick={() => setLocation("/create")} className="gap-2 shadow-sm">
            <Plus className="w-4 h-4" />
            Nueva Factura
          </Button>
        </div>
      </div>

      {/* Barra de selección activa */}
      {selectedIds.size > 0 && (
        <div className="flex items-center justify-between bg-slate-900 text-white rounded-lg px-5 py-3 shadow-md">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">
              {selectedIds.size} factura{selectedIds.size !== 1 ? 's' : ''} seleccionada{selectedIds.size !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              className="text-white/70 hover:text-white hover:bg-white/10 text-xs"
              onClick={() => setSelectedIds(new Set())}
            >
              Cancelar selección
            </Button>
            <Button
              size="sm"
              className="bg-white text-slate-900 hover:bg-white/90 gap-2 text-xs font-semibold"
              onClick={handlePrintSelected}
            >
              <Printer className="w-3.5 h-3.5" />
              Imprimir facturas seleccionadas
            </Button>
          </div>
        </div>
      )}

      <Card className="border-none shadow-sm bg-white overflow-hidden">
        <div className="p-4 border-b flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/50">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              data-testid="input-search-invoice"
              placeholder="Buscar por cliente, número, fecha, importe..."
              className="pl-9 bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 bg-white flex-1 sm:flex-none">
                  <Filter className="w-4 h-4" />
                  {statusFilter === 'all' ? 'Estado' : getStatusLabel(statusFilter)}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Filtrar por estado</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setStatusFilter("all")} className="cursor-pointer">
                  Todos los estados
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("paid")} className="cursor-pointer">
                  <Badge variant="outline" className="mr-2 bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100">Pagada</Badge>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("pending")} className="cursor-pointer">
                  <Badge variant="outline" className="mr-2 bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100">Pendiente</Badge>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("draft")} className="cursor-pointer">
                  <Badge variant="outline" className="mr-2 bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-100">Borrador</Badge>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" className="gap-2 bg-white flex-1 sm:flex-none" onClick={handlePrintList}>
              <Printer className="w-4 h-4" />
              Exportar Lista
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50/80">
              <TableRow>
                <TableHead className="w-[48px]">
                  <Checkbox
                    checked={allVisibleSelected}
                    onCheckedChange={toggleSelectAll}
                    aria-label="Seleccionar todas"
                    className={someSelected && !allVisibleSelected ? "opacity-60" : ""}
                  />
                </TableHead>
                <TableHead className="w-[120px]">Nº Factura</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="text-right">Importe</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.length > 0 ? (
                filteredInvoices.map((invoice) => {
                  const isSelected = selectedIds.has(invoice.id);
                  return (
                    <TableRow
                      key={invoice.id}
                      className={`hover:bg-slate-50/50 transition-colors ${isSelected ? "bg-blue-50/60" : ""}`}
                    >
                      <TableCell>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleSelect(invoice.id)}
                          aria-label={`Seleccionar factura ${invoice.number}`}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{invoice.number}</TableCell>
                      <TableCell>{getClientName(invoice.clientId)}</TableCell>
                      <TableCell>{new Date(invoice.date).toLocaleDateString('es-ES')}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(getInvoiceTotal(invoice))}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`capitalize ${getStatusColor(invoice.status)}`}>
                          {getStatusLabel(invoice.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Abrir menú</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setLocation(`/export/${invoice.id}`)}>
                              <FileText className="w-4 h-4 mr-2" />
                              Ver / PDF
                            </DropdownMenuItem>
                            {invoice.status === 'draft' && (
                              <DropdownMenuItem className="text-slate-700 cursor-pointer" onClick={() => setLocation(`/edit/${invoice.id}`)}>
                                Editar borrador
                              </DropdownMenuItem>
                            )}
                            {invoice.status !== 'paid' ? (
                              <DropdownMenuItem className="text-emerald-600 focus:text-emerald-700 cursor-pointer" onClick={() => markInvoiceAsPaid(invoice.id)}>
                                Marcar como pagada
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem className="text-amber-600 focus:text-amber-700 cursor-pointer" onClick={() => updateInvoice(invoice.id, { status: 'pending' })}>
                                Deshacer pago (marcar pendiente)
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    No se encontraron facturas con esos criterios.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {filteredInvoices.length > 0 && (
          <div className="p-4 bg-gray-50 border-t flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              {filteredInvoices.length} factura{filteredInvoices.length !== 1 ? 's' : ''}
              {selectedIds.size > 0 && ` · ${selectedIds.size} seleccionada${selectedIds.size !== 1 ? 's' : ''}`}
            </span>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total Mostrado</p>
              <p className="text-lg font-bold">{formatCurrency(totalFilteredAmount)}</p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
