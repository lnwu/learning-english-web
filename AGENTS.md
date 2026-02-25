# AGENTS.md - Learning English Web

本文件包含 AI 代理在 `learning-english-web` 模块中工作时必须遵守的规则。

---

## 项目概述

英语词汇学习 Web 应用，用户通过 Google 登录后可添加单词、练习拼写、查看掌握度统计。

## 技术栈

| 类别     | 技术                                               |
| -------- | -------------------------------------------------- |
| 框架     | Next.js 16（App Router）+ React 19                 |
| 语言     | TypeScript（strict 模式）                          |
| 认证     | NextAuth.js v5（Auth.js）— Google OAuth            |
| 状态管理 | MobX（`makeAutoObservable`）+ React Hooks          |
| 数据存储 | Firebase Firestore（主存储）+ localStorage（遗留） |
| 样式     | Tailwind CSS v4 + Radix UI + shadcn/ui（new-york） |
| 测试     | Playwright（E2E）                                  |
| 部署     | Vercel                                             |
| 包管理   | npm                                                |

## 目录结构

```
learning-english-web/
├── src/
│   ├── app/                  # Next.js App Router 页面
│   │   ├── layout.tsx        # 根布局（SessionProvider、Header、Toaster）
│   │   ├── page.tsx          # 根路由重定向到 /home
│   │   ├── home/             # 练习页
│   │   ├── add-word/         # 添加单词页
│   │   ├── profile/          # 个人资料 & 统计页
│   │   ├── login/            # 登录页
│   │   └── api/auth/         # NextAuth API 路由
│   ├── components/
│   │   ├── auth/             # 认证相关组件（UserMenu）
│   │   └── ui/               # UI 基础组件（shadcn/ui）
│   ├── hooks/
│   │   ├── useFirestoreWords.ts  # Firestore 实时同步 + 离线队列（主 hook）
│   │   ├── useWords.ts           # localStorage 遗留版本
│   │   ├── useLocale.ts          # 国际化
│   │   └── useToast.ts           # Toast 通知
│   └── lib/
│       ├── firebase.ts           # Firebase 初始化 & 匿名认证
│       ├── masteryCalculator.ts  # 掌握度算法
│       ├── syncQueue.ts          # 离线同步队列
│       ├── migrateLocalData.ts   # localStorage → Firestore 迁移
│       ├── i18n.ts               # 国际化工具
│       └── utils.ts              # 通用工具（cn 等）
├── docs/                     # 项目文档
├── e2e/                      # Playwright E2E 测试
├── next.config.ts
├── tsconfig.json
├── eslint.config.mjs
├── playwright.config.ts
├── components.json           # shadcn/ui 配置
└── package.json
```

## 强制规则

### 1. 代码风格

- 使用 TypeScript，启用严格模式，不使用 `any`。
- 组件使用函数式组件 + `FC` 类型。
- 客户端组件必须在文件顶部标注 `"use client"`。
- 路径别名统一使用 `@/*`（映射到 `src/*`）。
- 提交前确保 `npm run lint` 通过。

### 2. 状态管理

- 核心状态使用 MobX（`Words` 类 + `makeAutoObservable`）。
- 新增功能优先使用 `useFirestoreWords` hook，`useWords` 仅作遗留兼容。
- MobX Store 为模块级单例，不要在 hook 内部重复创建。

### 3. 数据层

- Firestore 数据路径：`/users/{userEmail}/words/{wordId}`。
- 练习记录变更通过 `SyncQueueManager` 本地队列缓冲，定时批量同步到 Firestore。
- 新增单词直接写入 Firestore（不经过队列）。
- 离线数据迁移逻辑在 `migrateLocalData.ts`，仅在检测到遗留 localStorage 数据时触发。

### 4. UI 组件

- 基础 UI 组件使用 shadcn/ui（`components/ui/`），样式为 `new-york`。
- 新增 shadcn 组件通过 `npx shadcn@latest add <component>` 安装。
- 样式使用 Tailwind CSS v4 工具类，避免自定义 CSS。
- 使用 `cn()` 工具函数合并 class。

### 5. 认证

- 认证使用 NextAuth.js v5（`src/auth.ts`），仅支持 Google Provider。
- 受保护页面通过 `auth()` 服务端函数获取 session。
- 客户端使用 `useSession()` 获取用户信息。
- 用户以 email 作为 Firestore 的 userId。

### 6. 环境变量

- 客户端变量以 `NEXT_PUBLIC_` 前缀命名。
- 服务端变量：`AUTH_SECRET`、`AUTH_GOOGLE_ID`、`AUTH_GOOGLE_SECRET`。
- 不得在代码中硬编码任何密钥或敏感信息。

### 7. 测试

- E2E 测试使用 Playwright，测试文件放在 `e2e/` 目录。
- 运行命令：`npm run test:e2e`。

### 8. 新页面 / 路由

- 遵循 Next.js App Router 约定，在 `src/app/<route>/page.tsx` 创建。
- 页面默认为 Server Component，需要交互时添加 `"use client"`。

## 常用命令

```bash
npm run dev          # 开发服务器
npm run build        # 生产构建
npm run start        # 启动生产服务器
npm run lint         # ESLint 检查
npm run lint:fix     # ESLint 自动修复
npm run test:e2e     # Playwright E2E 测试
```
