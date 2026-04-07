import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Landing from "./pages/Landing.tsx";
import Index from "./pages/Index.tsx";
import Approvals from "./pages/Approvals.tsx";
import Businesses from "./pages/Businesses.tsx";
import Influencers from "./pages/Influencers.tsx";
import Campaigns from "./pages/Campaigns.tsx";
import Meetings from "./pages/Meetings.tsx";
import Messages from "./pages/Messages.tsx";
import Analytics from "./pages/Analytics.tsx";
import Security from "./pages/Security.tsx";
import Settings from "./pages/Settings.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LanguageProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/dashboard" element={<ProtectedRoute><Index /></ProtectedRoute>} />
              <Route path="/approvals" element={<ProtectedRoute><Approvals /></ProtectedRoute>} />
              <Route path="/businesses" element={<ProtectedRoute><Businesses /></ProtectedRoute>} />
              <Route path="/influencers" element={<ProtectedRoute><Influencers /></ProtectedRoute>} />
              <Route path="/campaigns" element={<ProtectedRoute><Campaigns /></ProtectedRoute>} />
              <Route path="/meetings" element={<ProtectedRoute><Meetings /></ProtectedRoute>} />
              <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
              <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
              <Route path="/security" element={<ProtectedRoute><Security /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
