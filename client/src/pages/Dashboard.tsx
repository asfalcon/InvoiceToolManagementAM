import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { FileText, Clock, CheckCircle2, AlertCircle, FileWarning } from "lucide-react";

const DATA_VENTAS = [
  { name: "Ene", total: 4500 },
  { name: "Feb", total: 5200 },
  { name: "Mar", total: 4800 },
  { name: "Abr", total: 6100 },
  { name: "May", total: 5900 },
  { name: "Jun", total: 7200 },
];

const DATA_ESTADOS = [
  { name: "Pagadas", value: 65, color: "#10b981" },
  { name: "Pendientes", value: 25, color: "#f59e0b" },
  { name: "Vencidas", value: 10, color: "#ef4444" },
];

const STATS = [
  { label: "Ventas Totales", val: "€24,500", icon: FileText, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Pagadas", val: "€15,800", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Pendientes", val: "€6,200", icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
  { label: "Vencidas", val: "€2,500", icon: FileWarning, color: "text-rose-600", bg: "bg-rose-50" },
];

export default function Dashboard() {
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
              <BarChart data={DATA_VENTAS}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `€${val}`} />
                <Tooltip 
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
            <ResponsiveContainer width="100%" height="80%">
              <PieChart>
                <Pie data={DATA_ESTADOS} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {DATA_ESTADOS.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex gap-4 mt-4">
              {DATA_ESTADOS.map((e) => (
                <div key={e.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: e.color }} />
                  <span className="text-xs text-muted-foreground">{e.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}