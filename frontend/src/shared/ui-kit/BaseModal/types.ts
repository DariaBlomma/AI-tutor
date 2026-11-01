import type { ReactNode, RefObject } from 'react';

/**
 * Контракт доступности BaseModal (см. README.md в папке компонента).
 *
 * Radix Dialog обязан иметь доступное имя (accessible name) — как HTML
 * <dialog aria-labelledby="...">. Оно получается одним из двух способов:
 *  - видимый заголовок `title` -> компонент рендерит Dialog.Title и сам
 *    связывает его с контентом через aria-labelledby;
 *  - явный `ariaLabel` для модалок без визуально заметного заголовка.
 *
 * Дискриминированное объединение делает невалидное состояние (модалка вообще
 * без имени, либо title + ariaLabel одновременно) невыразимым на уровне типов.
 */
interface BaseModalShellProps {
    open: boolean;
    onClose: () => void;
    /** Содержимое тела модалки (слот content). */
    children: ReactNode;
}

export type BaseModalProps =
    | (BaseModalShellProps & {
          /** Видимый заголовок — становится доступным именем через aria-labelledby. */
          title: ReactNode;
          ariaLabel?: never;
      })
    | (BaseModalShellProps & {
          title?: never;
          /** Доступное имя для модалок без видимого заголовка. */
          ariaLabel: string;
      });

/**
 * Запись реестра «всплывающий слой — часть диалога» (панель DateTimePicker,
 * меню react-select и т.п.). Слой живёт в собственном портале (document.body),
 * но регистрирует свой DOM-узел в открытом BaseModal; тот рисует для него
 * штатную ветку DismissableLayer.Branch — см. ModalPopupLayerContext.tsx.
 */
export interface ModalPopupLayerEntry {
    ref: RefObject<HTMLElement | null>;
    /** true, пока слой открыт (напр. панель пикера до закрытия). */
    enabled: boolean;
}

export interface ModalPopupRegistryValue {
    register: (entry: ModalPopupLayerEntry) => () => void;
}
