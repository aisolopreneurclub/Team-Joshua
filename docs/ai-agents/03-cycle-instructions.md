# 사이클별 작업 지시서 (오픈클로 투입용)

> 각 사이클마다 아래 지시서를 오픈클로 대화에 붙여넣으세요.
> 설계서(Design Document)는 첫 사이클에서 한 번만 전달하면 됩니다.

---

## 첫 대화 시작 메시지 (1회만)

```
안녕하세요 준호님, 민재 팀장입니다.

우리 ASC 사내 ERP 시스템을 구축합니다.
아래 설계서를 기반으로 사이클별로 작업을 진행해 주세요.

[여기에 internal-erp.design.md 전체 내용을 붙여넣기]

지금부터 Cycle 1 작업을 시작합니다. 아래 작업 지시를 따라주세요.
```

---

## Cycle 1: Foundation (프로젝트 초기화 + 인증)

```
[작업 지시] Cycle 1: Foundation

설계서 참조: Section 11.2 - Cycle 1

다음을 순서대로 구현하세요:

1. 프로젝트 초기화
   - Next.js 15 프로젝트 생성 (App Router, TypeScript strict)
   - 설계서 Section 11.3의 패키지 설치
   - docker-compose.yml 작성 (PostgreSQL 15 + Redis 7)
   - tsconfig.json에 path alias 설정 (@/ → src/)
   - Tailwind CSS + shadcn/ui 초기화

2. Prisma 스키마
   - 설계서 Section 3.1의 스키마를 prisma/schema.prisma에 작성
   - 전체 스키마를 그대로 사용하세요 (수정하지 마세요)
   - prisma/seed.ts 작성:
     - Admin 유저 1명 (admin@asc.com / admin1234)
     - 기본 부서 3개 (개발팀, 기획팀, 디자인팀)
     - 샘플 직원 5명

3. NextAuth.js v5 인증
   - src/lib/auth.ts: Credentials provider (이메일/비밀번호)
   - app/(auth)/login/page.tsx: 로그인 페이지
   - app/(auth)/signup/page.tsx: 회원가입 페이지
   - middleware.ts: 인증 필수 라우트 보호 (/(main)/* 경로)
   - 비밀번호: bcryptjs로 해싱

4. 레이아웃 시스템
   - src/presentation/components/layout/AppLayout.tsx
   - src/presentation/components/layout/Sidebar.tsx
     - 메뉴: Dashboard, HR(하위: 직원, 조직도, 근태, 휴가), Calendar, Kanban, Settings
     - 현재 경로 하이라이트
     - 접기/펴기 토글
   - src/presentation/components/layout/Header.tsx
     - 프로필 드롭다운 (이름, 역할, 로그아웃)
     - 알림 아이콘 (뱃지)
   - app/(main)/layout.tsx에 AppLayout 적용

5. 공통 유틸
   - src/lib/errors.ts: ApiError 클래스 + createApiError 함수
     (설계서 Section 6.2 형식)
   - src/lib/api-client.ts: TanStack Query 설정
   - src/stores/useAuthStore.ts: 인증 상태 관리
   - src/stores/useSidebarStore.ts: 사이드바 접힘 상태

파일 구조는 설계서 Section 11.1을 정확히 따르세요.
구현 완료 후 리뷰 보고서를 작성해 주세요.
```

---

## Cycle 2: HR Module - Employee & Department

