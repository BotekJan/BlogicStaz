import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link as RouterLink } from "react-router-dom";
import {
    getSmlouvaById,
    updateSmlouva,
    deleteSmlouva,
    getAllUsers,
    getInstituce,
    Smlouva,
    SmlouvaUpdateDto,
    SimpleUser,
} from "../api/service";
import {
    Box,
    Typography,
    CircularProgress,
    Alert,
    List,
    ListItem,
    Button,
} from "@mui/material";
import ContractFormModal from "../components/ContractFormModal";
import { useAuth } from "../auth/AuthContext";
import type { Instituce } from "../components/ContractFormModal";

const ContractDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [contract, setContract] = useState<Smlouva | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editOpen, setEditOpen] = useState(false);
    const [allUsers, setAllUsers] = useState<SimpleUser[]>([]);
    const [instituce, setInstituce] = useState<Instituce[]>([]);
    const navigate = useNavigate();
    const { user } = useAuth();

    // Fetch contract
    useEffect(() => {
        if (!id) return;
        setLoading(true);
        setError(null);

        getSmlouvaById(Number(id))
            .then(setContract)
            .catch(() => setError("Smlouva nebyla nalezena"))
            .finally(() => setLoading(false));
    }, [id]);

    // Fetch users and institutions
    useEffect(() => {
        getAllUsers().then(setAllUsers);
        getInstituce().then(setInstituce);
    }, []);

    // Mapping function to provide full SimpleUser objects for the modal
    function toModalContract(contract: Smlouva, allUsers: SimpleUser[]) {
        return {
            evidencniCislo: contract.evidencniCislo,
            nazev: contract.nazev,
            instituce: contract.instituce,
            klient: allUsers.find(u => u.id === contract.klient.id) || contract.klient,
            spravce: allUsers.find(u => u.id === contract.spravce.id) || contract.spravce,
            datumUzavreni: contract.datumUzavreni,
            datumPlatnosti: contract.datumPlatnosti,
            datumUkonceni: contract.datumUkonceni,
            poradci: contract.poradci
                .map(p => allUsers.find(u => u.id === p.id))
                .filter(Boolean) as SimpleUser[],
        };
    }

    const handleEdit = async (data: {
        evidencniCislo: string;
        nazev: string;
        instituce: Instituce;
        klient: SimpleUser;
        spravce: SimpleUser;
        datumUzavreni: string;
        datumPlatnosti: string;
        datumUkonceni?: string | null;
        poradci: SimpleUser[];
    }) => {
        if (!id) return;
        setLoading(true);
        setError(null);
        try {
            const dto: SmlouvaUpdateDto = {
                evidencniCislo: data.evidencniCislo,
                nazev: data.nazev,
                instituceId: data.instituce.id,
                klientId: data.klient.id,
                spravceId: data.spravce.id,
                datumUzavreni: data.datumUzavreni,
                datumPlatnosti: data.datumPlatnosti,
                datumUkonceni: data.datumUkonceni || null,
                poradciIds: data.poradci.map((p) => p.id),
            };
            await updateSmlouva(Number(id), dto);
            const updated = await getSmlouvaById(Number(id));
            setContract(updated);
        } catch {
            setError("Chyba při ukládání změn.");
        } finally {
            setLoading(false);
            setEditOpen(false);
        }
    };

    const handleDelete = async () => {
        if (!id) return;
        if (window.confirm("Opravdu chcete smazat tuto smlouvu?")) {
            try {
                await deleteSmlouva(Number(id));
                navigate("/contracts");
            } catch {
                setError("Chyba při mazání smlouvy.");
            }
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" mt={6}>
                <CircularProgress />
            </Box>
        );
    }

    if (error || !contract) {
        return (
            <Box maxWidth={400} mx="auto" mt={6}>
                <Alert severity="error">
                    {error || "Chyba při načítání detailu smlouvy."}
                </Alert>
            </Box>
        );
    }

    // Permission: only správce or admin
    const canEditOrDelete =
        user &&
        (user.roles?.includes("admin") || user.id === contract.spravce.id);


    function getFullUser(users: SimpleUser[], partial: { id: number }) {
        return users.find(u => u.id === partial.id);
    }

    // Only hydrate if contract && allUsers loaded
    const hydratedContract = contract && allUsers.length > 0 ? {
        ...contract,
        klient: getFullUser(allUsers, contract.klient) ?? undefined,
        spravce: getFullUser(allUsers, contract.spravce) ?? undefined,
        poradci: contract.poradci
            .map(p => getFullUser(allUsers, p))
            .filter((u): u is SimpleUser => !!u), // Only SimpleUser, no null/undefined
    } : null;
    return (
        <Box maxWidth={700} mx="auto" mt={4}>
            <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
            >
                <Typography variant="h4" gutterBottom>
                    Detail smlouvy
                </Typography>
                {canEditOrDelete && (
                    <Box>
                        <Button
                            variant="outlined"
                            sx={{ mr: 1 }}
                            onClick={() => setEditOpen(true)}
                        >
                            Upravit
                        </Button>
                        <Button
                            variant="contained"
                            color="error"
                            onClick={handleDelete}
                        >
                            Smazat
                        </Button>
                    </Box>
                )}
            </Box>
            <Typography>
                <strong>Evidenční číslo:</strong> {contract.evidencniCislo}
            </Typography>
            <Typography>
                <strong>Název:</strong> {contract.nazev}
            </Typography>
            <Typography>
                <strong>Instituce:</strong> {contract.instituce?.nazev ?? "—"}
            </Typography>
            <Typography>
                <strong>Datum uzavření:</strong> {contract.datumUzavreni ? new Date(contract.datumUzavreni).toLocaleDateString() : "—"}
            </Typography>
            <Typography>
                <strong>Datum platnosti:</strong> {contract.datumPlatnosti ? new Date(contract.datumPlatnosti).toLocaleDateString() : "—"}
            </Typography>
            <Typography>
                <strong>Datum ukončení:</strong> {contract.datumUkonceni ? new Date(contract.datumUkonceni).toLocaleDateString() : "—"}
            </Typography>
            <Typography>
                <strong>Klient:</strong>{" "}
                <Button
                    component={RouterLink}
                    to={`/user/${contract.klient.id}`}
                    variant="text"
                    sx={{ textTransform: "none", p: 0, minWidth: 0 }}
                >
                    {contract.klient.jmeno} {contract.klient.prijmeni}
                </Button>
            </Typography>
            <Typography>
                <strong>Správce:</strong>{" "}
                <Button
                    component={RouterLink}
                    to={`/user/${contract.spravce.id}`}
                    variant="text"
                    sx={{ textTransform: "none", p: 0, minWidth: 0 }}
                >
                    {contract.spravce.jmeno} {contract.spravce.prijmeni}
                </Button>
            </Typography>
            <Typography variant="subtitle1" mt={2}>
                <strong>Poradci:</strong>
            </Typography>
            <List>
                {contract.poradci.length === 0 ? (
                    <ListItem>Žádní poradci</ListItem>
                ) : (
                    contract.poradci.map((p) => (
                        <ListItem key={p.id}>
                            <Button
                                component={RouterLink}
                                to={`/user/${p.id}`}
                                variant="text"
                                sx={{ textTransform: "none", p: 0, minWidth: 0 }}
                            >
                                {p.jmeno} {p.prijmeni}
                            </Button>
                        </ListItem>
                    ))
                )}
            </List>
            <ContractFormModal
                open={editOpen}
                onClose={() => setEditOpen(false)}
                onSubmit={handleEdit}
                contract={hydratedContract}
                allUsers={allUsers}
                institucionOptions={instituce}
            />
        </Box>
    );
};

export default ContractDetailPage;
