import { createContext, useContext, useMemo, useRef } from 'react';
import type { ReactNode } from 'react';
import { Branch } from '@radix-ui/react-dismissable-layer';

import type { ModalPopupLayerEntry, ModalPopupRegistryValue } from './types';

// Контекст «всплывающий слой — часть диалога». Значение — реестр слоёв
// открытого BaseModal; null вне модалки (слой тогда ведёт себя штатно).
const ModalPopupRegistryContext = createContext<ModalPopupRegistryValue | null>(null);

export function useModalPopupRegistry(): ModalPopupRegistryValue | null {
    return useContext(ModalPopupRegistryContext);
}

/**
 * Провайдер реестра всплывающих слоёв. Рендерится ВНУТРИ Dialog.Content только
 * при открытой модалке — тогда и только тогда зарегистрированные слои
 * считаются частью диалога.
 */
export function ModalPopupLayerProvider({ children }: { children: ReactNode }) {
    // Set в ref, не в state: регистрация слоя (открытие панели пикера) НЕ
    // должна перемонтировать контент модалки — MUI-панель чувствительна к
    // remount'у (см. комментарии в DateTimePicker про стабильные ссылки).
    const entriesRef = useRef<Set<ModalPopupLayerEntry>>(new Set());

    const value = useMemo<ModalPopupRegistryValue>(
        () => ({
            register: (entry) => {
                const entries = entriesRef.current;
                entries.add(entry);
                return () => {
                    entries.delete(entry);
                };
            },
        }),
        [],
    );

    return (
        <ModalPopupRegistryContext.Provider value={value}>
            {children}
            <ModalPopupBranches entriesRef={entriesRef} />
        </ModalPopupRegistryContext.Provider>
    );
}

/**
 * Дочерний компонент провайдера: читает записи реестра во время рендера и для
 * каждой активной рисует штатную ветку Radix — DismissableLayer.Branch.
 *
 * Почему это заменяет все прежние перехваты (isInsidePopupLayer +
 * preventDefault на onPointerDownOutside/onInteractOutside/onFocusOutside):
 * DismissableLayer проверяет `branch.contains(event.target)` для pointer-down,
 * focus-outside и composedPath() для Esc; попадание внутрь любой ветки —
 * событие вообще не считается «снаружи», канал dismiss не дёргается. Никаких
 * селекторов чужих классов, никаких preventDefault.
 *
 * Ref-колбэк передаётся как ПРОПС (не через cloneElement): он вызывается на
 * реальном DOM-узле панели из чужого портала, поэтому React-дерево ветки не
 * перерисовывает — rerender случается ровно один раз, при монтаже/размонтиже
 * самого узла панели.
 */
function ModalPopupBranches({
    entriesRef,
}: {
    entriesRef: React.RefObject<Set<ModalPopupLayerEntry>>;
}) {
    const branches: ReactNode[] = [];
    let index = 0;
    for (const entry of entriesRef.current) {
        if (!entry.enabled) continue;
        const branchRef = entry.ref as React.MutableRefObject<HTMLElement | null>;
        branches.push(<Branch key={`popup-branch-${index++}`} ref={branchRef} hidden aria-hidden />);
    }
    return <>{branches}</>;
}
