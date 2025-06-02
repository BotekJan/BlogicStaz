import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "../api/authService";
import * as authService from "../api/authService";

interface AuthContextType {
    user: User | null;
    setUser: (user: User | null) => void;
    logout: () => Promise<void>;
    reloadUser: () => Promise<void>;
    loading: boolean; // <-- Added!
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    setUser: () => { },
    logout: async () => { },
    reloadUser: async () => { },
    loading: false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Call /me to check current login state (runs on mount)
    const reloadUser = async () => {
        setLoading(true);
        try {
            const user = await authService.getMe(); // Assumes this returns the current user or throws
            setUser(user);
        } catch {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        reloadUser();
        // eslint-disable-next-line
    }, []);

    const logout = async () => {
        await authService.logout();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, setUser, logout, reloadUser, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
