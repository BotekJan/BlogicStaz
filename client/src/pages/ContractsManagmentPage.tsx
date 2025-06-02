import React, { useEffect, useState } from "react";
import {
    getSmlouvy,
    Smlouva,
    createSmlouva,
    SmlouvaCreateDto,
    getAllUsers,
    SimpleUser,
} from "../api/service";
import {
    Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, Button, CircularProgress, Box, Typography
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import ContractFormModal from "../components/ContractFormModal";
import { useAuth } from "../auth/AuthContext";

// --- Mock/fetch institucion data ---
// You should implement real API call!
type Instituce = { id: number; nazev: string; };
const getInstituce = async (): Promise<Instituce[]> => [
    { id: 1, nazev: "ČSOB" },
    { id: 2, nazev: "Komerční banka" },
    { id: 3, nazev: "Česká pojišťovna" }
];

const ContractsManagementPage: React.FC = () => {
    const [contracts, setContracts] = useState<Smlouva[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [allUsers, setAllUsers] = useState<SimpleUser[]>([]);
    const [instituce, setInstituce] = useState<Instituce[]>([]);
    const { user } = useAuth();

    useEffect(() => {
        setLoading(true);
        Promise.all([getSmlouvy(), getAllUsers(), getInstituce()])
            .then(([contracts, users, instituce]) => {
                setContracts(contracts);
                setAllUsers(users);
                setInstituce(instituce);
            })
            .finally(() => setLoading(false));
    }, []);

    // Handle new contract add
    const handleAdd = async (data: {
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
        setSaving(true);
        try {
            const dto: SmlouvaCreateDto = {
                evidencniCislo: data.evidencniCislo,
                nazev: data.nazev,
                instituceId: data.instituce.id,
                klientId: data.klient.id,
                spravceId: data.spravce.id,
                datumUzavreni: data.datumUzavreni,
                datumPlatnosti: data.datumPlatnosti,
                datumUkonceni: data.datumUkonceni || null,
                poradciIds: data.poradci.map(p => p.id),
            };
            await createSmlouva(dto);
            const smlouvy = await getSmlouvy();
            setContracts(smlouvy);
            setModalOpen(false);
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

    return (
        <Box maxWidth={1100} mx="auto" mt={4}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h4">
                    Správa smluv
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => setModalOpen(true)}
                >
                    Přidat smlouvu
                </Button>
            </Box>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Evidenční číslo</TableCell>
                            <TableCell>Název smlouvy</TableCell>
                            <TableCell>Instituce</TableCell>
                            <TableCell>Datum uzavření</TableCell>
                            <TableCell>Klient</TableCell>
                            <TableCell>Správce</TableCell>
                            <TableCell>Poradci</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {contracts.map((smlouva) => (
                            <TableRow key={smlouva.id}>
                                <TableCell>{smlouva.evidencniCislo}</TableCell>
                                <TableCell>
                                    <Button
                                        component={RouterLink}
                                        to={`/contracts/${smlouva.id}`}
                                        variant="text"
                                        color="primary"
                                        sx={{ textTransform: "none" }}
                                    >
                                        {smlouva.nazev}
                                    </Button>
                                </TableCell>
                                <TableCell>{smlouva.instituce?.nazev ?? "—"}</TableCell>
                                <TableCell>{new Date(smlouva.datumUzavreni).toLocaleDateString()}</TableCell>
                                <TableCell>
                                    <Button
                                        component={RouterLink}
                                        to={`/user/${smlouva.klient.id}`}
                                        color="primary"
                                        variant="text"
                                        sx={{ textTransform: "none", p: 0, minWidth: 0 }}
                                    >
                                        {smlouva.klient.jmeno} {smlouva.klient.prijmeni}
                                    </Button>
                                </TableCell>
                                <TableCell>
                                    <Button
                                        component={RouterLink}
                                        to={`/user/${smlouva.spravce.id}`}
                                        color="primary"
                                        variant="text"
                                        sx={{ textTransform: "none", p: 0, minWidth: 0 }}
                                    >
                                        {smlouva.spravce.jmeno} {smlouva.spravce.prijmeni}
                                    </Button>
                                </TableCell>
                                <TableCell>
                                    {smlouva.poradci.length
                                        ? smlouva.poradci.map(p => (
                                            <Button
                                                key={p.id}
                                                component={RouterLink}
                                                to={`/user/${p.id}`}
                                                color="primary"
                                                variant="text"
                                                sx={{ textTransform: "none", p: 0, minWidth: 0, mr: 1 }}
                                            >
                                                {p.jmeno} {p.prijmeni}
                                            </Button>
                                        ))
                                        : "—"}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <ContractFormModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onSubmit={handleAdd}
                contract={null}
                allUsers={allUsers}
                institucionOptions={instituce}
                loading={saving}
            />
        </Box>
    );
};

export default ContractsManagementPage;
