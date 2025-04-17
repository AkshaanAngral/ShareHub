import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import { Suspense, lazy } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { SocketProvider } from "@/contexts/SocketContext";
import { ChatProvider } from "@/contexts/ChatContext";
import { ToolProvider } from "@/contexts/ToolContext";
import PrivateRoute from "./components/PrivateRoute";

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

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <CartProvider>
            <SocketProvider>
              <ToolProvider>
                <ChatProvider>
                  <Toaster />
                  <Sonner />
                  <AppContent /> {/* Now this is where useAuth() is safely used */}
                </ChatProvider>
              </ToolProvider>
            </SocketProvider>
          </CartProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

const AppContent = () => {
  const { isLoggedIn } = useAuth(); // ✅ Safe inside AuthProvider

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Suspense fallback={<LoadingSpinner />}>
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
                <Dashboard />
              </PrivateRoute>
            } />
            <Route path="/chat" element={
              <PrivateRoute>
                <Chat />
              </PrivateRoute>
            } />
            <Route path="/signin" element={
              isLoggedIn ? <Navigate to="/" /> : <SignIn />
            } />
            <Route path="/register" element={
              isLoggedIn ? <Navigate to="/" /> : <Register />
            } />
            <Route path="/admin" element={
              <PrivateRoute requireAdmin={true}>
                <AdminPanel />
              </PrivateRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
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
