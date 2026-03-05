import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import Caps from "./pages/Caps";
import Sales from "./pages/Sales";
import ActivityPage from "./pages/ActivityPage";
import SettingsPage from "./pages/SettingsPage";
import EbayAuth from "./pages/EbayAuth";
import NotFound from "./pages/NotFound";
import { syncWorker } from "./lib/syncWorker";
import { ebayClient } from "./lib/ebay/client";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    // Start sync worker if eBay is connected
    if (ebayClient.isConnected()) {
      syncWorker.start();
    }

    return () => {
      syncWorker.stop();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth/ebay/callback" element={<EbayAuth />} />
            <Route path="/*" element={
              <AdminLayout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/inventory" element={<Inventory />} />
                  <Route path="/caps" element={<Caps />} />
                  <Route path="/sales" element={<Sales />} />
                  <Route path="/activity" element={<ActivityPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </AdminLayout>
            } />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