```
[작업 지시] Cycle 2: HR - 직원 & 부서

설계서 참조: Section 11.2 - Cycle 2

다음을 순서대로 구현하세요:

1. Domain 타입
   - src/domain/hr/types.ts
   - Employee, Department, DepartmentMember 타입 정의
   - 설계서 Section 3.1 Prisma 모델 기반

2. Infrastructure
   - src/infrastructure/hr/EmployeeRepository.ts
     - findAll(page, limit, filters): 페이지네이션 + 부서 필터
     - findById(id): 부서 정보 포함
     - create(data), update(id, data), delete(id)
   - src/infrastructure/hr/DepartmentRepository.ts
     - findAll(): 트리 구조 반환 (부모-자식 관계)
     - create(data), update(id, data), delete(id)

3. Application
   - src/application/hr/EmployeeService.ts
     - getEmployees(), getEmployeeById(), createEmployee(), updateEmployee(), deleteEmployee()
     - createEmployee 시 User 생성 + Employee 생성 트랜잭션
   - src/application/hr/DepartmentService.ts
     - getDepartmentTree(), createDepartment(), updateDepartment(), deleteDepartment()

4. API Routes (설계서 Section 4.3 참조)
   - app/api/v1/employees/route.ts: GET(목록), POST(생성)
   - app/api/v1/employees/[id]/route.ts: GET(상세), PUT(수정), DELETE(삭제)
   - app/api/v1/departments/route.ts: GET(트리), POST(생성)
   - app/api/v1/departments/[id]/route.ts: PUT(수정), DELETE(삭제)
   - 모든 API에 인증 체크 + Role 권한 체크 적용
   - 입력 검증: 설계서 Section 4.7 zod 스키마 사용

5. UI 컴포넌트
   - src/presentation/hr/EmployeeTable.tsx
     - 테이블: 이름, 사번, 부서, 직급, 입사일
     - 페이지네이션 (20건/페이지)
     - 부서별 필터
   - src/presentation/hr/EmployeeForm.tsx
     - react-hook-form + zod
     - 생성/수정 모드 (isEdit prop)
     - Dialog 안에서 렌더링
   - src/presentation/hr/OrgChart.tsx
     - 부서 트리 뷰 (들여쓰기 + 펼치기/접기)
     - 부서별 직원 수 표시

6. 페이지
   - app/(main)/hr/employees/page.tsx: 직원 목록
   - app/(main)/hr/employees/[id]/page.tsx: 직원 상세
   - app/(main)/hr/org-chart/page.tsx: 조직도

구현 완료 후 리뷰 보고서를 작성해 주세요.
```

---

## Cycle 3: HR Module - Attendance & Leave

```
[작업 지시] Cycle 3: HR - 근태 & 휴가

설계서 참조: Section 11.2 - Cycle 3

다음을 순서대로 구현하세요:

1. Infrastructure
   - src/infrastructure/hr/AttendanceRepository.ts
     - findByEmployeeAndDate(): 오늘 출퇴근 조회
     - findByDateRange(): 기간별 근태 목록
     - checkIn(), checkOut()
   - src/infrastructure/hr/LeaveRepository.ts
     - findAll(filters): 상태별/기간별 필터
     - create(), approve(), reject(), cancel()

2. Application
   - src/application/hr/AttendanceService.ts
     - checkIn(): 중복 출근 방지 로직
     - checkOut(): 초과근무 자동 계산 (18시 이후)
     - getMyAttendance(): 본인 근태 조회
     - getTeamAttendance(): 팀 근태 조회 (Manager 이상)
   - src/application/hr/LeaveService.ts
     - requestLeave(): 휴가 신청 (주말 제외 일수 계산)
     - approveLeave(): 승인 (Manager 이상만)
     - rejectLeave(): 반려 (사유 필수)
     - getLeaveBalance(): 잔여 연차 조회

3. API Routes
   - app/api/v1/attendances/route.ts: GET(목록)
   - app/api/v1/attendances/check-in/route.ts: POST
   - app/api/v1/attendances/check-out/route.ts: POST
   - app/api/v1/leaves/route.ts: GET(목록), POST(신청)
   - app/api/v1/leaves/[id]/approve/route.ts: PUT
   - app/api/v1/leaves/[id]/reject/route.ts: PUT

4. UI 컴포넌트
   - src/presentation/hr/AttendanceCard.tsx
     - 오늘 출퇴근 상태 카드
     - 출근/퇴근 버튼 (상태에 따라 토글)
     - 이번 주 근무 시간 요약
   - src/presentation/hr/LeaveRequestForm.tsx
     - 휴가 유형 선택 (ANNUAL, SICK, PERSONAL, MATERNITY, BEREAVEMENT)
     - 날짜 범위 선택 (DateRangePicker)
     - 자동 일수 계산 표시
   - src/presentation/hr/LeaveApprovalList.tsx
     - PENDING 상태 휴가 목록 (Manager용)
     - 승인/반려 버튼 + 반려 사유 입력

5. 페이지
   - app/(main)/hr/attendance/page.tsx: 근태 관리
   - app/(main)/hr/leaves/page.tsx: 휴가 관리

비즈니스 로직 주의사항:
- 출근은 하루 1회만 가능 (중복 방지)
- 퇴근 전 출근이 선행되어야 함
- 휴가 일수 계산 시 주말(토,일) 제외
- Manager만 승인/반려 가능 (Role 체크)
- 반려 시 사유(reason) 필수

구현 완료 후 리뷰 보고서를 작성해 주세요.
```

