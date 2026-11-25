# FRONTEND CODE STYLE (TutorAI)
Инструкция для ИИ-рефакторинга. Читать сверху вниз. Дерево и таблицы — обязательны к исполнению.

## 0. ЗОЛОТЫЕ ПРАВИЛА (нарушение = переделать)
1. Файл .tsx = ТОЛЬКО JSX + вызовы хуков + минимальные props/state.
    - логика с React (fetch, подписки, эффекты) -> hooks/useX.ts
    - чистые функции без React (формат, подсчёт, маппинг, валидация) -> utils/
2. Типы НЕ объявлять в .tsx. Типы живут в types/ (или в локальном types/ shared-компонента).
   Импорт типов — из barrel types/, а НЕ из файла верстки.
3. Папки lib/ и components/ ЗАПРЕЩЕНЫ. Хелперы -> utils/, компоненты -> ui/.
4. barrel index.ts создаётся ТОЛЬКО в папках, группирующих .ts-файлы
   (types, hooks, services, data, utils). В папках верстки
   (views/widgets/base/layouts) index.ts НЕ создаём — импорт компонента по полному пути.
5. Имя доменной папки = ЕДИНСТВЕННОЕ число = префикс её компонентов:
   student/ -> Student*, teacher/ -> Teacher*, user/ -> User*, auth/ -> Auth*, task/ -> Task*.
   (tasks/ переименовать в task/.)
6. Компонент доменного модуля всегда начинается с префикса модуля. В shared/ — без префикса.
7. Моки запрещены на готовых страницах; временная вёрстка с моками — только под SHOW_TMP_DATA.
8. Импорты вне текущей папки — через алиас @/. Относительные — только внутри одной папки.

## 1. ДЕРЕВО src/
src/
├── main.tsx
├── App.tsx
├── routeTree.gen.ts            # генерируется, НЕ трогать
├── routes/                     # только файлы маршрутов TanStack, тонкие
│   ├── __root.tsx              # guard (loader) + LayoutRoot + <Outlet/>
│   └── *.tsx                   # рендерят view из доменных модулей, логики здесь нет
├── shared/                     # общее между доменами (без префиксов)
│   ├── ui-kit/                 # BaseInputText, BaseInputPassword, Loader...
│   ├── icons/                  # IconHome, IconReports... (size через width/height props)
│   ├── widgets/                # AppBottomNav, AppSidebar...
│   ├── layouts/                # LayoutRoot, AuthTriangleFormLayout...
│   ├── services/               # AuthService (checkSession, refresh, logout)...
│   ├── utils/                  # общие чистые функции
│   └── types/                  # общие типы (кроме доменных)
├── auth/
├── user/                       # здесь живёт UserRole (реэкспорт, НЕ в auth/types)
├── student/
├── teacher/
└── task/                       # было tasks/ -> переименовать

## 2. ДЕРЕВО доменного модуля (пример teacher/; так же student/, auth/, user/, task/)
teacher/
├── hooks/                      # .ts, barrel index.ts
│   ├── useTeacherName.ts
│   ├── useTeacherReports.ts
│   └── index.ts
├── services/                   # .ts, barrel index.ts; путь-константа внутри сервиса
│   ├── TeacherReportsService.ts   # const REPORTS_PATH = '/teacher/reports'
│   └── index.ts
├── types/                      # .ts, barrel ВЛОЖЕННЫЙ (низ -> вверх)
│   ├── models/                 # DTO с бэка (зеркалят Java-DTO)
│   │   ├── teacher-report.ts      # kebab-case
│   │   └── index.ts               # barrel
│   ├── ui/                     # чисто фронт: опции дропдаунов, составные из моделей, Props
│   │   ├── teacher-report-filters.ts
│   │   ├── teacher-home-view.ts   # export type TeacherHomeViewProps
│   │   └── index.ts               # barrel
│   ├── forms.ts                # типы форм (один файл)
│   └── index.ts                # export * from './models'; './ui'; './forms'
├── data/                       # константы/переменные/объекты модуля (БЕЗ функций);
│   ├── nav-items.ts            # моки внутри — только под SHOW_TMP_DATA; barrel
│   └── index.ts
├── utils/                      # чистые функции модуля (без React); barrel
│   ├── format-report.ts
│   └── index.ts
└── ui/                         # 4 папки; НЕТ components/, НЕТ lib/, НЕТ вложенных widgets/
├── views/                  # страницы по URL, суффикс View
│   └── TeacherHomeView/
│       ├── TeacherHomeView.tsx        # БЕЗ index.ts
│       └── TeacherHomeView.module.scss
├── widgets/                # блок С логикой (API/фильтрация/навигация); ВСЕГДА на уровне ui/widgets/, НЕ внутри views/
│   └── TeacherStatCards/
│       ├── TeacherStatCards.tsx       # БЕЗ index.ts
│       └── TeacherStatCards.module.scss
├── base/                   # карточка/чип/прогресс-бар БЕЗ логики
│   └── TeacherAssignmentItem/
│       ├── TeacherAssignmentItem.tsx
│       └── TeacherAssignmentItem.module.scss
└── layouts/                # обёртка/сетка/шаблон БЕЗ логики, суффикс Layout
└── TeacherDashboardLayout/
├── TeacherDashboardLayout.tsx
└── TeacherDashboardLayout.module.scss

