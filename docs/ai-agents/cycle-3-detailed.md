# Cycle 3: HR - 근태 & 휴가 (상세 지시서)

---

## 작업 지시

Cycle 3를 시작합니다. 근태 관리와 휴가 관리를 구현하세요.

---

## 1. Domain 타입

```typescript
// src/domain/hr/types.ts에 추가

export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'
export type LeaveType = 'ANNUAL' | 'SICK' | 'PERSONAL' | 'MATERNITY' | 'BEREAVEMENT'

export interface Attendance {
  id: string
  employeeId: string
  date: Date
  checkIn: Date | null
  checkOut: Date | null
  overtime: number // 분 단위
  note: string | null
}

export interface LeaveRequest {
  id: string
  employeeId: string
  type: LeaveType
  startDate: Date
  endDate: Date
  reason: string | null
  status: LeaveStatus
  approverId: string | null
  approvedAt: Date | null
  employee?: { user: { name: string } }
}

export type CreateLeaveInput = {
  type: LeaveType
  startDate: string
  endDate: string
  reason?: string
}

export interface LeaveBalance {
  total: number      // 총 연차
  used: number       // 사용
  remaining: number  // 잔여
}
```

## 2. Zod Validation

```typescript
// src/lib/validations/leave.ts
import { z } from 'zod'

export const createLeaveSchema = z.object({
  type: z.enum(['ANNUAL', 'SICK', 'PERSONAL', 'MATERNITY', 'BEREAVEMENT']),
  startDate: z.string().min(1, '시작일을 입력하세요'),
  endDate: z.string().min(1, '종료일을 입력하세요'),
  reason: z.string().max(500).optional(),
}).refine(
  (data) => new Date(data.endDate) >= new Date(data.startDate),
  { message: '종료일은 시작일 이후여야 합니다', path: ['endDate'] }
)

export const rejectLeaveSchema = z.object({
  reason: z.string().min(1, '반려 사유를 입력하세요').max(500),
})
```

## 3. 비즈니스 로직 핵심

```typescript
// src/application/hr/AttendanceService.ts

export class AttendanceService {
  // 출근 체크
  async checkIn(employeeId: string) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // 중복 출근 방지
    const existing = await repo.findByEmployeeAndDate(employeeId, today)
    if (existing?.checkIn) {
      throw new Error('이미 출근 처리되었습니다')
    }

    return repo.upsert(employeeId, today, { checkIn: new Date() })
  }

  // 퇴근 체크
  async checkOut(employeeId: string) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const attendance = await repo.findByEmployeeAndDate(employeeId, today)
    if (!attendance?.checkIn) {
      throw new Error('출근 기록이 없습니다')
    }
    if (attendance.checkOut) {
      throw new Error('이미 퇴근 처리되었습니다')
    }

    // 초과근무 계산 (18시 이후 분 단위)
    const now = new Date()
    const endOfWork = new Date(today)
    endOfWork.setHours(18, 0, 0, 0)
    const overtime = now > endOfWork ? Math.floor((now.getTime() - endOfWork.getTime()) / 60000) : 0

    return repo.upsert(employeeId, today, { checkOut: now, overtime })
  }
}

// src/application/hr/LeaveService.ts

export class LeaveService {
  // 주말 제외 일수 계산
  private countBusinessDays(start: Date, end: Date): number {
    let count = 0
    const current = new Date(start)
    while (current <= end) {
      const day = current.getDay()
      if (day !== 0 && day !== 6) count++ // 토,일 제외
      current.setDate(current.getDate() + 1)
    }
    return count
  }

  async requestLeave(employeeId: string, input: CreateLeaveInput) {
    const startDate = new Date(input.startDate)
    const endDate = new Date(input.endDate)
    const days = this.countBusinessDays(startDate, endDate)

    if (days === 0) throw new Error('유효한 휴가 일수가 없습니다')

    // 잔여 연차 체크 (ANNUAL인 경우)
    if (input.type === 'ANNUAL') {
      const balance = await this.getLeaveBalance(employeeId)
      if (balance.remaining < days) {
        throw new Error(`잔여 연차가 부족합니다 (잔여: ${balance.remaining}일, 요청: ${days}일)`)
      }
    }

    return repo.create({
      employeeId,
      type: input.type,
      startDate,
      endDate,
      reason: input.reason,
      status: 'PENDING',
    })
  }

  async approveLeave(leaveId: string, approverId: string) {
    const leave = await repo.findById(leaveId)
    if (!leave) throw new Error('휴가 신청을 찾을 수 없습니다')
    if (leave.status !== 'PENDING') throw new Error('대기 중인 신청만 승인할 수 있습니다')

    return repo.update(leaveId, {
      status: 'APPROVED',
      approverId,
      approvedAt: new Date(),
    })
  }

  async rejectLeave(leaveId: string, approverId: string, reason: string) {
    const leave = await repo.findById(leaveId)
    if (!leave) throw new Error('휴가 신청을 찾을 수 없습니다')
    if (leave.status !== 'PENDING') throw new Error('대기 중인 신청만 반려할 수 있습니다')

    return repo.update(leaveId, {
      status: 'REJECTED',
      approverId,
      approvedAt: new Date(),
      // reason은 별도 필드나 note로 저장
    })
  }

  async getLeaveBalance(employeeId: string): Promise<LeaveBalance> {
    const currentYear = new Date().getFullYear()
    const total = 15 // 기본 연차 15일 (추후 근속연수에 따라 조정)
    const used = await repo.countApprovedLeaves(employeeId, currentYear, 'ANNUAL')
    return { total, used, remaining: total - used }
  }
}
```

