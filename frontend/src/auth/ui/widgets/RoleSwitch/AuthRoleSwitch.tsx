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
            <svg viewBox="0 0 140 110" className={styles.svg}>
                <polygon className={styles.tri} points="70,0 0,110 140,110" />
                <path
                    className={isTeacher ? `${styles.half} ${styles.halfActive}` : styles.half}
                    d="M 70 0 L 0 110 L 70 110 Z"
                    onClick={() => onChange('TEACHER')}
                />
                <path
                    className={!isTeacher ? `${styles.half} ${styles.halfActive}` : styles.half}
                    d="M 70 0 L 140 110 L 70 110 Z"
                    onClick={() => onChange('STUDENT')}
                />
                <line className={styles.divider} x1="70" y1="0" x2="70" y2="110" />
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
