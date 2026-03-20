# Internal ERP System Planning Document

> **Summary**: 사내 ERP 시스템 구축 - HR, 캘린더 연동, 칸반보드 기반 업무 트래킹 + AI 듀얼 에이전트 자율 개발 시스템
>
> **Project**: Joshua-Automation (ASC Internal ERP)
> **Author**: ASC Team
> **Date**: 2026-03-20
> **Status**: Draft

---

## Executive Summary

| Perspective | Content |
|-------------|---------|
| **Problem** | 사내 HR 관리, 일정 관리, 업무 트래킹이 각각 분리된 도구에서 운영되어 업무 효율이 떨어지고 정보 파편화가 발생함 |
| **Solution** | HR + 캘린더 + 칸반보드 통합 ERP + AI 듀얼 에이전트(팀장/직원)가 자율적으로 개발-리뷰-완성하는 무인 개발 파이프라인 |
| **Function/UX Effect** | 사람 개입 없이 AI 직원이 구현하고 AI 팀장이 회사 기준으로 리뷰하여 최종 완성물이 자동 생산됨 |
| **Core Value** | 개발 인력 없이도 사내 ERP를 자율 구축하고 지속적으로 개선하는 AI-Native 개발 체계 확립 |

---

## 1. Overview

### 1.1 Purpose

사내 업무 프로세스를 하나의 플랫폼에서 관리할 수 있는 통합 ERP 시스템을 구축한다. HR(인사관리), 캘린더(일정관리), 칸반보드(업무 트래킹) 세 가지 핵심 모듈을 통합하여 직원과 관리자 모두의 업무 효율을 높인다.

### 1.2 Background

- 현재 HR 정보는 스프레드시트 또는 별도 시스템으로 관리 중
- 일정 관리와 업무 할당이 분리되어 정보 동기화가 어려움
- 팀원 간 업무 현황 파악이 실시간으로 불가능
- 스크린샷에서 보이는 에이전트 대시보드와 유사한 형태의 통합 관리 UI가 필요

### 1.3 Related Documents

- Requirements: 이 문서
- References: 스크린샷 참고 (에이전트 대시보드 UI 레퍼런스)

---

## 2. Scope

### 2.1 In Scope

- [ ] **HR 모듈**: 직원 프로필, 조직도, 근태관리, 휴가관리, 급여 정보 조회
- [ ] **캘린더 모듈**: 개인/팀 캘린더, Google Calendar 연동, 일정 공유, 회의실 예약
- [ ] **칸반보드 모듈**: 프로젝트별 보드, 태스크 생성/할당/상태관리, 드래그앤드롭
- [ ] **대시보드**: 통합 홈 화면 (오늘 일정, 내 태스크, 팀 현황 요약)
- [ ] **사용자 인증**: 사내 계정 기반 로그인 (SSO 고려)
- [ ] **권한 관리**: 역할 기반 접근 제어 (Admin, Manager, Employee)
- [ ] **알림 시스템**: 태스크 할당, 일정 알림, HR 공지
- [ ] **AI 듀얼 에이전트 시스템**: 오픈클로 기반 팀장봇 + 직원봇 자율 개발 파이프라인

### 2.2 Out of Scope

- 회계/재무 관리 모듈 (향후 확장)
- 외부 고객 관리 (CRM)
- 모바일 네이티브 앱 (1차: 반응형 웹)
- ERP 데이터 마이그레이션 도구

---

## 3. Requirements

