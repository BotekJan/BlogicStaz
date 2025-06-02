import React, { useState, useEffect } from "react";
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box, Typography
} from "@mui/material";

interface UserEditModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: { email: string; telefon: string }) => void;
    email: string;
    telefon: string;
    loading?: boolean;
    error?: string | null;
}

const UserEditModal: React.FC<UserEditModalProps> = ({
    open, onClose, onSubmit, email: initialEmail, telefon: initialTelefon, loading, error,
}) => {
    const [email, setEmail] = useState(initialEmail);
    const [telefon, setTelefon] = useState(initialTelefon);

    useEffect(() => {
        setEmail(initialEmail);
        setTelefon(initialTelefon);
    }, [initialEmail, initialTelefon, open]);

    const handleSubmit = () => {
        onSubmit({ email, telefon });
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Upravit informace</DialogTitle>
            <DialogContent>
                {error && <Typography color="error">{error}</Typography>}
                <TextField
                    label="Email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    fullWidth
                    margin="normal"
                    type="email"
                />
                <TextField
                    label="Telefon"
                    value={telefon}
                    onChange={e => setTelefon(e.target.value)}
                    fullWidth
                    margin="normal"
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={!!loading}>Zrušit</Button>
                <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={!!loading}
                >
                    Uložit
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default UserEditModal;