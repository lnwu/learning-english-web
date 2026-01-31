# AGENTS.md - Web Application Module

本文件包含 AI agents 处理 **learning-english-web** 模块时的上下文和补充规则。

## 基础规则继承

通用强制规则继承自根目录 [`../AGENTS.md`](../AGENTS.md)：
- Context7 Usage（强制）
- Code Generation Rules（强制）
- Agent Skill 安装规范

---

## 模块特定上下文

### Technology Stack

| Category         | Technology                                    |
| ---------------- | ----------------------------------------------- |
| Framework        | Next.js 15 (App Router)                         |
| Language         | TypeScript 5.9 (strict mode)                    |
| UI Library       | React 19                                        |
| Styling          | Tailwind CSS v4                                 |
| State Management | MobX + mobx-react-lite                          |
| Authentication   | NextAuth.js v5 (Auth.js) with Google OAuth      |
| UI Components    | Radix UI primitives                             |
| Icons            | Lucide React                                    |
| Cloud Storage    | Firebase Firestore                              |
| Analytics        | Vercel Analytics                                |
| Build Tool       | Turbopack (dev), Next.js build (prod)           |

### Directory Structure

```
learning-english-web/
├── src/
│   ├── app/                    # Next.js App Router pages
│   ├── components/             # React components
│   ├── hooks/                  # Custom React hooks
│   └── lib/                    # Utility functions
├── docs/                       # Documentation
├── public/                     # Static assets
└── e2e/                        # Playwright tests
```

### Development Commands

```bash
npm run dev              # Development (Turbopack)
npm run build            # Production build
npm run lint             # ESLint
npm run test:e2e         # Playwright tests
```

### Environment Variables

Required in `.env.local`:

```bash
AUTH_SECRET=
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
```

### Context7 特别提示

涉及以下场景时必须调用 Context7：
- `package.json` 中的依赖版本
- Next.js 15、React 19、TypeScript 5.9 相关 API
- NextAuth.js v5 配置和 API
- Firebase Firestore SDK
- Tailwind CSS v4 新特性

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
2. **React**: Functional components; `"use client"` for interactivity
3. **State**: MobX for global; hooks for local
4. **Styling**: Tailwind CSS utility classes
5. **Imports**: Use `@/` path aliases

### Documentation

- `docs/ARCHITECTURE.md` - Technical architecture
- `docs/FIREBASE_IMPLEMENTATION_GUIDE.md` - Firestore setup
- `docs/MIGRATION_GUIDE.md` - Data migration
- `docs/GOOGLE_OAUTH_SETUP.md` - OAuth configuration
