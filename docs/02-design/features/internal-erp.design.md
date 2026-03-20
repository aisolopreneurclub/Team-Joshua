# Internal ERP System Design Document

> **Summary**: 사내 ERP 시스템 (HR + 캘린더 + 칸반보드) + AI 듀얼 에이전트 자율 개발 파이프라인 설계서
>
> **Project**: Joshua-Automation (ASC Internal ERP)
> **Author**: ASC Team
> **Date**: 2026-03-20
> **Status**: Draft
> **Planning Doc**: [internal-erp.plan.md](../01-plan/features/internal-erp.plan.md)

### Pipeline References

| Phase | Document | Status |
|-------|----------|--------|
| Phase 1 | Schema Definition | Included below (Section 3) |
| Phase 2 | Coding Conventions | Included below (Section 10) |
| Phase 3 | Mockup | Included below (Section 5) |
| Phase 4 | API Spec | Included below (Section 4) |

---

## 1. Overview

### 1.1 Design Goals

1. **모듈형 아키텍처**: HR, 캘린더, 칸반보드를 독립 모듈로 구성하되 통합 대시보드에서 연결
2. **AI 에이전트 친화적 설계**: 각 모듈을 독립적으로 구현할 수 있도록 명확한 인터페이스 정의
3. **Clean Architecture**: domain/application/infrastructure/presentation 4계층 분리
4. **실시간 협업**: 칸반보드 드래그앤드롭, 알림 등 실시간 기능 지원
5. **확장성**: 향후 회계/CRM 모듈 추가를 고려한 플러그인형 모듈 구조

### 1.2 Design Principles

- **Single Responsibility**: 각 모듈/컴포넌트는 하나의 책임만 담당
- **Dependency Inversion**: domain 레이어는 외부 의존성 없이 순수하게 유지
- **Convention over Configuration**: 일관된 네이밍/구조 규칙으로 AI 에이전트가 예측 가능하게 작업
- **Fail-Safe**: 에러 발생 시 안전한 기본값, 사용자에게 명확한 피드백

---

## 2. Architecture

### 2.1 System Architecture

```
┌────────────────────────────────────────────────────────────────────┐
│                         Client (Browser)                            │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    Next.js 15 App Router                      │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │  │
│  │  │Dashboard │  │ HR Module│  │Calendar  │  │ Kanban   │    │  │
│  │  │  Page    │  │  Pages   │  │ Module   │  │ Module   │    │  │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘    │  │
│  │       └──────────────┴──────────────┴──────────────┘         │  │
│  │                    Zustand Store + TanStack Query              │  │
│  └──────────────────────────────┬───────────────────────────────┘  │
│                                  │ HTTP/WebSocket                   │
├──────────────────────────────────┼─────────────────────────────────┤
│                         Server (Next.js API)                        │
│  ┌──────────────────────────────┴───────────────────────────────┐  │
│  │                    API Routes (/api/v1/*)                     │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │  │
│  │  │Auth API  │  │ HR API   │  │Calendar  │  │Kanban API│    │  │
│  │  │          │  │          │  │  API     │  │          │    │  │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘    │  │
│  │       └──────────────┴──────────────┴──────────────┘         │  │
│  │              Application Services (Use Cases)                 │  │
│  │              Domain Entities (Business Rules)                 │  │
│  └──────────────────────────────┬───────────────────────────────┘  │
│                                  │                                  │
├──────────────────────────────────┼─────────────────────────────────┤
│                         Infrastructure                              │
│  ┌────────────┐  ┌──────────────┐  ┌───────────┐  ┌────────────┐  │
│  │ PostgreSQL │  │ Google Cal   │  │  Redis    │  │ Socket.io  │  │
│  │ (Prisma)   │  │ API          │  │ (Cache)   │  │ (Realtime) │  │
│  └────────────┘  └──────────────┘  └───────────┘  └────────────┘  │
└────────────────────────────────────────────────────────────────────┘
```

### 2.2 Module Architecture

```
┌─────────────────────────────────────────────────────┐
│                  Shared Module                       │
│  ├── Auth (NextAuth.js v5)                          │
│  ├── Layout (Sidebar, Header, Breadcrumb)           │
│  ├── Notification Service                            │
│  └── Design System (shadcn/ui components)           │
├─────────────────────────────────────────────────────┤
│  HR Module        │  Calendar Module  │  Kanban Module │
│  ├── Employee     │  ├── Event        │  ├── Board     │
│  ├── Department   │  ├── Schedule     │  ├── Column    │
│  ├── Attendance   │  ├── GoogleSync   │  ├── Task      │
│  ├── Leave        │  └── MeetingRoom  │  ├── Comment   │
│  └── Payroll(RO)  │                   │  └── Label     │
├─────────────────────────────────────────────────────┤
│                  Integration Layer                    │
│  ├── Dashboard (통합 위젯)                           │
│  ├── Cross-module Links (Task↔Event, Employee↔Task) │
│  └── Unified Search                                  │
└─────────────────────────────────────────────────────┘
```

### 2.3 Dependencies

| Component | Depends On | Purpose |
|-----------|-----------|---------|
| Dashboard | HR, Calendar, Kanban | 각 모듈 요약 데이터 표시 |
| Calendar | Google Calendar API | 외부 캘린더 양방향 동기화 |
| Kanban | Socket.io | 실시간 보드 업데이트 |
| Notification | Redis, Socket.io | 알림 큐잉 및 실시간 전달 |
| All Modules | Auth | 인증/인가 의존 |

---

## 3. Data Model

### 3.1 Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================
// AUTH & USER
// ============================================

enum Role {
  ADMIN
  MANAGER
  EMPLOYEE
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String
  password      String?   // null when SSO
  role          Role      @default(EMPLOYEE)
  avatar        String?
  isActive      Boolean   @default(true)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relations
  employee      Employee?
  accounts      Account[]
  sessions      Session[]

  @@map("users")
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@map("accounts")
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}

// ============================================
// HR MODULE
// ============================================

model Employee {
  id           String   @id @default(cuid())
  userId       String   @unique
  employeeNo   String   @unique  // 사번
  position     String              // 직급
  phone        String?
  hireDate     DateTime
  birthDate    DateTime?
  address      String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  // Relations
  user              User               @relation(fields: [userId], references: [id])
  departmentMembers DepartmentMember[]
  attendances       Attendance[]
  leaveRequests     LeaveRequest[]
  assignedTasks     Task[]             @relation("TaskAssignee")
  createdTasks      Task[]             @relation("TaskCreator")
  calendarEvents    EventAttendee[]
  createdEvents     CalendarEvent[]    @relation("EventCreator")

  @@map("employees")
}

