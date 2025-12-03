import { useState, useEffect } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import Settings from "@/pages/settings";
import AddOrder from "@/pages/add-order";
import History from "@/pages/history";
import Earnings from "@/pages/earnings";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  return (
    <Switch>
      {!isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/settings" component={Settings} />
          <Route path="/add-order" component={AddOrder} />
          <Route path="/history" component={History} />
          <Route path="/earnings" component={Earnings} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    const splashEl = document.getElementById("splash-screen");
    
    const hideSplash = () => {
      if (splashEl) {
        splashEl.classList.add("hidden");
        setTimeout(() => {
          splashEl.remove();
        }, 500);
      }
      setAppReady(true);
    };

    const timer = setTimeout(hideSplash, 2800);

    return () => clearTimeout(timer);
  }, []);

  return appReady ? <Router /> : null;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <AppContent />
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
