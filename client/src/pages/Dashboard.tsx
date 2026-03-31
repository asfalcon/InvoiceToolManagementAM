import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { FileText, Clock, CheckCircle2, FileEdit, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/contexts/SettingsContext";
import { calculateTaxBreakdown, formatCurrency } from "@/lib/taxCalculations";

const MONTH_NAMES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

export default function Dashboard() {
  const { invoices } = useSettings();
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const getInvoiceTotal = (invoice: any) => {
    const subtotal = invoice.items.reduce((sum: number, item: any) => sum + (item.quantity * parseFloat(item.basePrice || 0)), 0);
    const breakdown = calculateTaxBreakdown(subtotal, parseFloat(invoice.discount || 0));
    return breakdown.total;
  };

  const totalSales = invoices.reduce((sum, inv) => sum + getInvoiceTotal(inv), 0);
  const paidInvoices = invoices.filter(i => i.status === 'paid');
  const pendingInvoices = invoices.filter(i => i.status === 'pending');
  const draftInvoices = invoices.filter(i => i.status === 'draft');
  const totalPaid = paidInvoices.reduce((sum, inv) => sum + getInvoiceTotal(inv), 0);
  const totalPending = pendingInvoices.reduce((sum, inv) => sum + getInvoiceTotal(inv), 0);

  const STATS = [
    { label: "Ventas Totales", val: formatCurrency(totalSales), icon: FileText, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Pagadas", val: formatCurrency(totalPaid), icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Pendientes", val: formatCurrency(totalPending), icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Borradores", val: `${draftInvoices.length} factura${draftInvoices.length !== 1 ? 's' : ''}`, icon: FileEdit, color: "text-slate-600", bg: "bg-slate-100" },
  ];

  const DATA_ESTADOS = [
    { name: "Pagadas", value: paidInvoices.length, color: "#10b981" },
    { name: "Pendientes", value: pendingInvoices.length, color: "#f59e0b" },
    { name: "Borrador", value: draftInvoices.length, color: "#94a3b8" }
  ].filter(d => d.value > 0);

  // Años disponibles: años con facturas + año actual
  const yearsWithInvoices = [...new Set(invoices.map(inv => new Date(inv.date).getFullYear()))];
  const availableYears = [...new Set([...yearsWithInvoices, currentYear])].sort((a, b) => b - a);

  // Evolución mensual del año seleccionado (enero → diciembre)
  const monthlySales = MONTH_NAMES.map((name, idx) => {
    const monthStr = `${selectedYear}-${String(idx + 1).padStart(2, '0')}`;
    return { name, monthStr, total: 0 };
  });

  invoices.forEach(inv => {
    const invYear = new Date(inv.date).getFullYear();
    if (invYear !== selectedYear) return;
    const month = inv.date.slice(0, 7);
    const m = monthlySales.find(ms => ms.monthStr === month);
    if (m) m.total += getInvoiceTotal(inv);
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Panel de Control</h1>
        <p className="text-muted-foreground mt-1">Análisis detallado de tu facturación y clientes.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((s, i) => (
          <Card key={i} className="border-none shadow-sm overflow-hidden group hover:scale-[1.02] transition-transform">
            <CardContent className="p-6 flex items-center gap-4">
              <div className={`${s.bg} p-3 rounded-xl ${s.color}`}>
                <s.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{s.label}</p>
                <p className="text-2xl font-bold">{s.val}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-none shadow-sm bg-white">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <CardTitle>Evolución de Ventas</CardTitle>
                <CardDescription>Facturación mensual de {selectedYear}</CardDescription>
              </div>
              {/* Selector de año */}
              <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-md"
                  onClick={() => setSelectedYear(y => y - 1)}
                  disabled={selectedYear <= Math.min(...availableYears, currentYear - 5)}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <div className="flex gap-1">
                  {availableYears.slice(0, 4).reverse().map(year => (
                    <button
                      key={year}
                      onClick={() => setSelectedYear(year)}
                      className={`px-3 py-1 text-sm rounded-md font-medium transition-colors ${
                        year === selectedYear
                          ? 'bg-white shadow-sm text-slate-900'
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      {year}
                    </button>
                  ))}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-md"
                  onClick={() => setSelectedYear(y => y + 1)}
                  disabled={selectedYear >= currentYear}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlySales}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `${val} €`} width={70} />
                <Tooltip
                  formatter={(value: number) => [formatCurrency(value), "Total"]}
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="total" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white">
          <CardHeader>
            <CardTitle>Estado de Facturas</CardTitle>
            <CardDescription>Distribución por estado</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex flex-col items-center justify-center">
            {DATA_ESTADOS.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height="80%">
                  <PieChart>
                    <Pie data={DATA_ESTADOS} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {DATA_ESTADOS.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [`${value} facturas`, "Cantidad"]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex gap-4 mt-4 flex-wrap justify-center">
                  {DATA_ESTADOS.map((e) => (
                    <div key={e.name} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: e.color }} />
                      <span className="text-xs text-muted-foreground">{e.name} ({e.value})</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center text-muted-foreground">
                <PieChart className="w-12 h-12 mx-auto text-slate-200 mb-2" />
                <p>No hay datos suficientes</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
