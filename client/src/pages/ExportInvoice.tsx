import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Share2, ArrowLeft, Printer, Mail, MessageSquare } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useSettings } from "@/contexts/SettingsContext";
import { calculateTaxBreakdown } from "@/lib/taxCalculations";
import { useRef } from "react";
import html2pdf from "html2pdf.js";

export default function ExportInvoice() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { company, invoices, clients, markInvoiceAsPaid } = useSettings();
  const invoiceRef = useRef<HTMLDivElement>(null);

  const invoice = invoices.find(i => i.id === id);
  const client = invoice ? clients.find(c => c.id === invoice.clientId) : null;

  if (!invoice || !client) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <h2 className="text-2xl font-bold">Factura no encontrada</h2>
        <Button onClick={() => setLocation("/")}>Volver al registro</Button>
      </div>
    );
  }

  const subtotal = invoice.items.reduce((sum, item) => sum + item.quantity * item.basePrice, 0);
  const breakdown = calculateTaxBreakdown(subtotal, invoice.discount);

  // Función simplificada para imprimir
  const handlePrint = () => {
    window.print();
  };

  // Función para descargar como HTML que se puede imprimir a PDF
  const handleDownload = () => {
    const element = invoiceRef.current;
    if (!element) return;
    
    // Configuración para el PDF
    const opt = {
      margin:       [0, 0, 0, 0],
      filename:     `Factura_${invoice.number}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, letterRendering: true },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    html2pdf().from(element).set(opt).save();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Botones de acción (No se imprimen debido a una clase CSS print:hidden que añadiremos al index.css) */}
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/")} className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Exportar Factura</h1>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" className="gap-2 text-sm" onClick={handlePrint}>
            <Printer className="w-4 h-4" /> Imprimir
          </Button>
          <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-sm" onClick={handleDownload}>
            <Download className="w-4 h-4" /> Exportar a PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 overflow-auto flex justify-center bg-gray-100 p-8 rounded-xl print:bg-white print:p-0">
          {/* A4 Invoice Document */}
          <div 
            ref={invoiceRef}
            className="bg-white text-slate-900 shadow-xl print:shadow-none p-12 sm:p-16 w-[210mm] min-h-[297mm] text-[12px] flex flex-col"
            style={{ fontFamily: 'var(--font-sans)', lineHeight: 1.5 }}
          >
            {/* Header / Logo */}
            <div className="flex justify-between items-start mb-12">
              <div className="max-w-[50%]">
                {/* Logo area */}
                {company.logo ? (
                  <img src={company.logo} alt="Logo Empresa" className="max-h-16 mb-6 object-contain" />
                ) : (
                  <div className="text-2xl font-bold mb-4 tracking-tight text-slate-800">{company.name}</div>
                )}
                <div className="text-slate-500 text-[11px] leading-relaxed">
                  <p>{company.address}</p>
                  <p>{company.zipCode} {company.city}, {company.country}</p>
                  <p className="mt-2"><span className="font-medium text-slate-600">NIF:</span> {company.nif}</p>
                  <p>{company.email}</p>
                  <p>{company.phone}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-light text-slate-400 tracking-widest uppercase mb-4">Factura</div>
                <div className="text-xl font-medium text-slate-800 mb-6">{invoice.number}</div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 mt-4 text-right text-[11px]">
                  <div className="text-slate-400 font-medium uppercase tracking-wider">Emisión:</div>
                  <div className="font-medium text-slate-700">{new Date(invoice.date).toLocaleDateString("es-ES")}</div>
                  <div className="text-slate-400 font-medium uppercase tracking-wider">Vencimiento:</div>
                  <div className="font-medium text-slate-700">{new Date(invoice.dueDate).toLocaleDateString("es-ES")}</div>
                </div>
              </div>
            </div>

            {/* Client Info */}
            <div className="mb-12">
              <h3 className="text-[11px] font-bold uppercase text-slate-400 tracking-widest mb-3">Facturar a:</h3>
              <div className="font-bold text-base text-slate-800 mb-2">{client.name}</div>
              <div className="text-slate-600 text-[11px] leading-relaxed">
                <p><span className="font-medium">NIF:</span> {client.nif}</p>
                <p>{client.address}</p>
                <p>{client.zipCode} {client.city}, {client.country}</p>
                {client.email && <p className="mt-1">{client.email}</p>}
              </div>
            </div>

            {/* Items Table */}
            <table className="w-full mb-12 text-[11px]">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-500">
                  <th className="pb-3 font-bold uppercase tracking-wider w-[50%]">Descripción del Servicio</th>
                  <th className="pb-3 font-bold uppercase tracking-wider text-center w-[15%]">Cant.</th>
                  <th className="pb-3 font-bold uppercase tracking-wider text-right w-[15%]">Precio/U</th>
                  <th className="pb-3 font-bold uppercase tracking-wider text-right w-[20%]">Subtotal</th>
                </tr>
              </thead>
              <tbody className="text-slate-700">
                {invoice.items.map((item, idx) => (
                  <tr key={idx} className="border-b border-slate-100 last:border-0">
                    <td className="py-4 pr-4">{item.description}</td>
                    <td className="py-4 text-center">{item.quantity}</td>
                    <td className="py-4 text-right">
                      {item.basePrice.toLocaleString("es-ES", { minimumFractionDigits: 2 })} €
                    </td>
                    <td className="py-4 text-right font-medium">
                      {(item.quantity * item.basePrice).toLocaleString("es-ES", { minimumFractionDigits: 2 })} €
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Summary & Totals */}
            <div className="flex justify-end mb-16 text-[11px]">
              <div className="w-[300px]">
                <div className="flex justify-between py-2 text-slate-600">
                  <span>Suma Total</span>
                  <span>{breakdown.subtotal.toLocaleString("es-ES", { minimumFractionDigits: 2 })} €</span>
                </div>
                {invoice.discount > 0 && (
                  <div className="flex justify-between py-2 text-slate-600">
                    <span>Descuento</span>
                    <span>-{invoice.discount.toLocaleString("es-ES", { minimumFractionDigits: 2 })} €</span>
                  </div>
                )}
                <div className="flex justify-between py-2 text-slate-600 border-b border-slate-100">
                  <span>Retención IRPF (15%)</span>
                  <span className="text-slate-600">-{breakdown.irpf.toLocaleString("es-ES", { minimumFractionDigits: 2 })} €</span>
                </div>
                <div className="flex justify-between py-3 text-slate-800 font-medium">
                  <span>Base Imponible</span>
                  <span>{breakdown.taxableBase.toLocaleString("es-ES", { minimumFractionDigits: 2 })} €</span>
                </div>
                <div className="flex justify-between py-2 text-slate-600">
                  <span>IGIC (7%)</span>
                  <span>+{breakdown.igic.toLocaleString("es-ES", { minimumFractionDigits: 2 })} €</span>
                </div>
                
                <div className="flex justify-between py-4 mt-2 border-t border-slate-200 text-base font-bold text-slate-900">
                  <span>Total a Pagar</span>
                  <span>{breakdown.total.toLocaleString("es-ES", { style: 'currency', currency: 'EUR' })}</span>
                </div>
              </div>
            </div>

            {invoice.notes && (
              <div className="mb-12 text-slate-600">
                <h4 className="text-[11px] font-bold uppercase text-slate-400 tracking-widest mb-2">Observaciones:</h4>
                <p className="bg-slate-50 p-4 rounded text-[11px]">{invoice.notes}</p>
              </div>
            )}

            {/* Footer */}
            <div className="mt-auto pt-6 border-t border-slate-200 text-[9px] text-slate-500">
              <div className="grid grid-cols-2 gap-10">
                <div>
                  <h4 className="font-bold text-slate-700 mb-2 uppercase tracking-widest">Datos de Pago</h4>
                  <p className="mb-1">Transferencia Bancaria</p>
                  <p className="font-mono text-slate-800 mt-1">IBAN: {company.bankAccount}</p>
                  {company.bankCode && <p className="font-mono mt-1">BIC/SWIFT: {company.bankCode}</p>}
                </div>
                <div>
                  <h4 className="font-bold text-slate-700 mb-2 uppercase tracking-widest">Información Legal</h4>
                  <p className="text-justify leading-relaxed">{company.legalNotes}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4 print:hidden">
          <Card className="border-none shadow-sm bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Estado de la Factura</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-md">
                <span className="text-sm text-slate-600">Estado Actual</span>
                <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                  invoice.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {invoice.status === 'paid' ? 'Pagada' : 'Pendiente'}
                </span>
              </div>
              
              {invoice.status !== 'paid' && (
                <Button 
                  className="w-full bg-emerald-600 hover:bg-emerald-700" 
                  onClick={() => {
                    markInvoiceAsPaid(invoice.id);
                  }}
                >
                  Marcar como Pagada
                </Button>
              )}
            </CardContent>
          </Card>
          
          <Card className="border-none shadow-sm bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Compartir</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start gap-2 py-5 h-auto text-xs">
                <Mail className="w-4 h-4" />
                <div className="text-left"><p className="font-bold">Email</p><p className="text-muted-foreground">Enviar al cliente</p></div>
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2 py-5 h-auto text-xs">
                <MessageSquare className="w-4 h-4" />
                <div className="text-left"><p className="font-bold">WhatsApp</p><p className="text-muted-foreground">Compartir enlace</p></div>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}