## 4. API Routes

```typescript
// app/api/v1/attendances/check-in/route.ts
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return createApiError('UNAUTHORIZED', '로그인이 필요합니다')

  try {
    // session에서 employeeId 가져오기
    const employee = await getEmployeeByUserId(session.user.id)
    const result = await attendanceService.checkIn(employee.id)
    return NextResponse.json(result)
  } catch (error) {
    return createApiError('BAD_REQUEST', error instanceof Error ? error.message : '출근 처리 실패')
  }
}

// app/api/v1/leaves/[id]/approve/route.ts
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return createApiError('UNAUTHORIZED', '로그인이 필요합니다')
  if (session.user.role === 'EMPLOYEE') return createApiError('FORBIDDEN', '승인 권한이 없습니다')

  try {
    const employee = await getEmployeeByUserId(session.user.id)
    const result = await leaveService.approveLeave(params.id, employee.id)
    return NextResponse.json(result)
  } catch (error) {
    return createApiError('BAD_REQUEST', error instanceof Error ? error.message : '승인 처리 실패')
  }
}
```

## 5. UI 컴포넌트

```tsx
// src/presentation/hr/AttendanceCard.tsx
// 구현 요점:
// - 오늘 출퇴근 상태를 GET /api/v1/attendances?date=today로 조회
// - 출근 전: "출근하기" 버튼 (파란색)
// - 출근 후: 출근 시간 표시 + "퇴근하기" 버튼 (빨간색)
// - 퇴근 후: 출퇴근 시간 모두 표시 + 근무시간 계산
// - 이번 주 근무시간 요약 (하단)
// - useMutation으로 check-in/check-out API 호출
// - 성공 시 toast("출근 처리되었습니다") + 쿼리 무효화

// src/presentation/hr/LeaveRequestForm.tsx
// 구현 요점:
// - Dialog 안에서 렌더링
// - 휴가 유형 Select: 연차/병가/개인사유/출산/경조사
// - 날짜 범위: 시작일 ~ 종료일 (DatePicker 2개 또는 DateRangePicker)
// - 자동 일수 계산 표시 (주말 제외): "3일 (주말 제외)"
// - 잔여 연차 표시: "잔여 연차: 12일"
// - 사유 입력 (선택)
// - POST /api/v1/leaves로 제출

// src/presentation/hr/LeaveApprovalList.tsx
// 구현 요점:
// - PENDING 상태 휴가만 목록 표시
// - 신청자 이름, 유형, 기간, 일수, 사유
// - 승인 버튼 (녹색) → PUT /api/v1/leaves/:id/approve
// - 반려 버튼 (빨강) → Dialog에서 사유 입력 → PUT /api/v1/leaves/:id/reject
// - Manager 이상만 접근 가능 (role 체크)
```

---

구현 완료 후 리뷰 보고서를 작성해 주세요.
