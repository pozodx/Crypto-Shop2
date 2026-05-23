import { Switch, Route } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import Home from "@/pages/home";
import ProductDetail from "@/pages/product-detail";
import OrderPage from "@/pages/order";
import Dashboard from "@/pages/admin/dashboard";
import ProductsAdmin from "@/pages/admin/products";
import OrdersAdmin from "@/pages/admin/orders";
import SettingsAdmin from "@/pages/admin/settings";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/product/:id" component={ProductDetail} />
      <Route path="/order/:id" component={OrderPage} />
      
      {/* Admin routes */}
      <Route path="/admin" component={Dashboard} />
      <Route path="/admin/products" component={ProductsAdmin} />
      <Route path="/admin/orders" component={OrdersAdmin} />
      <Route path="/admin/settings" component={SettingsAdmin} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
