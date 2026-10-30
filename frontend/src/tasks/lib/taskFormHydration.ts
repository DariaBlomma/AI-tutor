import type { CreateTaskFormState } from '@/tasks/hooks/useCreateTask';
import type { TaskItemDraft, TaskResponseDto } from '@/tasks/types';
import { TFNS_ANSWERS } from '@/tasks/data';
import { parseGapFillContent, parseMatchingContent, parseTaskContext, parseWordFormationContent } from './parseTaskContent';

let hydratedItemId = -1; // отдельные id для предзаполненных пунктов (новые карточки используют nextItemId >= 1)

// Пункт детальной карточки (TaskItemResponse) -> карточка конструктора (TaskItemDraft):
// поля механики разбираются из content-JSON, остальное берётся из колонок пункта как есть.
function itemResponseToDraft(item: TaskResponseDto['items'][number]): TaskItemDraft {
    const draft: TaskItemDraft = {
        id: hydratedItemId--,
        itemType: item.itemType,
        prompt: item.prompt ?? '',
        answer: item.correctAnswer ?? '',
        base: '',
        options: '',
        leftLabel: '',
        rightLabel: '',
        explanation: '',
    };

    switch (item.itemType) {
        case 'WORD_FORMATION': {
            const content = parseWordFormationContent(item.content);
            draft.base = content?.base ?? '';
            draft.explanation = content?.explanation ?? '';
            break;
        }
        case 'GAP_FILL': {
            const content = parseGapFillContent(item.content);
            draft.options = (content?.options ?? []).join(', ');
            draft.explanation = content?.explanation ?? '';
            break;
        }
        case 'TFNS': {
            const content = parseWordFormationContent(item.content); // explanation — общее поле контента
            draft.explanation = content?.explanation ?? '';
            // Чипы ответа сверяются с каноническими значениями enum (бэк хранит upper-case).
            const answer = (item.correctAnswer ?? '').toUpperCase();
            draft.answer = TFNS_ANSWERS.includes(answer as (typeof TFNS_ANSWERS)[number]) ? answer : '';
            break;
        }
        case 'MATCHING': {
            const content = parseMatchingContent(item.content);
            draft.leftLabel = content?.left_label ?? '';
            draft.rightLabel = content?.right_label ?? '';
            draft.explanation = content?.explanation ?? '';
            break;
        }
    }

    return draft;
}

/**
 * Детальная карточка задания -> состояние конструктора для режима редактирования.
 * Механика (itemType) берётся из первого пункта: смешанных по механике заданий бэк не создаёт
 * (на форме тип выбирается один раз до конструктора пунктов).
 */
export function taskToFormState(task: TaskResponseDto): CreateTaskFormState {
    const context = parseTaskContext(task.context);
    const sortedItems = [...task.items].sort((a, b) => a.position - b.position);

    return {
        name: task.name ?? '',
        instruction: task.instruction ?? '',
        topicIds: task.topics.map((t) => t.id),
        grammarTypeIds: task.taskTypes.map((t) => t.id),
        itemType: sortedItems[0]?.itemType ?? 'WORD_FORMATION',
        levels: task.levels ?? [],
        examType: task.examType ?? null,
        materialTitle: context?.title ?? '',
        materialText: context?.text ?? '',
        items: sortedItems.map(itemResponseToDraft),
    };
}
