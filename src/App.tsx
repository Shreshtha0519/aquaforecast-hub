import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { RegionProvider } from "@/contexts/RegionContext";

import Login from "@/pages/Login";
import MainLayout from "@/components/MainLayout";
import Dashboard from "@/pages/Dashboard";
import Prediction from "@/pages/Prediction";
import Scenario from "@/pages/Scenario";
import DataUpload from "@/pages/DataUpload";
import AskAI from "@/pages/AskAI";
import Performance from "@/pages/Performance";
import Comparison from "@/pages/Comparison";
import Help from "@/pages/Help";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <Routes>
      <Route 
        path="/" 
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} 
      />
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/prediction" element={<Prediction />} />
        <Route path="/scenario" element={<Scenario />} />
        <Route path="/data" element={<DataUpload />} />
        <Route path="/ask-ai" element={<AskAI />} />
        <Route path="/performance" element={<Performance />} />
        <Route path="/comparison" element={<Comparison />} />
        <Route path="/help" element={<Help />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <RegionProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </RegionProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