---

## Cycle 4: Calendar Module

```
[작업 지시] Cycle 4: Calendar

설계서 참조: Section 11.2 - Cycle 4, Section 4.4

다음을 순서대로 구현하세요:

1. Domain + Infrastructure
   - src/domain/calendar/types.ts: CalendarEvent, MeetingRoom, EventAttendee 타입
   - src/infrastructure/calendar/EventRepository.ts
     - findByDateRange(start, end): 기간별 이벤트 조회
     - findById(id): 참석자 + 회의실 정보 포함
     - create(), update(), delete()
   - src/infrastructure/calendar/GoogleCalendarClient.ts
     - syncEvent(): 이벤트를 Google Calendar에 동기화
     - importEvents(): Google Calendar에서 이벤트 가져오기
     - deleteEvent(): Google Calendar에서 이벤트 삭제

2. Application
   - src/application/calendar/EventService.ts
     - getEvents(startDate, endDate)
     - createEvent(): 이벤트 생성 + 참석자 초대 + 회의실 예약 + Google 동기화
     - updateEvent(), deleteEvent()
     - respondToEvent(): 참석 응답 (ACCEPTED/DECLINED/TENTATIVE)
   - src/application/calendar/GoogleCalendarService.ts
     - connectAccount(): Google OAuth 연결
     - syncAll(): 전체 동기화
     - getSyncStatus()

3. API Routes (설계서 Section 4.4 참조)
   - app/api/v1/events/route.ts: GET(?start=&end=), POST
   - app/api/v1/events/[id]/route.ts: GET, PUT, DELETE
   - app/api/v1/events/[id]/respond/route.ts: POST
   - app/api/v1/google-calendar/sync/route.ts: POST
   - app/api/v1/google-calendar/status/route.ts: GET
   - app/api/v1/meeting-rooms/route.ts: GET
   - app/api/v1/meeting-rooms/[id]/book/route.ts: POST
   - app/api/v1/meeting-rooms/[id]/availability/route.ts: GET

4. UI 컴포넌트
   - src/presentation/calendar/CalendarView.tsx
     - FullCalendar 래퍼 (month/week/day 뷰)
     - 이벤트 클릭 → 상세 보기
     - 빈 날짜 클릭 → 이벤트 생성 폼
     - 이벤트 색상 표시
   - src/presentation/calendar/EventForm.tsx
     - 제목, 설명, 시작/종료 시간, 종일 여부
     - 참석자 검색/선택 (직원 목록에서)
     - 회의실 선택 (MeetingRoomPicker)
     - Google Calendar 동기화 체크박스
   - src/presentation/calendar/GoogleSyncSettings.tsx
     - Google 계정 연결/해제
     - 동기화 상태 표시
     - 수동 동기화 버튼
   - src/presentation/calendar/MeetingRoomPicker.tsx
     - 회의실 목록 (이름, 층, 수용인원, 장비)
     - 선택 시간에 가용한 회의실만 표시

5. 페이지
   - app/(main)/calendar/page.tsx: 캘린더 메인

주의사항:
- Google Calendar 연동은 googleapis 패키지 사용
- 시간대(timezone) 처리: 모든 시간은 KST(Asia/Seoul) 기준
- 회의실 중복 예약 방지 (겹치는 시간 체크)
- FullCalendar 이벤트 객체 형식에 맞게 변환

구현 완료 후 리뷰 보고서를 작성해 주세요.
```

---

## Cycle 5: Kanban Module