### 3.1 Functional Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| **HR 모듈** | | | |
| FR-01 | 직원 프로필 CRUD (이름, 부서, 직급, 연락처, 입사일) | High | Pending |
| FR-02 | 조직도 트리 뷰 표시 | Medium | Pending |
| FR-03 | 근태 관리 (출퇴근 기록, 초과근무) | High | Pending |
| FR-04 | 휴가 신청/승인 워크플로우 | High | Pending |
| FR-05 | 급여 명세서 조회 (읽기 전용) | Medium | Pending |
| **캘린더 모듈** | | | |
| FR-06 | 개인 캘린더 일정 CRUD | High | Pending |
| FR-07 | 팀 캘린더 뷰 (월/주/일) | High | Pending |
| FR-08 | Google Calendar 양방향 동기화 | High | Pending |
| FR-09 | 회의실 예약 시스템 | Medium | Pending |
| FR-10 | 일정 초대 및 참석 확인 | Medium | Pending |
| **칸반보드 모듈** | | | |
| FR-11 | 프로젝트별 칸반보드 생성/관리 | High | Pending |
| FR-12 | 태스크 생성 (제목, 설명, 담당자, 마감일, 우선순위) | High | Pending |
| FR-13 | 드래그앤드롭으로 상태 변경 (To Do → In Progress → Done) | High | Pending |
| FR-14 | 태스크 필터링/검색 (담당자, 마감일, 우선순위) | Medium | Pending |
| FR-15 | 태스크 코멘트 및 첨부파일 | Medium | Pending |
| **공통** | | | |
| FR-16 | 사용자 인증 (이메일/비밀번호 + SSO) | High | Pending |
| FR-17 | 역할 기반 권한 관리 (Admin/Manager/Employee) | High | Pending |
| FR-18 | 통합 대시보드 (오늘 일정, 내 태스크, 팀 현황) | High | Pending |
| FR-19 | 실시간 알림 (웹 푸시 + 인앱) | Medium | Pending |
| FR-20 | 활동 로그 / 감사 추적 | Low | Pending |
| **AI 듀얼 에이전트 시스템** | | | |
| FR-21 | 직원봇 퍼소나 정의 및 구현 지시 수행 | High | Pending |
| FR-22 | 팀장봇 퍼소나 정의 및 코드 리뷰/승인 | High | Pending |
| FR-23 | 봇 간 자율 티키타카 루프 (구현→리뷰→수정→재리뷰→승인) | High | Pending |
| FR-24 | 회사 코딩 컨벤션/품질 기준 팀장봇 주입 | High | Pending |
| FR-25 | 작업 완료 시 사람에게 최종 알림 (Slack/이메일) | Medium | Pending |
| FR-26 | 티키타카 이력 로그 저장 (누가 뭘 지시/수정했는지) | Medium | Pending |
| FR-27 | 최대 반복 횟수 제한 (무한 루프 방지) | High | Pending |

### 3.2 Non-Functional Requirements

| Category | Criteria | Measurement Method |
|----------|----------|-------------------|
| Performance | 페이지 로드 < 2초, API 응답 < 500ms | Lighthouse, APM 모니터링 |
| Security | OWASP Top 10 준수, 데이터 암호화 (AES-256) | 보안 점검 체크리스트 |
| Scalability | 동시 사용자 200명 이상 지원 | 부하 테스트 (k6) |
| Availability | 99.5% 업타임 (업무시간 기준) | 모니터링 대시보드 |
| Accessibility | WCAG 2.1 AA 준수 | axe-core 자동 검사 |
| Data Backup | 일 1회 자동 백업, 30일 보관 | 백업 로그 확인 |

---

## 4. Success Criteria

### 4.1 Definition of Done

- [ ] 3개 핵심 모듈 (HR, 캘린더, 칸반보드) 구현 완료
- [ ] Google Calendar 연동 동작 확인
- [ ] 역할별 권한 제어 동작 확인
- [ ] 통합 대시보드 표시 정상
- [ ] 코드 리뷰 완료
- [ ] 배포 환경 구성 완료

### 4.2 Quality Criteria

- [ ] 테스트 커버리지 80% 이상
- [ ] Lint 에러 0건
- [ ] 빌드 성공
- [ ] Lighthouse Performance 점수 70점 이상

---