model Department {
  id          String   @id @default(cuid())
  name        String   @unique
  description String?
  parentId    String?  // 상위 부서 (조직도 트리)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  parent    Department?        @relation("DepartmentTree", fields: [parentId], references: [id])
  children  Department[]       @relation("DepartmentTree")
  members   DepartmentMember[]

  @@map("departments")
}

model DepartmentMember {
  id           String   @id @default(cuid())
  departmentId String
  employeeId   String
  isHead       Boolean  @default(false) // 부서장 여부
  joinedAt     DateTime @default(now())

  department Department @relation(fields: [departmentId], references: [id])
  employee   Employee   @relation(fields: [employeeId], references: [id])

  @@unique([departmentId, employeeId])
  @@map("department_members")
}

model Attendance {
  id          String    @id @default(cuid())
  employeeId  String
  date        DateTime  @db.Date
  checkIn     DateTime?
  checkOut    DateTime?
  overtime    Int       @default(0) // 초과근무 (분)
  note        String?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  employee Employee @relation(fields: [employeeId], references: [id])

  @@unique([employeeId, date])
  @@map("attendances")
}

enum LeaveStatus {
  PENDING
  APPROVED
  REJECTED
  CANCELLED
}

enum LeaveType {
  ANNUAL       // 연차
  SICK         // 병가
  PERSONAL     // 개인사유
  MATERNITY    // 출산
  BEREAVEMENT  // 경조사
}

model LeaveRequest {
  id          String      @id @default(cuid())
  employeeId  String
  type        LeaveType
  startDate   DateTime    @db.Date
  endDate     DateTime    @db.Date
  reason      String?
  status      LeaveStatus @default(PENDING)
  approverId  String?     // 승인자
  approvedAt  DateTime?
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  employee Employee @relation(fields: [employeeId], references: [id])

  @@map("leave_requests")
}

// ============================================
// CALENDAR MODULE
// ============================================

model CalendarEvent {
  id           String    @id @default(cuid())
  title        String
  description  String?
  startTime    DateTime
  endTime      DateTime
  allDay       Boolean   @default(false)
  location     String?
  color        String?   // UI 색상
  creatorId    String
  isRecurring  Boolean   @default(false)
  recurrenceRule String? // RRULE format
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  // Relations
  creator      Employee        @relation("EventCreator", fields: [creatorId], references: [id])
  attendees    EventAttendee[]
  googleSync   GoogleCalendarSync?
  meetingRoom  MeetingRoomBooking?

  @@map("calendar_events")
}

enum AttendeeStatus {
  PENDING
  ACCEPTED
  DECLINED
  TENTATIVE
}

model EventAttendee {
  id         String         @id @default(cuid())
  eventId    String
  employeeId String
  status     AttendeeStatus @default(PENDING)
  createdAt  DateTime       @default(now())

  event    CalendarEvent @relation(fields: [eventId], references: [id], onDelete: Cascade)
  employee Employee      @relation(fields: [employeeId], references: [id])

  @@unique([eventId, employeeId])
  @@map("event_attendees")
}

model GoogleCalendarSync {
  id              String   @id @default(cuid())
  eventId         String   @unique
  googleEventId   String   @unique
  calendarId      String   // Google Calendar ID
  syncToken       String?
  lastSyncedAt    DateTime @default(now())
  createdAt       DateTime @default(now())

  event CalendarEvent @relation(fields: [eventId], references: [id], onDelete: Cascade)

  @@map("google_calendar_syncs")
}

model MeetingRoom {
  id        String   @id @default(cuid())
  name      String   @unique
  floor     String?
  capacity  Int
  equipment String[] // 프로젝터, 화이트보드 등
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())

  bookings MeetingRoomBooking[]

  @@map("meeting_rooms")
}

model MeetingRoomBooking {
  id        String   @id @default(cuid())
  roomId    String
  eventId   String   @unique
  createdAt DateTime @default(now())

  room  MeetingRoom   @relation(fields: [roomId], references: [id])
  event CalendarEvent @relation(fields: [eventId], references: [id], onDelete: Cascade)

  @@map("meeting_room_bookings")
}

// ============================================
// KANBAN MODULE
// ============================================

model Board {
  id          String   @id @default(cuid())
  name        String
  description String?
  isArchived  Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  columns Column[]

  @@map("boards")
}

model Column {
  id       String @id @default(cuid())
  boardId  String
  name     String
  order    Int    // 컬럼 순서
  color    String? // 상태 색상

  board Board  @relation(fields: [boardId], references: [id], onDelete: Cascade)
  tasks Task[]

  @@map("columns")
}

enum Priority {
  LOW
  MEDIUM
  HIGH
  URGENT
}

model Task {
  id          String   @id @default(cuid())
  columnId    String
  title       String
  description String?
  order       Int      // 태스크 순서 (within column)
  priority    Priority @default(MEDIUM)
  dueDate     DateTime?
  assigneeId  String?
  creatorId   String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  column   Column     @relation(fields: [columnId], references: [id], onDelete: Cascade)
  assignee Employee?  @relation("TaskAssignee", fields: [assigneeId], references: [id])
  creator  Employee   @relation("TaskCreator", fields: [creatorId], references: [id])
  comments Comment[]
  labels   TaskLabel[]

  @@map("tasks")
}

model Comment {
  id        String   @id @default(cuid())
  taskId    String
  authorId  String
  content   String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  task Task @relation(fields: [taskId], references: [id], onDelete: Cascade)

  @@map("comments")
}

model Label {
  id    String @id @default(cuid())
  name  String @unique
  color String

  tasks TaskLabel[]

  @@map("labels")
}

model TaskLabel {
  taskId  String
  labelId String

  task  Task  @relation(fields: [taskId], references: [id], onDelete: Cascade)
  label Label @relation(fields: [labelId], references: [id], onDelete: Cascade)

  @@id([taskId, labelId])
  @@map("task_labels")
}

// ============================================
// NOTIFICATION
// ============================================

enum NotificationType {
  TASK_ASSIGNED
  TASK_UPDATED
  LEAVE_REQUEST
  LEAVE_APPROVED
  LEAVE_REJECTED
  EVENT_INVITE
  EVENT_REMINDER
  HR_ANNOUNCEMENT
}

model Notification {
  id         String           @id @default(cuid())
  userId     String
  type       NotificationType
  title      String
  message    String
  link       String?          // 관련 페이지 링크
  isRead     Boolean          @default(false)
  createdAt  DateTime         @default(now())

  @@index([userId, isRead])
  @@map("notifications")
}
```

### 3.2 Entity Relationships

```
[User] 1──1 [Employee]
[User] 1──N [Account] (OAuth providers)
[User] 1──N [Session]

