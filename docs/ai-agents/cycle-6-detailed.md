# Cycle 6: Integration + Dashboard + Notification (상세 지시서)

---

## 작업 지시

마지막 Cycle 6입니다. 통합 대시보드, 알림 시스템, Cross-module 연동을 구현하세요.

---

## 1. Dashboard Service

```typescript
// src/application/dashboard/DashboardService.ts

interface DashboardData {
  today: {
    events: { id: string; title: string; startTime: Date; endTime: Date; location: string | null }[]
    tasks: { id: string; title: string; priority: Priority; dueDate: Date | null; columnName: string }[]
    attendance: { checkIn: Date | null; checkOut: Date | null; overtime: number } | null
  }
  summary: {
    pendingLeaves: number
    overdueTasks: number
    upcomingEvents: number
    unreadNotifications: number
  }
  team: {
    onLeave: { name: string; type: LeaveType; endDate: Date }[]
    recentActivity: { id: string; message: string; createdAt: Date }[]
  }
}

export class DashboardService {
  async getDashboardData(employeeId: string, userId: string): Promise<DashboardData> {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const [events, tasks, attendance, pendingLeaves, overdueTasks, upcomingEvents, unreadNotifications, onLeave] =
      await Promise.all([
        // 오늘 일정 (본인이 creator이거나 attendee)
        prisma.calendarEvent.findMany({
          where: {
            startTime: { gte: today, lt: tomorrow },
            OR: [
              { creatorId: employeeId },
              { attendees: { some: { employeeId } } },
            ],
          },
          select: { id: true, title: true, startTime: true, endTime: true, location: true },
          orderBy: { startTime: 'asc' },
          take: 5,
        }),

        // 내 진행중 태스크
        prisma.task.findMany({
          where: {
            assigneeId: employeeId,
            column: { name: { not: 'Done' } },
          },
          select: {
            id: true, title: true, priority: true, dueDate: true,
            column: { select: { name: true } },
          },
          orderBy: [{ priority: 'desc' }, { dueDate: 'asc' }],
          take: 5,
        }),

        // 오늘 근태
        prisma.attendance.findUnique({
          where: { employeeId_date: { employeeId, date: today } },
        }),

        // 대기중 휴가
        prisma.leaveRequest.count({
          where: { status: 'PENDING' },
        }),

        // 마감 지난 태스크
        prisma.task.count({
          where: {
            assigneeId: employeeId,
            dueDate: { lt: today },
            column: { name: { not: 'Done' } },
          },
        }),

        // 이번 주 일정 수
        prisma.calendarEvent.count({
          where: {
            startTime: { gte: today, lt: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000) },
            OR: [
              { creatorId: employeeId },
              { attendees: { some: { employeeId } } },
            ],
          },
        }),

        // 안 읽은 알림
        prisma.notification.count({
          where: { userId, isRead: false },
        }),

        // 오늘 휴가 중인 팀원
        prisma.leaveRequest.findMany({
          where: {
            status: 'APPROVED',
            startDate: { lte: today },
            endDate: { gte: today },
          },
          select: {
            type: true,
            endDate: true,
            employee: { select: { user: { select: { name: true } } } },
          },
        }),
      ])

    return {
      today: {
        events,
        tasks: tasks.map(t => ({ ...t, columnName: t.column.name })),
        attendance: attendance ? {
          checkIn: attendance.checkIn,
          checkOut: attendance.checkOut,
          overtime: attendance.overtime,
        } : null,
      },
      summary: {
        pendingLeaves,
        overdueTasks,
        upcomingEvents,
        unreadNotifications,
      },
      team: {
        onLeave: onLeave.map(l => ({
          name: l.employee.user.name,
          type: l.type,
          endDate: l.endDate,
        })),
        recentActivity: [], // TODO: 최근 활동 로그
      },
    }
  }
}
```

## 2. Notification 시스템

