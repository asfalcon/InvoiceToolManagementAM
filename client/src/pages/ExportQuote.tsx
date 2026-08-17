import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, ArrowLeft, Printer, Send, CheckCircle2, XCircle, FileText } from "lucide-react";
import { useSettings } from "@/contexts/SettingsContext";
import { calculateTaxBreakdown, toNum } from "@/lib/taxCalculations";
import { useRef } from "react";
import { useToast } from "@/hooks/use-toast";

import Logo_AM from "@assets/Logo AM.png";

const STATUS_LABELS: Record<string, string> = {
  draft: "Borrador",
  sent: "Enviado",
  accepted: "Aceptado",
  rejected: "Rechazado",
};

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-slate-100 text-slate-700",
  sent: "bg-blue-100 text-blue-700",
  accepted: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
};

export default function ExportQuote() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { company, company2, quotes, updateQuote, addInvoice, invoices } = useSettings();
  const { toast } = useToast();
  const quoteRef = useRef<HTMLDivElement>(null);

  const quote = quotes.find(q => q.id === id);

  if (!quote) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <h2 className="text-2xl font-bold">Presupuesto no encontrado</h2>
        <Button onClick={() => setLocation("/quotes")}>Volver al registro</Button>
      </div>
    );
  }

  const round2 = (num: number) => Math.round(num * 100) / 100;
  const formatEuros = (num: number) =>
    `${round2(num).toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;

  const subtotal = quote.items.reduce((sum, item) => sum + item.quantity * toNum(item.basePrice), 0);
  const igicActive = false; // quotes always have IGIC exemption
  const breakdown = calculateTaxBreakdown(subtotal, toNum(quote.discount), igicActive);
  const invCompany = quote.companyId === 2 ? company2 : company;
  const isCompany2 = quote.companyId === 2;

  const formatDate = (dateStr: string, format: "long" | "short" = "long") => {
    if (!dateStr) return "—";
    if (format === "long") {
      return new Date(dateStr).toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" });
    }
    return new Date(dateStr).toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  const handlePrint = () => {
    if (!quoteRef.current) return;
    const originalTitle = document.title;
    document.title = `Presupuesto_${quote.number}`;
    const portal = document.createElement("div");
    portal.className = "invoice-print-root";
    const clone = quoteRef.current.cloneNode(true) as HTMLElement;
    clone.className = "invoice-a4 bg-white text-slate-900 font-sans flex flex-col";
    portal.appendChild(clone);
    document.body.appendChild(portal);
    window.print();
    document.body.removeChild(portal);
    setTimeout(() => { document.title = originalTitle; }, 300);
  };

  const handleConvertToInvoice = async () => {
    // Navigate to create invoice page with quote data pre-filled via sessionStorage
    const quoteData = {
      companyId: quote.companyId,
      items: quote.items,
      discount: quote.discount,
      notes: quote.notes,
      fromQuoteId: quote.id,
      fromQuoteNumber: quote.number,
      clientHint: quote.clientName,
    };
    sessionStorage.setItem("invoiceFromQuote", JSON.stringify(quoteData));
    setLocation("/create");
    toast({ title: "Datos del presupuesto cargados", description: "Selecciona el cliente y guarda la factura." });
  };

  const handleStatusChange = (status: string) => {
    updateQuote(quote.id, { status: status as any }, {
      onSuccess: () => toast({ title: "Estado actualizado" }),
      onError: () => toast({ title: "Error al actualizar", variant: "destructive" }),
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/quotes")} className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Exportar Presupuesto</h1>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" className="gap-2 text-sm" onClick={handlePrint}>
            <Printer className="w-4 h-4" /> Imprimir
          </Button>
          <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-sm" onClick={handlePrint}>
            <Download className="w-4 h-4" /> Exportar a PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 overflow-auto flex justify-center bg-gray-100 p-8 rounded-xl print:bg-white print:p-0">

          {/* ── TEMPLATE EMPRESA 1: Miguel Santiago ── */}
          {!isCompany2 && (
            <div
              ref={quoteRef}
              className="bg-white text-slate-900 shadow-xl print:shadow-none w-[210mm] min-h-[297mm] max-h-[297mm] text-[11px] flex flex-row font-sans overflow-hidden"
            >
              {/* Franja lateral izquierda */}
              <div style={{ width: "48px", minWidth: "48px", background: "#B2D3C2", flexShrink: 0, printColorAdjust: "exact", WebkitPrintColorAdjust: "exact" }} />
              {/* Contenido */}
              <div className="flex flex-col flex-1 p-10 min-w-0">
              {/* Header */}
              <div className="flex justify-between items-start mb-5">
                <div className="w-[48%]">
                  <img src={Logo_AM} alt="LogoAdmin" className="max-h-24 mb-2 object-contain" />
                  <div className="text-xs leading-relaxed text-slate-700 font-sans mt-2">
                    <br />
                    {invCompany.name}<br />
                    {invCompany.nif && <span>{invCompany.nif}<br /></span>}
                    {invCompany.address}<br />
                    {invCompany.zipCode} {invCompany.city},{" "}
                    {(invCompany as any).province || invCompany.country}<br />
                    {invCompany.email && <span>{invCompany.email}<br /></span>}
                    {invCompany.phone && <span>{invCompany.phone}</span>}
                  </div>
                </div>
                <div className="w-[48%] text-right">
                  <div className="text-[36px] font-normal tracking-[0.15em] uppercase text-slate-900 mb-3">PRESUPUESTO</div>
                  <div className="text-slate-500 mb-1 text-[10px] uppercase tracking-wider font-semibold">Fecha de Emisión:</div>
                  <div className="font-semibold text-sm text-slate-800 mb-3">{formatDate(quote.date)}</div>
                  <div className="font-bold text-base text-slate-800 mb-1">{quote.clientName}</div>
                  <div className="text-xs leading-relaxed text-slate-700 font-sans">
                    {quote.clientEmail && <span>{quote.clientEmail}<br /></span>}
                    {quote.clientPhone && <span>{quote.clientPhone}</span>}
                  </div>
                </div>
              </div>

              {/* Quote Meta */}
              <div className="flex justify-start gap-12 mb-5 border-b border-t border-slate-200 py-3">
                <div>
                  <div className="text-slate-500 mb-1 text-[11px] uppercase tracking-wider font-semibold">Nº de Presupuesto:</div>
                  <div className="font-semibold text-sm text-slate-800">{quote.number}</div>
                </div>
                <div>
                  <div className="text-slate-500 mb-1 text-[11px] uppercase tracking-wider font-semibold">Válido hasta:</div>
                  <div className="font-semibold text-sm text-slate-800">{formatDate(quote.validUntil)}</div>
                </div>
              </div>

              {/* Items Table */}
              <div className="mb-4 flex-grow">
                <table className="w-full text-center border-collapse">
                  <thead>
                    <tr className="bg-[#B2D3C2] text-black uppercase text-[10px] tracking-widest font-bold">
                      <th className="py-2.5 px-4 border-r border-white text-left w-[55%]">Descripción</th>
                      <th className="py-2.5 px-2 border-r border-white w-[15%]">Cant.</th>
                      <th className="py-2.5 px-2 border-r border-white w-[15%]">Precio</th>
                      <th className="py-2.5 px-2 w-[15%]">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm font-sans">
                    {quote.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="py-3 px-4 border-r-2 border-white text-left text-slate-800 align-top font-medium">
                          <span className="whitespace-pre-wrap">{item.description}</span>
                        </td>
                        <td className="py-3 px-2 border-r-2 border-white text-slate-700 align-top">{item.quantity}</td>
                        <td className="py-3 px-2 border-r-2 border-white text-slate-700 align-top">{formatEuros(toNum(item.basePrice))}</td>
                        <td className="py-3 px-2 text-slate-800 font-bold align-top">{formatEuros(item.quantity * toNum(item.basePrice))}</td>
                      </tr>
                    ))}
                    {Array.from({ length: Math.max(0, 3 - quote.items.length) }).map((_, idx) => (
                      <tr key={`empty-${idx}`}>
                        <td className="py-3 px-4 border-r-2 border-white text-transparent">.</td>
                        <td className="py-3 px-2 border-r-2 border-white text-transparent">.</td>
                        <td className="py-3 px-2 border-r-2 border-white text-transparent">.</td>
                        <td className="py-3 px-2 text-transparent">.</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="flex">
                  <div className="w-[55%] pt-4 pr-4">
                    {quote.notes && (
                      <div className="text-slate-600 mt-4">
                        <h4 className="text-[11px] font-bold uppercase text-slate-400 tracking-widest mb-2">Observaciones:</h4>
                        <p className="text-[12px] leading-relaxed italic">{quote.notes}</p>
                      </div>
                    )}
                  </div>
                  <div className="w-[45%]">
                    <div className="text-[13px] text-slate-600">
                      <div className="flex justify-between py-2 px-4 border-b border-slate-200">
                        <span>Subtotal</span><span>{formatEuros(breakdown.subtotal)}</span>
                      </div>
                      {toNum(quote.discount) > 0 && (
                        <div className="flex justify-between py-2 px-4 border-b border-slate-200">
                          <span>Descuento</span><span>-{formatEuros(toNum(quote.discount))}</span>
                        </div>
                      )}
                      <div className="py-2 px-4 text-[11px] text-slate-400 italic border-t border-slate-100">
                        Exento de IGIC por franquicia fiscal
                      </div>
                    </div>
                    <div className="flex justify-between items-center py-3 px-4 font-bold bg-[transparent] text-[#1d293d]">
                      <span className="uppercase tracking-widest text-[18px]">Total</span>
                      <span className="text-lg">{formatEuros(breakdown.total)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-auto pt-4 border-t border-slate-200 text-[10px] text-slate-500 font-sans">
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-bold text-slate-700 mb-2 uppercase tracking-widest">Información de Pago</h4>
                    <p className="mb-1 text-[#1d293d]">Método: Transferencia Bancaria</p>
                    <p className="text-slate-800 mt-1 font-normal">IBAN: {invCompany.bankAccount}</p>
                    {invCompany.bankCode && <p className="mt-1">Banco: {invCompany.bankCode}</p>}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-700 mb-2 uppercase tracking-widest">Información Legal</h4>
                    <p className="text-justify text-[9px] text-[#1d293d]">{invCompany.legalNotes}</p>
                  </div>
                </div>
              </div>
              </div>{/* fin contenido empresa 1 */}
            </div>
          )}

          {/* ── TEMPLATE EMPRESA 2: Antonio Pérez ── */}
          {isCompany2 && (
            <div
              ref={quoteRef}
              className="bg-white text-slate-900 shadow-xl print:shadow-none w-[210mm] min-h-[297mm] max-h-[297mm] text-[11px] font-sans overflow-hidden flex flex-row"
            >
              {/* Franja lateral izquierda */}
              <div style={{ width: "48px", minWidth: "48px", background: "#8B1A1A", flexShrink: 0, printColorAdjust: "exact", WebkitPrintColorAdjust: "exact" }} />
              {/* Contenido */}
              <div className="flex flex-col flex-1 p-8 min-w-0" style={{ minHeight: "297mm" }}>

                {/* Cabecera */}
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div style={{ color: "#8B1A1A", fontSize: "18px", fontWeight: 700, marginBottom: "4px" }}>
                      {invCompany.name}
                    </div>
                    <div className="text-[10px] text-slate-600 leading-relaxed">
                      {invCompany.address}<br />
                      {invCompany.zipCode} {invCompany.city},{" "}
                      {(invCompany as any).province || invCompany.country}<br />
                      {invCompany.nif && <span>NIF: {invCompany.nif}<br /></span>}
                      {invCompany.email && <span>{invCompany.email}<br /></span>}
                      {invCompany.phone && <span>{invCompany.phone}</span>}
                    </div>
                  </div>
                </div>

                {/* Separador y número de presupuesto */}
                <div style={{ marginBottom: "14px" }}>
                  <div style={{ borderBottom: "2px solid #8B1A1A" }} />
                  <div style={{ color: "#8B1A1A", fontWeight: 700, fontSize: "13px", letterSpacing: "0.08em", marginTop: "6px", marginBottom: "6px" }}>
                    Presupuesto n.º:&nbsp;{quote.number}
                  </div>
                  <div style={{ borderBottom: "2px solid #8B1A1A" }} />
                </div>

                {/* Cliente + meta */}
                <div className="flex justify-between mb-5" style={{ gap: "24px" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: "#8B1A1A", fontWeight: 700, fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>
                      Presupuesto para:
                    </div>
                    <div className="text-slate-700 text-[10px]">
                      <span style={{ fontWeight: 700, fontSize: "11px", color: "#1a1a2e" }}>{quote.clientName}</span><br />
                      {quote.clientEmail && <span>{quote.clientEmail}<br /></span>}
                      {quote.clientPhone && <span>{quote.clientPhone}</span>}
                    </div>
                  </div>

                  <div style={{ minWidth: "160px", textAlign: "right" }}>
                    <table style={{ marginLeft: "auto", fontSize: "10px", borderCollapse: "collapse" }}>
                      <tbody>
                        <tr>
                          <td style={{ color: "#8B1A1A", fontWeight: 700, paddingRight: "12px", paddingBottom: "4px" }}>Fecha</td>
                          <td style={{ paddingBottom: "4px" }}>{formatDate(quote.date, "short")}</td>
                        </tr>
                        {quote.validUntil && (
                          <tr>
                            <td style={{ color: "#8B1A1A", fontWeight: 700, paddingRight: "12px" }}>Válido hasta</td>
                            <td>{formatDate(quote.validUntil, "short")}</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Tabla de conceptos */}
                <div style={{ flex: 1 }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "10px" }}>
                    <thead>
                      <tr style={{ background: "#8B1A1A", color: "#ffffff" }}>
                        <th style={{ padding: "7px 10px", textAlign: "left", fontWeight: 700, letterSpacing: "0.06em", width: "10%" }}>Cant.</th>
                        <th style={{ padding: "7px 10px", textAlign: "left", fontWeight: 700, letterSpacing: "0.06em", width: "50%" }}>Descripción</th>
                        <th style={{ padding: "7px 10px", textAlign: "right", fontWeight: 700, letterSpacing: "0.06em", width: "20%" }}>Precio unitario</th>
                        <th style={{ padding: "7px 10px", textAlign: "right", fontWeight: 700, letterSpacing: "0.06em", width: "20%" }}>Importe</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quote.items.map((item, idx) => (
                        <tr key={idx} style={{ background: idx % 2 === 0 ? "#f8fafc" : "#ffffff", borderBottom: "1px solid #e2e8f0" }}>
                          <td style={{ padding: "8px 10px", textAlign: "center", color: "#374151" }}>{item.quantity}</td>
                          <td style={{ padding: "8px 10px", color: "#1a1a2e", fontWeight: 500, whiteSpace: "pre-wrap" }}>{item.description}</td>
                          <td style={{ padding: "8px 10px", textAlign: "right", color: "#374151" }}>{formatEuros(toNum(item.basePrice))}</td>
                          <td style={{ padding: "8px 10px", textAlign: "right", fontWeight: 700, color: "#1a1a2e" }}>{formatEuros(item.quantity * toNum(item.basePrice))}</td>
                        </tr>
                      ))}
                      {Array.from({ length: Math.max(0, 3 - quote.items.length) }).map((_, idx) => (
                        <tr key={`empty-${idx}`} style={{ borderBottom: "1px solid #e2e8f0" }}>
                          <td style={{ padding: "8px 10px" }}>&nbsp;</td>
                          <td style={{ padding: "8px 10px" }}>&nbsp;</td>
                          <td style={{ padding: "8px 10px" }}>&nbsp;</td>
                          <td style={{ padding: "8px 10px" }}>&nbsp;</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {quote.notes && (
                    <div style={{ marginTop: "12px", fontSize: "10px", color: "#64748b" }}>
                      <span style={{ fontWeight: 700, color: "#8B1A1A", textTransform: "uppercase", letterSpacing: "0.08em" }}>Observaciones: </span>
                      <span style={{ fontStyle: "italic", whiteSpace: "pre-wrap" }}>{quote.notes}</span>
                    </div>
                  )}

                  {/* Totales */}
                  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "16px" }}>
                    <table style={{ fontSize: "11px", borderCollapse: "collapse", minWidth: "220px" }}>
                      <tbody>
                        <tr>
                          <td style={{ padding: "4px 16px 4px 0", color: "#64748b" }}>Subtotal</td>
                          <td style={{ padding: "4px 0", textAlign: "right", color: "#374151" }}>{formatEuros(breakdown.subtotal)}</td>
                        </tr>
                        {toNum(quote.discount) > 0 && (
                          <tr>
                            <td style={{ padding: "4px 16px 4px 0", color: "#64748b" }}>Descuento</td>
                            <td style={{ padding: "4px 0", textAlign: "right", color: "#374151" }}>-{formatEuros(toNum(quote.discount))}</td>
                          </tr>
                        )}
                        <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                          <td colSpan={2} style={{ padding: "4px 0 8px 0", color: "#9ca3af", fontSize: "9px", fontStyle: "italic" }}>
                            Exento de IGIC por franquicia fiscal
                          </td>
                        </tr>
                        <tr>
                          <td style={{ padding: "10px 16px 4px 0", fontWeight: 700, fontSize: "15px", color: "#8B1A1A" }}>Total</td>
                          <td style={{ padding: "10px 0 4px 0", textAlign: "right", fontWeight: 700, fontSize: "15px", color: "#8B1A1A" }}>{formatEuros(breakdown.total)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Pie */}
                <div style={{ marginTop: "auto", paddingTop: "16px" }}>
                  <div style={{ borderTop: "2px solid #8B1A1A", marginBottom: "10px" }} />
                  <div style={{ color: "#8B1A1A", fontWeight: 700, fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>
                    Condiciones y forma de pago
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", fontSize: "9px", color: "#374151" }}>
                    <div>
                      <p style={{ marginBottom: "3px" }}>Método: Transferencia Bancaria</p>
                      <p style={{ marginBottom: "3px" }}>IBAN: {invCompany.bankAccount}</p>
                      {invCompany.bankCode && <p>Banco: {invCompany.bankCode}</p>}
                    </div>
                    <div>
                      <p style={{ textAlign: "justify", lineHeight: 1.5 }}>{invCompany.legalNotes}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Panel lateral */}
        <div className="space-y-4 print:hidden">
          <Card className="border-none shadow-sm bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Estado del Presupuesto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-md">
                <span className="text-sm text-slate-600">Estado actual</span>
                <span className={`px-2 py-1 text-xs rounded-full font-medium ${STATUS_COLORS[quote.status] || "bg-slate-100 text-slate-700"}`}>
                  {STATUS_LABELS[quote.status] || quote.status}
                </span>
              </div>

              {quote.status === "draft" && (
                <Button className="w-full gap-2 bg-blue-600 hover:bg-blue-700"
                  onClick={() => handleStatusChange("sent")}>
                  <Send className="w-4 h-4" /> Marcar como Enviado
                </Button>
              )}
              {quote.status === "sent" && (
                <>
                  <Button className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => handleStatusChange("accepted")}>
                    <CheckCircle2 className="w-4 h-4" /> Marcar como Aceptado
                  </Button>
                  <Button variant="outline" className="w-full gap-2 text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => handleStatusChange("rejected")}>
                    <XCircle className="w-4 h-4" /> Marcar como Rechazado
                  </Button>
                </>
              )}
              {(quote.status === "accepted" || quote.status === "rejected") && (
                <Button variant="outline" className="w-full text-slate-600"
                  onClick={() => handleStatusChange("sent")}>
                  Volver a Enviado
                </Button>
              )}
              <Button variant="outline" className="w-full text-slate-600 border-slate-300 hover:bg-slate-50"
                onClick={() => setLocation(`/quotes/edit/${quote.id}`)}>
                Editar presupuesto
              </Button>
            </CardContent>
          </Card>

          {quote.status === "accepted" && (
            <Card className="border-none shadow-sm bg-emerald-50 border border-emerald-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-emerald-800">Presupuesto Aceptado</CardTitle>
              </CardHeader>
              <CardContent>
                <Button className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700"
                  onClick={handleConvertToInvoice}>
                  <FileText className="w-4 h-4" /> Convertir a Factura
                </Button>
                <p className="text-xs text-emerald-700 mt-2 text-center">
                  Los conceptos se cargarán automáticamente
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