[Employee] N──N [Department] (through DepartmentMember)
[Employee] 1──N [Attendance]
[Employee] 1──N [LeaveRequest]
[Employee] 1──N [Task] (assignee)
[Employee] 1──N [Task] (creator)
[Employee] N──N [CalendarEvent] (through EventAttendee)
[Employee] 1──N [CalendarEvent] (creator)

[Department] 1──N [Department] (self-referencing tree)

[Board] 1──N [Column] 1──N [Task]
[Task] 1──N [Comment]
[Task] N──N [Label] (through TaskLabel)

[CalendarEvent] 1──0..1 [GoogleCalendarSync]
[CalendarEvent] 1──0..1 [MeetingRoomBooking]
[MeetingRoom] 1──N [MeetingRoomBooking]
```

---

## 4. API Specification

### 4.1 API Convention

- Base URL: `/api/v1`
- 인증: Bearer Token (NextAuth.js session)
- 응답 형식: JSON
- 페이지네이션: `?page=1&limit=20`
- 정렬: `?sort=createdAt&order=desc`
- 에러 응답: `{ error: { code, message, details } }`

### 4.2 Auth API

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | /api/auth/signin | 로그인 (NextAuth) | Public |
| POST | /api/auth/signup | 회원가입 | Public |
| GET | /api/auth/session | 세션 조회 | Required |
| POST | /api/auth/signout | 로그아웃 | Required |

### 4.3 HR API

| Method | Path | Description | Auth | Role |
|--------|------|-------------|------|------|
| GET | /api/v1/employees | 직원 목록 | Required | All |
| GET | /api/v1/employees/:id | 직원 상세 | Required | All |
| POST | /api/v1/employees | 직원 등록 | Required | Admin |
| PUT | /api/v1/employees/:id | 직원 수정 | Required | Admin/Self |
| DELETE | /api/v1/employees/:id | 직원 삭제 | Required | Admin |
| GET | /api/v1/departments | 부서 목록 (트리) | Required | All |
| POST | /api/v1/departments | 부서 생성 | Required | Admin |
| PUT | /api/v1/departments/:id | 부서 수정 | Required | Admin |
| DELETE | /api/v1/departments/:id | 부서 삭제 | Required | Admin |
| GET | /api/v1/attendances | 근태 목록 | Required | All |
| POST | /api/v1/attendances/check-in | 출근 체크 | Required | Self |
| POST | /api/v1/attendances/check-out | 퇴근 체크 | Required | Self |
| GET | /api/v1/leaves | 휴가 목록 | Required | All |
| POST | /api/v1/leaves | 휴가 신청 | Required | Self |
| PUT | /api/v1/leaves/:id/approve | 휴가 승인 | Required | Manager |
| PUT | /api/v1/leaves/:id/reject | 휴가 반려 | Required | Manager |

#### `POST /api/v1/employees` (example)

**Request:**
```json
{
  "email": "hong@asc.com",
  "name": "홍길동",
  "employeeNo": "ASC-2026-001",
  "position": "시니어 개발자",
  "departmentId": "dept_xxx",
  "phone": "010-1234-5678",
  "hireDate": "2026-03-01"
}
```

**Response (201):**
```json
{
  "id": "emp_xxx",
  "userId": "user_xxx",
  "employeeNo": "ASC-2026-001",
  "name": "홍길동",
  "position": "시니어 개발자",
  "department": { "id": "dept_xxx", "name": "개발팀" },
  "hireDate": "2026-03-01T00:00:00Z",
  "createdAt": "2026-03-20T09:00:00Z"
}
```

#### `POST /api/v1/leaves` (example)

**Request:**
```json
{
  "type": "ANNUAL",
  "startDate": "2026-04-01",
  "endDate": "2026-04-03",
  "reason": "개인 사유"
}
```

**Response (201):**
```json
{
  "id": "leave_xxx",
  "type": "ANNUAL",
  "startDate": "2026-04-01",
  "endDate": "2026-04-03",
  "status": "PENDING",
  "createdAt": "2026-03-20T09:00:00Z"
}
```

### 4.4 Calendar API

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | /api/v1/events | 이벤트 목록 (기간 필터) | Required |
| GET | /api/v1/events/:id | 이벤트 상세 | Required |
| POST | /api/v1/events | 이벤트 생성 | Required |
| PUT | /api/v1/events/:id | 이벤트 수정 | Required |
| DELETE | /api/v1/events/:id | 이벤트 삭제 | Required |
| POST | /api/v1/events/:id/respond | 참석 응답 | Required |
| POST | /api/v1/google-calendar/sync | Google Cal 동기화 | Required |
| GET | /api/v1/google-calendar/status | 동기화 상태 | Required |
| GET | /api/v1/meeting-rooms | 회의실 목록 | Required |
| POST | /api/v1/meeting-rooms/:id/book | 회의실 예약 | Required |
| GET | /api/v1/meeting-rooms/:id/availability | 회의실 가용 시간 | Required |

#### `POST /api/v1/events` (example)

**Request:**
```json
{
  "title": "주간 스프린트 회의",
  "startTime": "2026-03-25T10:00:00+09:00",
  "endTime": "2026-03-25T11:00:00+09:00",
  "description": "이번 주 스프린트 리뷰",
  "attendeeIds": ["emp_001", "emp_002"],
  "meetingRoomId": "room_001",
  "syncToGoogle": true
}
```

**Response (201):**
```json
{
  "id": "evt_xxx",
  "title": "주간 스프린트 회의",
  "startTime": "2026-03-25T10:00:00+09:00",
  "endTime": "2026-03-25T11:00:00+09:00",
  "creator": { "id": "emp_xxx", "name": "홍길동" },
  "attendees": [
    { "employeeId": "emp_001", "name": "김철수", "status": "PENDING" },
    { "employeeId": "emp_002", "name": "이영희", "status": "PENDING" }
  ],
  "meetingRoom": { "id": "room_001", "name": "회의실 A" },
  "googleSync": { "googleEventId": "google_xxx", "status": "synced" }
}
```

### 4.5 Kanban API

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | /api/v1/boards | 보드 목록 | Required |
| POST | /api/v1/boards | 보드 생성 | Required |
| GET | /api/v1/boards/:id | 보드 상세 (컬럼+태스크 포함) | Required |
| PUT | /api/v1/boards/:id | 보드 수정 | Required |
| DELETE | /api/v1/boards/:id | 보드 삭제 | Required |
| POST | /api/v1/boards/:id/columns | 컬럼 추가 | Required |
| PUT | /api/v1/columns/:id | 컬럼 수정 | Required |
| PUT | /api/v1/columns/reorder | 컬럼 순서 변경 | Required |
| DELETE | /api/v1/columns/:id | 컬럼 삭제 | Required |
| POST | /api/v1/tasks | 태스크 생성 | Required |
| PUT | /api/v1/tasks/:id | 태스크 수정 | Required |
| PUT | /api/v1/tasks/:id/move | 태스크 이동 (드래그앤드롭) | Required |
| DELETE | /api/v1/tasks/:id | 태스크 삭제 | Required |
| POST | /api/v1/tasks/:id/comments | 코멘트 추가 | Required |
| GET | /api/v1/tasks/:id/comments | 코멘트 목록 | Required |

#### `PUT /api/v1/tasks/:id/move` (drag & drop)

**Request:**
```json
{
  "targetColumnId": "col_002",
  "newOrder": 2
}
```

**Response (200):**
```json
{
  "id": "task_xxx",
  "columnId": "col_002",
  "order": 2,
  "updatedAt": "2026-03-20T09:30:00Z"
}
```

### 4.6 Dashboard API

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | /api/v1/dashboard | 통합 대시보드 데이터 | Required |
| GET | /api/v1/notifications | 알림 목록 | Required |
| PUT | /api/v1/notifications/:id/read | 알림 읽음 처리 | Required |
| PUT | /api/v1/notifications/read-all | 전체 읽음 처리 | Required |

#### `GET /api/v1/dashboard` Response

```json
{
  "today": {
    "events": [/* 오늘 일정 3건 */],
    "tasks": [/* 내 진행중 태스크 5건 */],
    "attendance": { "checkIn": "09:00", "checkOut": null }
  },
  "summary": {
    "pendingLeaves": 2,
    "overdueTask": 1,
    "upcomingEvents": 5,
    "unreadNotifications": 3
  },
  "team": {
    "onLeave": ["김철수"],
    "recentActivity": [/* 최근 팀 활동 */]
  }
}
```

### 4.7 Zod Validation Schemas

```typescript
// src/lib/validations/employee.ts
import { z } from 'zod'

