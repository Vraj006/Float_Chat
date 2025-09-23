import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./lib/auth-context";
import OceanLaunch from "./pages/OceanLaunch";
import Landing from "./pages/Landing";
import DataVisualization from "./pages/DataVisualization";
import AIChatbot from "./pages/AIChatbot";
import OceanExplorer from "./pages/OceanExplorer";
import OceanMapSimple from "./pages/OceanMapSimple";
import TestSupabase from "./pages/TestSupabase";
import DataInspection from "./pages/DataInspection";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import { AnimatePresence } from "framer-motion";
import "./App.css";

const queryClient = new QueryClient();

// ProtectedRoute component to handle authentication
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background/95 to-background/90">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

// AnimatedRoutes component to handle transitions
const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public routes */}
        <Route path="/" element={<OceanLaunch />} />
        <Route path="/home" element={<Landing />} />
        <Route path="/auth" element={<Auth />} />

        {/* Protected routes - require authentication */}
        <Route path="/data-viz" element={
          <ProtectedRoute>
            <DataVisualization />
          </ProtectedRoute>
        } />
        <Route path="/ai-chat" element={
          <ProtectedRoute>
            <AIChatbot />
          </ProtectedRoute>
        } />
        <Route path="/ocean-explorer" element={
          <ProtectedRoute>
            <OceanExplorer />
          </ProtectedRoute>
        } />
        <Route path="/ocean-map" element={
          <ProtectedRoute>
            <OceanMapSimple />
          </ProtectedRoute>
        } />
        <Route path="/test-supabase" element={
          <ProtectedRoute>
            <TestSupabase />
          </ProtectedRoute>
        } />
        <Route path="/data-inspection" element={
          <ProtectedRoute>
            <DataInspection />
          </ProtectedRoute>
        } />

        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AnimatedRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
