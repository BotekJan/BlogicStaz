import React, { useState } from "react";
import { TextField, Button, Box, Typography } from "@mui/material";
import { login } from "../api/authService";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";

const LoginPage: React.FC = () => {
    const [form, setForm] = useState({ email: "", heslo: "" });
    const [message, setMessage] = useState("");
    const { setUser } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage("");
        try {
            const user = await login(form); // login returns user info
            setUser(user);
            navigate(`/user/${user.id}`); // redirect to user's profile
        } catch (error: any) {
            setMessage(error.response?.data || "Chyba při přihlášení");
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 400, mx: "auto", mt: 4 }}>
            <Typography variant="h5" gutterBottom>
                Přihlášení
            </Typography>
            <TextField
                fullWidth
                margin="normal"
                label="Email"
                name="email"
                value={form.email}
                onChange={handleChange}
            />
            <TextField
                fullWidth
                margin="normal"
                label="Heslo"
                name="heslo"
                type="password"
                value={form.heslo}
                onChange={handleChange}
            />
            <Button fullWidth type="submit" variant="contained" sx={{ mt: 2 }}>
                Přihlásit
            </Button>
            {message && (
                <Typography color="error" sx={{ mt: 2 }}>
                    {message}
                </Typography>
            )}
        </Box>
    );
};

export default LoginPage;