```typescript
// src/application/notification/NotificationService.ts

export class NotificationService {
  async create(data: {
    userId: string
    type: NotificationType
    title: string
    message: string
    link?: string
  }) {
    return prisma.notification.create({ data })
  }

  async getByUserId(userId: string, limit = 20) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })
  }

  async markAsRead(id: string) {
    return prisma.notification.update({
      where: { id },
      data: { isRead: true },
    })
  }

  async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    })
  }

  async getUnreadCount(userId: string) {
    return prisma.notification.count({
      where: { userId, isRead: false },
    })
  }
}

// 기존 Service에 알림 트리거 추가:

// TaskService.createTask() 에 추가:
// if (input.assigneeId) {
//   const assignee = await prisma.employee.findUnique({
//     where: { id: input.assigneeId },
//     select: { userId: true },
//   })
//   if (assignee) {
//     await notificationService.create({
//       userId: assignee.userId,
//       type: 'TASK_ASSIGNED',
//       title: '새 태스크가 할당되었습니다',
//       message: `"${input.title}" 태스크가 할당되었습니다`,
//       link: `/kanban/${boardId}?task=${task.id}`,
//     })
//   }
// }

// LeaveService.approveLeave() 에 추가:
// await notificationService.create({
//   userId: leave.employee.userId,
//   type: 'LEAVE_APPROVED',
//   title: '휴가가 승인되었습니다',
//   message: `${leave.startDate} ~ ${leave.endDate} 휴가가 승인되었습니다`,
//   link: '/hr/leaves',
// })

// LeaveService.rejectLeave() 에 추가:
// await notificationService.create({
//   userId: leave.employee.userId,
//   type: 'LEAVE_REJECTED',
//   title: '휴가가 반려되었습니다',
//   message: `${leave.startDate} ~ ${leave.endDate} 휴가가 반려되었습니다. 사유: ${reason}`,
//   link: '/hr/leaves',
// })

// EventService.createEvent() 에 추가:
// for (const attendeeId of input.attendeeIds) {
//   const attendee = await prisma.employee.findUnique({
//     where: { id: attendeeId },
//     select: { userId: true },
//   })
//   if (attendee) {
//     await notificationService.create({
//       userId: attendee.userId,
//       type: 'EVENT_INVITE',
//       title: '일정 초대',
//       message: `"${input.title}" 일정에 초대되었습니다`,
//       link: `/calendar?event=${event.id}`,
//     })
//   }
// }
```

## 3. Dashboard UI

```tsx
// src/presentation/dashboard/DashboardWidgets.tsx
// 4-grid 레이아웃 (2x2):
// ┌──────────────────┬──────────────────┐
// │ 오늘 현황 요약   │ 오늘 일정        │
// │ (4개 카드)       │ (TodaySchedule)  │
// ├──────────────────┼──────────────────┤
// │ 내 태스크        │ 팀 현황          │
// │ (MyTasks)        │ (TeamStatus)     │
// └──────────────────┴──────────────────┘

// 요약 카드 4개:
// - 진행중 태스크 수 (아이콘: ClipboardList)
// - 마감 임박 (빨간색 강조, 아이콘: AlertTriangle)
// - 대기 중 휴가 (Manager만, 아이콘: Calendar)
// - 안 읽은 알림 (아이콘: Bell)

// src/presentation/dashboard/TodaySchedule.tsx
// - 오늘 이벤트 타임라인
// - 시간 + 제목 + 장소
// - 빈 경우: "오늘 예정된 일정이 없습니다"

// src/presentation/dashboard/MyTasks.tsx
// - 내 태스크 목록 (우선순위 뱃지 + 상태)
// - 클릭 시 칸반보드 해당 태스크로 이동
// - "모두 보기" 링크 → /kanban

// src/presentation/dashboard/TeamStatus.tsx
// - 오늘 휴가 중인 팀원 목록
// - 휴가 유형 아이콘
// - 빈 경우: "모든 팀원이 근무 중입니다"
```

## 4. Notification Dropdown

