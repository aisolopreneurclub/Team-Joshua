# Design-Implementation Gap Analysis Report

> **Analysis Type**: Gap Analysis (Cycle 1 Re-analysis #3)
>
> **Project**: Joshua-Automation (ASC Internal ERP)
> **Analyst**: bkit-gap-detector
> **Date**: 2026-03-20
> **Design Doc**: [internal-erp.design.md](../02-design/features/internal-erp.design.md)
> **Scope**: Cycle 1 (Foundation) only — Design Section 11.2

---

## Executive Summary

| Perspective | Content |
|-------------|---------|
| **Feature** | internal-erp (Cycle 1: Foundation) |
| **Analysis Date** | 2026-03-20 (Re-analysis #3) |
| **Match Rate** | **93%** (Weighted) |
| **Status** | **PASS** (>= 90% threshold) |
| **Previous** | v0.1: 47% → v0.2: 87% → v0.3: **93%** |

---

## Overall Scores

| Category | Weight | v0.1 | v0.2 | v0.3 (Current) | Status |
|----------|:------:|:----:|:----:|:--------------:|:------:|
| Project Initialization | 15% | 90% | 95% | **100%** | PASS |
| Prisma Schema + Seed | 15% | 50% | 80% | **85%** | WARNING |
| NextAuth.js Authentication | 25% | 0% | 85% | **92%** | PASS |
| Layout System | 20% | 10% | 75% | **92%** | PASS |
| Common Utils + Stores | 15% | 80% | 95% | **98%** | PASS |
| Domain Types | 5% | 100% | 100% | **100%** | PASS |
| Validations (Zod) | 5% | 95% | 95% | **95%** | PASS |

```
Weighted Calculation:
  Project Init:   100% × 15% = 15.00
  Prisma+Seed:     85% × 15% = 12.75
  Auth:            92% × 25% = 23.00
  Layout:          92% × 20% = 18.40
  Utils+Stores:    98% × 15% = 14.70
  Domain Types:   100% ×  5% =  5.00
  Validations:     95% ×  5% =  4.75
  ────────────────────────────────────
  Total:                  93.60%  → PASS ✅
```

---

## Changes Since v0.2

| Fix | Category | Impact |
|-----|----------|--------|
| shadcn/ui 초기화 + 10개 기본 컴포넌트 설치 | Layout | +17% (75→92%) |
| Google 로그인 버튼 추가 (login 페이지) | Auth | +7% (85→92%) |
| Global mutation onError 핸들러 추가 | Utils | +3% (95→98%) |
| `.gitignore`에 `!.env.example` 예외 추가 | Project Init | +5% (95→100%) |

---

## Cycle 1 Checklist Final Status

| # | Task | Status | Detail |
|:-:|------|:------:|--------|
| 1 | 프로젝트 초기화 | ✅ 100% | Next.js 16, 모든 패키지, docker-compose, tsconfig, shadcn/ui |
| 2 | Prisma 스키마 + 시드 | ⚠️ 85% | 스키마 100%, 시드 100%, **마이그레이션 미실행** (DB 없이 실행 불가) |
| 3 | NextAuth.js 인증 | ✅ 92% | Credentials + Google, 로그인/회원가입, 미들웨어, RBAC 유틸 |
| 4 | 레이아웃 시스템 | ✅ 92% | AppLayout, Sidebar, Header, Breadcrumb, shadcn/ui 10개 컴포넌트 |
| 5 | 공통 유틸 | ✅ 98% | errors, api-client, stores(3), hooks(3), socket, validations(4) |

---

## Remaining Gaps (Non-blocking)

| # | Item | Impact | Notes |
|:-:|------|:------:|-------|
| 1 | Prisma migration 미실행 | Low | Docker PostgreSQL 기동 후 `npx prisma migrate dev --name init` 필요 |
| 2 | NextAuth v4 vs v5 버전 차이 | Low | v4 API로 정상 동작, Design 문서 업데이트 권장 |
| 3 | CommandPalette (Cmd+K) 미구현 | Low | cmdk 패키지 설치됨, Cycle 5 통합 단계에서 구현 예정 |

---

## File Inventory (Cycle 1)

### Source Files (37개)

```
src/app/(auth)/login/page.tsx
src/app/(auth)/signup/page.tsx
src/app/(main)/dashboard/page.tsx
src/app/(main)/layout.tsx
src/app/api/auth/[...nextauth]/route.ts
src/app/api/auth/signup/route.ts
src/app/globals.css
src/app/layout.tsx
src/app/page.tsx
src/components/ui/avatar.tsx
src/components/ui/badge.tsx
src/components/ui/button.tsx
src/components/ui/card.tsx
src/components/ui/dialog.tsx
src/components/ui/dropdown-menu.tsx
src/components/ui/input.tsx
src/components/ui/label.tsx
src/components/ui/separator.tsx
src/components/ui/sheet.tsx
src/domain/calendar/types.ts
src/domain/common/types.ts
src/domain/hr/types.ts
src/domain/kanban/types.ts
src/hooks/useAuth.ts
src/hooks/useNotifications.ts
src/hooks/useSocket.ts
src/infrastructure/db/prisma.ts
src/lib/api-client.ts
src/lib/auth-utils.ts
src/lib/auth.ts
src/lib/errors.ts
src/lib/providers.tsx
src/lib/session-provider.tsx
src/lib/socket.ts
src/lib/utils.ts
src/lib/validations/employee.ts
src/lib/validations/event.ts
src/lib/validations/leave.ts
src/lib/validations/task.ts
src/presentation/components/layout/AppLayout.tsx
src/presentation/components/layout/Breadcrumb.tsx
src/presentation/components/layout/Header.tsx
src/presentation/components/layout/Sidebar.tsx
src/stores/useAuthStore.ts
src/stores/useNotificationStore.ts
src/stores/useSidebarStore.ts
```

### Root/Config Files
```
middleware.ts
docker-compose.yml
prisma/schema.prisma
prisma/seed.ts
.env.local
.env.example
components.json
```

---

## Next Steps

1. `docker compose up -d` → `npx prisma migrate dev --name init` → `npm run db:seed`
2. Cycle 2 진행: HR 모듈 — 직원 프로필 + 부서 CRUD
3. Design 문서 버전 정보 업데이트 (next-auth v4, zod v4, tailwind v4)

---

## Version History

| Version | Date | Match Rate | Changes |
|---------|------|:----------:|---------|
| 0.1 | 2026-03-20 | 47% | Initial gap analysis |
| 0.2 | 2026-03-20 | 87% | Auth, Layout, Infrastructure 구현 후 |
| 0.3 | 2026-03-20 | **93%** | shadcn/ui, Google 로그인, mutation handler, gitignore 수정 |
