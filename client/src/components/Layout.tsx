import { Link, useLocation } from "wouter";
import { FileText, PlusCircle, LayoutDashboard, Settings } from "lucide-react";
import { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Facturas", icon: FileText },
    { href: "/create", label: "Nueva Factura", icon: PlusCircle },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card flex flex-col hidden md:flex">
        <div className="p-6 flex items-center gap-3 border-b">
          <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-primary-foreground font-bold">
            F
          </div>
          <span className="font-semibold text-lg tracking-tight">FacturaPro</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <a
                  data-testid={`nav-link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                    isActive 
                      ? "bg-primary/10 text-primary font-medium" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </a>
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t">
          <button className="flex items-center gap-3 px-3 py-2 w-full rounded-md text-muted-foreground hover:bg-muted transition-colors text-left">
            <Settings className="w-5 h-5" />
            Configuración
          </button>
        </div>
      </aside>

      {/* Mobile nav (bottom) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 border-t bg-card flex justify-around p-2 z-50">
         {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <a className={`flex flex-col items-center p-2 ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                  <Icon className="w-6 h-6" />
                  <span className="text-[10px] mt-1 font-medium">{item.label}</span>
                </a>
              </Link>
            );
          })}
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
        <div className="max-w-6xl mx-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}