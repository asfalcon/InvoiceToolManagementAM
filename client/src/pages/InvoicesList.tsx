import { useState } from "react";
import { Plus, Search, Filter, Download, MoreHorizontal, Users, Euro } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useLocation } from "wouter";

// Mock data to simulate the database
const MOCK_INVOICES = [
  { id: "FAC-2023-001", client: "Acme Corp", date: "2023-10-01", amount: 1500.00, status: "pagada" },
  { id: "FAC-2023-002", client: "Globex Inc", date: "2023-10-05", amount: 320.50, status: "pendiente" },
  { id: "FAC-2023-003", client: "Initech", date: "2023-10-12", amount: 4500.00, status: "vencida" },
  { id: "FAC-2023-004", client: "Stark Industries", date: "2023-10-15", amount: 890.00, status: "pagada" },
  { id: "FAC-2023-005", client: "Wayne Enterprises", date: "2023-10-20", amount: 12500.00, status: "pendiente" },
  { id: "FAC-2023-006", client: "Cyberdyne Systems", date: "2023-10-22", amount: 450.00, status: "borrador" },
  { id: "FAC-2023-007", client: "Massive Dynamic", date: "2023-10-25", amount: 2100.00, status: "pagada" },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "pagada": return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "pendiente": return "bg-amber-100 text-amber-800 border-amber-200";
    case "vencida": return "bg-rose-100 text-rose-800 border-rose-200";
    case "borrador": return "bg-slate-100 text-slate-800 border-slate-200";
    default: return "bg-slate-100 text-slate-800 border-slate-200";
  }
};

export default function InvoicesList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [, setLocation] = useLocation();

  const filteredInvoices = MOCK_INVOICES.filter(
    inv => 
      inv.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              data-testid="input-search-invoice"
              placeholder="Buscar por cliente o ID..."
              className="pl-9 bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline" className="gap-2 bg-white flex-1 sm:flex-none">
              <Filter className="w-4 h-4" />
              Filtrar
            </Button>
            <Button variant="outline" className="gap-2 bg-white flex-1 sm:flex-none">
              <Download className="w-4 h-4" />
              Exportar
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
                    <TableCell className="font-medium">{invoice.id}</TableCell>
                    <TableCell>{invoice.client}</TableCell>
                    <TableCell>{new Date(invoice.date).toLocaleDateString('es-ES')}</TableCell>
                    <TableCell className="text-right font-medium">
                      {invoice.amount.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`capitalize ${getStatusColor(invoice.status)}`}>
                        {invoice.status}
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
                          <DropdownMenuItem onClick={() => setLocation(`/export/${invoice.id}`)}>Exportar PDF</DropdownMenuItem>
                          <DropdownMenuItem>Ver detalles</DropdownMenuItem>
                          <DropdownMenuItem className="text-primary">Marcar pagada</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    No se encontraron facturas.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}