# Примечания к дереву:
# - Вложенные widgets/ внутри views/ ЗАПРЕЩЕНЫ. Все виджеты — только в ui/widgets/ модуля.
# - shared-компонент со своими типами/данными: shared/widgets/AppBottomNav/
#   содержит AppBottomNav.tsx + types/ + data/ (types/ и data/ имеют barrel, корень папки — нет).

## 3. КУДА ПОЛОЖИТЬ КОМПОНЕНТ (решать по таблице, не на глаз)
| Что это                                  | Куда                         | Суффикс/префикс            |
|------------------------------------------|------------------------------|----------------------------|
| страница по URL                          | ui/views/                    | View                       |
| блок, который дергает API / фильтрует /  | ui/widgets/                  | префикс домена             |
|   навигирует / имеет бизнес-логику        |                              |                            |
| переиспользуемая карточка/чип/бар БЕЗ    | ui/base/                     | Item/Bar/Chip + префикс    |
|   логики                                 |                              |                            |
| переиспользуемая обёртка/сетка/шаблон    | ui/layouts/                  | Layout                     |
| инпут/кнопка/универсальный атом          | shared/ui-kit/               | без префикса               |
| иконка                                   | shared/icons/                | Icon + без префикса        |
| глобальный виджет (нижняя навигация)     | shared/widgets/              | без префикса               |
# Разграничения:
# - переиспользуется ТОЛЬКО вёрстка -> layouts, а не widgets.
# - есть логика/фильтрация -> widgets, а не base.
# - если только вёрстка переиспользуется между доменами -> shared/layouts.

## 4. ИМЕНОВАНИЕ (по типу файла)
| Тип файла            | Регистр        | Пример                       | barrel? |
|----------------------|----------------|------------------------------|---------|
| компонент .tsx       | PascalCase     | TeacherHomeView.tsx          | нет     |
| стиль .module.scss   | PascalCase     | TeacherHomeView.module.scss  | нет     |
| хук .ts              | camelCase useX | useTeacherReports.ts         | да      |
| сервис .ts           | PascalCase     | TeacherReportsService.ts     | да      |
| тип .ts              | kebab-case     | teacher-report.ts            | да      |
| утилита .ts          | kebab-case     | format-report.ts             | да      |
| данные/конфиг .ts    | kebab-case     | nav-items.ts                 | да      |
| константы-значения   | UPPER_SNAKE    | REPORTS_PATH, SHOW_TMP_DATA  | —       |
| тип пропсов          | PascalCase     | TeacherHomeViewProps         | —       |

## 5. ИМПОРТ / ЭКСПОРТ
- Компонент: import { TeacherHomeView } from '@/teacher/ui/views/TeacherHomeView/TeacherHomeView.tsx'
  (полный путь С расширением .tsx, БЕЗ barrel в папке верстки).
- Тип: import type { TeacherReport } from '@/teacher/types'  (через barrel types/).
  UserRole: import type { UserRole } from '@/user/types' (владелец домена — user, не auth).
- Хук/сервис/утилита: через barrel модуля (import { useTeacherName } from '@/teacher/hooks').
- Внутри одной папки — относительный путь; всё остальное — @/.
- Циклических импортов типов избегать: тип живёт у владельца домена.
- Расширение .tsx обязательно при импорте компонентов из папок views/widgets/base/layouts.
  Расширение .ts при импорте из barrel (types, hooks, services, utils, data) НЕ указывается.

