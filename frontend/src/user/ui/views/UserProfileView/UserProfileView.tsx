import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';

import { AuthService } from '@/auth/services/AuthService';
import { buildStudentStatCells } from '@/student/lib/formatStudentStats';
import { IconCopy, IconTrapezoidShape, IconTrianglesFrame } from '@/shared/icons';
import { useUserProfile } from '@/user/hooks/useUserProfile';

import styles from './UserProfileView.module.scss';

// Общая страница профиля для учителя и ученика (макет TutorAI):
// треугольный каркас, имя/email, код учителя с копированием (TEACHER)
// либо имя привязанного учителя (STUDENT), трапециевидная кнопка «Выйти».
export function UserProfileView() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { data: profile, isPending, isError } = useUserProfile();
    const [copied, setCopied] = useState(false);

    const displayName = profile
        ? [profile.firstName, profile.lastName].filter(Boolean).join(' ') || profile.userName
        : '';

    // Выход из аккаунта: сервис чистит токены; кэш react-query очищаем полностью,
    // чтобы данные предыдущего пользователя не попали в следующую сессию.
    // Редирект на логин — через guard __root (локальные дублирующие редиректы запрещены),
    // поэтому здесь только навигация.
    const handleLogout = async () => {
        await AuthService.signOut();
        queryClient.clear();
        void navigate({ to: '/auth/login' });
    };

    // Копирование произвольного текста в буфер обмена по клику на иконку.
    const copyToClipboard = async (text: string | null | undefined) => {
        if (!text) return;
        try {
            await navigator.clipboard.writeText(text);
        } catch {
            // clipboard API недоступен (не https) — используем fallback
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            textarea.remove();
        }
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1500);
    };

    const handleCopyCode = () => void copyToClipboard(profile?.teacherCode);
    const handleCopyTeacherCode = () => void copyToClipboard(profile?.teacher?.teacherCode);

    return (
        <div className={styles.page}>
            <h1 className={styles.title}>TutorAI</h1>

            {isPending && <p className={styles.status}>Загрузка…</p>}
            {isError && <p className={styles.status}>Не удалось загрузить профиль</p>}

            {profile && (
                <div className={styles.trianglesWrap} data-role={profile.role}>
                    <IconTrianglesFrame className={styles.triFrame}/>

                    <button type="button" className={styles.btnLogout} onClick={handleLogout}>
                        <IconTrapezoidShape className={styles.btnLogoutBorder} variant="filled"/>
                        <span className={styles.btnLogoutText}>Выйти</span>
                    </button>

                    {/* Верхний треугольник: у ученика — статистика, ниже email и имя;
                        у учителя — только имя/email (макет профиля учителя). */}
                    <div className={styles.topTriangleContent}>
                        {profile.role === 'STUDENT' && (
                            <div className={styles.statsRow}>
                                {buildStudentStatCells(profile.stats).map((cell) => (
                                    <div key={cell.label} className={styles.statItem}>
                                        <div className={styles.statValue}>{cell.value}</div>
                                        <div className={styles.statLabel}>{cell.label}</div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className={styles.topPersonalContent}>
                            <div className={`${styles.field} ${styles.fieldName}`}>{displayName}</div>
                            <div className={`${styles.field} ${styles.fieldEmail}`}>{profile.email}</div>
                        </div>

                    </div>
                    {profile.role === 'TEACHER' ? (
                        <div className={styles.bottomTriangleContent}>
                            <div className={`${styles.field} ${styles.fieldCode}`}>
                                <span className={styles.codeValue}>{profile.teacherCode}</span>
                                <button
                                    type="button"
                                    className={styles.copyButton}
                                    onClick={handleCopyCode}
                                    aria-label="Скопировать код"
                                    title="Скопировать код"
                                >
                                    <IconCopy className={styles.copyIcon}/>
                                </button>
                            </div>
                            <p className={styles.hint}>
                                Отправьте этот код ученику;<br/>
                                по нему он сможет зарегистрироваться к вам
                            </p>
                        </div>
                    ) : (
                        /* Нижний треугольник ученика: код учителя, подпись и имя учителя */
                        <div className={styles.bottomTriangleText}>
                            <div className={`${styles.field} ${styles.fieldCode}`}>
                                <span className={styles.codeValue}>{profile.teacher?.teacherCode ?? '—'}</span>
                                <button
                                    type="button"
                                    className={styles.copyButton}
                                    onClick={handleCopyTeacherCode}
                                    aria-label="Скопировать код учителя"
                                    title="Скопировать код учителя"
                                >
                                    <IconCopy className={styles.copyIcon}/>
                                </button>
                            </div>
                            <p className={styles.hint}>Код вашего учителя</p>
                            <div className={styles.textTeacher}>
                                Учитель: {profile.teacher?.fullName ?? '—'}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {copied && <span className={styles.copiedBadge} role="status">Скопировано</span>}
        </div>
    );
}
