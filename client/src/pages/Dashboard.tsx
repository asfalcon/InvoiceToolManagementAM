import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { FileText, Clock, CheckCircle2, AlertCircle, FileWarning } from "lucide-react";
import { useSettings } from "@/contexts/SettingsContext";
import { calculateTaxBreakdown, formatCurrency } from "@/lib/taxCalculations";

export default function Dashboard() {
  const { invoices } = useSettings();

  // Calcular totales
  const getInvoiceTotal = (invoice: any) => {
    const subtotal = invoice.items.reduce((sum: number, item: any) => sum + (item.quantity * parseFloat(item.basePrice || 0)), 0);
    return calculateTaxBreakdown(subtotal, parseFloat(invoice.discount || 0)).total;
  };

  const totalSales = invoices.reduce((sum, inv) => sum + getInvoiceTotal(inv), 0);
  
  const paidInvoices = invoices.filter(i => i.status === 'paid');
  const pendingInvoices = invoices.filter(i => i.status === 'pending');
  const overdueInvoices = invoices.filter(i => i.status === 'overdue');

  const totalPaid = paidInvoices.reduce((sum, inv) => sum + getInvoiceTotal(inv), 0);
  const totalPending = pendingInvoices.reduce((sum, inv) => sum + getInvoiceTotal(inv), 0);
  const totalOverdue = overdueInvoices.reduce((sum, inv) => sum + getInvoiceTotal(inv), 0);

  const STATS = [
    { label: "Ventas Totales", val: formatCurrency(totalSales), icon: FileText, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Pagadas", val: formatCurrency(totalPaid), icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Pendientes", val: formatCurrency(totalPending), icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Vencidas", val: formatCurrency(totalOverdue), icon: FileWarning, color: "text-rose-600", bg: "bg-rose-50" },
  ];

  const DATA_ESTADOS = [
    { name: "Pagadas", value: paidInvoices.length, color: "#10b981" },
    { name: "Pendientes", value: pendingInvoices.length, color: "#f59e0b" },
    { name: "Vencidas", value: overdueInvoices.length, color: "#ef4444" },
    { name: "Borrador", value: invoices.filter(i => i.status === 'draft').length, color: "#94a3b8" }
  ].filter(d => d.value > 0);

  // Evolución de ventas de los últimos 6 meses
  const monthlySales = Array(6).fill(0).map((_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    return {
      monthStr: d.toISOString().slice(0, 7), // YYYY-MM
      name: d.toLocaleDateString('es-ES', { month: 'short' }),
      total: 0
    };
  });

  invoices.forEach(inv => {
    const month = inv.date.slice(0, 7);
    const m = monthlySales.find(ms => ms.monthStr === month);
    if (m) {
      m.total += getInvoiceTotal(inv);
    }
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
            <CardTitle>Evolución de Ventas</CardTitle>
            <CardDescription>Facturación mensual del semestre actual</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlySales}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} style={{ textTransform: 'capitalize' }} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `${val} €`} />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), "Total"]}
                  cursor={{fill: '#f8fafc'}}
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