import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Plus, Trash2, Edit2, Mail, MapPin, Phone } from "lucide-react";
import { useSettings } from "@/contexts/SettingsContext";
import { useToast } from "@/hooks/use-toast";
import { Client } from "@/types";

export default function ClientsManagement() {
  const { clients, addClient, updateClient, deleteClient, services } = useSettings();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Client>>({
    name: "",
    nif: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    zipCode: "",
    country: "España",
    billingType: "standard",
    customFields: {},
    serviceRates: {},
  });

  const filteredClients = clients.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleSave = () => {
    if (!formData.name || !formData.nif || !formData.email) {
      toast({ title: "Error", description: "Completa los campos obligatorios" });
      return;
    }

    if (editingId) {
      updateClient(editingId, formData);
      toast({ title: "Cliente actualizado" });
    } else {
      addClient(formData as Client);
      toast({ title: "Cliente creado" });
    }

    setIsOpen(false);
    setEditingId(null);
    setFormData({ name: "", nif: "", email: "", phone: "", address: "", city: "", zipCode: "", country: "España", billingType: "standard", customFields: {}, serviceRates: {} });
  };

  const handleEdit = (client: Client) => {
    setFormData(client);
    setEditingId(client.id);
    setIsOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Clientes</h1>
          <p className="text-muted-foreground mt-1">Administra tus clientes y sus tarifas especiales.</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" /> Nuevo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingId ? "Editar Cliente" : "Crear Cliente"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label>Nombre de la Empresa</Label>
                  <Input value={formData.name || ""} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Ej. Acme Corp" />
                </div>
                <div className="space-y-2">
                  <Label>NIF/CIF</Label>
                  <Input value={formData.nif || ""} onChange={(e) => setFormData({ ...formData, nif: e.target.value })} placeholder="B12345678" />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" value={formData.email || ""} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="contacto@empresa.com" />
                </div>
                <div className="space-y-2">
                  <Label>Teléfono</Label>
                  <Input value={formData.phone || ""} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+34 912 345 678" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Dirección</Label>
                  <Input value={formData.address || ""} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="Calle Principal 123" />
                </div>
                <div className="space-y-2">
                  <Label>Ciudad</Label>
                  <Input value={formData.city || ""} onChange={(e) => setFormData({ ...formData, city: e.target.value })} placeholder="Madrid" />
                </div>
                <div className="space-y-2">
                  <Label>Código Postal</Label>
                  <Input value={formData.zipCode || ""} onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })} placeholder="28001" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>País</Label>
                  <Input value={formData.country || ""} onChange={(e) => setFormData({ ...formData, country: e.target.value })} placeholder="España" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Tipo de Facturación</Label>
                  <select
                    value={formData.billingType || "standard"}
                    onChange={(e) => setFormData({ ...formData, billingType: e.target.value as "standard" | "simplified" })}
                    className="w-full px-3 py-2 border rounded-md text-sm"
                  >
                    <option value="standard">Factura Completa</option>
                    <option value="simplified">Factura Simplificada</option>
                  </select>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold text-sm mb-3">Tarifas Especiales por Servicio</h3>
                <div className="space-y-2">
                  {services.map(service => (
                    <div key={service.id} className="grid grid-cols-2 gap-2 items-center">
                      <Label className="text-sm">{service.name}</Label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder={service.basePrice.toString()}
                        defaultValue={formData.serviceRates?.[service.name] || ""}
                        onChange={(e) => setFormData({
                          ...formData,
                          serviceRates: { ...formData.serviceRates, [service.name]: parseFloat(e.target.value) || parseFloat(String(service.basePrice)) }
                        })}
                        className="text-sm"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleSave} className="w-full">{editingId ? "Actualizar" : "Crear"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative w-full max-w-sm">
        <Input
          placeholder="Buscar cliente..."
          className="bg-white"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredClients.map((client) => (
          <Card key={client.id} className="border-none shadow-sm bg-white overflow-hidden">
            <CardHeader className="bg-gray-50/50 border-b flex flex-row justify-between items-start">
              <div>
                <CardTitle className="text-lg">{client.name}</CardTitle>
                <p className="text-sm text-muted-foreground font-mono mt-1">{client.nif}</p>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEdit(client)}
                  className="rounded-full"
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteClient(client.id)}
                  className="rounded-full text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="w-4 h-4 text-primary" /> {client.email}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="w-4 h-4 text-primary" /> {client.phone}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4 text-primary" /> {client.address}, {client.city}
                </div>
              </div>
              <div className="border-t pt-3">
                <p className="text-xs font-bold uppercase text-muted-foreground tracking-widest mb-2">Tipo: {client.billingType === "standard" ? "Factura Completa" : "Simplificada"}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
