import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import CategoryPage from "./pages/CategoryPage";
import ArticlePage from './pages/ArticlePage';
import StatePage from './pages/StatePage';
import VideoPage from './pages/VideoPage';
import SearchResults from './pages/SearchResults';
import LivePage from './pages/LivePage';
import LiveStreamPage from './pages/LiveStreamPage';
import { MainLayout } from "./components/layout/MainLayout";
import { ScrollToTop } from "./components/utils/ScrollToTop";
import AboutUsPage from "./pages/AboutUsPage";
import SupportUsPage from "./pages/SupportUsPage";
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import ShortUrlRedirect from './pages/ShortUrlRedirect';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <ScrollToTop />
              <Routes>
                <Route path="/" element={<MainLayout><Index /></MainLayout>} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/category/:slug" element={<MainLayout><CategoryPage /></MainLayout>} />
                <Route path="/article/:slug" element={<MainLayout><ArticlePage /></MainLayout>} />
                <Route path="/article/id/:id" element={<MainLayout><ArticlePage /></MainLayout>} />
                <Route path="/state/:slug" element={<MainLayout><StatePage /></MainLayout>} />
                <Route path="/video/:slug" element={<MainLayout><VideoPage /></MainLayout>} />
                <Route path="/search" element={<MainLayout><SearchResults /></MainLayout>} />
                <Route path="/videos" element={<MainLayout><VideoPage /></MainLayout>} />
                <Route path="/live" element={<MainLayout><LivePage /></MainLayout>} />
                <Route path="/live/:id" element={<MainLayout><LiveStreamPage /></MainLayout>} />
                <Route path="/about-us" element={<MainLayout><AboutUsPage /></MainLayout>} />
                <Route path="/support-us" element={<MainLayout><SupportUsPage /></MainLayout>} />
                <Route path="/privacy-policy" element={<MainLayout><PrivacyPolicyPage /></MainLayout>} />
                <Route path="/:shortId" element={<ShortUrlRedirect />} />
                <Route path="*" element={<MainLayout><NotFound /></MainLayout>} />
              </Routes>
            </BrowserRouter>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
