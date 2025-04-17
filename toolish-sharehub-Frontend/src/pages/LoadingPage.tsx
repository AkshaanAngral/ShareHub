import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Mail, LogIn } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const LoadingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn, isAuthLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");

    if (token) {
      localStorage.setItem("token", token);
      navigate("/", { replace: true });
    } else {
      setIsLoading(false);
    }

    // Simulate initial loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [location, navigate]);

  useEffect(() => {
    if (!isAuthLoading) {
      if (isLoggedIn) {
        navigate("/dashboard");
      } else {
        setIsLoading(false);
      }
    }
  }, [isLoggedIn, isAuthLoading, navigate]);

  const handleEmailLogin = () => {
    navigate("/signin");
  };

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:5000/api/auth/google";
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-background to-secondary/20 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Toolish ShareHub</CardTitle>
          <CardDescription>
            Welcome to the community of tool sharing enthusiasts
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {isLoading || isAuthLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4 mx-auto" />
              <Skeleton className="h-10 w-full mt-4" />
              <Skeleton className="h-10 w-full mt-2" />
            </div>
          ) : (
            <div className="space-y-3 animate-fade-in">
              <p className="text-center text-muted-foreground">
                Choose how you want to continue
              </p>

              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full flex items-center gap-2 h-12"
                  onClick={handleGoogleLogin}
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" className="text-primary">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </Button>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-muted" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-background px-2 text-muted-foreground">Or</span>
                  </div>
                </div>

                <Button
                  className="w-full flex items-center gap-2 h-12"
                  onClick={handleEmailLogin}
                >
                  <Mail className="h-4 w-4" />
                  Continue with Email
                </Button>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="text-center text-sm text-muted-foreground">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </CardFooter>
      </Card>
    </div>
  );
};

export default LoadingPage;
