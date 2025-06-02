import React from "react";
import { useAuth } from "./AuthContext";
import { Navigate, useLocation } from "react-router-dom";
import { CircularProgress, Box } from "@mui/material";

const AlreadyAuthRedirect: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        // Still checking login state, show spinner
        return (
            <Box display="flex" justifyContent="center" mt={6}>
                <CircularProgress />
            </Box>
        );
    }

    if (user) {
        // Already logged in, redirect to home
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    return <>{children}</>;
};

export default AlreadyAuthRedirect;
