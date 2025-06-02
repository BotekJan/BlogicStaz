import React from "react";
import { useAuth } from "./AuthContext";
import { Navigate, useLocation } from "react-router-dom";
import { CircularProgress, Box } from "@mui/material";

const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    // Wait until we've checked if the user is logged in
    if (loading) {
        return (
            <Box display="flex" justifyContent="center" mt={6}>
                <CircularProgress />
            </Box>
        );
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <>{children}</>;
};

export default RequireAuth;