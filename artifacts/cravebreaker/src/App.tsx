import { type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import { AppStateProvider, useApp } from '@/lib/app-state';
import { Shell } from '@/components/Shell';
import Onboarding from '@/pages/onboarding';
import HomePage from '@/pages/home';
import BreathePage from '@/pages/breathe';
import SupportPage from '@/pages/support';
import PatchPage from '@/pages/patch';
import ChatPage from '@/pages/chat';

const queryClient = new QueryClient();

function Router() {
  const { profile } = useApp();
  if (!profile) return <Onboarding />;
  return (
    <Shell>
      <RoutedErrorBoundary>
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/breathe" component={BreathePage} />
          <Route path="/support" component={SupportPage} />
          <Route path="/patch" component={PatchPage} />
          <Route path="/chat" component={ChatPage} />
          <Route component={NotFound} />
        </Switch>
      </RoutedErrorBoundary>
    </Shell>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <AppStateProvider>
            <Router />
          </AppStateProvider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
