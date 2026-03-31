import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSettings, CompanySettings } from "@/contexts/SettingsContext";
import { useToast } from "@/hooks/use-toast";

function CompanyForm({
  initialData,
  onSave,
}: {
  initialData: CompanySettings;
  onSave: (data: CompanySettings, cb: { onSuccess: () => void; onError: (e: any) => void }) => void;
}) {
  const { toast } = useToast();
  const [form, setForm] = useState(initialData);

  useEffect(() => {
    setForm(initialData);
  }, [initialData]);

  const handleSave = () => {
    onSave(form, {
      onSuccess: () => toast({ title: "Datos de empresa guardados correctamente" }),
      onError: (err: any) => toast({ title: "Error al guardar", description: err?.message || "Inténtalo de nuevo", variant: "destructive" }),
    });
  };

  return (
    <Card className="border-none shadow-sm bg-white">
      <CardContent className="space-y-4 pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Nombre de la Empresa</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>NIF/CIF</Label>
            <Input value={form.nif} onChange={(e) => setForm({ ...form, nif: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Teléfono</Label>
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Dirección</Label>
            <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Ciudad</Label>
            <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Código Postal</Label>
            <Input value={form.zipCode} onChange={(e) => setForm({ ...form, zipCode: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>País</Label>
            <Input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Sitio Web</Label>
            <Input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
          </div>
        </div>

        <div className="border-t pt-6">
          <h3 className="font-semibold mb-4">Datos Bancarios</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label>IBAN</Label>
              <Input value={form.bankAccount} onChange={(e) => setForm({ ...form, bankAccount: e.target.value })} placeholder="ES00 0000 0000 0000 0000 0000" />
            </div>
            <div className="space-y-2">
              <Label>Código BIC</Label>
              <Input value={form.bankCode} onChange={(e) => setForm({ ...form, bankCode: e.target.value })} />
            </div>
          </div>
        </div>

        <div className="border-t pt-6">
          <h3 className="font-semibold mb-4">Notas Legales</h3>
          <div className="space-y-2">
            <Label>Texto que aparecerá en el pie de página de las facturas</Label>
            <Textarea value={form.legalNotes} onChange={(e) => setForm({ ...form, legalNotes: e.target.value })} rows={4} />
          </div>
        </div>

        <Button onClick={handleSave} className="w-full mt-6">
          Guardar Cambios
        </Button>
      </CardContent>
    </Card>
  );
}

export default function Settings() {
  const { company, company2, saveCompany, saveCompany2, theme, saveTheme, isLoading } = useSettings();
  const { toast } = useToast();
  const [themeForm, setThemeForm] = useState(theme);

  useEffect(() => {
    if (!isLoading) {
      setThemeForm(theme);
    }
  }, [theme, isLoading]);

  const handleSaveTheme = () => {
    saveTheme(themeForm, {
      onSuccess: () => toast({ title: "Tema actualizado" }),
      onError: (err: any) => toast({ title: "Error al guardar tema", variant: "destructive" }),
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
        <p className="text-muted-foreground mt-1">Personaliza tus empresas y la apariencia de la aplicación.</p>
      </div>
      <Tabs defaultValue="company1" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="company1">Miguel Santiago</TabsTrigger>
          <TabsTrigger value="company2">Empresa 2</TabsTrigger>
          <TabsTrigger value="theme">Tema</TabsTrigger>
        </TabsList>

        <TabsContent value="company1" className="space-y-6">
          <div className="pt-2 px-1">
            <h2 className="text-lg font-semibold">Datos de la Empresa 1</h2>
            <p className="text-sm text-muted-foreground">Información principal de la primera empresa emisora de facturas.</p>
          </div>
          <CompanyForm initialData={company} onSave={saveCompany} />
        </TabsContent>

        <TabsContent value="company2" className="space-y-6">
          <div className="pt-2 px-1">
            <h2 className="text-lg font-semibold">Datos de la Empresa 2</h2>
            <p className="text-sm text-muted-foreground">Información de la segunda empresa emisora de facturas.</p>
          </div>
          <CompanyForm initialData={company2} onSave={saveCompany2} />
        </TabsContent>

        <TabsContent value="theme" className="space-y-6">
          <Card className="border-none shadow-sm bg-white">
            <CardHeader>
              <CardTitle>Personalización del Tema</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Color Primario</Label>
                  <div className="flex gap-2">
                    <Input type="color" value={themeForm.primaryColor} onChange={(e) => setThemeForm({ ...themeForm, primaryColor: e.target.value })} className="w-20 h-10 cursor-pointer" />
                    <Input type="text" value={themeForm.primaryColor} onChange={(e) => setThemeForm({ ...themeForm, primaryColor: e.target.value })} className="flex-1" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Color Secundario</Label>
                  <div className="flex gap-2">
                    <Input type="color" value={themeForm.secondaryColor} onChange={(e) => setThemeForm({ ...themeForm, secondaryColor: e.target.value })} className="w-20 h-10 cursor-pointer" />
                    <Input type="text" value={themeForm.secondaryColor} onChange={(e) => setThemeForm({ ...themeForm, secondaryColor: e.target.value })} className="flex-1" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Color de Acento</Label>
                  <div className="flex gap-2">
                    <Input type="color" value={themeForm.accentColor} onChange={(e) => setThemeForm({ ...themeForm, accentColor: e.target.value })} className="w-20 h-10 cursor-pointer" />
                    <Input type="text" value={themeForm.accentColor} onChange={(e) => setThemeForm({ ...themeForm, accentColor: e.target.value })} className="flex-1" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Familia de Tipografía</Label>
                  <Input value={themeForm.fontFamily} onChange={(e) => setThemeForm({ ...themeForm, fontFamily: e.target.value })} />
                </div>
              </div>

              <Button onClick={handleSaveTheme} className="w-full">
                Aplicar Tema
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
