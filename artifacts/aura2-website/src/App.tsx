import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Ranking from "@/pages/Ranking";
import Download from "@/pages/Download";
import Wiki from "@/pages/Wiki";
import Conta from "@/pages/Conta";
import MainLayout from "@/components/layout/MainLayout";
import TermsOfUse from "@/pages/termos-de-uso";
import PrivacyPolicy from "@/pages/politicas-de-privacidade";
import ResetPassword from "@/pages/ResetPassword";
import Loja from "@/pages/Loja";
import Admin from "@/pages/Admin";
import Parceiros from "@/pages/Parceiros";
import ComeceAJogar from "@/pages/ComeceAJogar";

const queryClient = new QueryClient();

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [location]);
  return null;
}

function Router() {
  return (
    <MainLayout>
      <ScrollToTop />
      <Switch>
        <Route path="/ranking" component={Ranking} />
        <Route path="/download" component={Download} />
        <Route path="/wiki" component={Wiki} />
        <Route path="/conta" component={Conta} />
        <Route path="/termos-de-uso" component={TermsOfUse} />
        <Route path="/politicas-de-privacidade" component={PrivacyPolicy} />
        <Route path="/redefinir-senha" component={ResetPassword} />
        <Route path="/loja" component={Loja} />
        <Route path="/admin" component={Admin} />
        <Route path="/parceiros" component={Parceiros} />
        <Route path="/comece-a-jogar" component={ComeceAJogar} />
        <Route path="/" component={Home} />
        <Route>
          <NotFound />
        </Route>
      </Switch>
    </MainLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
