import { useState, useCallback, useEffect } from 'react';

const SIDEBAR_COLLAPSED_KEY = 'app-sidebar-collapsed';
const DEFAULT_COLLAPSED = false;

export function useSidebar() {
    const [collapsed, setCollapsed] = useState<boolean>(() => {
        try {
            const stored = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
            return stored === 'true';
        } catch {
            return DEFAULT_COLLAPSED;
        }
    });

    const toggle = useCallback(() => {
        setCollapsed(prev => {
            const next = !prev;
            try {
                localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next));
            } catch { /* storage unavailable, ignore */ }
            return next;
        });
    }, []);

    const collapse = useCallback(() => {
        setCollapsed(true);
        try {
            localStorage.setItem(SIDEBAR_COLLAPSED_KEY, 'true');
        } catch { /* ignore */ }
    }, []);

    const expand = useCallback(() => {
        setCollapsed(false);
        try {
            localStorage.setItem(SIDEBAR_COLLAPSED_KEY, 'false');
        } catch { /* ignore */ }
    }, []);

    return { collapsed, toggle, collapse, expand };
}

export function useSidebarBodyClass(isDesktop: boolean) {
    useEffect(() => {
        if (!isDesktop) return;
        try {
            const collapsed = localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true';
            document.body.classList.toggle('sidebar--collapsed', collapsed);
        } catch { /* ignore */ }
    }, [isDesktop]);
}