```
[작업 지시] Cycle 5: Kanban

설계서 참조: Section 11.2 - Cycle 5, Section 4.5

다음을 순서대로 구현하세요:

1. Domain + Infrastructure
   - src/domain/kanban/types.ts: Board, Column, Task, Comment, Label 타입
   - src/infrastructure/kanban/BoardRepository.ts
     - findAll(): 보드 목록
     - findById(id): 컬럼 + 태스크 + 담당자 포함 (보드 전체 로드)
     - create(), update(), archive()
   - src/infrastructure/kanban/TaskRepository.ts
     - create(), update(), delete()
     - moveTask(taskId, targetColumnId, newOrder): 태스크 이동 + 순서 재정렬
     - findWithFilters(boardId, filters): 담당자/우선순위/마감일 필터

2. Application
   - src/application/kanban/BoardService.ts
     - getBoards(), getBoardDetail(), createBoard(), updateBoard(), archiveBoard()
     - addColumn(), updateColumn(), reorderColumns(), deleteColumn()
   - src/application/kanban/TaskService.ts
     - createTask(): 생성 + 알림 (assignee에게)
     - updateTask(), deleteTask()
     - moveTask(): 컬럼 이동 + order 재계산
     - addComment(), getComments()

3. API Routes (설계서 Section 4.5 참조)
   - app/api/v1/boards/route.ts: GET, POST
   - app/api/v1/boards/[id]/route.ts: GET(상세+컬럼+태스크), PUT, DELETE
   - app/api/v1/boards/[id]/columns/route.ts: POST
   - app/api/v1/columns/[id]/route.ts: PUT, DELETE
   - app/api/v1/columns/reorder/route.ts: PUT
   - app/api/v1/tasks/route.ts: POST
   - app/api/v1/tasks/[id]/route.ts: PUT, DELETE
   - app/api/v1/tasks/[id]/move/route.ts: PUT
   - app/api/v1/tasks/[id]/comments/route.ts: GET, POST

4. UI 컴포넌트 (핵심)
   - src/presentation/kanban/KanbanBoard.tsx
     - @dnd-kit/core 기반 드래그앤드롭
     - DndContext + SortableContext
     - 컬럼 간 태스크 이동 지원
     - 필터 바 (담당자, 우선순위, 마감일)
   - src/presentation/kanban/KanbanColumn.tsx
     - 컬럼 헤더 (이름, 태스크 수, 색상)
     - useDroppable 적용
     - [+ 태스크] 버튼
   - src/presentation/kanban/TaskCard.tsx
     - useSortable 적용
     - 제목, 우선순위 뱃지, 담당자 아바타, 마감일
     - 우선순위별 색상: LOW(초록), MEDIUM(노랑), HIGH(빨강), URGENT(보라)
   - src/presentation/kanban/TaskDetailModal.tsx
     - Sheet(사이드 패널) 형태
     - 태스크 전체 정보 표시/수정
     - 코멘트 목록 + 입력
   - src/presentation/kanban/TaskForm.tsx
     - 제목, 설명, 담당자 선택, 우선순위, 마감일
   - src/presentation/kanban/CommentList.tsx
     - 코멘트 목록 (작성자, 시간, 내용)
     - 새 코멘트 입력

5. 페이지
   - app/(main)/kanban/page.tsx: 보드 목록
   - app/(main)/kanban/[boardId]/page.tsx: 개별 보드

DnD 구현 핵심:
- onDragEnd에서 PUT /api/v1/tasks/:id/move 호출
- optimistic update: UI 먼저 이동 → API 성공 시 확정, 실패 시 롤백
- 같은 컬럼 내 순서 변경도 지원
- 컬럼 간 이동 시 targetColumnId + newOrder 전달

구현 완료 후 리뷰 보고서를 작성해 주세요.
```

---

## Cycle 6: Integration + Dashboard + Notification

