import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { Box, Typography, CircularProgress, Alert, Button } from "@mui/material";
import { getUserById, updateUser } from "../api/service";
import AgeFromDate from "../utils/AgeFromDate";
import UserEditModal from "../components/UserEditModal"; // Import the modal!

interface UserDetail {
    id: number;
    jmeno: string;
    prijmeni: string;
    email: string;
    telefon: string;
    datumNarozeni: string;
}

const UserPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user, reloadUser } = useAuth();
    const [detail, setDetail] = useState<UserDetail | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // Modal state
    const [editOpen, setEditOpen] = useState(false);
    const [editError, setEditError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        setError(null);

        getUserById(Number(id))
            .then((data) => setDetail(data))
            .catch((err: any) => {
                if (err.response?.status === 403) {
                    setError("Nemáte oprávnění zobrazit tento profil.");
                } else if (err.response?.status === 404) {
                    setError("Uživatel nenalezen.");
                } else {
                    setError("Chyba při načítání profilu.");
                }
            })
            .finally(() => setLoading(false));
    }, [id]);

    const canEdit = user && detail && user.id === detail.id; // Only allow editing your own info (expandable for admin later)

    const handleEdit = async (data: { email: string; telefon: string }) => {
        setSaving(true);
        setEditError(null);
        try {
            await updateUser(detail!.id, data); // add this to your service
            setDetail({ ...detail!, ...data });
            if (user?.id === detail?.id) {
                reloadUser(); // update auth context too
            }
            setEditOpen(false);
        } catch (e: any) {
            setEditError(e?.response?.data || "Chyba při ukládání změn.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" mt={6}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box maxWidth={400} mx="auto" mt={6}>
                <Alert severity="error">{error}</Alert>
                <Box mt={2}>
                    <Button
                        variant="contained"
                        onClick={() => navigate(user ? `/user/${user.id}` : "/login")}
                    >
                        {user
                            ? `Zpět na profil uživatele ${user.jmeno} ${user.prijmeni}`
                            : "Přihlásit se"}
                    </Button>
                </Box>
            </Box>
        );
    }

    if (!detail) return null;

    return (
        <Box maxWidth={400} mx="auto" mt={6}>
            <Typography variant="h5" gutterBottom>
                Profil uživatele
            </Typography>
            <Typography><strong>Jméno:</strong> {detail.jmeno}</Typography>
            <Typography><strong>Příjmení:</strong> {detail.prijmeni}</Typography>
            <Typography><strong>Email:</strong> {detail.email}</Typography>
            <Typography><strong>Telefon:</strong> {detail.telefon}</Typography>
            <Typography>
                <strong>Datum narození:</strong> {detail.datumNarozeni}
            </Typography>
            <Typography>
                <strong>Věk:</strong> <AgeFromDate date={detail.datumNarozeni} /> let
            </Typography>
            {canEdit && (
                <Box mt={2}>
                    <Button variant="outlined" onClick={() => setEditOpen(true)}>
                        Upravit osobní údaje
                    </Button>
                </Box>
            )}
            <UserEditModal
                open={editOpen}
                onClose={() => setEditOpen(false)}
                onSubmit={handleEdit}
                email={detail.email}
                telefon={detail.telefon}
                loading={saving}
                error={editError}
            />
        </Box>
    );
};

export default UserPage;
