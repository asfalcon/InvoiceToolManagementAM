import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Share2, ArrowLeft, Printer, Mail, MessageSquare } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useSettings } from "@/contexts/SettingsContext";
import { calculateTaxBreakdown, toNum } from "@/lib/taxCalculations";
import { useRef } from "react";

export default function ExportInvoice() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { company, invoices, clients, markInvoiceAsPaid, updateInvoice } = useSettings();
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

  const roundUp = (num: number) => Math.ceil(num * 100) / 100;
  const formatEuros = (num: number) => `${roundUp(num).toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;

  const subtotal = invoice.items.reduce((sum, item) => sum + item.quantity * toNum(item.basePrice), 0);
  const breakdown = calculateTaxBreakdown(subtotal, toNum(invoice.discount));

  // Usamos la impresión nativa que genera PDFs perfectos vectoriales
  // cambiando el título temporalmente para que el archivo por defecto sea el correcto.
  const handlePrint = () => {
    const originalTitle = document.title;
    document.title = `Factura_${invoice.number}`;
    window.print();
    setTimeout(() => { document.title = originalTitle; }, 500);
  };

  const handleDownload = handlePrint;

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
            className="bg-white text-slate-900 shadow-xl print:shadow-none p-12 sm:p-16 w-[210mm] min-h-[297mm] text-[12px] flex flex-col font-sans"
          >
            {/* Header: Company & Client Info */}
            <div className="flex justify-between items-start mb-8">
              {/* Top Left: Company */}
              <div className="w-[48%]">
                <img src="/logo-admin.png" alt="LogoAdmin" className="max-h-16 mb-4 object-contain" />
                <div className="text-sm leading-relaxed text-slate-700 font-sans mt-4">
                  <span className="font-bold text-slate-900">Admin+</span><br />
                  {company.name}<br />
                  {company.address}<br />
                  {company.zipCode} {company.city}, {company.province || company.country}<br />
                  {company.email && <span>{company.email}<br /></span>}
                  {company.phone && <span>{company.phone}</span>}
                </div>
              </div>

              {/* Top Right: Client */}
              <div className="w-[48%] text-right">
                <div className="text-[40px] font-normal tracking-[0.15em] uppercase text-slate-900 mb-6">
                  FACTURA
                </div>
                <div className="text-slate-500 mb-1 text-[11px] uppercase tracking-wider font-semibold">Fecha de Emisión:</div>
                <div className="font-semibold text-sm text-slate-800 mb-6">{new Date(invoice.date).toLocaleDateString("es-ES", {day: '2-digit', month: 'long', year: 'numeric'})}</div>
                <div className="font-bold text-lg text-slate-800 mb-1">{client.name}</div>
                <div className="text-sm leading-relaxed text-slate-700 font-sans">
                  <span className="font-semibold">NIF:</span> {client.nif}<br />
                  {client.address}<br />
                  {client.zipCode} {client.city}, {client.country}<br />
                  {client.email && <span>{client.email}</span>}
                </div>
              </div>
            </div>

            {/* Invoice Meta */}
            <div className="flex justify-start gap-12 mb-10 border-b border-t border-slate-200 py-4">
              <div>
                <div className="text-slate-500 mb-1 text-[11px] uppercase tracking-wider font-semibold">Nº de Factura:</div>
                <div className="font-semibold text-sm text-slate-800">{invoice.number}</div>
              </div>
            </div>

            {/* Items Table */}
            <div className="mb-8 flex-grow">
              <table className="w-full text-center border-collapse">
                <thead>
                  <tr className="bg-[#bda193] text-black uppercase text-[10px] tracking-widest font-bold">
                    <th className="py-4 px-4 border-r border-white text-left w-[55%]">Descripción</th>
                    <th className="py-4 px-2 border-r border-white w-[15%]">Cant.</th>
                    <th className="py-4 px-2 border-r border-white w-[15%]">Precio</th>
                    <th className="py-4 px-2 w-[15%]">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="text-sm font-sans">
                  {invoice.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-5 px-4 border-r-2 border-white text-left text-slate-800 align-top font-medium">{item.description}</td>
                      <td className="py-5 px-2 border-r-2 border-white text-slate-700 align-top">{item.quantity}</td>
                      <td className="py-5 px-2 border-r-2 border-white text-slate-700 align-top">{formatEuros(item.basePrice)}</td>
                      <td className="py-5 px-2 text-slate-800 font-bold align-top">{formatEuros(item.quantity * item.basePrice)}</td>
                    </tr>
                  ))}
                  {/* Fill empty space if few items for layout stability */}
                  {Array.from({ length: Math.max(1, 5 - invoice.items.length) }).map((_, idx) => (
                    <tr key={`empty-${idx}`}>
                      <td className="py-6 px-4 border-r-2 border-white text-transparent">.</td>
                      <td className="py-6 px-2 border-r-2 border-white text-transparent">.</td>
                      <td className="py-6 px-2 border-r-2 border-white text-transparent">.</td>
                      <td className="py-6 px-2 text-transparent">.</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Breakdown & Totals */}
              <div className="flex">
                <div className="w-[55%] pt-4 pr-4">
                  {invoice.notes && (
                    <div className="text-slate-600 mt-4">
                      <h4 className="text-[11px] font-bold uppercase text-slate-400 tracking-widest mb-2">Observaciones:</h4>
                      <p className="text-[12px] leading-relaxed italic">{invoice.notes}</p>
                    </div>
                  )}
                </div>
                <div className="w-[45%]">
                  <div className="text-[13px] text-slate-600">
                    <div className="flex justify-between py-2 px-4 border-b border-slate-200">
                      <span>Subtotal</span>
                      <span>{formatEuros(breakdown.subtotal)}</span>
                    </div>
                    {invoice.discount > 0 && (
                      <div className="flex justify-between py-2 px-4 border-b border-slate-200">
                        <span>Descuento</span>
                        <span>-{formatEuros(invoice.discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between py-2 px-4 text-slate-800">
                      <span>IRPF (15%)</span>
                      <span>{formatEuros(breakdown.irpf)}</span>
                    </div>
                  </div>
                  <div className="bg-[#4d3c34] text-white flex justify-between items-center py-3 px-4 font-bold">
                    <span className="uppercase tracking-widest text-xs">Total</span>
                    <span className="text-lg">{formatEuros(breakdown.total)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer / Payment Info & Legal */}
            <div className="mt-auto pt-8 border-t border-slate-200 text-[10px] text-slate-500 font-sans">
              <div className="grid grid-cols-2 gap-12">
                <div>
                  <h4 className="font-bold text-slate-700 mb-2 uppercase tracking-widest">Información de Pago</h4>
                  <p className="mb-1">Método: Transferencia Bancaria</p>
                  <p className="font-medium text-slate-800 mt-1">IBAN: {company.bankAccount}</p>
                  {company.bankCode && <p className="mt-1">Banco: {company.bankCode}</p>}
                </div>
                <div>
                  <h4 className="font-bold text-slate-700 mb-2 uppercase tracking-widest">Información Legal</h4>
                  <p className="text-justify leading-relaxed text-[9px]">{company.legalNotes}</p>
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
              
              {invoice.status !== 'paid' ? (
                <Button 
                  className="w-full bg-emerald-600 hover:bg-emerald-700" 
                  onClick={() => {
                    markInvoiceAsPaid(invoice.id);
                  }}
                >
                  Marcar como Pagada
                </Button>
              ) : (
                <Button 
                  variant="outline"
                  className="w-full text-amber-600 border-amber-200 hover:bg-amber-50 hover:text-amber-700" 
                  onClick={() => {
                    updateInvoice(invoice.id, { status: 'pending' });
                  }}
                >
                  Deshacer Pago
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