```
[작업 지시] Cycle 6: 통합 + 대시보드 + 알림

설계서 참조: Section 11.2 - Cycle 6, Section 4.6, Section 5.2

다음을 순서대로 구현하세요:

1. 통합 대시보드
   - src/application/dashboard/DashboardService.ts
     - getDashboardData(): 오늘 일정, 내 태스크, 근태, 팀 현황 통합 조회
   - app/api/v1/dashboard/route.ts: GET
     (설계서 Section 4.6 응답 형식 참조)
   - src/presentation/dashboard/DashboardWidgets.tsx: 위젯 컨테이너
   - src/presentation/dashboard/TodaySchedule.tsx: 오늘 일정 위젯
   - src/presentation/dashboard/MyTasks.tsx: 내 태스크 위젯 (진행중/마감임박)
   - src/presentation/dashboard/TeamStatus.tsx: 팀 현황 (출근/휴가/외근)
   - app/(main)/dashboard/page.tsx
   - 설계서 Section 5.2 와이어프레임 참조

2. 알림 시스템
   - src/application/notification/NotificationService.ts
     - createNotification(): 알림 생성
     - getNotifications(): 목록 조회
     - markAsRead(), markAllAsRead()
   - app/api/v1/notifications/route.ts: GET
   - app/api/v1/notifications/[id]/read/route.ts: PUT
   - app/api/v1/notifications/read-all/route.ts: PUT
   - src/presentation/components/NotificationDropdown.tsx
     - 헤더 알림 아이콘 클릭 시 드롭다운
     - 읽지 않은 알림 수 뱃지
     - 알림 클릭 시 해당 페이지로 이동

   알림 트리거 (기존 Service에 추가):
   - TaskService.createTask() → TASK_ASSIGNED 알림 (assignee에게)
   - LeaveService.approveLeave() → LEAVE_APPROVED 알림
   - LeaveService.rejectLeave() → LEAVE_REJECTED 알림
   - EventService.createEvent() → EVENT_INVITE 알림 (참석자들에게)

3. Cross-module 연동
   - 직원 상세 페이지에 "할당된 태스크" 목록 추가
   - 태스크 상세에서 관련 캘린더 이벤트 링크
   - src/presentation/components/CommandPalette.tsx
     - cmdk 패키지 사용
     - Cmd+K로 열기
     - 직원/태스크/이벤트 통합 검색
     - 검색 결과 클릭 시 해당 페이지로 이동

4. 최종 마무리
   - app/page.tsx: / 접근 시 /dashboard로 리다이렉트
   - 모든 페이지 로딩 스켈레톤 확인
   - 모든 에러 상태 UI 확인
   - 빈 상태(empty state) UI 확인 ("아직 데이터가 없습니다")
   - app/(main)/settings/page.tsx: 기본 설정 페이지 (프로필 수정)

구현 완료 후 리뷰 보고서를 작성해 주세요.
이번 사이클이 마지막입니다. PASS 판정 후 전체 프로젝트 완료 보고를 해주세요.
```

---

## 티키타카 운영 가이드

### 대화 흐름 예시

```
사람: [Cycle 1 작업 지시 붙여넣기]
준호(직원봇): [구현 + 구현 완료 보고]
민재(팀장봇): [리뷰 → FAIL: 수정사항 3건]
준호(직원봇): [수정 + 수정 완료 보고]
민재(팀장봇): [재리뷰 → PASS]
사람: [Cycle 2 작업 지시 붙여넣기]
... 반복 ...
```

### 비용 절감 팁

1. **설계서는 1회만 전달**: 첫 대화에서 Design 문서 전체를 전달하고, 이후 사이클에서는 작업 지시만 전달
2. **짧은 피드백 루프**: 팀장봇이 한 번에 7건 이하로 피드백하여 수정-재리뷰 횟수 최소화
3. **사이클 분리**: 한 대화가 너무 길어지면 새 대화 시작 (컨텍스트 리셋으로 토큰 절감)
4. **PASS 후 빠르게 다음**: 사이클 PASS 받으면 즉시 다음 지시서 투입

### 오픈클로 설정

| 설정 | 권장값 |
|------|--------|
| 모델 | Claude Sonnet 4.6 (비용/성능 균형) |
| Temperature | 0 (결정론적 코드 생성) |
| Max Tokens | 16,000 (충분한 코드 길이) |
| 에이전트 수 | 2 (준호 + 민재) |
