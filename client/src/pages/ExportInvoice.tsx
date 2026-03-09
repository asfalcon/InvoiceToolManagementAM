import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, Share2, ArrowLeft, Printer, Mail, MessageSquare } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function ExportInvoice() {
  const { id } = useParams();
  const [, setLocation] = useLocation();

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/")} className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Exportar Factura</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2"><Printer className="w-4 h-4" /> Imprimir</Button>
          <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700"><Download className="w-4 h-4" /> Descargar PDF</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          {/* A4 Preview Mockup */}
          <Card className="border-none shadow-2xl bg-white aspect-[1/1.414] p-12 overflow-hidden ring-1 ring-slate-200">
            <div className="flex justify-between items-start mb-12">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-2xl">F</div>
                <div>
                  <h2 className="text-xl font-bold">FacturaPro S.L.</h2>
                  <p className="text-xs text-muted-foreground">CIF: B12345678</p>
                </div>
              </div>
              <div className="text-right">
                <h1 className="text-3xl font-black text-slate-300 tracking-tighter uppercase mb-1">Factura</h1>
                <p className="font-bold text-slate-900">{id}</p>
                <p className="text-xs text-muted-foreground mt-1">Fecha: 09/03/2026</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-12 mb-12">
              <div>
                <h3 className="text-xs font-bold uppercase text-slate-400 tracking-widest mb-2">Emisor</h3>
                <p className="font-bold">FacturaPro S.L.</p>
                <p className="text-sm text-slate-600">Calle Tecnológica 10, Suite 4</p>
                <p className="text-sm text-slate-600">28001 Madrid, España</p>
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase text-slate-400 tracking-widest mb-2">Cliente</h3>
                <p className="font-bold">Acme Corporation</p>
                <p className="text-sm text-slate-600">Polígono Industrial Norte</p>
                <p className="text-sm text-slate-600">41001 Sevilla, España</p>
              </div>
            </div>

            <table className="w-full mb-12">
              <thead>
                <tr className="border-b-2 border-slate-100 text-left">
                  <th className="py-4 text-xs font-bold uppercase text-slate-400 tracking-widest">Concepto</th>
                  <th className="py-4 text-xs font-bold uppercase text-slate-400 tracking-widest text-right">Cant.</th>
                  <th className="py-4 text-xs font-bold uppercase text-slate-400 tracking-widest text-right">Precio</th>
                  <th className="py-4 text-xs font-bold uppercase text-slate-400 tracking-widest text-right">Total</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <tr className="border-b border-slate-50">
                  <td className="py-4 font-medium text-slate-900">Mantenimiento Mensual Sistemas</td>
                  <td className="py-4 text-right text-slate-600">1</td>
                  <td className="py-4 text-right text-slate-600">€450,00</td>
                  <td className="py-4 text-right font-bold text-slate-900">€450,00</td>
                </tr>
                <tr className="border-b border-slate-50">
                  <td className="py-4 font-medium text-slate-900">Horas de Consultoría IT (Marzo)</td>
                  <td className="py-4 text-right text-slate-600">5</td>
                  <td className="py-4 text-right text-slate-600">€75,00</td>
                  <td className="py-4 text-right font-bold text-slate-900">€375,00</td>
                </tr>
              </tbody>
            </table>

            <div className="ml-auto w-64 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Subtotal</span>
                <span className="font-medium text-slate-900">€825,00</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">IVA (21%)</span>
                <span className="font-medium text-slate-900">€173,25</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center pt-2">
                <span className="font-bold text-slate-900 uppercase tracking-tighter">Total Factura</span>
                <span className="text-2xl font-black text-primary">€998,25</span>
              </div>
            </div>

            <div className="mt-auto pt-12 text-[10px] text-slate-400 leading-relaxed border-t border-slate-100">
              <p>Factura emitida según la normativa vigente. El pago debe realizarse antes de los 30 días posteriores a la fecha de emisión.</p>
              <p className="mt-1">IBAN: ES00 0000 0000 0000 0000 0000</p>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-sm bg-white">
            <CardHeader className="pb-4"><CardTitle className="text-lg">Enviar a cliente</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full justify-start gap-3 py-6 h-auto">
                <div className="bg-blue-100 p-2 rounded-lg text-blue-600"><Mail className="w-5 h-5" /></div>
                <div className="text-left">
                  <p className="font-bold text-sm">Enviar por Email</p>
                  <p className="text-xs text-muted-foreground">Enviará el PDF adjunto</p>
                </div>
              </Button>
              <Button variant="outline" className="w-full justify-start gap-3 py-6 h-auto">
                <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600"><MessageSquare className="w-5 h-5" /></div>
                <div className="text-left">
                  <p className="font-bold text-sm">WhatsApp</p>
                  <p className="text-xs text-muted-foreground">Compartir enlace directo</p>
                </div>
              </Button>
              <Button variant="outline" className="w-full justify-start gap-3 py-6 h-auto">
                <div className="bg-slate-100 p-2 rounded-lg text-slate-600"><Share2 className="w-5 h-5" /></div>
                <div className="text-left">
                  <p className="font-bold text-sm">Otras opciones</p>
                  <p className="text-xs text-muted-foreground">Copiar enlace o descargar</p>
                </div>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}