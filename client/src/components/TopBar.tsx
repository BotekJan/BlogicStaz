import React, { useState } from "react";
import {
    AppBar, Toolbar, Typography, Button, Box, IconButton, Menu, MenuItem, useTheme, useMediaQuery
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useAuth } from "../auth/AuthContext";
import { Link as RouterLink, useNavigate } from "react-router-dom";

const TopBar: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const isAdmin = user?.roles?.includes("admin");

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = async () => {
        await logout();
        navigate("/login");
        handleMenuClose();
    };

    // Menu items (for mobile)
    const navLinks = [
        { label: "Smlouvy", to: "/contracts", show: !!user },
        { label: "Správa smluv", to: "/contracts-management", show: isAdmin },
        { label: "Uživatelé", to: "/users", show: isAdmin }
    ];

    const authLinks = !user
        ? [
            { label: "Přihlásit se", to: "/login" },
            { label: "Registrovat", to: "/register" }
        ]
        : [
            { label: `${user.jmeno} ${user.prijmeni}`, to: `/user/${user.id}` },
            { label: "Odhlásit se", action: handleLogout }
        ];

    return (
        <AppBar position="static">
            <Toolbar
                sx={{
                    justifyContent: "space-between",
                    alignItems: "center",
                    px: { xs: 1, sm: 2 },
                    minHeight: { xs: 56, sm: 64 }
                }}
            >
                {/* Left: Logo */}
                <Box sx={{ display: "flex", alignItems: "center", flex: "1 0 auto" }}>
                    <Typography
                        variant="h6"
                        component={RouterLink}
                        to="/"
                        sx={{
                            color: "inherit",
                            textDecoration: "none",
                            fontWeight: 500,
                            letterSpacing: 1,
                            mr: 2,
                        }}
                    >
                        BLOGIC CRM
                    </Typography>
                    {!isMobile && user && (
                        <>
                            <Button color="inherit" component={RouterLink} to="/contracts">
                                Smlouvy
                            </Button>
                            {isAdmin && (
                                <>
                                    <Button color="inherit" component={RouterLink} to="/contracts-management">
                                        Správa smluv
                                    </Button>
                                    <Button color="inherit" component={RouterLink} to="/users">
                                        Uživatelé
                                    </Button>
                                </>
                            )}
                        </>
                    )}
                </Box>
                {/* Right: Auth/Hamburger */}
                <Box sx={{ display: "flex", alignItems: "center", flex: "0 0 auto" }}>
                    {isMobile ? (
                        <>
                            <IconButton
                                color="inherit"
                                edge="end"
                                onClick={handleMenuOpen}
                                aria-label="menu"
                            >
                                <MenuIcon />
                            </IconButton>
                            <Menu
                                anchorEl={anchorEl}
                                open={Boolean(anchorEl)}
                                onClose={handleMenuClose}
                            >
                                {navLinks.filter(l => l.show).map((link) => (
                                    <MenuItem
                                        key={link.to}
                                        component={RouterLink}
                                        to={link.to}
                                        onClick={handleMenuClose}
                                    >
                                        {link.label}
                                    </MenuItem>
                                ))}
                                {authLinks.map((link, i) =>
                                    link.action ? (
                                        <MenuItem key={i} onClick={link.action}>{link.label}</MenuItem>
                                    ) : (
                                        <MenuItem
                                            key={link.to}
                                            component={RouterLink}
                                            to={link.to!}
                                            onClick={handleMenuClose}
                                        >
                                            {link.label}
                                        </MenuItem>
                                    )
                                )}
                            </Menu>
                        </>
                    ) : !user ? (
                        <>
                            <Button color="inherit" component={RouterLink} to="/login">
                                Přihlásit se
                            </Button>
                            <Button color="inherit" component={RouterLink} to="/register">
                                Registrovat
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button color="inherit" component={RouterLink} to={`/user/${user.id}`}>
                                {user.jmeno} {user.prijmeni}
                            </Button>
                            <Button color="inherit" onClick={handleLogout}>
                                Odhlásit se
                            </Button>
                        </>
                    )}
                </Box>
            </Toolbar>

        </AppBar>
    );
};

export default TopBar;