```tsx
// src/presentation/components/NotificationDropdown.tsx
'use client'

// 구현 요점:
// - Header의 Bell 아이콘 클릭 시 Popover 열기
// - 안 읽은 알림 수 뱃지 (빨간 원)
// - 알림 목록: type별 아이콘 + 제목 + 시간 (formatDistanceToNow)
// - 안 읽은 알림은 배경색 구분 (bg-blue-50)
// - 알림 클릭: markAsRead + link로 이동
// - "모두 읽음" 버튼
// - useQuery로 폴링 (refetchInterval: 30000, 30초)

// NotificationType별 아이콘:
// TASK_ASSIGNED: ClipboardCheck
// TASK_UPDATED: RefreshCw
// LEAVE_REQUEST: CalendarPlus
// LEAVE_APPROVED: CheckCircle (녹색)
// LEAVE_REJECTED: XCircle (빨강)
// EVENT_INVITE: CalendarHeart
// EVENT_REMINDER: Bell
// HR_ANNOUNCEMENT: Megaphone
```

## 5. Command Palette (통합 검색)

```tsx
// src/presentation/components/CommandPalette.tsx
'use client'

import { CommandDialog, CommandInput, CommandList, CommandGroup, CommandItem } from 'cmdk'

// 구현 요점:
// - Cmd+K (Mac) / Ctrl+K (Windows)로 열기
// - 검색 대상: 직원, 태스크, 이벤트
// - 그룹별 표시:
//   - 직원: 이름, 부서, 직급 → /hr/employees/[id]
//   - 태스크: 제목, 보드이름 → /kanban/[boardId]?task=[id]
//   - 일정: 제목, 날짜 → /calendar?event=[id]
// - 디바운스 검색 (300ms)
// - API: GET /api/v1/search?q={query} (새 엔드포인트, 3가지 동시 검색)
// - 빈 결과: "검색 결과가 없습니다"
// - 빠른 이동:
//   - "대시보드" → /dashboard
//   - "직원" → /hr/employees
//   - "캘린더" → /calendar
//   - "보드" → /kanban

// app/api/v1/search/route.ts
// GET ?q=검색어
// 응답: { employees: [...], tasks: [...], events: [...] }
// 각 최대 5건
```

## 6. Cross-module 연동

```
추가 구현 사항:

1. 직원 상세 페이지 (/hr/employees/[id])에 추가:
   - "할당된 태스크" 섹션: assigneeId가 이 직원인 태스크 목록
   - GET /api/v1/tasks?assigneeId={employeeId}

2. 태스크 상세 (TaskDetailModal)에 추가:
   - "관련 일정" 링크 (있을 경우)
   - 태스크 마감일 → 캘린더 이벤트로 생성 버튼 (선택)

3. 사이드바 알림 뱃지:
   - HR 메뉴: 대기 중 휴가 수 (Manager)
   - Kanban 메뉴: 마감 임박 태스크 수
```

## 7. 마무리 체크리스트

```
모든 페이지 점검:
- [ ] / → /dashboard 리다이렉트
- [ ] /dashboard: 4개 위젯 정상 표시
- [ ] /hr/employees: 목록 + CRUD
- [ ] /hr/employees/[id]: 상세 + 수정 + 태스크 목록
- [ ] /hr/org-chart: 조직도 트리
- [ ] /hr/attendance: 출퇴근 카드
- [ ] /hr/leaves: 신청 + 승인/반려
- [ ] /calendar: FullCalendar 뷰 + CRUD
- [ ] /kanban: 보드 목록
- [ ] /kanban/[id]: 칸반보드 + DnD
- [ ] /settings: 프로필 수정

UX 점검:
- [ ] 모든 비동기 작업에 로딩 스켈레톤/스피너
- [ ] 모든 에러에 toast 알림
- [ ] 빈 상태에 안내 메시지
- [ ] 모바일에서 사이드바 접힘/햄버거 메뉴

보안 점검:
- [ ] 모든 API에 인증 체크
- [ ] Role별 접근 제어 정상
- [ ] 환경변수 하드코딩 없음
```

---

이번 사이클이 마지막입니다.
구현 완료 후 리뷰 보고서와 함께 전체 프로젝트 완료 보고를 작성해 주세요.

```
[전체 완료 보고]
Cycle 1~6 구현 완료

구현된 모듈:
- Foundation: (파일 수)
- HR: (파일 수)
- Calendar: (파일 수)
- Kanban: (파일 수)
- Integration: (파일 수)

총 파일 수: N개
주요 기술: Next.js 15, Prisma, NextAuth, shadcn/ui, @dnd-kit, FullCalendar

최종 점검 결과: (마무리 체크리스트 통과 여부)
```