## 5. Risks and Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Google Calendar API 변경/제한 | High | Low | OAuth 2.0 기반 안정적 API 사용, 에러 핸들링 강화 |
| 대규모 데이터 시 성능 저하 | High | Medium | 페이지네이션, 인덱싱, 캐싱 전략 수립 |
| 권한 관리 복잡도 증가 | Medium | Medium | RBAC 패턴으로 초기 설계, 확장 가능한 구조 |
| 실시간 알림 인프라 비용 | Medium | Medium | WebSocket + 폴링 하이브리드, 필요시 SSE 대안 |
| 사내 SSO 연동 지연 | Medium | High | 1차 이메일/비밀번호 인증, SSO는 2차 단계 |
| AI 봇 간 무한 루프 (합의 불가) | High | Medium | 최대 반복 횟수 제한 (5회), 3회 이상 동일 지적 시 사람 에스컬레이션 |
| 팀장봇 리뷰 기준 모호 | Medium | Medium | 회사 컨벤션 문서를 시스템 프롬프트로 명확히 주입 |
| 오픈클로 API 비용 급증 | High | Medium | 토큰 사용량 모니터링, 일일 한도 설정, 작업 단위 분할 |
| AI 생성 코드 품질 불균일 | Medium | High | 팀장봇 체크리스트 강화, 자동 테스트 통과 필수 조건 |

---

## 6. Architecture Considerations

### 6.1 Project Level Selection

| Level | Characteristics | Recommended For | Selected |
|-------|-----------------|-----------------|:--------:|
| **Starter** | Simple structure | Static sites, portfolios | |
| **Dynamic** | Feature-based modules, BaaS | Web apps with backend, SaaS MVPs | |
| **Enterprise** | Strict layer separation, DI, microservices | High-traffic systems, complex architectures | **[v]** |

### 6.2 Key Architectural Decisions

| Decision | Options | Selected | Rationale |
|----------|---------|----------|-----------|
| Framework | Next.js / React / Vue | **Next.js 15 (App Router)** | SSR/SSG 지원, API Routes 내장, 풍부한 에코시스템 |
| State Management | Context / Zustand / Redux | **Zustand** | 가벼운 번들 크기, 보일러플레이트 최소화, TypeScript 친화적 |
| API Client | fetch / axios / react-query | **TanStack Query + fetch** | 서버 상태 캐싱, 자동 재요청, 낙관적 업데이트 지원 |
| Form Handling | react-hook-form / formik | **react-hook-form + zod** | 성능 최적화, 스키마 기반 검증 |
| Styling | Tailwind / CSS Modules | **Tailwind CSS + shadcn/ui** | 빠른 개발, 일관된 디자인 시스템 |
| Testing | Jest / Vitest / Playwright | **Vitest + Playwright** | 빠른 단위 테스트 + E2E 테스트 |
| Backend | BaaS / Custom Server | **Custom API (Next.js API Routes + PostgreSQL)** | ERP 특성상 복잡한 비즈니스 로직, 데이터 주권 중요 |
| DB | PostgreSQL / MySQL | **PostgreSQL** | JSON 지원, 복합 쿼리 성능, 확장성 |
| ORM | Prisma / Drizzle / TypeORM | **Prisma** | 타입 안전, 마이그레이션 관리, 풍부한 문서 |
| Auth | NextAuth / Custom | **NextAuth.js v5** | OAuth/SSO 통합 용이, 세션 관리 내장 |
| Real-time | WebSocket / SSE | **Socket.io** | 양방향 통신, 알림/칸반 실시간 업데이트 |
| Calendar | FullCalendar / custom | **FullCalendar + Google API** | 풍부한 뷰 옵션, 드래그앤드롭, Google 연동 |
| Kanban | react-beautiful-dnd / dnd-kit | **@dnd-kit/core** | 접근성 지원, 유연한 커스터마이징, 활발한 유지보수 |
| Deployment | Vercel / AWS / Docker | **Docker + AWS (ECS or K8s)** | 사내 시스템 특성상 컨테이너 기반 배포 |

