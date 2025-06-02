import React, { useEffect, useState } from "react";
import {
    Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, Button, CircularProgress, Box, Typography
} from "@mui/material";
import {
    getSmlouvy, Smlouva, createSmlouva, SmlouvaCreateDto,
    getAllUsers, SimpleUser,
    getInstituce,
    Instituce
} from "../api/service";
import { Link as RouterLink } from "react-router-dom";
import ContractFormModal from "../components/ContractFormModal";
import { useAuth } from "../auth/AuthContext";

const ContractsPage: React.FC = () => {
    const [contracts, setContracts] = useState<Smlouva[]>([]);
    const [allUsers, setAllUsers] = useState<SimpleUser[]>([]);
    const [instituceOptions, setInstituceOptions] = useState<Instituce[]>([]); // NEW
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        setLoading(true);
        Promise.all([
            getSmlouvy(),
            getAllUsers(),
            getInstituce() // NEW: Fetch instituce from API
        ])
            .then(([contracts, users, instituce]) => {
                setContracts(contracts);
                setAllUsers(users);
                setInstituceOptions(instituce); // NEW
            })
            .finally(() => setLoading(false));
    }, []);

    // The modal form must now provide all these fields!
    const handleAdd = async (data: {
        evidencniCislo: string;
        nazev: string;
        instituce: { id: number };
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
                instituceId: data.instituce.id,
                nazev: data.nazev,
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

    if (!user) return null;

    // Filter contracts for current user
    const klientskeSmlouvy = contracts.filter(sml =>
        sml.klient.id === user.id
    );
    const zamestnaneckeSmlouvy = contracts.filter(
        sml =>
            sml.spravce.id === user.id ||
            sml.poradci.some(p => p.id === user.id)
    ).filter(sml => sml.klient.id !== user.id);

    // Only show add button if NOT klient
    const canAddContract = user && !user.roles?.includes("klient");

    return (
        <Box maxWidth={1100} mx="auto" mt={4}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h4">
                    Smlouvy
                </Typography>
                {canAddContract && (
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => setModalOpen(true)}
                    >
                        Přidat smlouvu
                    </Button>
                )}
            </Box>
            {klientskeSmlouvy.length > 0 && (
                <>
                    <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
                        Klientské smlouvy
                    </Typography>
                    <ContractsTable smlouvy={klientskeSmlouvy} />
                </>
            )}
            {zamestnaneckeSmlouvy.length > 0 && (
                <>
                    <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
                        Zaměstnanecké smlouvy
                    </Typography>
                    <ContractsTable smlouvy={zamestnaneckeSmlouvy} />
                </>
            )}
            {klientskeSmlouvy.length === 0 && zamestnaneckeSmlouvy.length === 0 && (
                <Typography variant="body1" sx={{ mt: 2 }}>
                    Nemáte žádné smlouvy.
                </Typography>
            )}
            <ContractFormModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onSubmit={handleAdd}
                contract={null}
                allUsers={allUsers}
                loading={saving}
                institucionOptions={instituceOptions} />
        </Box>
    );
};

function ContractsTable({ smlouvy }: { smlouvy: Smlouva[] }) {
    return (
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
                    {smlouvy.map((smlouva) => (
                        <TableRow key={smlouva.id}>
                            <TableCell>
                                {smlouva.evidencniCislo}
                            </TableCell>
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
                            <TableCell>
                                {smlouva.instituce?.nazev ?? "—"}
                            </TableCell>
                            <TableCell>
                                {new Date(smlouva.datumUzavreni).toLocaleDateString()}
                            </TableCell>
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
    );
}

export default ContractsPage;
