import { useEffect, useState } from 'react';
import { UserService } from '@/user/services/UserService';

// Имя учителя с бэкенда (GET /user/me); fallback — «Учитель».
export function useTeacherName(): string {
    const [teacherName, setTeacherName] = useState('Учитель');

    useEffect(() => {
        let active = true;

        UserService.getProfile()
            .then((profile) => {
                if (!active) return;
                const name = [profile.firstName, profile.lastName].filter(Boolean).join(' ');
                setTeacherName(name || profile.userName || 'Учитель');
            })
            .catch(() => {
                if (active) setTeacherName('Учитель');
            });

        return () => {
            active = false;
        };
    }, []);

    return teacherName;
}
