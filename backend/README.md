# AI Tutor Platform — Backend

Java 21 · Spring Boot · Maven · PostgreSQL · Liquibase.

## Формат контента заданий (task_items.content и tasks.context)

Задание (`tasks`) состоит из пунктов (`task_items`). Контент пункта хранится в JSONB-колонке `content`,
общий материал задания — в `tasks.context`. Структура **строго фиксирована** и проверяется на бэкенде
(`TaskContentValidator`): неизвестные поля и некорректные значения отклоняются с `400 Bad Request`.

Порядок пунктов фиксируется один раз при сохранении (в том порядке, в котором учитель ввёл задание)
и далее нигде не меняется. Отдельное поле `position` через интерфейс не редактируется.

### Поддерживаемые типы пунктов (item_type)

| Тип | prompt | correctAnswer | content |
|---|---|---|---|
| `WORD_FORMATION` | обязателен, содержит пропуск `___` | обязателен | опционально: `{base, explanation}` |
| `GAP_FILL` | обязателен, содержит пропуск `___` | обязателен | опционально: `{options[], explanation}` |
| `TFNS` | обязателен — текст утверждения | обязателен: `TRUE` / `FALSE` / `NOT STATED` | опционально: `{explanation}` |
| `MATCHING` | опционален (подсказка) | **не используется** | **обязателен**: `{left_label, right_label, explanation?}` |

> Для TFNS и MATCHING задание **обязано** иметь материал в `tasks.context` (см. ниже).

### WORD_FORMATION (словообразование)

Учитель вводит предложение целиком, слово в скобках — база для преобразования; ответ — под номером.

```json
{
  "itemType": "WORD_FORMATION",
  "prompt": "She is a very ___ (KIND) person.",
  "correctAnswer": "KINDNESS",
  "content": "{\"base\": \"KIND\", \"explanation\": \"Суффикс -ness образует существительное\"}"
}
```

Поля `content`: `base` — обязательная непустая строка (слово из скобок), `explanation` — необязательная строка.

### GAP_FILL (грамматический пропуск, опционально с выбором из опций)

```json
{
  "itemType": "GAP_FILL",
  "prompt": "He ___ (go) to school every day.",
  "correctAnswer": "GOES",
  "content": "{\"options\": [\"GO\", \"GOES\", \"WENT\"], \"explanation\": \"Present Simple, 3-е лицо\"}"
}
```

Поля `content`: `options` — необязательный непустой массив строк (если есть — ученик выбирает из них),
`explanation` — необязательная строка.

### TFNS (True / False / Not stated)

Материал (текст или аудио) лежит в `tasks.context`, каждое утверждение — отдельный пункт, текст утверждения — в `prompt`.

```json
{
  "itemType": "TFNS",
  "prompt": "The author travelled to Italy by train.",
  "correctAnswer": "NOT STATED",
  "content": null
}
```

`correctAnswer` — только `TRUE`, `FALSE` или `NOT STATED` (регистр не важен, нормализуется).

### MATCHING (соединение заголовков/фрагментов)

**Одна пара = один пункт** (это даёт статистику по каждому соединению). Правильная пара хранится в `content`.

```json
{
  "itemType": "MATCHING",
  "prompt": null,
  "correctAnswer": null,
  "content": "{\"left_label\": \"1. A difficult start\", \"right_label\": \"C. The journey began with a breakdown\"}"
}
```

Левые части берутся учителем из `content.left_label`, правые (перемешанные) — из всех пар задания.
`correctAnswer` для matching запрещён (эталон — сама пара).

### tasks.context (общий материал задания)

Обязателен, если в задании есть хотя бы один пункт TFNS или MATCHING. Формат:

```json
{ "type": "TEXT",  "title": "A Journey by Train", "text": "Полный текст материала..." }
```

```json
{ "type": "AUDIO", "title": "Listening 1", "url": "https://.../track.mp3" }
```

* `type` — `"TEXT"` или `"AUDIO"` (обязательно);
* для `TEXT` обязателен непустой `text`, опционален `title`;
* для `AUDIO` обязателен непустой `url`, опционален `title`.

Для заданий без материала (чистый word formation / gap fill) `context = null`.

### Превью в списке банка заданий

При создании/обновлении задания бэкенд генерирует и сохраняет `tasks.preview_text`:
первые до 3 пунктов — предложения с `___` (WORD_FORMATION/GAP_FILL), утверждения (TFNS)
или левые части пар (MATCHING), каждая строка обрезается до 120 символов.
В лёгком списке (`GET /api/tasks`) отдаётся только мета: `publicId`, `name`, `previewText`,
`isMixed`, топики, типы заданий, число пунктов — без контента. Полный контент — в `GET /api/tasks/{id}`.
