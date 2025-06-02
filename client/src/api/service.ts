import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
});

export interface User {
    id: number;
    jmeno: string;
    prijmeni: string;
    email: string;
    telefon: string;
    rodneCislo: string;
    datumNarozeni: string;
    roles?: string[];
}

export const getUsers = async (): Promise<User[]> => {
    const res = await api.get<User[]>("/");
    return res.data;
};

export const getUserById = async (id: number): Promise<User> => {
    const res = await api.get<User>(`/users/${id}`);
    return res.data;
};

// --- Contracts ---

export interface Instituce {
    id: number;
    nazev: string;
}

export interface Smlouva {
    id: number;
    evidencniCislo: string;
    nazev: string;
    instituce: Instituce;
    klient: { id: number; jmeno: string; prijmeni: string };
    spravce: { id: number; jmeno: string; prijmeni: string };
    datumUzavreni: string;
    datumPlatnosti: string;
    datumUkonceni: string | null;
    poradci: { id: number; jmeno: string; prijmeni: string }[];
}

export const getSmlouvy = async (): Promise<Smlouva[]> => {
    const res = await api.get<Smlouva[]>("/smlouvy");
    return res.data;
};

export const getSmlouvaById = async (id: number): Promise<Smlouva> => {
    const res = await api.get<Smlouva>(`/smlouvy/${id}`);
    return res.data;
};

export interface SmlouvaContractList {
    id: number;
    nazev: string;
    evidencniCislo: string;
}

export const getMojeSmlouvy = async (userId: number) => {
    const res = await api.get<{
        klient: SmlouvaContractList[];
        spravce: SmlouvaContractList[];
        poradce: SmlouvaContractList[];
    }>(`/mycontracts/${userId}`);
    return res.data;
};

// DTOs for create/update
export interface SmlouvaCreateDto {
    evidencniCislo: string;
    instituceId: number;
    nazev: string;
    klientId: number;
    spravceId: number;
    datumUzavreni: string;
    datumPlatnosti: string;
    datumUkonceni?: string | null;
    poradciIds: number[];
}

export const createSmlouva = async (data: SmlouvaCreateDto): Promise<void> => {
    await api.post("/smlouvy", data);
};

export interface SmlouvaUpdateDto extends SmlouvaCreateDto { }

export const updateSmlouva = async (id: number, data: SmlouvaUpdateDto): Promise<void> => {
    await api.put(`/smlouvy/${id}`, data);
};

/** Delete a contract */
export const deleteSmlouva = async (id: number): Promise<void> => {
    await api.delete(`/smlouvy/${id}`);
};

export interface SimpleUser {
    id: number;
    jmeno: string;
    prijmeni: string;
    email: string;
    telefon: string;

    datumNarozeni: string;
    roles: string[];
}
export const getAllUsers = async (): Promise<SimpleUser[]> => {
    const res = await api.get<SimpleUser[]>("/users");
    return res.data;
};

export interface UserUpdateDto {
    email: string;
    telefon: string;
}

export const updateUser = async (
    id: number,
    data: UserUpdateDto
) => {
    const res = await api.put(`/users/${id}`, data);
    return res.data;
};


export interface Instituce {
    id: number;
    nazev: string;
}

export const getInstituce = async (): Promise<Instituce[]> => {
    const res = await api.get<Instituce[]>("/instituce");
    return res.data;
};

export default api;
