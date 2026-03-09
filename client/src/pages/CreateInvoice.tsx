import { useState } from "react";
import { useLocation } from "wouter";
import { Save, X, Plus, Trash2, ArrowLeft, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

type InvoiceItem = {
  id: string;
  description: string;
  quantity: number;
  price: number;
};

const RECURRING_SERVICES = [
  { label: "Mantenimiento Mensual", price: 150, description: "Servicio de mantenimiento técnico mensual" },
  { label: "Consultoría IT", price: 80, description: "Hora de consultoría tecnológica" },
  { label: "Desarrollo Web", price: 1200, description: "Desarrollo de nuevas funcionalidades web" },
  { label: "Hosting Anual", price: 200, description: "Alojamiento web y dominio anual" },
];

const MOCK_CLIENTS = [
  { id: "acme", name: "Acme Corp", nif: "B12345678", email: "facturas@acme.com", address: "Polígono Ind. s/n", customRates: { "Consultoría IT": 75 } },
  { id: "globex", name: "Globex Inc", nif: "A87654321", email: "billing@globex.com", address: "Main St 456", customRates: {} },
];

export default function CreateInvoice() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: "1", description: "", quantity: 1, price: 0 }
  ]);
  
  const selectedClient = MOCK_CLIENTS.find(c => c.id === selectedClientId);

  const addItem = () => {
    setItems([...items, { id: Math.random().toString(36).substring(7), description: "", quantity: 1, price: 0 }]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const applyServiceTemplate = (itemId: string, serviceLabel: string) => {
    const service = RECURRING_SERVICES.find(s => s.label === serviceLabel);
    if (service) {
      const price = selectedClient?.customRates?.[service.label as keyof typeof selectedClient.customRates] || service.price;
      setItems(items.map(item => item.id === itemId ? { 
        ...item, 
        description: service.description, 
        price: price 
      } : item));
    }
  };

  const calculateSubtotal = () => items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  const taxRate = 0.21;
  const subtotal = calculateSubtotal();
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  const handleSave = () => {
    toast({
      title: "Factura guardada",
      description: "La factura se ha guardado correctamente.",
    });
    setTimeout(() => setLocation("/"), 1500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => setLocation("/")} className="rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Crear Factura (€)</h1>
          <p className="text-muted-foreground mt-1">Configuración en euros con servicios predefinidos.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-sm bg-white">
            <CardHeader className="border-b bg-gray-50/50 pb-4">
              <CardTitle className="text-lg">Cliente</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label>Seleccionar Cliente</Label>
                <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Busca un cliente..." />
                  </SelectTrigger>
                  <SelectContent>
                    {MOCK_CLIENTS.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {selectedClient && (
                <div className="grid grid-cols-2 gap-4 p-4 bg-primary/5 rounded-lg border border-primary/10">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">NIF/CIF</p>
                    <p className="font-medium">{selectedClient.nif}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Email</p>
                    <p className="font-medium">{selectedClient.email}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Dirección</p>
                    <p className="font-medium">{selectedClient.address}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white">
            <CardHeader className="border-b bg-gray-50/50 pb-4">
              <CardTitle className="text-lg">Conceptos</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {items.map((item) => (
                <div key={item.id} className="space-y-4 p-4 border rounded-lg relative bg-white">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Cargar Plantilla de Servicio</Label>
                      <Select onValueChange={(val) => applyServiceTemplate(item.id, val)}>
                        <SelectTrigger className="bg-gray-50">
                          <SelectValue placeholder="Elegir servicio recurrente..." />
                        </SelectTrigger>
                        <SelectContent>
                          {RECURRING_SERVICES.map(s => (
                            <SelectItem key={s.label} value={s.label}>{s.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Precio Unitario (€)</Label>
                      <Input 
                        type="number" 
                        value={item.price}
                        onChange={(e) => updateItem(item.id, "price", parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Descripción Personalizada</Label>
                    <Textarea 
                      value={item.description}
                      onChange={(e) => updateItem(item.id, "description", e.target.value)}
                      placeholder="Detalles del servicio..."
                      className="resize-none"
                    />
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <div className="flex items-center gap-2">
                      <Label>Cantidad:</Label>
                      <Input 
                        type="number" 
                        className="w-20" 
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, "quantity", parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-lg">
                        {(item.quantity * item.price).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                      </span>
                      <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)} disabled={items.length === 1}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full border-dashed" onClick={addItem}>
                <Plus className="w-4 h-4 mr-2" /> Añadir Concepto
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-sm bg-slate-900 text-white">
            <CardHeader><CardTitle className="text-lg">Resumen de Factura</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between opacity-80"><span>Subtotal</span><span>{subtotal.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</span></div>
              <div className="flex justify-between opacity-80"><span>IVA (21%)</span><span>{tax.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</span></div>
              <Separator className="bg-white/10" />
              <div className="flex justify-between font-bold text-2xl"><span>Total</span><span>{total.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</span></div>
            </CardContent>
            <CardFooter className="flex gap-2 p-6 pt-0">
               <Button data-testid="btn-save-invoice" className="w-full bg-primary hover:bg-primary/90" onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" /> Guardar Factura
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}