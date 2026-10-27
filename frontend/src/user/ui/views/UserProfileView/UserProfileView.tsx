import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';

import { AuthService } from '@/auth/services/AuthService';
import { IconCopy, IconTrapezoidGradient, IconTrapezoidShape, IconTrianglesFrame } from '@/shared/icons';
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

    // Копирование кода учителя в буфер обмена по клику на иконку.
    const handleCopyCode = async () => {
        if (!profile?.teacherCode) return;
        try {
            await navigator.clipboard.writeText(profile.teacherCode);
        } catch {
            // clipboard API недоступен (не https) — используем fallback
            const textarea = document.createElement('textarea');
            textarea.value = profile.teacherCode;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            textarea.remove();
        }
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1500);
    };

    return (
        <div className={styles.page}>
            {/* Градиент трапеции объявляется один раз на страницу (url(#...) глобален в DOM) */}
            <IconTrapezoidGradient/>

            <h1 className={styles.title}>TutorAI</h1>

            {isPending && <p className={styles.status}>Загрузка…</p>}
            {isError && <p className={styles.status}>Не удалось загрузить профиль</p>}

            {profile && (
                <div className={styles.trianglesWrap}>
                    <IconTrianglesFrame className={styles.triFrame}/>

                    <button type="button" className={styles.btnLogout} onClick={handleLogout}>
                        <IconTrapezoidShape className={styles.btnLogoutBorder} variant="filled"/>
                        <span className={styles.btnLogoutText}>Выйти</span>
                    </button>

                    <div className={`${styles.field} ${styles.fieldName}`}>{displayName}</div>
                    <div className={`${styles.field} ${styles.fieldEmail}`}>{profile.email}</div>

                    {profile.role === 'TEACHER' ? (
                        <>
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
                        </>
                    ) : (
                        <div className={`${styles.field} ${styles.fieldTeacher}`}>
                            Учитель: {profile.teacher?.fullName ?? '—'}
                        </div>
                    )}
                </div>
            )}

            {copied && <span className={styles.copiedBadge} role="status">Скопировано</span>}
        </div>
    );
}
