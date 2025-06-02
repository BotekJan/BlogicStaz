import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import TopBar from "./components/TopBar";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import UserPage from "./pages/UserPage";
import ContractsPage from "./pages/ContractsPage";
import ContractDetailPage from "./pages/ContractDetailPage";
import UsersPage from "./pages/UsersPage";

// MUI Theme imports
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "./theme";

import RequireAuth from "./auth/RequireAuth"; // <-- import your auth guard
import ContractsManagementPage from "./pages/ContractsManagmentPage";
import AlreadyAuthRedirect from "./auth/AlreadyAuthRedirect";

function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <AuthProvider>
                <BrowserRouter>
                    <TopBar />
                    <Routes>
                        {/* Public routes */}
                        <Route
                            path="/login"
                            element={
                                <AlreadyAuthRedirect>
                                    <LoginPage />
                                </AlreadyAuthRedirect>
                            }
                        />
                        <Route
                            path="/register"
                            element={
                                <AlreadyAuthRedirect>
                                    <RegisterPage />
                                </AlreadyAuthRedirect>
                            }
                        />

                        {/* Protected routes */}
                        <Route
                            path="/"
                            element={
                                <RequireAuth>
                                    <ContractsPage />
                                </RequireAuth>
                            }
                        />
                        <Route
                            path="/contracts"
                            element={
                                <RequireAuth>
                                    <ContractsPage />
                                </RequireAuth>
                            }
                        />
                        <Route
                            path="/contracts/:id"
                            element={
                                <RequireAuth>
                                    <ContractDetailPage />
                                </RequireAuth>
                            }
                        />
                        <Route
                            path="/users"
                            element={
                                <RequireAuth>
                                    <UsersPage />
                                </RequireAuth>
                            }
                        />
                        <Route
                            path="/user/:id"
                            element={
                                <RequireAuth>
                                    <UserPage />
                                </RequireAuth>
                            }
                        />
                        <Route
                            path="/contracts-management"
                            element={
                                <RequireAuth>
                                    <ContractsManagementPage />
                                </RequireAuth>
                            }
                        />
                    </Routes>
                </BrowserRouter>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
