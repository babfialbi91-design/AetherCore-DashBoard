import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/hooks/use-language";
import { AuthProvider } from "@/hooks/use-auth";
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
import Economy from "@/pages/economy";
import Purchases from "@/pages/purchases";
import Welcome from "@/pages/welcome";
import Logs from "@/pages/logs";
import Levels from "@/pages/levels";
import Notifications from "@/pages/notifications";
import AutoRules from "@/pages/autorules";
import BadWords from "@/pages/badwords";
import EmbedBuilder from "@/pages/embedbuilder";

const queryClient = new QueryClient();

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Overview} />
        <Route path="/leaderboard" component={Leaderboard} />
        <Route path="/lfg" component={Lfg} />
        <Route path="/tournaments" component={Tournaments} />
        <Route path="/shop" component={Shop} />
        <Route path="/events" component={Events} />
        <Route path="/daily" component={Daily} />
        <Route path="/economy" component={Economy} />
        <Route path="/purchases" component={Purchases} />
        <Route path="/tickets" component={Tickets} />
        <Route path="/welcome" component={Welcome} />
        <Route path="/logs" component={Logs} />
        <Route path="/levels" component={Levels} />
        <Route path="/notifications" component={Notifications} />
        <Route path="/autorules" component={AutoRules} />
        <Route path="/badwords" component={BadWords} />
        <Route path="/warnings" component={Warnings} />
        <Route path="/autoresponses" component={AutoResponses} />
        <Route path="/announce" component={Announce} />
        <Route path="/embedbuilder" component={EmbedBuilder} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <LanguageProvider>
          <AuthProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Router />
            </WouterRouter>
            <Toaster />
          </AuthProvider>
        </LanguageProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
