import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface PrivateRouteProps {
    children: React.ReactNode;
    requireAdmin?: boolean;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, requireAdmin = false }) => {
    const { isLoggedIn, isAdmin } = useAuth();
    const location = useLocation();

    if (!isLoggedIn) {
        // Redirect to signin page if not logged in
        return <Navigate to="/signin" state={{ from: location }} replace />;
    }

    if (requireAdmin && !isAdmin) {
        // Redirect to home page if admin access is required but user is not admin
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};

export default PrivateRoute;