### 6.3 Clean Architecture Approach

```
Selected Level: Enterprise

Folder Structure Preview:
┌─────────────────────────────────────────────────────────┐
│ src/                                                     │
│ ├── app/                    # Next.js App Router pages   │
│ │   ├── (auth)/             # 인증 관련 페이지            │
│ │   ├── dashboard/          # 통합 대시보드               │
│ │   ├── hr/                 # HR 모듈 페이지             │
│ │   ├── calendar/           # 캘린더 모듈 페이지          │
│ │   ├── kanban/             # 칸반보드 모듈 페이지        │
│ │   └── api/                # API Routes                 │
│ ├── domain/                 # 도메인 엔티티, 비즈니스 규칙 │
│ │   ├── hr/                 # Employee, Department, Leave │
│ │   ├── calendar/           # Event, Schedule             │
│ │   └── kanban/             # Board, Task, Column         │
│ ├── application/            # 유스케이스, 서비스 레이어    │
│ │   ├── hr/                                               │
│ │   ├── calendar/                                         │
│ │   └── kanban/                                           │
│ ├── infrastructure/         # DB, 외부 API, 인프라 구현    │
│ │   ├── db/                 # Prisma schema, migrations   │
│ │   ├── google-calendar/    # Google Calendar API client  │
│ │   └── notification/       # 알림 서비스 구현            │
│ ├── presentation/           # UI 컴포넌트, 레이아웃       │
│ │   ├── components/         # 공통 컴포넌트               │
│ │   ├── hr/                 # HR 관련 UI                  │
│ │   ├── calendar/           # 캘린더 관련 UI              │
│ │   └── kanban/             # 칸반보드 관련 UI            │
│ └── lib/                    # 유틸리티, 설정              │
│     ├── auth.ts             # NextAuth 설정              │
│     ├── prisma.ts           # Prisma client              │
│     └── utils.ts            # 공통 유틸리티               │
├── prisma/                                                │
│   └── schema.prisma         # DB 스키마                   │
└── docker-compose.yml        # 로컬 개발 환경              │
```

### 6.4 핵심 데이터 모델 (개요)

```
[Employee] 1──N [LeaveRequest]
[Employee] 1──N [Attendance]
[Employee] N──N [Department] (through DepartmentMember)
[Employee] 1──N [Task] (assignee)
[Employee] 1──N [CalendarEvent] (creator/attendee)

[Department] 1──N [DepartmentMember]

[Board] 1──N [Column] 1──N [Task]
[Task] 1──N [Comment]
[Task] N──N [Label]

[CalendarEvent] N──N [Employee] (attendees)
[CalendarEvent] 0──1 [GoogleCalendarSync]
```

### 6.5 AI Dual Agent System Architecture

#### 개요

오픈클로(OpenClaw) 플랫폼에서 2개의 AI 퍼소나가 자율적으로 협업하여 ERP 시스템을 구현하는 무인 개발 파이프라인.

```
┌─────────────────────────────────────────────────────────────────┐
│                    AI Dual Agent Pipeline                        │
│                                                                 │
│  ┌──────────────┐    작업 지시     ┌──────────────┐             │
│  │              │ ──────────────→  │              │             │
│  │   팀장봇      │                  │   직원봇      │             │
│  │  (Reviewer)  │  ←──────────────  │  (Executor)  │             │
│  │              │    구현 결과물     │              │             │
│  └──────┬───────┘                  └──────┬───────┘             │
│         │                                 │                     │
│         │ 리뷰 피드백                      │ 코드 구현            │
│         │                                 │                     │
│         ▼                                 ▼                     │
│  ┌──────────────┐                  ┌──────────────┐             │
│  │  승인 판단    │                  │  수정 반영    │             │
│  │  PASS/FAIL   │                  │  재구현      │             │
│  └──────┬───────┘                  └──────────────┘             │
│         │                                                       │
│    PASS │                                                       │
│         ▼                                                       │
│  ┌──────────────┐                                               │
│  │  최종 완성    │ → Slack/이메일 알림 → 사람 확인               │
│  │  PR 생성     │                                               │
│  └──────────────┘                                               │
└─────────────────────────────────────────────────────────────────┘
```

