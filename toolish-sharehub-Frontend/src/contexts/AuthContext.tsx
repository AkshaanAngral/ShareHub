import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface AuthContextType {
  isLoggedIn: boolean;
  isAdmin: boolean;
  userEmail: string | null;
  user: {
    email: string;
    isAdmin: boolean;
    role: string;
    name: string;
    id: string; // Added id property
  } | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  toggleAdmin: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  isAdmin: false,
  userEmail: null,
  user: {
    email: "",
    isAdmin: false,
    role: "",
    name: "",
    id: "", // Default value for id
  },
  login: async () => false,
  logout: async () => {},
  toggleAdmin: () => {},
});

// Helper function to decode JWT token
const decodeJwt = (token: string) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Error decoding JWT:", error);
    return null;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [user, setUser] = useState<AuthContextType["user"]>(null);

  const navigate = useNavigate(); // Use useNavigate

  const loadAuthDataFromToken = useCallback((token: string | null) => {
    if (token) {
      const decodedToken = decodeJwt(token);

      if (decodedToken) {
        setIsLoggedIn(true);
        setUser({
          email: decodedToken.email,
          isAdmin: decodedToken.isAdmin,
          role: decodedToken.role,
          name: decodedToken.name,
          id: decodedToken._id || decodedToken.id, // Get id from token (MongoDB uses _id)
        });
        setUserEmail(decodedToken.email);
        setIsAdmin(decodedToken.isAdmin || false);
        localStorage.setItem("token", token);
        localStorage.setItem("isAdmin", String(decodedToken.isAdmin)); // Store as string
      } else {
        localStorage.removeItem("token");
        localStorage.removeItem("userEmail");
        localStorage.removeItem("isAdmin");
        setUser(null);
      }
    } else {
      setIsLoggedIn(false);
      setUserEmail(null);
      setIsAdmin(false);
      localStorage.removeItem("token");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("isAdmin");
      setUser(null);
    }
  }, []);

  useEffect(() => {
    // Check for token in URL
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (token) {
      loadAuthDataFromToken(token);
      navigate("/", { replace: true }); // Clean URL
    } else {
      // Load from local storage on app mount
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        loadAuthDataFromToken(storedToken);
      }
    }
  }, [loadAuthDataFromToken, navigate]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        let errorMessage = "Login failed. Please check your credentials.";

        if (errorData.message === "Incorrect password") {
          errorMessage = "Invalid credentials";
        } else if (errorData.message === "User not found") {
          errorMessage = "User not found";
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }

        toast.error(errorMessage);
        return false;
      }

      const data = await response.json();
      loadAuthDataFromToken(data.token);

      toast.success("Signed in successfully!");
      return true;
    } catch (error) {
      toast.error("Login failed. Please try again.");
      return false;
    }
  };

  const logout = useCallback(async (): Promise<void> => {
    try {
      // Await the fetch call to ensure it completes before updating the state
      await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/logout`, {
        method: "GET",
        credentials: "include",
      });
    } catch (err) {
      console.warn("OAuth logout failed or not needed.");
    }

    setIsLoggedIn(false);
    setIsAdmin(false);
    setUserEmail(null);
    localStorage.clear();
    setUser(null);
    toast.success("Signed out successfully!");
  }, [setIsLoggedIn, setIsAdmin, setUserEmail, toast]);

  const toggleAdmin = () => {
    setIsAdmin((prev) => {
      const newVal = !prev;
      localStorage.setItem("isAdmin", newVal.toString());
      return newVal;
    });
  };

  const contextValue: AuthContextType = {
    isLoggedIn,
    isAdmin,
    userEmail,
    user,
    login,
    logout,
    toggleAdmin,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
