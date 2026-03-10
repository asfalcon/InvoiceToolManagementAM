import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Share2, ArrowLeft, Printer, Mail, MessageSquare } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useSettings } from "@/hooks/useSettings";
import { calculateTaxBreakdown } from "@/lib/taxCalculations";

export default function ExportInvoice() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { company } = useSettings();

  // Mock data - en producción vendría de una base de datos
  const invoiceData = {
    number: id || "FAC-2024-001",
    date: new Date().toLocaleDateString("es-ES"),
    client: {
      name: "Acme Corporation S.A.",
      nif: "B87654321",
      address: "Polígono Industrial Norte, Sevilla",
    },
    items: [
      { description: "Mantenimiento Mensual Sistemas", qty: 1, price: 450 },
      { description: "Horas de Consultoría IT (Marzo)", qty: 5, price: 75 },
    ],
  };

  const subtotal = invoiceData.items.reduce((sum, item) => sum + item.qty * item.price, 0);
  const breakdown = calculateTaxBreakdown(subtotal, 0);

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/")} className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Exportar Factura</h1>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" className="gap-2 text-sm"><Printer className="w-4 h-4" /> Imprimir</Button>
          <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-sm"><Download className="w-4 h-4" /> Descargar PDF</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          {/* A4 Invoice Preview */}
          <Card className="border-none shadow-2xl bg-white overflow-hidden ring-1 ring-slate-200 p-12">
            {/* Header */}
            <div className="mb-12">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <div className="text-4xl font-black text-slate-900 mb-1">{company.name}</div>
                  <p className="text-sm text-slate-500 font-medium">{company.nif} • {company.city}, {company.country}</p>
                </div>
                <div className="text-right">
                  <div className="text-5xl font-black text-slate-200 tracking-tighter">FACTURA</div>
                  <p className="text-2xl font-bold text-slate-900 mt-2">{invoiceData.number}</p>
                  <p className="text-sm text-slate-500 mt-2">{invoiceData.date}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-12 text-sm">
                <div>
                  <h3 className="text-xs font-bold uppercase text-slate-400 tracking-widest mb-3">DE</h3>
                  <p className="font-bold text-slate-900 mb-1">{company.name}</p>
                  <p className="text-slate-600">{company.address}</p>
                  <p className="text-slate-600">{company.zipCode} {company.city}, {company.country}</p>
                  <p className="text-slate-600 mt-2">{company.email}</p>
                  <p className="text-slate-600">{company.phone}</p>
                </div>

                <div>
                  <h3 className="text-xs font-bold uppercase text-slate-400 tracking-widest mb-3">PARA</h3>
                  <p className="font-bold text-slate-900 mb-1">{invoiceData.client.name}</p>
                  <p className="text-slate-600">NIF: {invoiceData.client.nif}</p>
                  <p className="text-slate-600">{invoiceData.client.address}</p>
                </div>
              </div>
            </div>

            <Separator className="mb-8" />

            {/* Items Table */}
            <table className="w-full mb-8">
              <thead>
                <tr className="border-b-2 border-slate-900 text-left">
                  <th className="pb-3 text-xs font-bold uppercase text-slate-400 tracking-widest">Concepto</th>
                  <th className="pb-3 text-xs font-bold uppercase text-slate-400 tracking-widest text-right">Cant.</th>
                  <th className="pb-3 text-xs font-bold uppercase text-slate-400 tracking-widest text-right">Precio</th>
                  <th className="pb-3 text-xs font-bold uppercase text-slate-400 tracking-widest text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {invoiceData.items.map((item, idx) => (
                  <tr key={idx} className="border-b border-slate-100">
                    <td className="py-4 font-medium text-slate-900">{item.description}</td>
                    <td className="py-4 text-right text-slate-600">{item.qty}</td>
                    <td className="py-4 text-right text-slate-600">{item.price.toLocaleString("es-ES", { style: "currency", currency: "EUR" })}</td>
                    <td className="py-4 text-right font-bold text-slate-900">{(item.qty * item.price).toLocaleString("es-ES", { style: "currency", currency: "EUR" })}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Summary */}
            <div className="ml-auto w-80 space-y-2 text-sm mb-8">
              <div className="flex justify-between">
                <span className="text-slate-600">Subtotal</span>
                <span className="font-medium text-slate-900">{breakdown.subtotal.toLocaleString("es-ES", { style: "currency", currency: "EUR" })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">IRPF (15%)</span>
                <span className="font-medium text-red-600">-{breakdown.irpf.toLocaleString("es-ES", { style: "currency", currency: "EUR" })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Base Imponible</span>
                <span className="font-medium text-slate-900">{(breakdown.subtotal - breakdown.irpf).toLocaleString("es-ES", { style: "currency", currency: "EUR" })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">IGIC (7%)</span>
                <span className="font-medium text-green-600">+{breakdown.igic.toLocaleString("es-ES", { style: "currency", currency: "EUR" })}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between pt-2 border-t-2 border-slate-900">
                <span className="font-bold uppercase tracking-tighter text-slate-900">Total</span>
                <span className="text-2xl font-black text-slate-900">{breakdown.total.toLocaleString("es-ES", { style: "currency", currency: "EUR" })}</span>
              </div>
            </div>

            {/* Footer */}
            <Separator className="mb-6" />
            <div className="space-y-3 text-[11px] text-slate-500 leading-relaxed">
              <p><span className="font-bold text-slate-700">Método de Pago:</span> Transferencia Bancaria</p>
              <p><span className="font-bold text-slate-700">Cuenta IBAN:</span> {company.bankAccount}</p>
              <p className="border-t pt-3">{company.legalNotes}</p>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="border-none shadow-sm bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Compartir</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start gap-2 py-5 h-auto text-xs">
                <Mail className="w-4 h-4" />
                <div className="text-left"><p className="font-bold">Email</p><p className="text-muted-foreground">PDF adjunto</p></div>
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2 py-5 h-auto text-xs">
                <MessageSquare className="w-4 h-4" />
                <div className="text-left"><p className="font-bold">WhatsApp</p><p className="text-muted-foreground">Enlace directo</p></div>
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2 py-5 h-auto text-xs">
                <Share2 className="w-4 h-4" />
                <div className="text-left"><p className="font-bold">Copiar</p><p className="text-muted-foreground">Enlace</p></div>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
