import { useState } from "react";
import { useLocation } from "wouter";
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
import { calculateTaxBreakdown, formatCurrency } from "@/lib/taxCalculations";
import { InvoiceItem, Invoice } from "@/types";

export default function CreateInvoice() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { services, clients, addInvoice, invoices } = useSettings();

  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: "1", description: "", quantity: 1, basePrice: 0, taxIncrement: 0 }
  ]);
  const [discount, setDiscount] = useState(0);
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split("T")[0]);
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");

  const selectedClient = clients.find(c => c.id === selectedClientId);

  const addItem = () => {
    setItems([...items, { 
      id: Math.random().toString(36).substring(7), 
      description: "", 
      quantity: 1, 
      basePrice: 0, 
      taxIncrement: 0 
    }]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const applyService = (itemId: string, serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    if (service) {
      const price = selectedClient?.serviceRates?.[service.name] || service.basePrice;
      setItems(items.map(item => item.id === itemId ? { 
        ...item, 
        serviceId: service.id,
        description: service.description, 
        basePrice: price,
        taxIncrement: service.taxIncrement
      } : item));
    }
  };

  const calculateSubtotal = () => items.reduce((sum, item) => sum + (item.quantity * item.basePrice), 0);
  const subtotal = calculateSubtotal();
  const breakdown = calculateTaxBreakdown(subtotal, discount);

  // Generate next invoice number
  const nextInvoiceNumber = `FAC-${new Date().getFullYear()}-${String(invoices.length + 1).padStart(3, '0')}`;

  const handleSave = () => {
    if (!selectedClientId) {
      toast({ title: "Error", description: "Selecciona un cliente", variant: "destructive" });
      return;
    }
    
    if (items.some(i => i.basePrice === 0 || !i.description)) {
      toast({ title: "Atención", description: "Algunos conceptos están incompletos", variant: "destructive" });
      return;
    }

    const newInvoice: Invoice = {
      id: Date.now().toString(),
      number: nextInvoiceNumber,
      clientId: selectedClientId,
      date: issueDate,
      dueDate: dueDate,
      items: items,
      discount: discount,
      notes: notes,
      status: "pending"
    };

    // Save using context which uses local storage
    addInvoice(newInvoice);

    toast({
      title: "Factura guardada",
      description: `La factura ${nextInvoiceNumber} se ha creado correctamente.`,
    });
    
    // Redirect without full reload to maintain context state
    setLocation("/");
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => setLocation("/")} className="rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Crear Factura</h1>
          <p className="text-muted-foreground mt-1">Facturación en euros con IRPF, IGIC y descuentos.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <Card className="border-none shadow-sm bg-white">
            <CardHeader className="border-b bg-gray-50/50 pb-4">
              <CardTitle className="text-lg">Cliente</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label>Seleccionar Cliente</Label>
                <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Busca un cliente..." />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedClient && (
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10 space-y-2 text-sm">
                  <p><span className="font-bold">NIF:</span> {selectedClient.nif}</p>
                  <p><span className="font-bold">Email:</span> {selectedClient.email}</p>
                  <p><span className="font-bold">Dirección:</span> {selectedClient.address}, {selectedClient.city}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white">
            <CardHeader className="border-b bg-gray-50/50 pb-4">
              <CardTitle className="text-lg">Conceptos</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {items.map((item, idx) => (
                <div key={item.id} className="space-y-3 p-4 border rounded-lg bg-white">
                  <div className="space-y-2">
                    <Label className="text-sm">Cargar Servicio Predefinido</Label>
                    <Select onValueChange={(val) => applyService(item.id, val)} value={item.serviceId || ""}>
                      <SelectTrigger className="bg-gray-50 text-sm">
                        <SelectValue placeholder="Elegir servicio..." />
                      </SelectTrigger>
                      <SelectContent>
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
              <div className="flex justify-between opacity-80">
                <span>IRPF (15%)</span>
                <span className="text-red-400">-{formatCurrency(breakdown.irpf)}</span>
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
              <div className="flex justify-between opacity-80 pt-2">
                <span>Base Imponible</span>
                <span>{formatCurrency(breakdown.taxableBase)}</span>
              </div>
              <div className="flex justify-between opacity-80">
                <span>IGIC (7%)</span>
                <span className="text-green-400">+{formatCurrency(breakdown.igic)}</span>
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
              <CardTitle className="text-lg">Detalles de Emisión</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="space-y-2">
                <Label className="text-sm">Número de Factura</Label>
                <Input value={nextInvoiceNumber} disabled className="text-sm bg-gray-50" />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Fecha de Emisión</Label>
                <Input type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} className="text-sm" />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Fecha de Vencimiento</Label>
                <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="text-sm" />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Notas</Label>
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notas adicionales..." className="resize-none text-sm" rows={2} />
              </div>
            </CardContent>
            <CardFooter className="bg-gray-50/50 border-t p-4 flex gap-2">
              <Button variant="outline" className="flex-1 bg-white text-sm" onClick={() => setLocation("/")}>
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
              <Button data-testid="btn-save-invoice" className="flex-1 text-sm" onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Guardar
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
