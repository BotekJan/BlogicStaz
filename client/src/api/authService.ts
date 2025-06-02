import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
});

export interface User {
    id: number;
    email: string;
    jmeno: string;
    prijmeni: string;
    telefon: string;
    datumNarozeni: string;
    roles: string[];
}

export const login = async (data: { email: string; heslo: string }) => {
    const res = await api.post<User>("/login", data);
    return res.data;
};

export const register = async (data: {
    jmeno: string;
    prijmeni: string;
    email: string;
    telefon: string;
    datumNarozeni: string;
    heslo: string;
}) => {
    const res = await api.post<User>("/register", data);
    return res.data;
};

export const logout = async () => {
    await api.post("/logout");
};

// Get the current logged-in user (using /me)
export const getMe = async (): Promise<User> => {
    const res = await api.get<User>("/me");
    return res.data;
};
