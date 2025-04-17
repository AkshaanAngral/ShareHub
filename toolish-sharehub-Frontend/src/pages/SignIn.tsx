import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, AlertCircle, ArrowLeft } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "../contexts/AuthContext";

const SignIn = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  const from = (location.state as any)?.from?.pathname || "/";

  // 👇 Add this to detect Google redirect and auto-navigate
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const googleEmail = params.get("googleUser");

    if (googleEmail) {
      console.log("✅ Google user signed in:", googleEmail);
      navigate(from, { replace: true });
    }
  }, []);

  const validateForm = () => {
    const newErrors = { email: "", password: "" };
    let isValid = true;

    if (!email) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid";
      isValid = false;
    }

    if (!password) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");

    if (validateForm()) {
      setIsLoading(true);
      try {
        const success = await login(email, password);
        if (success) {
          navigate(from, { replace: true });
        } else {
          setAuthError("Invalid email or password. Please try again.");
        }
      } catch (error) {
        setAuthError("An error occurred during sign in. Please try again.");
        console.error("Sign in error:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleGoogleSignIn = () => {
    window.location.href = `${
      import.meta.env.VITE_API_BASE_URL
    }/api/auth/google`;
  };

  const GoogleIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      width="24px"
      height="24px"
      className="mr-2 h-4 w-4"
    >
      <path fill="#EA4335" d="M24 9.5c3.1 0 5.8 1.1 7.9 2.9l5.9-5.9C33.6 3.2 28.1 1 24 1 14.6 1 6.8 6.7 3.4 14l7 5.4C11.8 12.2 17.4 9.5 24 9.5z" />
      <path fill="#34A853" d="M46.5 24c0-1.6-.2-3-.6-4.4H24v8h12c-.5 2-1.8 4-3.7 5L40 37c3-2.8 4.7-7 4.7-13z" />
      <path fill="#FBBC05" d="M10.4 28c-.3-1-.4-2-.4-3s0-2 .4-3L3.4 14C1.2 18 .5 21 .5 24s1 .6-.2z" />
      <path fill="#4285F4" d="M24,46c6,0,10,-2,13,-5l-6,-6c-1,1,-3,2,-7,2,-6,0,-11,-4,-13,-10l-7,5c4,8,12,14,20,14z" />
    </svg>
  );

  return (
    <div className="container max-w-md mx-auto py-10">
      <Button
        variant="ghost"
        className="mb-4 flex items-center gap-1"
        onClick={() => navigate("/")}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to welcome page
      </Button>

      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-semibold text-center">
            Sign in
          </CardTitle>
          <CardDescription className="text-center">
            Enter your email and password to sign in to your account
          </CardDescription>
        </CardHeader>

        <CardContent>
          {authError && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" /> {authError}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    className={`pl-10 ${
                      errors.email ? "border-destructive" : ""
                    }`}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                {errors.email && (
                  <p className="text-destructive text-sm flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" /> {errors.email}
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    to="/forgot-password"
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    className={`pl-10 ${
                      errors.password ? "border-destructive" : ""
                    }`}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                {errors.password && (
                  <p className="text-destructive text-sm flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" /> {errors.password}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </div>
          </form>

          <Button
            className="w-full mt-4"
            variant="outline"
            onClick={handleGoogleSignIn}
          >
            <GoogleIcon />
            Sign In with Google
          </Button>

        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center text-muted-foreground">
            Don’t have an account?{" "}
            <Link to="/register" className="text-primary hover:underline">
              Register
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SignIn;