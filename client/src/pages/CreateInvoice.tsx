import { useState } from "react";
import { useLocation } from "wouter";
import { Save, X, Plus, Trash2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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

export default function CreateInvoice() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: "1", description: "", quantity: 1, price: 0 }
  ]);
  
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

  const calculateSubtotal = () => items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  const taxRate = 0.21; // 21% IVA
  const subtotal = calculateSubtotal();
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  const handleSave = () => {
    toast({
      title: "Factura guardada",
      description: "La factura se ha guardado correctamente en la base de datos.",
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
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Crear Nueva Factura</h1>
          <p className="text-muted-foreground mt-1">Completa los datos para emitir una nueva factura.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-sm bg-white">
            <CardHeader className="border-b bg-gray-50/50 pb-4">
              <CardTitle className="text-lg">Datos del Cliente</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="client">Cliente</Label>
                <Select defaultValue="new">
                  <SelectTrigger data-testid="select-client" className="bg-white">
                    <SelectValue placeholder="Seleccionar cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">+ Añadir nuevo cliente</SelectItem>
                    <SelectItem value="acme">Acme Corp</SelectItem>
                    <SelectItem value="globex">Globex Inc</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="name">Razón Social / Nombre</Label>
                <Input id="name" placeholder="Ej. Acme Corporation S.L." className="bg-white" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="nif">NIF / CIF</Label>
                <Input id="nif" placeholder="B12345678" className="bg-white" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email de contacto</Label>
                <Input id="email" type="email" placeholder="facturacion@acme.com" className="bg-white" />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Dirección</Label>
                <Textarea id="address" placeholder="Calle Falsa 123, Madrid" className="resize-none bg-white" rows={2} />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white">
            <CardHeader className="border-b bg-gray-50/50 pb-4 flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Conceptos</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {/* Table header for desktop */}
              <div className="hidden md:grid grid-cols-12 gap-4 text-sm font-medium text-muted-foreground px-2">
                <div className="col-span-6">Descripción</div>
                <div className="col-span-2 text-right">Cant.</div>
                <div className="col-span-2 text-right">Precio Ud.</div>
                <div className="col-span-2 text-right">Total</div>
              </div>

              {items.map((item, index) => (
                <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-gray-50/50 p-3 md:bg-transparent md:p-0 rounded-md border md:border-none">
                  <div className="col-span-1 md:col-span-6 space-y-1">
                    <Label className="md:hidden text-xs text-muted-foreground">Descripción</Label>
                    <Input 
                      placeholder="Descripción del servicio o producto" 
                      value={item.description}
                      onChange={(e) => updateItem(item.id, "description", e.target.value)}
                      className="bg-white"
                    />
                  </div>
                  <div className="col-span-1 md:col-span-2 space-y-1">
                    <Label className="md:hidden text-xs text-muted-foreground">Cantidad</Label>
                    <Input 
                      type="number" 
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, "quantity", parseInt(e.target.value) || 0)}
                      className="text-right bg-white"
                    />
                  </div>
                  <div className="col-span-1 md:col-span-2 space-y-1">
                    <Label className="md:hidden text-xs text-muted-foreground">Precio Ud.</Label>
                    <Input 
                      type="number"
                      step="0.01" 
                      value={item.price}
                      onChange={(e) => updateItem(item.id, "price", parseFloat(e.target.value) || 0)}
                      className="text-right bg-white"
                    />
                  </div>
                  <div className="col-span-1 md:col-span-2 flex items-center justify-between md:justify-end gap-2">
                     <span className="md:hidden text-sm font-medium text-muted-foreground">Total:</span>
                     <div className="flex items-center gap-2">
                      <span className="font-medium">${(item.quantity * item.price).toLocaleString('es-ES', { minimumFractionDigits: 2 })}</span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => removeItem(item.id)}
                        disabled={items.length === 1}
                        className="text-muted-foreground hover:text-destructive shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              <Button 
                variant="outline" 
                className="w-full mt-4 border-dashed bg-gray-50/50 hover:bg-gray-100"
                onClick={addItem}
              >
                <Plus className="w-4 h-4 mr-2" />
                Añadir línea
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-sm bg-primary text-primary-foreground">
             <CardHeader className="pb-4">
              <CardTitle className="text-lg text-primary-foreground/90">Resumen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-primary-foreground/80">Subtotal</span>
                <span>${subtotal.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-primary-foreground/80">IVA (21%)</span>
                <span>${tax.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</span>
              </div>
              <Separator className="bg-primary-foreground/20" />
              <div className="flex justify-between font-bold text-xl">
                <span>Total</span>
                <span>${total.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white">
            <CardHeader className="border-b bg-gray-50/50 pb-4">
              <CardTitle className="text-lg">Detalles de Emisión</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="invoice-date">Fecha de emisión</Label>
                <Input id="invoice-date" type="date" defaultValue={new Date().toISOString().split('T')[0]} className="bg-white" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="due-date">Fecha de vencimiento</Label>
                <Input id="due-date" type="date" defaultValue={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]} className="bg-white" />
              </div>
            </CardContent>
            <CardFooter className="bg-gray-50/50 border-t p-4 flex gap-2">
              <Button variant="outline" className="flex-1 bg-white" onClick={() => setLocation("/")}>
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
              <Button data-testid="btn-save-invoice" className="flex-1" onClick={handleSave}>
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