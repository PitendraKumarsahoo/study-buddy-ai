import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import StudyAssistant from "./pages/StudyAssistant";
import Chatbot from "./pages/Chatbot";
import ResumeGenerator from "./pages/ResumeGenerator";
import VoiceNotes from "./pages/VoiceNotes";
import NewsChecker from "./pages/NewsChecker";
import Recommendations from "./pages/Recommendations";
import ConversationHistory from "./pages/ConversationHistory";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Navbar />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/study" element={<StudyAssistant />} />
            <Route path="/chat" element={<Chatbot />} />
            <Route path="/resume" element={<ResumeGenerator />} />
            <Route path="/voice-notes" element={<VoiceNotes />} />
            <Route path="/news-check" element={<NewsChecker />} />
            <Route path="/recommendations" element={<Recommendations />} />
            <Route path="/history" element={<ConversationHistory />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