export const createEmployeeSchema = z.object({
  email: z.string().email('유효한 이메일을 입력하세요'),
  name: z.string().min(2, '이름은 2자 이상이어야 합니다'),
  employeeNo: z.string().regex(/^ASC-\d{4}-\d{3}$/, '사번 형식: ASC-YYYY-NNN'),
  position: z.string().min(1),
  departmentId: z.string().cuid(),
  phone: z.string().regex(/^010-\d{4}-\d{4}$/).optional(),
  hireDate: z.string().datetime(),
})

// src/lib/validations/task.ts
export const createTaskSchema = z.object({
  columnId: z.string().cuid(),
  title: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  assigneeId: z.string().cuid().optional(),
  dueDate: z.string().datetime().optional(),
})

export const moveTaskSchema = z.object({
  targetColumnId: z.string().cuid(),
  newOrder: z.number().int().min(0),
})

// src/lib/validations/event.ts
export const createEventSchema = z.object({
  title: z.string().min(1).max(200),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  description: z.string().max(5000).optional(),
  allDay: z.boolean().default(false),
  location: z.string().optional(),
  attendeeIds: z.array(z.string().cuid()).optional(),
  meetingRoomId: z.string().cuid().optional(),
  syncToGoogle: z.boolean().default(false),
})

// src/lib/validations/leave.ts
export const createLeaveSchema = z.object({
  type: z.enum(['ANNUAL', 'SICK', 'PERSONAL', 'MATERNITY', 'BEREAVEMENT']),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  reason: z.string().max(500).optional(),
})
```

---

## 5. UI/UX Design

### 5.1 Global Layout

```
┌──────────────────────────────────────────────────────────────┐
│  Logo   │  검색 (Cmd+K)           │  알림 🔔  │  프로필 👤  │
├─────────┼────────────────────────────────────────────────────┤
│         │                                                    │
│  📊     │  Main Content Area                                 │
│ Dashboard│                                                   │
│         │  (각 모듈별 페이지가 여기에 렌더링)                 │
│  👥     │                                                    │
│  HR     │                                                    │
│         │                                                    │
│  📅     │                                                    │
│ Calendar│                                                    │
│         │                                                    │
│  📋     │                                                    │
│  Kanban │                                                    │
│         │                                                    │
│ ─────── │                                                    │
│  ⚙️     │                                                    │
│ Settings│                                                    │
│         │                                                    │
└─────────┴────────────────────────────────────────────────────┘
```

### 5.2 Dashboard Page

```
┌──────────────────────────────────────────────────────────────┐
│  환영합니다, 홍길동님! 👋          2026-03-20 (금)           │
├──────────────────────────┬───────────────────────────────────┤
│  📊 오늘 현황            │  📅 오늘 일정                     │
│  ┌──────┐ ┌──────┐      │  ┌─────────────────────────────┐  │
│  │ 진행중│ │ 마감  │      │  │ 09:00 스탠드업 미팅         │  │
│  │  5   │ │ 임박 1│      │  │ 14:00 스프린트 리뷰          │  │
│  └──────┘ └──────┘      │  │ 16:00 1:1 미팅               │  │
│  ┌──────┐ ┌──────┐      │  └─────────────────────────────┘  │
│  │ 대기 │ │ 완료  │      │                                   │
│  │  3   │ │ 12   │      │                                   │
│  └──────┘ └──────┘      │                                   │
├──────────────────────────┼───────────────────────────────────┤
│  📋 내 태스크            │  👥 팀 현황                       │
│  ┌─────────────────────┐ │  ┌─────────────────────────────┐  │
│  │ ☐ API 엔드포인트 구현│ │  │ 김철수  - 연차 🏖️           │  │
│  │ ☑ DB 스키마 설계     │ │  │ 이영희  - 근무중 💻         │  │
│  │ ☐ UI 컴포넌트 작성   │ │  │ 박민수  - 외근 🚗           │  │
│  └─────────────────────┘ │  └─────────────────────────────┘  │
└──────────────────────────┴───────────────────────────────────┘
```

### 5.3 Kanban Board Page

```
┌──────────────────────────────────────────────────────────────┐
│  ERP 프로젝트 보드    [+ 컬럼 추가]  [필터 ▼]  [검색 🔍]    │
├──────────────┬──────────────┬──────────────┬─────────────────┤
│  📥 To Do    │ 🔄 In Progress│ 👀 Review   │ ✅ Done         │
│  ──────────  │  ──────────   │ ──────────   │ ──────────      │
│ ┌──────────┐ │ ┌──────────┐  │ ┌──────────┐ │ ┌──────────┐   │
│ │ 회의실    │ │ │ HR API   │  │ │ 캘린더   │ │ │ DB 설계  │   │
│ │ 예약 기능 │ │ │ 구현     │  │ │ 연동 QA  │ │ │          │   │
│ │ 🟡 Medium │ │ │ 🔴 High  │  │ │ 🟡 Medium│ │ │ 🟢 Low   │   │
│ │ 👤 박민수 │ │ │ 👤 홍길동│  │ │ 👤 이영희│ │ │ 👤 김철수│   │
│ │ 📅 03/28 │ │ │ 📅 03/25 │  │ │ 📅 03/26│ │ │ ✅ 03/18 │   │
│ └──────────┘ │ └──────────┘  │ └──────────┘ │ └──────────┘   │
│ ┌──────────┐ │ ┌──────────┐  │              │ ┌──────────┐   │
│ │ 알림     │ │ │ 칸반보드 │  │              │ │ 인증     │   │
│ │ 시스템   │ │ │ DnD 구현 │  │              │ │ 모듈     │   │
│ │ 🟡 Medium │ │ │ 🔴 High  │  │              │ │ 🟢 Low   │   │
│ └──────────┘ │ └──────────┘  │              │ └──────────┘   │
│              │               │              │                │
│ [+ 태스크]  │ [+ 태스크]    │ [+ 태스크]   │ [+ 태스크]     │
└──────────────┴──────────────┴──────────────┴─────────────────┘
```

### 5.4 User Flow

```
Login → Dashboard (홈)
  ├── HR
  │   ├── 내 프로필 조회/수정
  │   ├── 조직도 보기
  │   ├── 출퇴근 체크
  │   └── 휴가 신청 → 팀장 승인/반려
  │
  ├── Calendar
  │   ├── 월/주/일 뷰 전환
  │   ├── 일정 생성 → 참석자 초대
  │   ├── Google Calendar 연동 설정
  │   └── 회의실 예약
  │
  ├── Kanban
  │   ├── 보드 선택/생성
  │   ├── 태스크 생성 → 담당자 할당
  │   ├── 드래그앤드롭으로 상태 변경
  │   └── 태스크 상세 → 코멘트 작성
  │
  └── Settings (Admin)
      ├── 사용자 관리
      ├── 부서 관리
      └── 회의실 관리
