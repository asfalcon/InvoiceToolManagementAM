import { useState } from "react";
import { Plus, Search, Filter, Download, MoreHorizontal, Users, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  const [, setLocation] = useLocation();
  const { invoices, clients, markInvoiceAsPaid, updateInvoice } = useSettings();

  const getClientName = (clientId: string) => {
    return clients.find(c => c.id === clientId)?.name || "Cliente Desconocido";
  };

  const getInvoiceTotal = (invoice: any) => {
    const subtotal = invoice.items.reduce((sum: number, item: any) => sum + (item.quantity * parseFloat(item.basePrice || 0)), 0);
    const breakdown = calculateTaxBreakdown(subtotal, parseFloat(invoice.discount || 0));
    return breakdown.total;
  };

  const filteredInvoices = invoices.filter(inv => {
    const search = searchTerm.toLowerCase();
    const clientName = getClientName(inv.clientId).toLowerCase();
    const number = inv.number.toLowerCase();
    const dateStr = new Date(inv.date).toLocaleDateString('es-ES');
    const totalAmount = formatCurrency(getInvoiceTotal(inv));
    const statusLabel = getStatusLabel(inv.status).toLowerCase();
    
    const matchesSearch = 
      clientName.includes(search) || 
      number.includes(search) ||
      dateStr.includes(search) ||
      totalAmount.includes(search) ||
      statusLabel.includes(search);
      
    const matchesStatus = statusFilter === "all" || inv.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Calculate total amount of filtered invoices
  const totalFilteredAmount = filteredInvoices.reduce((sum, inv) => sum + getInvoiceTotal(inv), 0);

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
                <DropdownMenuItem onClick={() => setStatusFilter("overdue")} className="cursor-pointer">
                  <Badge variant="outline" className="mr-2 bg-rose-100 text-rose-800 border-rose-200 hover:bg-rose-100">Vencida</Badge>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("draft")} className="cursor-pointer">
                  <Badge variant="outline" className="mr-2 bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-100">Borrador</Badge>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" className="gap-2 bg-white flex-1 sm:flex-none">
              <Download className="w-4 h-4" />
              Exportar Lista
            </Button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50/80">
              <TableRow>
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
                filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id} className="hover:bg-slate-50/50 transition-colors">
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
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    No se encontraron facturas con esos criterios.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        {filteredInvoices.length > 0 && (
          <div className="p-4 bg-gray-50 border-t flex justify-end">
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
