import { createTheme } from "@mui/material/styles";

const theme = createTheme({
    palette: {
        primary: {
            main: "#b0b0b0",        // Lighter neutral gray
            contrastText: "#222",   // Dark text for better contrast
        },
        secondary: {
            main: "#e0e0e0",        // Even lighter gray for accents
        },
        background: {
            default: "#f9f9f9",     // Very light background
            paper: "#ffffff"        // Card/Sheet background
        },
        text: {
            primary: "#222",        // Nearly black for readability
            secondary: "#555",      // Slightly lighter for secondary text
        },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                containedPrimary: {
                    backgroundColor: "#1976d2 !important",   // Force blue
                    color: "#fff !important",
                    "&:hover": {
                        backgroundColor: "#1565c0 !important",
                    },
                },
                outlinedPrimary: {
                    borderColor: "#1976d2 !important",
                    color: "#1976d2 !important",
                    "&:hover": {
                        borderColor: "#1565c0 !important",
                        color: "#1565c0 !important",
                    },
                },
                textPrimary: {
                    color: "#1976d2 !important",
                }
            },
        }
    }
});

export default theme;