#### 팀장봇 퍼소나 (Reviewer Bot)

| 항목 | 설정 |
|------|------|
| **역할** | ASC 사 기술 팀장. 코드 리뷰어이자 품질 게이트키퍼 |
| **성격** | 꼼꼼하고 원칙적. 타협 없이 기준을 지킴. 하지만 건설적 피드백 제공 |
| **리뷰 기준** | 회사 코딩 컨벤션, Clean Architecture 준수, 보안, 성능, 테스트 커버리지 |
| **권한** | PASS(승인) / FAIL(반려+피드백) / ESCALATE(사람에게 에스컬레이션) |
| **행동 규칙** | 1. 구현물을 받으면 체크리스트 기반 리뷰 수행 |
| | 2. FAIL 시 구체적인 수정 지시사항 전달 |
| | 3. 3회 연속 동일 이슈 반복 시 ESCALATE |
| | 4. PASS 시 PR 생성 및 사람에게 알림 |

**팀장봇 시스템 프롬프트 핵심 요소:**
```
- 당신은 ASC의 기술 팀장입니다
- 다음 기준으로 코드를 리뷰합니다:
  □ TypeScript strict mode 준수
  □ Enterprise Clean Architecture 패턴 준수 (domain/application/infrastructure/presentation 분리)
  □ API 응답 시간 < 500ms 고려한 설계
  □ OWASP Top 10 보안 취약점 없음
  □ Prisma 쿼리 최적화 (N+1 방지)
  □ 컴포넌트 재사용성 확보
  □ 에러 핸들링 완비
  □ 한국어 주석/커밋 메시지
- PASS/FAIL/ESCALATE로 판정합니다
- FAIL 시 수정사항을 번호 리스트로 명확히 전달합니다
```

#### 직원봇 퍼소나 (Executor Bot)

| 항목 | 설정 |
|------|------|
| **역할** | ASC 사 풀스택 개발자. 지시받은 기능을 구현하는 실행자 |
| **성격** | 성실하고 빠름. 피드백을 적극 수용하고 즉시 반영 |
| **기술 스택** | Next.js 15, TypeScript, Prisma, Tailwind, shadcn/ui |
| **행동 규칙** | 1. 설계서(Design doc)를 기반으로 코드 구현 |
| | 2. 구현 완료 후 결과물을 팀장봇에게 전달 |
| | 3. FAIL 피드백 수신 시 수정사항 반영 후 재전달 |
| | 4. 구현 시 항상 테스트 코드 포함 |

**직원봇 시스템 프롬프트 핵심 요소:**
```
- 당신은 ASC의 풀스택 개발자입니다
- Design 문서를 기반으로 코드를 구현합니다
- 구현 원칙:
  □ Design 문서의 구조를 정확히 따름
  □ TypeScript strict, no any
  □ 모든 API에 zod 검증 적용
  □ 컴포넌트는 shadcn/ui 기반
  □ Prisma 쿼리 최적화
  □ 단위 테스트 필수 포함
- 구현 완료 후 팀장에게 리뷰 요청합니다
- 팀장의 피드백을 수정사항으로 받으면 즉시 반영합니다
```

#### 티키타카 루프 프로세스

