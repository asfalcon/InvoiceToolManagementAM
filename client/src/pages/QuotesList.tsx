import { useState } from "react";
import { useLocation } from "wouter";
import { PlusCircle, Search, Eye, Pencil, Trash2, FileText, CheckCircle2, XCircle, Send, FileEdit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSettings } from "@/contexts/SettingsContext";
import { calculateTaxBreakdown, formatCurrency, toNum } from "@/lib/taxCalculations";
import { useToast } from "@/hooks/use-toast";

const STATUS_LABELS: Record<string, string> = {
  draft: "Borrador",
  sent: "Enviado",
  accepted: "Aceptado",
  rejected: "Rechazado",
};

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-slate-100 text-slate-700",
  sent: "bg-blue-100 text-blue-700",
  accepted: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
};

export default function QuotesList() {
  const [, setLocation] = useLocation();
  const { quotes, deleteQuote, updateQuote } = useSettings();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const getQuoteTotal = (quote: any) => {
    const subtotal = quote.items.reduce((sum: number, item: any) => sum + item.quantity * toNum(item.basePrice), 0);
    const breakdown = calculateTaxBreakdown(subtotal, toNum(quote.discount), false);
    return breakdown.total;
  };

  const filtered = quotes.filter(q => {
    const matchesStatus = statusFilter === "all" || q.status === statusFilter;
    const term = searchTerm.toLowerCase();
    const matchesSearch = !term ||
      q.number.toLowerCase().includes(term) ||
      q.clientName.toLowerCase().includes(term) ||
      q.clientEmail.toLowerCase().includes(term) ||
      new Date(q.date).toLocaleDateString("es-ES").includes(term) ||
      STATUS_LABELS[q.status]?.toLowerCase().includes(term) ||
      formatCurrency(getQuoteTotal(q)).toLowerCase().includes(term);
    return matchesStatus && matchesSearch;
  });

  const handleDelete = (id: string, number: string) => {
    if (!confirm(`¿Eliminar el presupuesto ${number}?`)) return;
    deleteQuote(id, {
      onSuccess: () => toast({ title: "Presupuesto eliminado" }),
      onError: () => toast({ title: "Error al eliminar", variant: "destructive" }),
    });
  };

  const handleStatusChange = (id: string, status: string) => {
    updateQuote(id, { status: status as any }, {
      onSuccess: () => toast({ title: "Estado actualizado" }),
      onError: () => toast({ title: "Error al actualizar", variant: "destructive" }),
    });
  };

  const getCompanyLabel = (companyId: number) => companyId === 2 ? "Antonio Pérez" : "Miguel Santiago";

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Presupuestos</h1>
          <p className="text-muted-foreground mt-1">Historial y gestión de presupuestos.</p>
        </div>
        <Button onClick={() => setLocation("/quotes/create")} className="gap-2">
          <PlusCircle className="w-4 h-4" /> Nuevo Presupuesto
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar presupuesto..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="draft">Borrador</SelectItem>
            <SelectItem value="sent">Enviado</SelectItem>
            <SelectItem value="accepted">Aceptado</SelectItem>
            <SelectItem value="rejected">Rechazado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabla */}
      {filtered.length === 0 ? (
        <Card className="border-none shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
            <FileText className="w-12 h-12 text-slate-200" />
            <p className="text-lg font-medium">No hay presupuestos</p>
            <p className="text-sm">Crea tu primer presupuesto para empezar.</p>
            <Button onClick={() => setLocation("/quotes/create")} className="mt-2 gap-2">
              <PlusCircle className="w-4 h-4" /> Nuevo Presupuesto
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-none shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-slate-50">
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Nº Presupuesto</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Cliente</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Empresa</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Fecha</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Válido hasta</th>
                  <th className="text-right px-4 py-3 font-semibold text-slate-600">Importe</th>
                  <th className="text-center px-4 py-3 font-semibold text-slate-600">Estado</th>
                  <th className="text-right px-4 py-3 font-semibold text-slate-600">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((quote, idx) => (
                  <tr key={quote.id} className={`border-b hover:bg-slate-50/50 transition-colors ${idx % 2 === 0 ? "" : "bg-slate-50/30"}`}>
                    <td className="px-4 py-3 font-mono font-medium text-slate-800">{quote.number}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-800">{quote.clientName || "—"}</div>
                      {quote.clientEmail && <div className="text-xs text-slate-400">{quote.clientEmail}</div>}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{getCompanyLabel(quote.companyId)}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {quote.date ? new Date(quote.date).toLocaleDateString("es-ES") : "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {quote.validUntil ? new Date(quote.validUntil).toLocaleDateString("es-ES") : "—"}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-800">
                      {formatCurrency(getQuoteTotal(quote))}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[quote.status] || "bg-slate-100 text-slate-700"}`}>
                        {STATUS_LABELS[quote.status] || quote.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {/* Cambio de estado rápido */}
                        {quote.status === "draft" && (
                          <Button variant="ghost" size="icon" className="w-7 h-7 text-blue-600" title="Marcar como enviado"
                            onClick={() => handleStatusChange(quote.id, "sent")}>
                            <Send className="w-3.5 h-3.5" />
                          </Button>
                        )}
                        {quote.status === "sent" && (
                          <>
                            <Button variant="ghost" size="icon" className="w-7 h-7 text-emerald-600" title="Marcar como aceptado"
                              onClick={() => handleStatusChange(quote.id, "accepted")}>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="w-7 h-7 text-red-500" title="Marcar como rechazado"
                              onClick={() => handleStatusChange(quote.id, "rejected")}>
                              <XCircle className="w-3.5 h-3.5" />
                            </Button>
                          </>
                        )}
                        <Button variant="ghost" size="icon" className="w-7 h-7" title="Ver presupuesto"
                          onClick={() => setLocation(`/quotes/export/${quote.id}`)}>
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="w-7 h-7" title="Editar"
                          onClick={() => setLocation(`/quotes/edit/${quote.id}`)}>
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="w-7 h-7 text-destructive" title="Eliminar"
                          onClick={() => handleDelete(quote.id, quote.number)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-2 border-t bg-slate-50/50 text-xs text-slate-400">
            {filtered.length} presupuesto{filtered.length !== 1 ? "s" : ""}
          </div>
        </Card>
      )}
    </div>
  );
}