```

### 5.5 Component List

| Component | Location | Responsibility |
|-----------|----------|----------------|
| `AppLayout` | `src/presentation/components/layout/` | 전체 레이아웃 (사이드바+헤더+메인) |
| `Sidebar` | `src/presentation/components/layout/` | 좌측 네비게이션 |
| `Header` | `src/presentation/components/layout/` | 상단 바 (검색, 알림, 프로필) |
| `DashboardWidgets` | `src/presentation/dashboard/` | 대시보드 위젯 모음 |
| `EmployeeTable` | `src/presentation/hr/` | 직원 목록 테이블 |
| `EmployeeForm` | `src/presentation/hr/` | 직원 등록/수정 폼 |
| `OrgChart` | `src/presentation/hr/` | 조직도 트리 뷰 |
| `AttendanceCard` | `src/presentation/hr/` | 출퇴근 체크 카드 |
| `LeaveRequestForm` | `src/presentation/hr/` | 휴가 신청 폼 |
| `LeaveApprovalList` | `src/presentation/hr/` | 휴가 승인 대기 목록 |
| `CalendarView` | `src/presentation/calendar/` | FullCalendar 래퍼 |
| `EventForm` | `src/presentation/calendar/` | 이벤트 생성/수정 폼 |
| `GoogleSyncSettings` | `src/presentation/calendar/` | Google 연동 설정 |
| `MeetingRoomPicker` | `src/presentation/calendar/` | 회의실 선택 UI |
| `KanbanBoard` | `src/presentation/kanban/` | 칸반보드 메인 (DnD) |
| `KanbanColumn` | `src/presentation/kanban/` | 개별 컬럼 |
| `TaskCard` | `src/presentation/kanban/` | 태스크 카드 |
| `TaskDetailModal` | `src/presentation/kanban/` | 태스크 상세 모달 |
| `TaskForm` | `src/presentation/kanban/` | 태스크 생성/수정 폼 |
| `CommentList` | `src/presentation/kanban/` | 코멘트 목록 |
| `NotificationDropdown` | `src/presentation/components/` | 알림 드롭다운 |
| `CommandPalette` | `src/presentation/components/` | Cmd+K 검색 팔레트 |

---

## 6. Error Handling

### 6.1 Error Code Definition

| Code | Message | Cause | Handling |
|------|---------|-------|----------|
| 400 | BAD_REQUEST | 입력 유효성 실패 | zod 에러 메시지 표시 |
| 401 | UNAUTHORIZED | 인증 실패/만료 | 로그인 페이지 리다이렉트 |
| 403 | FORBIDDEN | 권한 부족 | "권한이 없습니다" 토스트 |
| 404 | NOT_FOUND | 리소스 없음 | 404 페이지 표시 |
| 409 | CONFLICT | 중복 데이터 | 충돌 사항 안내 |
| 422 | VALIDATION_ERROR | 비즈니스 규칙 위반 | 상세 에러 메시지 표시 |
| 429 | TOO_MANY_REQUESTS | Rate limit 초과 | 재시도 안내 |
| 500 | INTERNAL_ERROR | 서버 에러 | "일시적 오류" + 로그 기록 |

### 6.2 Error Response Format

```typescript
// src/lib/errors.ts
interface ApiError {
  error: {
    code: string
    message: string
    details?: Record<string, string[]> // field-level errors
  }
}