```
Step 1: [설계서 투입]
  │  이 세션(bkit)에서 만든 Design 문서를 오픈클로에 전달
  │
Step 2: [직원봇 구현]
  │  직원봇이 설계서 기반으로 코드 구현
  │  구현 완료 → 팀장봇에게 전달
  │
Step 3: [팀장봇 리뷰]
  │  팀장봇이 체크리스트 기반 리뷰
  │  ├── PASS → Step 5 (완료)
  │  ├── FAIL → Step 4 (수정 요청)
  │  └── ESCALATE → 사람에게 알림
  │
Step 4: [직원봇 수정]
  │  피드백 반영 후 재전달 → Step 3 반복
  │  (최대 5회, 초과 시 자동 ESCALATE)
  │
Step 5: [최종 완성]
  │  PR 생성 + 변경 내역 정리
  │  Slack/이메일로 사람에게 최종 확인 요청
  │
  ▼ [사람: 최종 머지 승인]
```

#### 작업 단위 분할 전략

한 번의 티키타카 사이클에서 전체 ERP를 만들지 않음. **모듈 단위로 분할**:

| Cycle | 작업 단위 | 입력 | 예상 반복 |
|-------|----------|------|----------|
| 1 | Foundation (프로젝트 초기화 + 인증) | Design Phase 1 | 2-3회 |
| 2 | HR 모듈 - 직원 프로필 | Design Phase 2-1 | 2-3회 |
| 3 | HR 모듈 - 근태/휴가 | Design Phase 2-2 | 3-4회 |
| 4 | 캘린더 모듈 | Design Phase 3 | 3-4회 |
| 5 | 칸반보드 모듈 | Design Phase 4 | 3-4회 |
| 6 | 통합 대시보드 + 알림 | Design Phase 5 | 2-3회 |

#### 오픈클로 운영 설정

| 설정 | 값 | 이유 |
|------|-----|------|
| **대화 구조** | 단일 스레드 (팀장↔직원 동일 대화) | 컨텍스트 유지 |
| **최대 반복** | 5회/사이클 | 비용 제어 + 무한루프 방지 |
| **타임아웃** | 30분/사이클 | 비정상 종료 방지 |
| **토큰 한도** | 일일 500K 토큰 | 비용 관리 |
| **결과 저장** | Git commit per cycle | 작업 추적 |
| **알림 채널** | Slack #erp-ai-dev | 사람 모니터링 |

#### 품질 게이트 (팀장봇 체크리스트)

```markdown
## 코드 리뷰 체크리스트

### 필수 (하나라도 FAIL이면 반려)
- [ ] TypeScript 컴파일 에러 없음
- [ ] 빌드 성공 (next build)
- [ ] 기존 테스트 깨지지 않음
- [ ] SQL Injection / XSS 취약점 없음
- [ ] 환경변수에 시크릿 하드코딩 없음

### 아키텍처
- [ ] domain 레이어에 infrastructure 의존성 없음
- [ ] API Route에 비즈니스 로직 직접 작성 없음 (서비스 레이어 사용)
- [ ] 컴포넌트 단일 책임 원칙

### 코드 품질
- [ ] any 타입 사용 없음
- [ ] 매직 넘버/스트링 없음 (상수 사용)
- [ ] 에러 핸들링 존재
- [ ] 중복 코드 없음

### UX
- [ ] 로딩 상태 표시
- [ ] 에러 상태 표시
- [ ] 반응형 레이아웃
```

---

## 7. Convention Prerequisites

### 7.1 Existing Project Conventions

- [ ] `CLAUDE.md` has coding conventions section
- [ ] `docs/01-plan/conventions.md` exists (Phase 2 output)
- [ ] ESLint configuration (`.eslintrc.*`)
- [ ] Prettier configuration (`.prettierrc`)
- [ ] TypeScript configuration (`tsconfig.json`)

### 7.2 Conventions to Define/Verify

| Category | Current State | To Define | Priority |
|----------|---------------|-----------|:--------:|
| **Naming** | Missing | PascalCase 컴포넌트, camelCase 함수/변수, SCREAMING_SNAKE 상수 | High |
| **Folder structure** | Missing | Enterprise 레벨 Clean Architecture | High |
| **Import order** | Missing | 외부 → 내부 → 상대경로, 자동 정렬 | Medium |
| **Environment variables** | Missing | .env.local / .env.production 분리 | High |
| **Error handling** | Missing | Result 패턴, 에러 바운더리 | Medium |
| **API Convention** | Missing | RESTful, /api/v1/{module}/{resource} | High |

