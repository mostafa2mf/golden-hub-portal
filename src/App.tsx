import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Landing from "./pages/Landing.tsx";
import Index from "./pages/Index.tsx";
import Approvals from "./pages/Approvals.tsx";
import Businesses from "./pages/Businesses.tsx";
import Influencers from "./pages/Influencers.tsx";
import Campaigns from "./pages/Campaigns.tsx";
import Meetings from "./pages/Meetings.tsx";
import Messages from "./pages/Messages.tsx";
import Analytics from "./pages/Analytics.tsx";
import Staff from "./pages/Staff.tsx";
import Security from "./pages/Security.tsx";
import Settings from "./pages/Settings.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LanguageProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/dashboard" element={<Index />} />
            <Route path="/approvals" element={<Approvals />} />
            <Route path="/businesses" element={<Businesses />} />
            <Route path="/influencers" element={<Influencers />} />
            <Route path="/campaigns" element={<Campaigns />} />
            <Route path="/meetings" element={<Meetings />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/staff" element={<Staff />} />
            <Route path="/security" element={<Security />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