// Usage in API Route
export function createApiError(code: string, message: string, details?: Record<string, string[]>) {
  return NextResponse.json(
    { error: { code, message, details } },
    { status: getHttpStatus(code) }
  )
}
```

### 6.3 Client-Side Error Handling

```typescript
// src/lib/api-client.ts
// TanStack Query 글로벌 에러 핸들러
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (error.status === 401 || error.status === 403) return false
        return failureCount < 2
      },
    },
    mutations: {
      onError: (error) => {
        if (error.status === 401) {
          redirect('/login')
        }
        toast.error(error.message)
      },
    },
  },
})
```

---

## 7. Security Considerations

- [x] Input validation: zod 스키마 기반 서버사이드 검증
- [x] Authentication: NextAuth.js v5 (JWT + Database sessions)
- [x] Authorization: Role-based middleware (Admin/Manager/Employee)
- [x] XSS prevention: React 기본 이스케이프 + DOMPurify (rich text)
- [x] SQL Injection: Prisma parameterized queries
- [x] CSRF: NextAuth.js 내장 CSRF 보호
- [x] HTTPS: 프로덕션 환경 강제
- [x] Rate Limiting: API Route middleware (express-rate-limit or upstash)
- [x] Sensitive data: 비밀번호 bcrypt 해싱, 환경변수 분리

### 7.1 Role-Based Access Control Matrix

| Resource | Admin | Manager | Employee |
|----------|:-----:|:-------:|:--------:|
| 직원 CRUD | Full | Read | Self only |
| 부서 관리 | Full | Read | Read |
| 근태 조회 | All | Team | Self |
| 휴가 승인 | All | Team | - |
| 캘린더 이벤트 | All | All | Own/Invited |
| 칸반 보드 | Full | Full | Assigned |
| 시스템 설정 | Full | - | - |

---

## 8. Test Plan

### 8.1 Test Scope

| Type | Target | Tool |
|------|--------|------|
| Unit Test | Services, Validators, Utils | Vitest |
| Integration Test | API Routes + Prisma | Vitest + Prisma (test DB) |
| E2E Test | User flows (로그인→기능사용) | Playwright |
| Component Test | UI 컴포넌트 렌더링 | Vitest + Testing Library |

### 8.2 Key Test Cases

**HR Module:**
- [ ] 직원 CRUD 정상 동작
- [ ] 권한별 접근 제한 (Employee가 다른 직원 수정 불가)
- [ ] 휴가 신청 → 승인 → 잔여일수 차감 플로우
- [ ] 출퇴근 중복 체크 방지

**Calendar Module:**
- [ ] 이벤트 CRUD + 참석자 초대
- [ ] Google Calendar 동기화 (양방향)
- [ ] 회의실 중복 예약 방지
- [ ] 반복 일정 생성

**Kanban Module:**
- [ ] 보드/컬럼/태스크 CRUD
- [ ] 드래그앤드롭 이동 + 순서 유지
- [ ] 필터링/검색 정확도
- [ ] 실시간 업데이트 (Socket.io)

**Auth:**
- [ ] 로그인/로그아웃 정상 동작
- [ ] 세션 만료 시 리다이렉트
- [ ] Role별 API 접근 제한

---

## 9. Clean Architecture

### 9.1 Layer Structure

| Layer | Responsibility | Location |
|-------|---------------|----------|
| **Presentation** | UI 컴포넌트, 페이지, 훅 | `src/presentation/`, `src/app/` |
| **Application** | 유스케이스, 서비스 로직 | `src/application/` |
| **Domain** | 엔티티, 비즈니스 규칙, 타입 | `src/domain/` |
| **Infrastructure** | DB, 외부 API, 알림 서비스 | `src/infrastructure/` |

### 9.2 Dependency Rules

```
┌─────────────────────────────────────────────────────────────┐
│                    Dependency Direction                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   Presentation ──→ Application ──→ Domain ←── Infrastructure│
│                          │                                  │
│                          └──→ Infrastructure                │
│                                                             │
│   Rule: Inner layers MUST NOT depend on outer layers        │
│         Domain is independent (no external dependencies)    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 9.3 Layer Assignment per Module

**HR Module:**

| Component | Layer | Location |
|-----------|-------|----------|
| `EmployeeTable`, `LeaveRequestForm` | Presentation | `src/presentation/hr/` |
| `EmployeeService`, `LeaveService` | Application | `src/application/hr/` |
| `Employee`, `LeaveRequest` types | Domain | `src/domain/hr/` |
| `EmployeeRepository`, `LeaveRepository` | Infrastructure | `src/infrastructure/hr/` |

**Calendar Module:**

| Component | Layer | Location |
|-----------|-------|----------|
| `CalendarView`, `EventForm` | Presentation | `src/presentation/calendar/` |
| `EventService`, `GoogleCalendarService` | Application | `src/application/calendar/` |
| `CalendarEvent`, `MeetingRoom` types | Domain | `src/domain/calendar/` |
| `EventRepository`, `GoogleCalendarClient` | Infrastructure | `src/infrastructure/calendar/` |

**Kanban Module:**

| Component | Layer | Location |
|-----------|-------|----------|
| `KanbanBoard`, `TaskCard` | Presentation | `src/presentation/kanban/` |
| `BoardService`, `TaskService` | Application | `src/application/kanban/` |
| `Board`, `Task`, `Column` types | Domain | `src/domain/kanban/` |
| `BoardRepository`, `TaskRepository` | Infrastructure | `src/infrastructure/kanban/` |

---

## 10. Coding Convention

### 10.1 Naming Conventions

| Target | Rule | Example |
|--------|------|---------|
| Components | PascalCase | `EmployeeTable`, `TaskCard` |
| Functions | camelCase | `getEmployeeById()`, `handleDragEnd()` |
| Constants | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT`, `DEFAULT_PAGE_SIZE` |
| Types/Interfaces | PascalCase | `Employee`, `CreateTaskInput` |
| Files (component) | PascalCase.tsx | `EmployeeTable.tsx` |
| Files (utility) | camelCase.ts | `formatDate.ts` |
| Files (service) | PascalCase.ts | `EmployeeService.ts` |
| Folders | kebab-case | `meeting-room/`, `google-calendar/` |
| API Routes | kebab-case | `/api/v1/leave-requests` |
| DB tables | snake_case | `leave_requests`, `calendar_events` |
| Env vars | UPPER_SNAKE_CASE | `DATABASE_URL`, `GOOGLE_CLIENT_ID` |

### 10.2 Import Order

```typescript
// 1. External libraries
import { useState, useCallback } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'

// 2. Internal absolute imports
import { Button, Dialog } from '@/presentation/components/ui'
import { EmployeeService } from '@/application/hr/EmployeeService'

// 3. Relative imports
import { useEmployeeFilter } from './hooks'

// 4. Type imports
import type { Employee, CreateEmployeeInput } from '@/domain/hr/types'

// 5. Styles (if any)
import './styles.css'
```

### 10.3 Commit Message Convention

```
<type>(<scope>): <subject> (한국어 가능)