### 7.3 Environment Variables Needed

| Variable | Purpose | Scope | To Be Created |
|----------|---------|-------|:-------------:|
| `DATABASE_URL` | PostgreSQL 연결 | Server | [v] |
| `NEXTAUTH_SECRET` | Auth 시크릿 키 | Server | [v] |
| `NEXTAUTH_URL` | Auth 콜백 URL | Server | [v] |
| `GOOGLE_CLIENT_ID` | Google OAuth | Server | [v] |
| `GOOGLE_CLIENT_SECRET` | Google OAuth | Server | [v] |
| `GOOGLE_CALENDAR_API_KEY` | Google Calendar API | Server | [v] |
| `NEXT_PUBLIC_APP_URL` | 앱 URL | Client | [v] |
| `SMTP_HOST` | 이메일 알림 | Server | [v] |
| `REDIS_URL` | 세션/캐시 스토어 | Server | [v] |

### 7.4 Pipeline Integration

| Phase | Status | Document Location | Command |
|-------|:------:|-------------------|---------|
| Phase 1 (Schema) | Pending | `docs/01-plan/schema.md` | `/phase-1-schema` |
| Phase 2 (Convention) | Pending | `docs/01-plan/conventions.md` | `/phase-2-convention` |

---

## 8. Module Implementation Phases

### Phase 1: Foundation (인증 + 기본 구조)
1. Next.js 프로젝트 초기화 + Enterprise 구조 설정
2. PostgreSQL + Prisma 스키마 설정
3. NextAuth.js 인증 (이메일/비밀번호)
4. 레이아웃 + 사이드바 네비게이션
5. 역할 기반 권한 미들웨어

### Phase 2: HR 모듈
1. 직원 프로필 CRUD
2. 부서/조직도
3. 근태 관리
4. 휴가 신청/승인

### Phase 3: 캘린더 모듈
1. 개인 캘린더 CRUD
2. FullCalendar UI 통합
3. Google Calendar API 연동
4. 일정 초대/공유

### Phase 4: 칸반보드 모듈
1. 보드/컬럼 CRUD
2. 태스크 CRUD + 할당
3. 드래그앤드롭 구현
4. 필터링/검색

### Phase 5: 통합 + 알림
1. 통합 대시보드
2. 실시간 알림 시스템
3. 모듈 간 연동 (캘린더 일정 → 태스크)
4. 검색/필터 통합

### Phase 6: AI 듀얼 에이전트 셋업
1. 팀장봇 시스템 프롬프트 작성 (ASC 퍼소나 + 리뷰 체크리스트)
2. 직원봇 시스템 프롬프트 작성 (기술 스택 + 구현 원칙)
3. 오픈클로 대화 파이프라인 구성 (직원→팀장 루프)
4. 에스컬레이션 알림 연동 (Slack)
5. 토큰 사용량 모니터링 대시보드
6. 전체 사이클 테스트 런 (Foundation 모듈로 검증)

### Phase 7: 배포 + 안정화
1. Docker 컨테이너화
2. CI/CD 파이프라인
3. 성능 최적화
4. 보안 점검

---

## 9. Next Steps

1. [ ] Design 문서 작성 (`internal-erp.design.md`)
2. [ ] Phase 1 Schema 정의 (`/phase-1-schema`)
3. [ ] Phase 2 Convention 정의 (`/phase-2-convention`)
4. [ ] 팀 리뷰 및 승인
5. [ ] 구현 시작

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-03-20 | Initial draft | ASC Team |
| 0.2 | 2026-03-20 | AI Dual Agent System 추가 (팀장봇/직원봇 자율 개발 파이프라인) | ASC Team |
