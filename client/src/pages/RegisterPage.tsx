import React, { useState } from "react";
import { TextField, Button, Box, Typography } from "@mui/material";
import { register } from "../api/authService";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";

const RegisterPage: React.FC = () => {
    const [form, setForm] = useState({
        jmeno: "",
        prijmeni: "",
        email: "",
        telefon: "",
        datumNarozeni: "",
        heslo: "",
    });
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
            const user = await register(form); // Register returns user info
            setUser(user); // Set user in context
            navigate(`/user/${user.id}`); // Redirect to their profile page
        } catch (error: any) {
            setMessage(error.response?.data || "Chyba při registraci");
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 400, mx: "auto", mt: 4 }}>
            <Typography variant="h5" gutterBottom>
                Registrace
            </Typography>
            <TextField
                fullWidth
                margin="normal"
                label="Jméno"
                name="jmeno"
                value={form.jmeno}
                onChange={handleChange}
            />
            <TextField
                fullWidth
                margin="normal"
                label="Příjmení"
                name="prijmeni"
                value={form.prijmeni}
                onChange={handleChange}
            />
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
                label="Telefon"
                name="telefon"
                value={form.telefon}
                onChange={handleChange}
            />
            <TextField
                fullWidth
                margin="normal"
                label="Datum narození"
                name="datumNarozeni"
                type="date"
                value={form.datumNarozeni}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
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
                Registrovat
            </Button>
            {message && (
                <Typography color="error" sx={{ mt: 2 }}>
                    {message}
                </Typography>
            )}
        </Box>
    );
};

export default RegisterPage;