type: feat, fix, refactor, style, test, docs, chore
scope: hr, calendar, kanban, auth, dashboard, common
```

Examples:
- `feat(hr): 직원 프로필 CRUD API 구현`
- `feat(kanban): 드래그앤드롭 태스크 이동 구현`
- `fix(calendar): Google Calendar 동기화 시간대 버그 수정`

---

## 11. Implementation Guide

### 11.1 File Structure

```
src/
├── app/                              # Next.js App Router
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── (main)/                       # 인증 필요 영역
│   │   ├── layout.tsx                # AppLayout 적용
│   │   ├── dashboard/page.tsx
│   │   ├── hr/
│   │   │   ├── employees/page.tsx
│   │   │   ├── employees/[id]/page.tsx
│   │   │   ├── org-chart/page.tsx
│   │   │   ├── attendance/page.tsx
│   │   │   └── leaves/page.tsx
│   │   ├── calendar/page.tsx
│   │   ├── kanban/
│   │   │   ├── page.tsx              # 보드 목록
│   │   │   └── [boardId]/page.tsx    # 개별 보드
│   │   └── settings/page.tsx
│   ├── api/
│   │   └── v1/
│   │       ├── employees/route.ts
│   │       ├── departments/route.ts
│   │       ├── attendances/route.ts
│   │       ├── leaves/route.ts
│   │       ├── events/route.ts
│   │       ├── google-calendar/route.ts
│   │       ├── meeting-rooms/route.ts
│   │       ├── boards/route.ts
│   │       ├── columns/route.ts
│   │       ├── tasks/route.ts
│   │       ├── dashboard/route.ts
│   │       └── notifications/route.ts
│   ├── layout.tsx
│   └── page.tsx                      # 리다이렉트 → /dashboard
│
├── domain/                           # 순수 타입 + 비즈니스 규칙
│   ├── hr/
│   │   └── types.ts                  # Employee, Department, Leave types
│   ├── calendar/
│   │   └── types.ts                  # CalendarEvent, MeetingRoom types
│   ├── kanban/
│   │   └── types.ts                  # Board, Column, Task types
│   └── common/
│       └── types.ts                  # Role, Pagination, ApiResponse types
│
├── application/                      # 서비스 레이어 (유스케이스)
│   ├── hr/
│   │   ├── EmployeeService.ts
│   │   ├── AttendanceService.ts
│   │   └── LeaveService.ts
│   ├── calendar/
│   │   ├── EventService.ts
│   │   └── GoogleCalendarService.ts
│   ├── kanban/
│   │   ├── BoardService.ts
│   │   └── TaskService.ts
│   └── notification/
│       └── NotificationService.ts
│
├── infrastructure/                   # 외부 의존성 구현
│   ├── db/
│   │   └── prisma.ts                 # Prisma client singleton
│   ├── hr/
│   │   ├── EmployeeRepository.ts
│   │   ├── AttendanceRepository.ts
│   │   └── LeaveRepository.ts
│   ├── calendar/
│   │   ├── EventRepository.ts
│   │   └── GoogleCalendarClient.ts
│   ├── kanban/
│   │   ├── BoardRepository.ts
│   │   └── TaskRepository.ts
│   └── notification/
│       └── NotificationRepository.ts
│
├── presentation/                     # UI 컴포넌트
│   ├── components/
│   │   ├── ui/                       # shadcn/ui 컴포넌트
│   │   ├── layout/
│   │   │   ├── AppLayout.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   └── Breadcrumb.tsx
│   │   ├── CommandPalette.tsx
│   │   └── NotificationDropdown.tsx
│   ├── dashboard/
│   │   ├── DashboardWidgets.tsx
│   │   ├── TodaySchedule.tsx
│   │   ├── MyTasks.tsx
│   │   └── TeamStatus.tsx
│   ├── hr/
│   │   ├── EmployeeTable.tsx
│   │   ├── EmployeeForm.tsx
│   │   ├── OrgChart.tsx
│   │   ├── AttendanceCard.tsx
│   │   ├── LeaveRequestForm.tsx
│   │   └── LeaveApprovalList.tsx
│   ├── calendar/
│   │   ├── CalendarView.tsx
│   │   ├── EventForm.tsx
│   │   ├── GoogleSyncSettings.tsx
│   │   └── MeetingRoomPicker.tsx
│   └── kanban/
│       ├── KanbanBoard.tsx
│       ├── KanbanColumn.tsx
│       ├── TaskCard.tsx
│       ├── TaskDetailModal.tsx
│       ├── TaskForm.tsx
│       └── CommentList.tsx
│
├── lib/                              # 유틸리티
│   ├── auth.ts                       # NextAuth 설정
│   ├── api-client.ts                 # TanStack Query 설정
│   ├── socket.ts                     # Socket.io client
│   ├── utils.ts                      # 공통 유틸
│   └── validations/                  # Zod 스키마
│       ├── employee.ts
│       ├── event.ts
│       ├── task.ts
│       └── leave.ts
│
├── hooks/                            # 커스텀 훅
│   ├── useAuth.ts
│   ├── useNotifications.ts
│   └── useSocket.ts
│
└── stores/                           # Zustand 스토어
    ├── useAuthStore.ts
    ├── useSidebarStore.ts
    └── useNotificationStore.ts

prisma/
├── schema.prisma
├── seed.ts                           # 초기 데이터 시딩
└── migrations/

docker-compose.yml                    # PostgreSQL + Redis
```

### 11.2 Implementation Order (AI 에이전트 사이클별)

#### Cycle 1: Foundation
```
순서: 1→2→3→4→5

1. [ ] 프로젝트 초기화
   - next.js 15 프로젝트 생성 (App Router, TypeScript)
   - 패키지 설치: prisma, @auth/prisma-adapter, zustand, @tanstack/react-query,
     tailwindcss, shadcn/ui, zod, react-hook-form, @hookform/resolvers
   - docker-compose.yml (PostgreSQL 15 + Redis 7)
   - tsconfig.json path aliases (@/ → src/)

2. [ ] Prisma 스키마 + 마이그레이션
   - schema.prisma 전체 작성 (위 Section 3.1)
   - npx prisma migrate dev --name init
   - prisma/seed.ts (Admin 유저 + 기본 부서 + 샘플 데이터)

3. [ ] NextAuth.js v5 인증
   - src/lib/auth.ts (Credentials + Google provider)
   - 로그인/회원가입 페이지
   - middleware.ts (인증 필수 라우트 보호)
   - Role 기반 접근 제어 유틸

4. [ ] 레이아웃 시스템
   - AppLayout (사이드바 + 헤더 + 메인)
   - Sidebar (네비게이션 메뉴)
   - Header (검색, 알림, 프로필)
   - shadcn/ui 기본 컴포넌트 설치

5. [ ] 공통 유틸
   - API 에러 핸들링 (src/lib/errors.ts)
   - TanStack Query 설정 (src/lib/api-client.ts)
   - Zustand 스토어 (auth, sidebar)
```

#### Cycle 2: HR Module - Employee & Department
```
순서: 1→2→3→4

1. [ ] Domain 타입 정의
   - src/domain/hr/types.ts

2. [ ] Repository + Service
   - EmployeeRepository, DepartmentRepository
   - EmployeeService, DepartmentService

3. [ ] API Routes
   - /api/v1/employees (CRUD)
   - /api/v1/departments (CRUD + tree)

4. [ ] UI 컴포넌트
   - EmployeeTable (목록 + 페이지네이션)
   - EmployeeForm (생성/수정)
   - OrgChart (부서 트리 뷰)
   - 페이지: /hr/employees, /hr/employees/[id], /hr/org-chart
```

#### Cycle 3: HR Module - Attendance & Leave
```
순서: 1→2→3→4

1. [ ] Repository + Service
   - AttendanceRepository, AttendanceService
   - LeaveRepository, LeaveService

2. [ ] API Routes
   - /api/v1/attendances (check-in, check-out, list)
   - /api/v1/leaves (CRUD + approve/reject)

