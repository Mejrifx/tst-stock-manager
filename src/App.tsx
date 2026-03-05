import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { AuthProvider } from "@/components/AuthProvider";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import Caps from "./pages/Caps";
import Sales from "./pages/Sales";
import ActivityPage from "./pages/ActivityPage";
import SettingsPage from "./pages/SettingsPage";
import EbayAuth from "./pages/EbayAuth";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import { syncWorker } from "./lib/syncWorker";
import { ebayClient } from "./lib/ebay/client";
import { useStore } from "./store/useStore";

const queryClient = new QueryClient();

const App = () => {
  const loadData = useStore((state) => state.loadData);

  useEffect(() => {
    // Load data from Supabase on startup
    loadData();

    // Start sync worker if eBay is connected
    if (ebayClient.isConnected()) {
      syncWorker.start();
    }

    return () => {
      syncWorker.stop();
    };
  }, [loadData]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/auth/ebay/callback" element={<EbayAuth />} />
              <Route path="/*" element={
                <ProtectedRoute>
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
                </ProtectedRoute>
              } />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
