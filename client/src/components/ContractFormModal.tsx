import React, { useState, useEffect } from "react";
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, Box, Typography,
    MenuItem, Select, InputLabel, FormControl
} from "@mui/material";
import { useAuth } from "../auth/AuthContext";
import type { SimpleUser } from "../api/service";

// Type for institucion
export interface Instituce {
    id: number;
    nazev: string;
}

interface ContractFormModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: {
        evidencniCislo: string;
        nazev: string;
        instituce: Instituce;
        klient: SimpleUser;
        spravce: SimpleUser;
        datumUzavreni: string;
        datumPlatnosti: string;
        datumUkonceni?: string | null;
        poradci: SimpleUser[];
    }) => void;
    contract?: {
        evidencniCislo?: string;
        nazev?: string;
        instituce?: Instituce;
        klient?: SimpleUser;
        spravce?: SimpleUser;
        datumUzavreni?: string;
        datumPlatnosti?: string;
        datumUkonceni?: string | null;
        poradci?: SimpleUser[];
    } | null;
    allUsers: SimpleUser[];
    institucionOptions: Instituce[];
    loading?: boolean;
    error?: string | null;
}

const ContractFormModal: React.FC<ContractFormModalProps> = ({
    open, onClose, onSubmit, contract, allUsers, institucionOptions, loading, error,
}) => {
    const { user } = useAuth();

    // State
    const [evidencniCislo, setEvidencniCislo] = useState("");
    const [nazev, setNazev] = useState("");
    const [instituce, setInstituce] = useState<Instituce | null>(null);
    const [klient, setKlient] = useState<SimpleUser | null>(null);
    const [spravce, setSpravce] = useState<SimpleUser | null>(null);
    const [datumUzavreni, setDatumUzavreni] = useState("");
    const [datumPlatnosti, setDatumPlatnosti] = useState("");
    const [datumUkonceni, setDatumUkonceni] = useState<string | null>("");
    const [poradci, setPoradci] = useState<SimpleUser[]>([]);
    const [localError, setLocalError] = useState<string | null>(null);

    // Role checks
    const isAdmin = user?.roles?.includes("admin");

    useEffect(() => {
        setEvidencniCislo(contract?.evidencniCislo ?? "");
        setNazev(contract?.nazev ?? "");
        setInstituce(contract?.instituce ?? null);
        setKlient(contract?.klient ?? null);
        setSpravce(contract?.spravce ?? (isAdmin ? null : user ?? null));
        setDatumUzavreni(contract?.datumUzavreni ?? "");
        setDatumPlatnosti(contract?.datumPlatnosti ?? "");
        setDatumUkonceni(contract?.datumUkonceni ?? "");
        setPoradci(contract?.poradci ?? []);
        setLocalError(null);
    }, [contract, open]);

    // Filter options
    const klientOptions = allUsers.filter(u => u.roles?.includes("klient"));
    const spravceOptions = allUsers.filter(u => u.roles?.includes("zamestnanec"));
    const poradceOptions = allUsers.filter(
        u => u.roles?.includes("zamestnanec") && u.id !== spravce?.id
    );

    // Handlers
    const handleKlientChange = (id: number) => setKlient(allUsers.find(u => u.id === id) || null);
    const handleSpravceChange = (id: number) => {
        setSpravce(allUsers.find(u => u.id === id) || null);
        setPoradci(prev => prev.filter(p => p.id !== id));
    };
    const handlePoradciChange = (ids: number[]) =>
        setPoradci(ids.map(id => allUsers.find(u => u.id === id)).filter(Boolean) as SimpleUser[]);
    const handleInstituceChange = (id: number) =>
        setInstituce(institucionOptions.find(i => i.id === id) || null);

    // Submission
    const handleSubmit = () => {
        if (
            !evidencniCislo.trim() ||
            !nazev.trim() ||
            !instituce ||
            !klient ||
            !spravce ||
            !datumUzavreni ||
            !datumPlatnosti
        ) {
            setLocalError("Vyplňte všechna povinná pole.");
            return;
        }
        setLocalError(null);
        onSubmit({
            evidencniCislo,
            nazev,
            instituce,
            klient,
            spravce,
            datumUzavreni,
            datumPlatnosti,
            datumUkonceni: datumUkonceni || null,
            poradci,
        });
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{contract ? "Upravit smlouvu" : "Přidat smlouvu"}</DialogTitle>
            <DialogContent>
                {(error || localError) && <Box mb={2}><Typography color="error">{error || localError}</Typography></Box>}
                <TextField
                    label="Evidenční číslo"
                    value={evidencniCislo}
                    onChange={e => setEvidencniCislo(e.target.value)}
                    fullWidth
                    margin="normal"
                    required
                />
                <TextField
                    label="Název smlouvy"
                    value={nazev}
                    onChange={e => setNazev(e.target.value)}
                    fullWidth
                    margin="normal"
                    required
                />
                {/* Instituce */}
                <FormControl fullWidth margin="normal" required>
                    <InputLabel id="instituce-label">Instituce</InputLabel>
                    <Select
                        labelId="instituce-label"
                        value={instituce?.id ?? ""}
                        label="Instituce"
                        onChange={e => handleInstituceChange(Number(e.target.value))}
                    >
                        {institucionOptions.map(i => (
                            <MenuItem key={i.id} value={i.id}>{i.nazev}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
                {/* Klient */}
                <FormControl fullWidth margin="normal" required>
                    <InputLabel id="klient-label">Klient</InputLabel>
                    <Select
                        labelId="klient-label"
                        value={klient?.id ?? ""}
                        label="Klient"
                        onChange={e => handleKlientChange(Number(e.target.value))}
                    >
                        {klientOptions.map(u => (
                            <MenuItem key={u.id} value={u.id}>{u.jmeno} {u.prijmeni}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
                {/* Správce */}
                <FormControl fullWidth margin="normal" required>
                    <InputLabel id="spravce-label">Správce</InputLabel>
                    <Select
                        labelId="spravce-label"
                        value={spravce?.id ?? ""}
                        label="Správce"
                        onChange={e => handleSpravceChange(Number(e.target.value))}
                        disabled={!isAdmin}
                    >
                        {spravceOptions.map(u => (
                            <MenuItem key={u.id} value={u.id}>{u.jmeno} {u.prijmeni}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
                {/* Datum uzavření */}
                <TextField
                    label="Datum uzavření"
                    type="date"
                    value={datumUzavreni}
                    onChange={e => setDatumUzavreni(e.target.value)}
                    fullWidth
                    margin="normal"
                    InputLabelProps={{ shrink: true }}
                    required
                />
                {/* Datum platnosti */}
                <TextField
                    label="Datum platnosti"
                    type="date"
                    value={datumPlatnosti}
                    onChange={e => setDatumPlatnosti(e.target.value)}
                    fullWidth
                    margin="normal"
                    InputLabelProps={{ shrink: true }}
                    required
                />
                {/* Datum ukončení (volitelné) */}
                <TextField
                    label="Datum ukončení"
                    type="date"
                    value={datumUkonceni || ""}
                    onChange={e => setDatumUkonceni(e.target.value)}
                    fullWidth
                    margin="normal"
                    InputLabelProps={{ shrink: true }}
                />
                {/* Poradci */}
                <FormControl fullWidth margin="normal">
                    <InputLabel id="poradci-label">Poradci</InputLabel>
                    <Select
                        labelId="poradci-label"
                        multiple
                        value={poradci.map(p => p.id)}
                        label="Poradci"
                        onChange={e =>
                            handlePoradciChange(
                                typeof e.target.value === "string"
                                    ? e.target.value.split(",").map(Number)
                                    : (e.target.value as number[])
                            )
                        }
                        renderValue={selected => poradceOptions
                            .filter(p => selected.includes(p.id))
                            .map(p => `${p.jmeno} ${p.prijmeni}`).join(", ")}
                    >
                        {poradceOptions.map(u => (
                            <MenuItem key={u.id} value={u.id}>{u.jmeno} {u.prijmeni}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={!!loading}>Zrušit</Button>
                <Button variant="contained" onClick={handleSubmit} disabled={!!loading}>
                    {contract ? "Uložit změny" : "Přidat"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ContractFormModal;
