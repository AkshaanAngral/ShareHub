import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import { Suspense, lazy } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { ChatProvider } from "@/contexts/ChatContext";
import { ToolProvider } from "@/contexts/ToolContext";
import { SocketProvider } from "@/contexts/SocketContext";
import { NotificationsProvider } from "@/contexts/NotificationsContext";
import PrivateRoute from "./components/PrivateRoute";
import Bookings from "./pages/Bookings";

// Lazy loading the page components
const Index = lazy(() => import("./pages/Index"));
const Tools = lazy(() => import("./pages/Tools"));
const AddTool = lazy(() => import("./pages/AddTool"));
const ToolDetail = lazy(() => import("./pages/ToolDetail"));
const HowItWorks = lazy(() => import("./pages/HowItWorks"));
const About = lazy(() => import("./pages/About"));
const Cart = lazy(() => import("./pages/Cart"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Chat = lazy(() => import("./pages/Chat"));
const AdminPanel = lazy(() => import("./pages/AdminPanel"));
const NotFound = lazy(() => import("./pages/NotFound"));
const SignIn = lazy(() => import("./pages/SignIn"));
const Register = lazy(() => import("./pages/Register"));
const LoadingPage = lazy(() => import("./pages/LoadingPage"));
const Notifications = lazy(() => import("./pages/Notifications")); // Make sure this exists!

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <SocketProvider>
            <NotificationsProvider>
              <CartProvider>
                <ToolProvider>
                  <ChatProvider>
                    <Toaster />
                    <Sonner />
                    <Suspense fallback={<LoadingSpinner />}>
                      <AppContent />
                    </Suspense>
                  </ChatProvider>
                </ToolProvider>
              </CartProvider>
            </NotificationsProvider>
          </SocketProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

const AppContent = () => {
  const { isLoggedIn } = useAuth();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/welcome" element={<LoadingPage />} />
          <Route path="/" element={<Index />} />
          <Route path="/tools" element={<Tools />} />
          <Route path="/tools/add" element={<AddTool />} />
          <Route path="/tools/:toolId" element={<ToolDetail />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/about" element={<About />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/dashboard" element={
            <PrivateRoute>
              <Dashboard userEmail={undefined} />
            </PrivateRoute>
          } />
          <Route path="/chat" element={
            <PrivateRoute>
              <Chat />
            </PrivateRoute>
          } />
          <Route path="/notifications" element={
            <PrivateRoute>
              <Notifications />
            </PrivateRoute>
          } />
          <Route path="/signin" element={
            isLoggedIn ? <Navigate to="/" /> : <SignIn />} />
          <Route path="/register" element={
            isLoggedIn ? <Navigate to="/" /> : <Register />} />
          <Route path="/admin" element={
            <PrivateRoute requireAdmin={true}>
              <AdminPanel />
            </PrivateRoute>
          } />
           <Route path="/bookings" element={
                          <PrivateRoute>
                            <Bookings />
                          </PrivateRoute>
                        } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
};

const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-screen">
    <div className="w-16 h-16 border-4 border-blue-500 border-solid border-t-transparent rounded-full animate-spin"></div>
  </div>
);

export default App;
