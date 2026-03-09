import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Edit2, Mail, MapPin, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const MOCK_CLIENTS = [
  { id: "1", name: "Acme Corp", nif: "B12345678", email: "contact@acme.com", phone: "+34 912 345 678", address: "Av. Principal 123, Madrid" },
  { id: "2", name: "Globex Inc", nif: "A87654321", email: "info@globex.com", phone: "+34 931 234 567", address: "Calle Industria 45, Barcelona" },
];

export default function ClientsManagement() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Clientes</h1>
          <p className="text-muted-foreground mt-1">Administra tus clientes y sus condiciones comerciales.</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" /> Nuevo Cliente
        </Button>
      </div>

      <div className="relative w-full max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Buscar cliente..." 
          className="pl-9 bg-white"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {MOCK_CLIENTS.map((client) => (
          <Card key={client.id} className="border-none shadow-sm bg-white overflow-hidden group hover:ring-2 ring-primary/20 transition-all">
            <CardHeader className="bg-gray-50/50 border-b flex flex-row justify-between items-center">
              <div>
                <CardTitle className="text-xl">{client.name}</CardTitle>
                <p className="text-sm text-muted-foreground font-mono mt-1">{client.nif}</p>
              </div>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Edit2 className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-primary" />
                  <span>{client.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-4 h-4 text-primary" />
                  <span>{client.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span>{client.address}</span>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <p className="text-xs font-bold uppercase text-muted-foreground tracking-widest mb-3">Tarifas Especiales</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100">
                    Consultoría IT: €75/h
                  </Badge>
                  <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-100">
                    Descuento: 10%
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}