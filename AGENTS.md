# AGENTS.md - Web Application Module

This file contains mandatory rules and context for AI agents working on the **learning-english-web** Next.js application.

## Mandatory Rules

### 1. Context7 Usage (Mandatory)

涉及以下任何情况时，**必须**先调用 Context7 工具，不得凭记忆假设：

| 场景          | 必须检查 | 示例                               |
| ------------- | -------- | ---------------------------------- |
| 版本号约束    | ✅       | `package.json` 中的依赖版本        |
| 第三方库导入  | ✅       | `import { x } from "library"`      |
| API 调用      | ✅       | 外部服务接口、SDK                  |
| 配置文件      | ✅       | `next.config.ts`、`tsconfig.json`  |

### 2. Code Generation Rules

生成**所有代码文件**时禁止添加任何注释，包括：

- ❌ 行内注释：`// 这是注释`
- ❌ 块注释：`/* ... */`
- ❌ 文档注释：`/** ... */`、`/// ...`
- ❌ 行尾注释：`code // 注释`

**适用范围**：`.ts` `.tsx` `.js` `.jsx` 等所有代码文件

**例外情况**：用户明确要求添加注释时 ✅

---

## Module Context

### Technology Stack

| Category         | Technology                                    |
| ---------------- | --------------------------------------------- |
| Framework        | Next.js 15 (App Router)                       |
| Language         | TypeScript 5.9 (strict mode)                  |
| UI Library       | React 19                                      |
| Styling          | Tailwind CSS v4                               |
| State Management | MobX + mobx-react-lite                        |
| Authentication   | NextAuth.js v5 (Auth.js) with Google OAuth    |
| UI Components    | Radix UI primitives                           |
| Icons            | Lucide React                                  |
| Cloud Storage    | Firebase Firestore                            |
| Analytics        | Vercel Analytics                              |
| Build Tool       | Turbopack (dev), Next.js build (prod)         |

### Directory Structure

```
learning-english-web/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── layout.tsx          # Root layout with auth provider
│   │   ├── page.tsx            # Root redirect
│   │   ├── home/               # Practice page (main feature)
│   │   ├── add-word/           # Add new words page
│   │   ├── profile/            # User profile & stats
│   │   ├── login/              # Authentication page
│   │   └── api/auth/           # NextAuth API routes
│   ├── components/
│   │   ├── auth/               # Auth components
│   │   └── ui/                 # UI primitives
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Utility functions
│   └── proxy.ts                # API proxy utilities
├── docs/                       # Documentation
├── public/                     # Static assets
└── e2e/                        # Playwright tests
```

### Development Commands

```bash
# Development (with Turbopack)
npm run dev

# Production build
npm run build

# Start production server
npm run start

# Linting
npm run lint
npm run lint:fix

# E2E Testing (Playwright)
npm run test:e2e
npm run test:e2e:ui
npm run test:e2e:headed
```

### Environment Variables

Required in `.env.local`:

```bash
# NextAuth
AUTH_SECRET=
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=

# Firebase (NEXT_PUBLIC_ prefixed for client access)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
```

### External APIs

| API                  | Purpose                          |
| -------------------- | -------------------------------- |
| Dictionary API       | Word validation & definitions    |
| Google Translate API | Chinese translations             |
| Web Speech API       | Text-to-speech pronunciation     |

### Firestore Data Schema

```typescript
interface WordData {
  word: string;
  translation: string;
  correctCount: number;
  totalAttempts: number;
  inputTimes: number[];
  lastPracticedAt: Date | null;
  createdAt: Date;
  id: string;
}
```

### Development Conventions

1. **TypeScript**: Strict mode; avoid `any` type
2. **React**: Functional components with hooks; `"use client"` for interactivity
3. **State Management**: MobX for global state; React hooks for local state
4. **Styling**: Tailwind CSS utility classes
5. **Components**: Small, focused components
6. **Imports**: Use `@/` path aliases

### Documentation

- `docs/ARCHITECTURE.md` - Technical architecture
- `docs/FIREBASE_IMPLEMENTATION_GUIDE.md` - Firestore setup
- `docs/MIGRATION_GUIDE.md` - LocalStorage to Firestore migration
- `docs/GOOGLE_OAUTH_SETUP.md` - Google OAuth configuration
