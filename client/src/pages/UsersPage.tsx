import React, { useEffect, useState } from "react";
import {
    Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, Button, CircularProgress, Box
} from "@mui/material";
import { getUsers } from "../api/service";
import { Link as RouterLink } from "react-router-dom";
import AgeFromDate from "../utils/AgeFromDate"; // <-- import

interface Uzivatel {
    id: number;
    jmeno: string;
    prijmeni: string;
    email: string;
    telefon: string;
    datumNarozeni: string;
}

const UsersPage: React.FC = () => {
    const [users, setUsers] = useState<Uzivatel[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getUsers().then(setUsers).finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" mt={6}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Jméno</TableCell>
                        <TableCell>Příjmení</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Telefon</TableCell>
                        <TableCell>Věk</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {users.map((user) => (
                        <TableRow key={user.id}>
                            <TableCell>
                                <Button
                                    component={RouterLink}
                                    to={`/user/${user.id}`}
                                    variant="text"
                                    color="primary"
                                    sx={{ textTransform: "none", p: 0, minWidth: 0 }}
                                >
                                    {user.jmeno}
                                </Button>
                            </TableCell>
                            <TableCell>{user.prijmeni}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>{user.telefon}</TableCell>
                            <TableCell>
                                <AgeFromDate date={user.datumNarozeni} /> let
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default UsersPage;