## 6. ДАННЫЕ И СОСТОЯНИЕ
- data/: константы, переменные, объекты модуля. БЕЗ функций (функции -> utils/).
  Моки внутри data/ — только под SHOW_TMP_DATA.
- SHOW_TMP_DATA=true -> показывать мок из data/, false -> скрывать до реализации.
- Роли и id брать из токена/сервиса; отдельных эндпоинтов «узнать свою роль» нет.
- Глобальные элементы (AppBottomNav) — в LayoutRoot, активный пункт через useLocation.

## 7. СТИЛИ И UI-KIT
- Стили только CSS-модули (*.module.scss), после рефакторинга удалять неиспользуемые правила.
- Темовые переменные: --p, --pd, --bg, --c1, --c3, --r. Палитры страниц/макетов унифицированы.
- Все инпуты — из shared/ui-kit (BaseInputText, BaseInputPassword). Ошибку поля рендерит сам
  инпут; серверные ошибки — в слот notice лэйаута. Плейсхолдеры на русском.
- Размер иконок — только пропсами width/height (со значениями по умолчанию).

## 8. РОУТИНГ И GUARD
- Единый guard в loader __root.tsx: нет сессии -> /auth/login; есть сессия + любой /auth* -> /;
  на / рендер по роли (учитель -> TeacherHomeView, иначе -> StudentHomeView).
- Локальные дублирующие редиректы в страницах запрещены.
- Проверка сессии при входе — AuthService.checkSession() (валидация + refresh).
- Пути фронта зеркалят зоны API бэка (/teacher/** -> фронтовый /teacher/reports).

## 9. ЧЕК-ЛИСТ ПЕРЕД СОЗДАНИЕМ ФАЙЛА (проходить по пунктам)
1. Это компонент или хук/сервис/тип/утилита/данные?
2. Компонент? -> есть префикс домена (или это shared без префикса)? верный суффикс
   (View/Layout/Item/Widget)?
3. Компонент? -> положить в ui/{views,widgets,base,layouts}/<Name>/<Name>.tsx + .module.scss,
   index.ts НЕ создавать. Виджеты — ТОЛЬКО в ui/widgets/ модуля, НЕ внутри views/.
4. Тип? -> DTO бэка в types/models/, фронт-тип/Props в types/ui/, форма в types/forms.ts;
   kebab-case; barrel на месте; НЕ объявлять в .tsx.
5. Есть логика с React? -> hooks/useX.ts. Чистая функция? -> utils/. Константа/объект? -> data/.
6. Импорт вне папки через @/; типы через barrel types/;
   импорт компонента — с расширением .tsx (например, '@/teacher/ui/views/.../View.tsx').
7. Нет lib/, нет components/, нет вложенных widgets/, нет моков вне SHOW_TMP_DATA,
   нет папки во множественном числе.

## 10. АНТИПАТТЕРНЫ (так НЕ делать)
- ❌ fetch/useEffect в теле компонента.  ✅ useTeacherReports() в hooks/.
- ❌ interface Props внутри .tsx.        ✅ types/ui/teacher-home-view.ts.
- ❌ student/ui/components/...          ✅ student/ui/widgets/ или base/.
- ❌ student/lib/format.ts              ✅ student/utils/format.ts.
- ❌ views/HomeworkView/index.ts        ✅ импорт по полному пути, barrel только для .ts-папок.
- ❌ tasks/                             ✅ task/.
- ❌ ReportTaskPreview в teacher/       ✅ TeacherReportTaskPreview (префикс домена).
- ❌ import { UserRole } from '@/auth/types'  ✅ from '@/user/types'.
- ❌ самодельная обёртка ответа { success, data }  ✅ чистый DTO, зеркалящий Java-DTO.
- ❌ widgets/ внутри views/             ✅ все виджеты в ui/widgets/ модуля.
- ❌ функции в data/                    ✅ функции в utils/, в data/ только константы/объекты.
- ❌ import { View } from '@/teacher/ui/views/View' (без расширения) ✅ import { View } from '@/teacher/ui/views/View/View.tsx' (с .tsx)