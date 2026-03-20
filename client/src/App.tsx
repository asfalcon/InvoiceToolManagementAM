import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SettingsProvider } from "@/contexts/SettingsContext";
import NotFound from "@/pages/not-found";

import InvoicesList from "@/pages/InvoicesList";
import CreateInvoice from "@/pages/CreateInvoice";
import Dashboard from "@/pages/Dashboard";
import ClientsManagement from "@/pages/ClientsManagement";
import ServicesManagement from "@/pages/ServicesManagement";
import Settings from "@/pages/Settings";
import ExportInvoice from "@/pages/ExportInvoice";
import Layout from "@/components/Layout";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/" component={InvoicesList} />
        <Route path="/create" component={CreateInvoice} />
        <Route path="/edit/:id" component={CreateInvoice} />
        <Route path="/clients" component={ClientsManagement} />
        <Route path="/services" component={ServicesManagement} />
        <Route path="/settings" component={Settings} />
        <Route path="/export/:id" component={ExportInvoice} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SettingsProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </SettingsProvider>
    </QueryClientProvider>
  );
}

export default App;
