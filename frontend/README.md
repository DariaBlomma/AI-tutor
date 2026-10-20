# TutorAI Frontend

Стек: React 18 + TypeScript + Vite + SCSS (CSS Modules) + ESLint + React Router.

## Запуск

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # tsc -b && vite build
npm run lint     # eslint .
```

Backend (Spring Boot, порт 8080, context-path `/api`) проксируется Vite:
запросы на `/api/*` идут на `http://localhost:8080` (см. `vite.config.ts`).

## Структура (feature-based)

```
src/
├── app/                    # инициализация приложения
│   ├── main.tsx            # точка входа
│   ├── App.tsx             // BrowserRouter
│   ├── router/index.tsx    # маршруты: view доступен по роуту
│   └── styles/             # глобальные SCSS (_variables.scss, global.scss)
├── shared/                 # переиспользуемый код
│   ├── api/client.ts       # fetch-клиент, разбор ErrorResponse бэкенда
│   ├── lib/validation.ts   # правила валидации (как в SignUpRequest)
│   └── ui/TrapezoidButton/ # общий UI-виджет (кнопка-трапеция)
└── features/auth/          # модуль авторизации
    ├── api/signUpApi.ts    # POST /api/auth/signup
    ├── model/
    │   ├── types/          # UserRole, SignUpPayload, AuthResponse (зеркало DTO)
    │   └── hooks/useRegisterForm.ts  # состояние формы, валидация, отправка
    ├── ui/                 # widgets/view-компоненты фичи
    │   ├── RoleSwitch/     # треугольник-переключатель Учитель/Ученик
    │   └── TriangleForm/   # каркас из двух треугольников + поля
    └── views/              # то, что доступно по роуту
        └── RegisterPage/   # /auth/register
```

Правило зависимостей: `views → ui/model/api → shared`, `app → features`.
Стили — только CSS Modules (`*.module.scss`), глобальные переменные в `app/styles/_variables.scss`.
