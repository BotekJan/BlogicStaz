import React from "react";

interface AgeFromDateProps {
    date: string | Date | null | undefined;
}

const AgeFromDate: React.FC<AgeFromDateProps> = ({ date }) => {
    if (!date) return <span>—</span>;

    const birthDate = typeof date === "string" ? new Date(date) : date;
    if (isNaN(birthDate.getTime())) return <span>Neplatné datum</span>;

    const now = new Date();
    let age = now.getFullYear() - birthDate.getFullYear();
    const m = now.getMonth() - birthDate.getMonth();

    if (m < 0 || (m === 0 && now.getDate() < birthDate.getDate())) {
        age--;
    }

    return <span>{age}</span>;
};

export default AgeFromDate;
