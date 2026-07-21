import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/hooks/use-language";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import LoginPage from "@/pages/login";
import NotFound from "@/pages/not-found";

import Layout from "@/components/layout";
import Overview from "@/pages/overview";
import Leaderboard from "@/pages/leaderboard";
import Lfg from "@/pages/lfg";
import Tournaments from "@/pages/tournaments";
import Shop from "@/pages/shop";
import Events from "@/pages/events";
import Warnings from "@/pages/warnings";
import AutoResponses from "@/pages/autoresponses";
import Announce from "@/pages/announce";
import Daily from "@/pages/daily";
import Tickets from "@/pages/tickets";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }
  if (!session) return <Redirect to="/login" />;
  return <>{children}</>;
}

function AppRoutes() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/login">
        {session ? <Redirect to="/" /> : <LoginPage />}
      </Route>
      <Route>
        <ProtectedRoute>
          <Layout>
            <Switch>
              <Route path="/" component={Overview} />
              <Route path="/leaderboard" component={Leaderboard} />
              <Route path="/lfg" component={Lfg} />
              <Route path="/tournaments" component={Tournaments} />
              <Route path="/shop" component={Shop} />
              <Route path="/events" component={Events} />
              <Route path="/warnings" component={Warnings} />
              <Route path="/autoresponses" component={AutoResponses} />
              <Route path="/announce" component={Announce} />
              <Route path="/daily" component={Daily} />
              <Route path="/tickets" component={Tickets} />
              <Route component={NotFound} />
            </Switch>
          </Layout>
        </ProtectedRoute>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <LanguageProvider>
          <AuthProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <AppRoutes />
            </WouterRouter>
            <Toaster />
          </AuthProvider>
        </LanguageProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
