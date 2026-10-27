import type { UserRole } from '@/user/types';

import styles from './AuthRoleSwitch.module.scss';

interface AuthRoleSwitchProps {
    role: UserRole;
    onChange: (role: UserRole) => void;
}

// Треугольник-переключатель Учитель/Ученик из макета.
export function AuthRoleSwitch({ role, onChange }: AuthRoleSwitchProps) {
    const isTeacher = role === 'TEACHER';

    return (
        <div className={styles.switch}>
            <svg viewBox="0 0 150 118" className={styles.svg}>
                <polygon className={styles.tri} points="75,0 0,118 150,118" />
                <path
                    className={isTeacher ? `${styles.half} ${styles.halfActive}` : styles.half}
                    d="M 75 0 L 0 118 L 75 118 Z"
                    onClick={() => onChange('TEACHER')}
                />
                <path
                    className={!isTeacher ? `${styles.half} ${styles.halfActive}` : styles.half}
                    d="M 75 0 L 150 118 L 75 118 Z"
                    onClick={() => onChange('STUDENT')}
                />
                <line className={styles.divider} x1="75" y1="0" x2="75" y2="118" />
            </svg>
            <span className={isTeacher ? `${styles.text} ${styles.textTeacher} ${styles.textActive}` : `${styles.text} ${styles.textTeacher}`}>
                Учитель
            </span>
            <span className={!isTeacher ? `${styles.text} ${styles.textStudent} ${styles.textActive}` : `${styles.text} ${styles.textStudent}`}>
                Ученик
            </span>
        </div>
    );
}
