
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { DataProvider } from "@/context/DataContext";
import Layout from "@/components/Layout";
import LoginPage from "@/pages/LoginPage";
import Dashboard from "@/pages/Dashboard";
import KanbanBoard from "@/pages/KanbanBoard";
import Leads from "@/pages/Leads";
import Profile from "@/pages/Profile";
import Users from "@/pages/Users";
import WhatsAppConfig from "@/pages/WhatsAppConfig";
import ChatPage from "@/pages/ChatPage";
import ChatLogs from "@/pages/ChatLogs";
import NotFound from "@/pages/NotFound";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "@/pages/Index";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <DataProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/" element={<Index />} />
              
              <Route path="/" element={
                <ProtectedRoute>
                  <Layout>
                    <Outlet />
                  </Layout>
                </ProtectedRoute>
              }>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/kanban" element={<KanbanBoard />} />
                <Route path="/leads" element={<Leads />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/users" element={<Users />} />
                <Route path="/whatsapp-config" element={<WhatsAppConfig />} />
                <Route path="/chat/:leadId" element={<ChatPage />} />
                <Route path="/chat-logs" element={<ChatLogs />} />
              </Route>
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </DataProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
