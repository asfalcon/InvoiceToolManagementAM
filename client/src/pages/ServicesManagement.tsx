import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Plus, Trash2, Edit2 } from "lucide-react";
import { useSettings } from "@/contexts/SettingsContext";
import { useToast } from "@/hooks/use-toast";
import { Service } from "@/types";
import { formatCurrency } from "@/lib/taxCalculations";

export default function ServicesManagement() {
  const { services, addService, updateService, deleteService } = useSettings();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Service>>({
    name: "",
    description: "",
    basePrice: 0,
    taxIncrement: 0,
    category: "",
  });

  const handleSave = () => {
    if (!formData.name || !formData.description || formData.basePrice === undefined) {
      toast({ title: "Error", description: "Completa todos los campos obligatorios", variant: "destructive" });
      return;
    }

    const resetForm = () => {
      setIsOpen(false);
      setEditingId(null);
      setFormData({ name: "", description: "", basePrice: 0, taxIncrement: 0, category: "" });
    };

    if (editingId) {
      updateService(editingId, formData, {
        onSuccess: () => { toast({ title: "Servicio actualizado" }); resetForm(); },
        onError: (err: any) => toast({ title: "Error al actualizar servicio", description: err?.message || "Inténtalo de nuevo", variant: "destructive" }),
      });
    } else {
      addService(formData as Service, {
        onSuccess: () => { toast({ title: "Servicio creado correctamente" }); resetForm(); },
        onError: (err: any) => toast({ title: "Error al crear servicio", description: err?.message || "Inténtalo de nuevo", variant: "destructive" }),
      });
    }
  };

  const handleEdit = (service: Service) => {
    setFormData(service);
    setEditingId(service.id);
    setIsOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Servicios</h1>
          <p className="text-muted-foreground mt-1">Crea y edita servicios/conceptos facturables.</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" /> Nuevo Servicio
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Editar Servicio" : "Crear Servicio"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Nombre del Servicio</Label>
                <Input value={formData.name || ""} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Ej. Consultoría IT" />
              </div>
              <div className="space-y-2">
                <Label>Descripción</Label>
                <Textarea value={formData.description || ""} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Detalles del servicio" rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Categoría</Label>
                  <Input value={formData.category || ""} onChange={(e) => setFormData({ ...formData, category: e.target.value })} placeholder="Ej. Consultoría" />
                </div>
                <div className="space-y-2">
                  <Label>Precio Base (€)</Label>
                  <Input type="number" value={formData.basePrice || 0} onChange={(e) => setFormData({ ...formData, basePrice: parseFloat(e.target.value) })} placeholder="0.00" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Incremento por Impuestos (%)</Label>
                <Input type="number" value={formData.taxIncrement || 0} onChange={(e) => setFormData({ ...formData, taxIncrement: parseFloat(e.target.value) })} placeholder="0" />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleSave} className="w-full">{editingId ? "Actualizar" : "Crear"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((service) => (
          <Card key={service.id} className="border-none shadow-sm bg-white">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg">{service.name}</CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">{service.category}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(service)}>
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => deleteService(service.id)} className="text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">{service.description}</p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Precio Base</p>
                  <p className="font-bold">{formatCurrency(service.basePrice)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Tax Inc.</p>
                  <p className="font-bold">{service.taxIncrement}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
