import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { Save, X, Plus, Trash2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useSettings } from "@/contexts/SettingsContext";
import { calculateTaxBreakdown, formatCurrency, toNum } from "@/lib/taxCalculations";

type QuoteItemLocal = {
  id: string;
  serviceId?: string;
  description: string;
  quantity: number;
  basePrice: number;
  taxIncrement: number;
};

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

export default function CreateQuote() {
  const [, setLocation] = useLocation();
  const { id: editId } = useParams<{ id?: string }>();
  const { toast } = useToast();
  const { services, quotes, addQuote, updateQuote } = useSettings();

  const editQuote = editId ? quotes.find(q => q.id === editId) : null;
  const isEditing = !!editQuote;

  const today = new Date().toISOString().split("T")[0];

  const [selectedCompanyId, setSelectedCompanyId] = useState<number>(editQuote?.companyId ?? 1);
  const [clientName, setClientName] = useState(editQuote?.clientName ?? "");
  const [clientEmail, setClientEmail] = useState(editQuote?.clientEmail ?? "");
  const [clientPhone, setClientPhone] = useState(editQuote?.clientPhone ?? "");
  const [items, setItems] = useState<QuoteItemLocal[]>(
    editQuote?.items?.length
      ? editQuote.items.map(item => ({ ...item, basePrice: toNum(item.basePrice), taxIncrement: toNum(item.taxIncrement) }))
      : [{ id: "1", description: "", quantity: 1, basePrice: 0, taxIncrement: 0 }]
  );
  const [discount, setDiscount] = useState(editQuote ? toNum(editQuote.discount) : 0);
  const [issueDate, setIssueDate] = useState(editQuote?.date ?? today);
  const [validUntil, setValidUntil] = useState(editQuote?.validUntil ?? addDays(today, 15));
  const [notes, setNotes] = useState(editQuote?.notes ?? "");

  const addItem = () => {
    setItems([...items, { id: Math.random().toString(36).substring(7), description: "", quantity: 1, basePrice: 0, taxIncrement: 0 }]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id: string, field: keyof QuoteItemLocal, value: string | number) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const applyService = (itemId: string, serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    if (service) {
      setItems(items.map(item => item.id === itemId ? {
        ...item,
        serviceId: service.id,
        description: service.description,
        basePrice: toNum(service.basePrice),
        taxIncrement: toNum(service.taxIncrement),
      } : item));
    }
  };

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.basePrice, 0);
  const breakdown = calculateTaxBreakdown(subtotal, discount, false);

  const { data: nextNumberData } = useQuery<{ number: string }>({
    queryKey: ["/api/quotes/next-number"],
    queryFn: () => fetch("/api/quotes/next-number").then(r => r.json()),
    staleTime: 0,
    enabled: !isEditing,
  });
  const nextQuoteNumber = isEditing ? (editQuote?.number ?? "") : (nextNumberData?.number ?? "...");

  const validate = () => {
    if (!clientName.trim()) {
      toast({ title: "Error", description: "Introduce el nombre del cliente", variant: "destructive" });
      return false;
    }
    if (items.some(i => i.basePrice === 0 || !i.description)) {
      toast({ title: "Atención", description: "Algunos conceptos están incompletos", variant: "destructive" });
      return false;
    }
    return true;
  };

  const buildQuoteData = (status: "draft" | "sent") => ({
    number: nextQuoteNumber,
    companyId: selectedCompanyId,
    clientName: clientName.trim(),
    clientEmail: clientEmail.trim(),
    clientPhone: clientPhone.trim(),
    date: issueDate,
    validUntil,
    items,
    discount,
    notes,
    applyIgic: "false" as const,
    status,
  });

  const handleSave = () => {
    if (!validate()) return;
    const onError = (err: any) => toast({ title: "Error al guardar presupuesto", description: err?.message || "Inténtalo de nuevo", variant: "destructive" });

    if (isEditing && editQuote) {
      updateQuote(editQuote.id, { ...buildQuoteData("sent"), status: editQuote.status as any }, {
        onSuccess: () => {
          toast({ title: "Presupuesto actualizado", description: `El presupuesto ${editQuote.number} se ha guardado.` });
          setLocation("/quotes");
        },
        onError,
      });
    } else {
      addQuote(buildQuoteData("sent"), {
        onSuccess: () => {
          toast({ title: "Presupuesto guardado", description: `El presupuesto ${nextQuoteNumber} se ha creado correctamente.` });
          setLocation("/quotes");
        },
        onError,
      });
    }
  };

  const handleSaveDraft = () => {
    if (!validate()) return;
    const onError = (err: any) => toast({ title: "Error al guardar borrador", description: err?.message || "Inténtalo de nuevo", variant: "destructive" });

    if (isEditing && editQuote) {
      updateQuote(editQuote.id, buildQuoteData("draft"), {
        onSuccess: () => { toast({ title: "Borrador guardado" }); setLocation("/quotes"); },
        onError,
      });
    } else {
      addQuote(buildQuoteData("draft"), {
        onSuccess: () => { toast({ title: "Borrador guardado", description: `El presupuesto ${nextQuoteNumber} se ha guardado como borrador.` }); setLocation("/quotes"); },
        onError,
      });
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => setLocation("/quotes")} className="rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isEditing ? `Editar Presupuesto ${editQuote?.number}` : "Crear Presupuesto"}
          </h1>
          <p className="text-muted-foreground mt-1">Presupuesto en euros con descuentos.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          {/* Empresa y datos del cliente */}
          <Card className="border-none shadow-sm bg-white">
            <CardHeader className="border-b bg-gray-50/50 pb-4">
              <CardTitle className="text-lg">Empresa y Cliente</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label>Empresa Emisora</Label>
                <Select value={String(selectedCompanyId)} onValueChange={(val) => setSelectedCompanyId(Number(val))}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Selecciona empresa..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Miguel Santiago</SelectItem>
                    <SelectItem value="2">Antonio Pérez</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Nombre y apellidos *</Label>
                  <Input
                    value={clientName}
                    onChange={e => setClientName(e.target.value)}
                    placeholder="Juan García López"
                    className="text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={clientEmail}
                    onChange={e => setClientEmail(e.target.value)}
                    placeholder="cliente@email.com"
                    className="text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Móvil</Label>
                  <Input
                    value={clientPhone}
                    onChange={e => setClientPhone(e.target.value)}
                    placeholder="+34 600 000 000"
                    className="text-sm"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Conceptos */}
          <Card className="border-none shadow-sm bg-white">
            <CardHeader className="border-b bg-gray-50/50 pb-4">
              <CardTitle className="text-lg">Conceptos</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {items.map((item) => (
                <div key={item.id} className="space-y-3 p-4 border rounded-lg bg-white">
                  <div className="space-y-2">
                    <Label className="text-sm">Cargar Servicio Predefinido</Label>
                    <Select onValueChange={(val) => applyService(item.id, val)} value={item.serviceId || ""}>
                      <SelectTrigger className="bg-gray-50 text-sm">
                        <SelectValue placeholder="Elegir servicio..." />
                      </SelectTrigger>
                      <SelectContent className="max-h-48 overflow-y-auto">
                        {services.map(s => (
                          <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Descripción</Label>
                    <Textarea
                      value={item.description}
                      onChange={(e) => updateItem(item.id, "description", e.target.value)}
                      placeholder="Detalles del servicio"
                      className="resize-none text-sm"
                      rows={2}
                    />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Cantidad</Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, "quantity", parseInt(e.target.value) || 1)}
                        className="text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Precio Ud. (€)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={item.basePrice}
                        onChange={(e) => updateItem(item.id, "basePrice", parseFloat(e.target.value) || 0)}
                        className="text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Tax Inc. (%)</Label>
                      <Input
                        type="number"
                        value={item.taxIncrement}
                        onChange={(e) => updateItem(item.id, "taxIncrement", parseFloat(e.target.value) || 0)}
                        className="text-sm"
                      />
                    </div>
                    <div className="flex flex-col justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                        disabled={items.length === 1}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="pt-2 border-t text-right">
                    <span className="text-sm font-bold">
                      Subtotal: {formatCurrency(item.quantity * item.basePrice)}
                    </span>
                  </div>
                </div>
              ))}

              <Button variant="outline" className="w-full border-dashed mt-4" onClick={addItem}>
                <Plus className="w-4 h-4 mr-2" /> Añadir Concepto
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Panel lateral */}
        <div className="space-y-6">
          <Card className="border-none shadow-sm bg-slate-900 text-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-white">Desglose</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between opacity-80">
                <span>Subtotal</span>
                <span>{formatCurrency(breakdown.subtotal)}</span>
              </div>
              <div className="text-[11px] opacity-50 italic pt-1">
                Exento de IGIC por franquicia fiscal
              </div>
              <div className="space-y-2 border-t border-white/10 pt-2">
                <Label className="text-xs opacity-70">Descuento (€)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={discount}
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                  className="bg-white/10 text-white placeholder:text-white/50 border-white/20 text-sm"
                />
              </div>
              <Separator className="bg-white/10 my-3" />
              <div className="flex justify-between font-bold text-lg pt-2">
                <span>Total</span>
                <span className="text-yellow-400">{formatCurrency(breakdown.total)}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Detalles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm">Número de Presupuesto</Label>
                <Input value={isEditing ? editQuote!.number : nextQuoteNumber} disabled className="text-sm bg-gray-50" />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Fecha de Emisión</Label>
                <Input
                  type="date"
                  value={issueDate}
                  onChange={(e) => {
                    setIssueDate(e.target.value);
                    if (!isEditing) setValidUntil(addDays(e.target.value, 15));
                  }}
                  className="text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Válido hasta</Label>
                <Input
                  type="date"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                  className="text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Notas</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Notas adicionales..."
                  className="resize-none text-sm"
                  rows={2}
                />
              </div>
            </CardContent>
            <CardFooter className="bg-gray-50/50 border-t p-4 flex flex-col gap-2">
              <div className="flex gap-2 w-full">
                <Button variant="outline" className="flex-1 bg-white text-sm" onClick={() => setLocation("/quotes")}>
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
                <Button className="flex-1 text-sm" onClick={handleSave}>
                  <Save className="w-4 h-4 mr-2" />
                  {isEditing ? "Actualizar" : "Guardar"}
                </Button>
              </div>
              <Button
                variant="outline"
                className="w-full text-sm text-slate-600 border-slate-300 hover:bg-slate-50"
                onClick={handleSaveDraft}
              >
                Guardar como borrador
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