3. [ ] UI 컴포넌트
   - AttendanceCard (출퇴근 체크)
   - LeaveRequestForm (휴가 신청)
   - LeaveApprovalList (승인 대기 목록)
   - 페이지: /hr/attendance, /hr/leaves

4. [ ] 비즈니스 로직
   - 중복 출근 체크 방지
   - 휴가 일수 계산 (주말 제외)
   - 승인 워크플로우 (PENDING → APPROVED/REJECTED)
```

#### Cycle 4: Calendar Module
```
순서: 1→2→3→4→5

1. [ ] Domain 타입 + Repository + Service
   - CalendarEvent, MeetingRoom types
   - EventRepository, EventService
   - GoogleCalendarClient, GoogleCalendarService

2. [ ] API Routes
   - /api/v1/events (CRUD + respond)
   - /api/v1/google-calendar (sync, status)
   - /api/v1/meeting-rooms (list, book, availability)

3. [ ] FullCalendar 통합
   - CalendarView (month/week/day 뷰)
   - 이벤트 클릭 → 상세 보기
   - 날짜 클릭 → 이벤트 생성

4. [ ] Google Calendar 연동
   - OAuth 2.0 인증 플로우
   - 양방향 동기화 (생성/수정/삭제)
   - 동기화 상태 표시

5. [ ] 회의실 예약
   - MeetingRoomPicker (가용 시간 표시)
   - 중복 예약 방지 로직
```

#### Cycle 5: Kanban Module
```
순서: 1→2→3→4→5

1. [ ] Domain 타입 + Repository + Service
   - Board, Column, Task, Comment types
   - BoardRepository, TaskRepository
   - BoardService, TaskService

2. [ ] API Routes
   - /api/v1/boards (CRUD)
   - /api/v1/columns (CRUD + reorder)
   - /api/v1/tasks (CRUD + move + comments)

3. [ ] 칸반보드 UI
   - KanbanBoard (@dnd-kit/core 기반)
   - KanbanColumn (드롭 영역)
   - TaskCard (드래그 가능 카드)

4. [ ] 태스크 상세
   - TaskDetailModal (모달 형태)
   - TaskForm (생성/수정)
   - CommentList (코멘트 CRUD)

5. [ ] Socket.io 실시간
   - 태스크 이동 시 다른 사용자에게 실시간 반영
   - 새 태스크/코멘트 알림
```

#### Cycle 6: Integration + Dashboard + Notification
```
순서: 1→2→3→4

1. [ ] 통합 대시보드
   - DashboardWidgets (오늘 현황, 일정, 태스크, 팀)
   - /api/v1/dashboard (통합 데이터)

2. [ ] 알림 시스템
   - NotificationService (생성 + 읽음 처리)
   - NotificationDropdown (실시간 업데이트)
   - Socket.io 실시간 알림 푸시

3. [ ] Cross-module 연동
   - 캘린더 이벤트 → 칸반 태스크 연결
   - 직원 프로필 → 할당된 태스크 목록
   - CommandPalette (Cmd+K 통합 검색)

4. [ ] 최종 정리
   - 반응형 레이아웃 점검
   - 에러 바운더리 설정
   - 로딩/빈 상태 UI 완성
```

### 11.3 Package Dependencies

```json
{
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@prisma/client": "^6.0.0",
    "next-auth": "^5.0.0",
    "@auth/prisma-adapter": "^2.0.0",
    "zustand": "^5.0.0",
    "@tanstack/react-query": "^5.0.0",
    "zod": "^3.23.0",
    "react-hook-form": "^7.53.0",
    "@hookform/resolvers": "^3.9.0",
    "@fullcalendar/core": "^6.0.0",
    "@fullcalendar/react": "^6.0.0",
    "@fullcalendar/daygrid": "^6.0.0",
    "@fullcalendar/timegrid": "^6.0.0",
    "@fullcalendar/interaction": "^6.0.0",
    "@dnd-kit/core": "^6.0.0",
    "@dnd-kit/sortable": "^8.0.0",
    "@dnd-kit/utilities": "^3.0.0",
    "socket.io": "^4.7.0",
    "socket.io-client": "^4.7.0",
    "googleapis": "^140.0.0",
    "bcryptjs": "^2.4.3",
    "date-fns": "^3.6.0",
    "sonner": "^1.5.0",
    "cmdk": "^1.0.0",
    "lucide-react": "^0.400.0"
  },
  "devDependencies": {
    "typescript": "^5.6.0",
    "prisma": "^6.0.0",
    "tailwindcss": "^3.4.0",
    "vitest": "^2.0.0",
    "@testing-library/react": "^16.0.0",
    "playwright": "^1.47.0",
    "eslint": "^9.0.0"
  }
}
```

---

## 12. AI Dual Agent Operation Guide

> 이 섹션은 오픈클로에서 팀장봇/직원봇을 셋업할 때 참조하는 가이드입니다.

### 12.1 직원봇에게 전달할 내용

각 사이클마다 다음을 직원봇에게 전달합니다:

```
[작업 지시]
1. 이 Design 문서의 "Cycle N" 섹션을 읽으세요
2. Implementation Order의 체크리스트를 순서대로 구현하세요
3. 구현 시 다음을 반드시 지켜주세요:
   - Section 3 (Data Model)의 Prisma 스키마 사용
   - Section 4 (API Spec)의 엔드포인트와 요청/응답 형식 준수
   - Section 9 (Clean Architecture) 레이어 분리
   - Section 10 (Convention) 네이밍 규칙
   - Section 4.7 (Zod Validation) 스키마 적용
4. 구현 완료 후 팀장에게 리뷰를 요청하세요
```

### 12.2 팀장봇 리뷰 기준

팀장봇은 다음 기준으로 리뷰합니다:

```
[리뷰 체크리스트]
1. Design 문서와의 일치도
   - API 엔드포인트가 Section 4와 일치하는가?
   - Prisma 스키마가 Section 3과 일치하는가?
   - 파일 구조가 Section 11.1과 일치하는가?
2. Clean Architecture 준수
   - domain 레이어에 외부 의존성이 없는가?
   - API Route에 비즈니스 로직이 직접 없는가?
3. 코드 품질
   - TypeScript strict, any 사용 없음
   - zod 검증 적용됨
   - 에러 핸들링 존재
4. 보안
   - 인증/인가 체크 존재
   - SQL injection/XSS 취약점 없음
```

### 12.3 사이클 완료 판정

팀장봇이 PASS 판정 시 다음을 출력합니다:

```
[PASS] Cycle N 완료
- 구현 파일: (파일 목록)
- 테스트: (통과 여부)
- 다음 사이클: Cycle N+1 진행 가능
```

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-03-20 | Initial design document | ASC Team |
