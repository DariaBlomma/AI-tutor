import { useState, useCallback, useEffect } from 'react';

const SIDEBAR_COLLAPSED_KEY = 'app-sidebar-collapsed';
const DEFAULT_COLLAPSED = false;

function getCollapsed(): boolean {
    try {
        return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true';
    } catch {
        return DEFAULT_COLLAPSED;
    }
}

function setCollapsed(value: boolean) {
    try {
        localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(value));
    } catch { /* ignore */ }
}

// Простой store с подпиской — синхронизирует все экземпляры useSidebar
// в рамках одной вкладки (storage event работает только между вкладками).
const listeners = new Set<() => void>();

function notify() {
    listeners.forEach(fn => fn());
}

export function useSidebar() {
    const [collapsed, setCollapsedState] = useState(getCollapsed);

    // Подписываемся на изменения от других экземпляров в той же вкладке.
    useEffect(() => {
        const handler = () => setCollapsedState(getCollapsed);
        listeners.add(handler);
        return () => {
            listeners.delete(handler);
        };
    }, []);

    const toggle = useCallback(() => {
        setCollapsedState(prev => {
            const next = !prev;
            setCollapsed(next);
            notify();
            return next;
        });
    }, []);

    const collapse = useCallback(() => {
        setCollapsedState(true);
        setCollapsed(true);
        notify();
    }, []);

    const expand = useCallback(() => {
        setCollapsedState(false);
        setCollapsed(false);
        notify();
    }, []);

    return { collapsed, toggle, collapse, expand };
}
