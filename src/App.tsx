import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { Suspense, lazy } from 'react';
import { MainLayout } from "./components/layout/MainLayout";
import { ScrollToTop } from "./components/utils/ScrollToTop";

const queryClient = new QueryClient();

const Index = lazy(() => import('./pages/Index'));
const Auth = lazy(() => import('./pages/Auth'));
const Admin = lazy(() => import('./pages/Admin'));
const NotFound = lazy(() => import('./pages/NotFound'));
const CategoryPage = lazy(() => import('./pages/CategoryPage'));
const ArticlePage = lazy(() => import('./pages/ArticlePage'));
const StatePage = lazy(() => import('./pages/StatePage'));
const VideoPage = lazy(() => import('./pages/VideoPage'));
const SearchResults = lazy(() => import('./pages/SearchResults'));
const LivePage = lazy(() => import('./pages/LivePage'));
const LiveStreamPage = lazy(() => import('./pages/LiveStreamPage'));
const AboutUsPage = lazy(() => import('./pages/AboutUsPage'));
const SupportUsPage = lazy(() => import('./pages/SupportUsPage'));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'));
const ShortUrlRedirect = lazy(() => import('./pages/ShortUrlRedirect'));
const ContactUsPage = lazy(() => import('./pages/ContactUsPage'));

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
              <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="h-12 w-12 animate-spin rounded-full border-4 border-red-600 border-t-transparent" /></div>}>
                <Routes>
                  <Route path="/" element={<MainLayout><Index /></MainLayout>} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/category/:slug" element={<MainLayout><CategoryPage /></MainLayout>} />
                  <Route path="/article/:slug" element={<MainLayout><ArticlePage /></MainLayout>} />
                  <Route path="/article/id/:id" element={<MainLayout><ArticlePage /></MainLayout>} />
                  <Route path="/state/:slug" element={<MainLayout><StatePage /></MainLayout>} />
                  <Route path="/video/:id" element={<MainLayout><VideoPage /></MainLayout>} />
                  <Route path="/search" element={<MainLayout><SearchResults /></MainLayout>} />
                  <Route path="/videos" element={<MainLayout><VideoPage /></MainLayout>} />
                  <Route path="/live" element={<MainLayout><LivePage /></MainLayout>} />
                  <Route path="/live/:id" element={<MainLayout><LiveStreamPage /></MainLayout>} />
                  <Route path="/about-us" element={<MainLayout><AboutUsPage /></MainLayout>} />
                  <Route path="/support-us" element={<MainLayout><SupportUsPage /></MainLayout>} />
                  <Route path="/privacy-policy" element={<MainLayout><PrivacyPolicyPage /></MainLayout>} />
                  <Route path="/:shortId" element={<ShortUrlRedirect />} />
                  <Route path="/contact-us" element={<MainLayout><ContactUsPage /></MainLayout>} />
                  <Route path="*" element={<MainLayout><NotFound /></MainLayout>} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
