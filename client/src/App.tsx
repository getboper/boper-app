import { Switch, Route, useLocation, Router as WouterRouter } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import Sidebar from "@/components/ui/sidebar";
import MobileNav from "@/components/ui/mobile-nav";
import Dashboard from "@/pages/dashboard";
import Jobs from "@/pages/jobs";
import Clients from "@/pages/clients";
import Invoices from "@/pages/invoices";
import Reports from "@/pages/reports";
import Settings from "@/pages/settings";
import Checkout from "@/pages/checkout";
import Subscribe from "@/pages/subscribe";
import PaymentSuccess from "@/pages/payment-success";
import LandingPage from "@/pages/landing";
import ComingSoon from "@/pages/coming-soon";
import NotFound from "@/pages/not-found";
import Calendar from "@/pages/calendar";
import { useState, useEffect } from "react";
import { useMobile } from "@/hooks/use-mobile";
import SubscriptionGuard from "@/components/ui/subscription-guard";
import TrialBanner from "@/components/ui/trial-banner";

// App Layout for pages that require the dashboard layout
function AppLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  const isMobile = useMobile();
  const [, setLocation] = useLocation();

  // Close mobile menu when navigating
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [setLocation]);

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Mobile Header */}
      {isMobile && (
        <div className="md:hidden bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-md flex items-center justify-center text-white font-bold">
                B
              </div>
              <h1 className="ml-3 text-xl font-bold text-gray-800">Boper</h1>
            </div>
            <button
              className="text-gray-500 hover:text-gray-700"
              onClick={toggleMobileMenu}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Sidebar or Mobile Menu */}
      {isMobile ? (
        <div
          className={`fixed inset-0 bg-gray-800 bg-opacity-50 z-50 transition-opacity ${
            mobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          onClick={toggleMobileMenu}
        >
          <div
            className={`absolute top-0 left-0 w-64 h-full bg-white transition-transform transform ${
              mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <Sidebar onClose={toggleMobileMenu} />
          </div>
        </div>
      ) : (
        <Sidebar />
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
        {children}
      </main>

      {/* Mobile Bottom Nav */}
      {isMobile && <MobileNav />}
    </div>
  );
}

function Router() {
  const [location] = useLocation();
  
  // Paths that should use the main layout with sidebar, etc.
  const appPaths = [
    '/dashboard',
    '/jobs',
    '/calendar',
    '/clients',
    '/invoices',
    '/reports',
    '/settings',
    '/checkout',
    '/subscribe',
    '/payment-success',
    '/coming-soon',
  ];

  // Check if current path should use app layout
  const useAppLayout = appPaths.some(path => location === path || location.startsWith(`${path}/`));
  
  // If the path is empty (root), redirect to dashboard
  useEffect(() => {
    if (location === "/" && sessionStorage.getItem("hasVisitedLanding")) {
      window.location.href = "/dashboard";
    } else if (location === "/") {
      sessionStorage.setItem("hasVisitedLanding", "true");
    }
  }, [location]);

  // If not using app layout, render route directly
  if (!useAppLayout) {
    return (
      <Switch>
        <Route path="/" component={LandingPage} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/jobs" component={Jobs} />
        <Route path="/calendar" component={Calendar} />
        <Route path="/clients" component={Clients} />
        <Route path="/invoices" component={Invoices} />
        <Route path="/reports" component={Reports} />
        <Route path="/settings" component={Settings} />
        <Route path="/checkout" component={Checkout} />
        <Route path="/subscribe" component={Subscribe} />
        <Route path="/payment-success" component={PaymentSuccess} />
        <Route path="/coming-soon" component={ComingSoon} />
        <Route component={NotFound} />
      </Switch>
    );
  }

  // Using app layout with subscription guard
  return (
    <SubscriptionGuard>
      <AppLayout>
        <Switch>
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/jobs" component={Jobs} />
          <Route path="/calendar" component={Calendar} />
          <Route path="/clients" component={Clients} />
          <Route path="/invoices" component={Invoices} />
          <Route path="/reports" component={Reports} />
          <Route path="/settings" component={Settings} />
          <Route path="/checkout" component={Checkout} />
          <Route path="/subscribe" component={Subscribe} />
          <Route path="/payment-success" component={PaymentSuccess} />
          <Route path="/coming-soon" component={ComingSoon} />
          <Route component={NotFound} />
        </Switch>
      </AppLayout>
    </SubscriptionGuard>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
