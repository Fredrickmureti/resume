
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/components/ui/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import Dashboard from '@/pages/Dashboard';
import Templates from '@/pages/Templates';
import Pricing from '@/pages/Pricing';
import Admin from '@/pages/Admin';
import NotFound from '@/pages/NotFound';
import { ScrollToTop } from '@/components/ScrollToTop';
import Notifications from '@/pages/Notifications';
import { PublicResume } from '@/pages/PublicResume';
import { Branding } from '@/pages/Branding';
import { JobTracker } from '@/pages/JobTracker';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <AuthProvider>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/templates" element={<Templates />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/branding" element={<Branding />} />
            <Route path="/job-tracker" element={<JobTracker />} />
            <Route path="/:username" element={<PublicResume />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
