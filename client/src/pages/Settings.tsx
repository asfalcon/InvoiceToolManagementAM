import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSettings } from "@/contexts/SettingsContext";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { company, saveCompany, theme, saveTheme } = useSettings();
  const { toast } = useToast();
  const [companyForm, setCompanyForm] = useState(company);
  const [themeForm, setThemeForm] = useState(theme);

  const handleSaveCompany = () => {
    saveCompany(companyForm);
    toast({ title: "Datos de empresa guardados" });
  };

  const handleSaveTheme = () => {
    saveTheme(themeForm);
    toast({ title: "Tema actualizado" });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
        <p className="text-muted-foreground mt-1">Personaliza tu empresa y la apariencia de la aplicación.</p>
      </div>

      <Tabs defaultValue="company" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="company">Empresa</TabsTrigger>
          <TabsTrigger value="theme">Tema</TabsTrigger>
        </TabsList>

        <TabsContent value="company" className="space-y-6">
          <Card className="border-none shadow-sm bg-white">
            <CardHeader>
              <CardTitle>Datos de la Empresa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nombre de la Empresa</Label>
                  <Input value={companyForm.name} onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>NIF/CIF</Label>
                  <Input value={companyForm.nif} onChange={(e) => setCompanyForm({ ...companyForm, nif: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" value={companyForm.email} onChange={(e) => setCompanyForm({ ...companyForm, email: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Teléfono</Label>
                  <Input value={companyForm.phone} onChange={(e) => setCompanyForm({ ...companyForm, phone: e.target.value })} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Dirección</Label>
                  <Input value={companyForm.address} onChange={(e) => setCompanyForm({ ...companyForm, address: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Ciudad</Label>
                  <Input value={companyForm.city} onChange={(e) => setCompanyForm({ ...companyForm, city: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Código Postal</Label>
                  <Input value={companyForm.zipCode} onChange={(e) => setCompanyForm({ ...companyForm, zipCode: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>País</Label>
                  <Input value={companyForm.country} onChange={(e) => setCompanyForm({ ...companyForm, country: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Sitio Web</Label>
                  <Input value={companyForm.website} onChange={(e) => setCompanyForm({ ...companyForm, website: e.target.value })} />
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="font-semibold mb-4">Datos Bancarios</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <Label>IBAN</Label>
                    <Input value={companyForm.bankAccount} onChange={(e) => setCompanyForm({ ...companyForm, bankAccount: e.target.value })} placeholder="ES00 0000 0000 0000 0000 0000" />
                  </div>
                  <div className="space-y-2">
                    <Label>Código BIC</Label>
                    <Input value={companyForm.bankCode} onChange={(e) => setCompanyForm({ ...companyForm, bankCode: e.target.value })} />
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="font-semibold mb-4">Notas Legales</h3>
                <div className="space-y-2">
                  <Label>Texto que aparecerá en el pie de página de las facturas</Label>
                  <Textarea value={companyForm.legalNotes} onChange={(e) => setCompanyForm({ ...companyForm, legalNotes: e.target.value })} rows={4} />
                </div>
              </div>

              <Button onClick={handleSaveCompany} className="w-full mt-6">
                Guardar Cambios
              </Button>
            </CardContent>
          </Card>
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
