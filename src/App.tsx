import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Router, Route, Switch, Redirect } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import ErrorBoundary from "@/components/ErrorBoundary";
import { ThemeProvider } from "@/contexts/ThemeContext";

import Overview from "@/pages/Overview";
import Reddit from "@/pages/Reddit";
import Twitter from "@/pages/Twitter";
import ChannelPlaceholder from "@/pages/ChannelPlaceholder";

function AppRouter() {
  return (
    <Router hook={useHashLocation}>
      <Switch>
        <Route path="/">
          <Redirect to="/overview/dashboard" />
        </Route>

        <Route path="/overview/dashboard" component={Overview} />

        <Route path="/channels/reddit" component={Reddit} />
        <Route path="/channels/twitter" component={Twitter} />
        <Route path="/channels/:channel">
          {(params) => <ChannelPlaceholder channel={params.channel} />}
        </Route>

        <Route>
          <Redirect to="/overview/dashboard" />
        </Route>
      </Switch>
    </Router>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <AppRouter />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
