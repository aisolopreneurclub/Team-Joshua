"use client"

import { useState } from "react"
import { MessageSquare, ChevronRight, Circle } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { AgentSession, AgentMessage, AgentRole } from "@/domain/agent/types"
import { AGENT_META } from "@/domain/agent/types"
import { cn } from "@/lib/utils"

// --- Mock 데이터: 에이전트 간 세션 대화 ---
const MOCK_SESSIONS: AgentSession[] = [
  {
    id: "session-1",
    title: "Dashboard 컴포넌트 Gap 분석",
    feature: "dashboard",
    phase: "check",
    participants: ["cto-lead", "gap-detector", "frontend-architect"],
    startedAt: "2026-03-23T09:15:00Z",
    status: "completed",
    messages: [
      {
        id: "m1",
        sessionId: "session-1",
        from: "cto-lead",
        to: "gap-detector",
        content: "dashboard feature의 Design 문서 대비 구현 상태를 분석해주세요. StatCard, MyTasks, TeamStatus 컴포넌트 중심으로 확인 부탁드립니다.",
        timestamp: "2026-03-23T09:15:00Z",
        type: "request",
      },
      {
        id: "m2",
        sessionId: "session-1",
        from: "gap-detector",
        to: "cto-lead",
        content: "분석 완료했습니다. Match Rate 87%입니다.\n\n✅ 구현 완료: StatCard 4종, MyTasks 리스트, TeamStatus 그리드\n❌ 미구현: 실시간 데이터 연동 (현재 mock), 차트 위젯, 알림 클릭 시 상세 이동",
        timestamp: "2026-03-23T09:16:30Z",
        type: "response",
      },
      {
        id: "m3",
        sessionId: "session-1",
        from: "cto-lead",
        to: "frontend-architect",
        content: "Gap 분석 결과 87%입니다. 차트 위젯 미구현 건은 다음 스프린트로 미뤄도 될까요? 실시간 데이터 연동이 우선이라고 봅니다.",
        timestamp: "2026-03-23T09:17:00Z",
        type: "request",
      },
      {
        id: "m4",
        sessionId: "session-1",
        from: "frontend-architect",
        to: "cto-lead",
        content: "동의합니다. API 연동부터 진행하면 90% 이상 달성 가능합니다. TanStack Query로 캐싱 전략도 같이 잡겠습니다. 차트는 recharts 도입 시점에 맞춰서 하죠.",
        timestamp: "2026-03-23T09:18:15Z",
        type: "response",
      },
    ],
  },
  {
    id: "session-2",
    title: "HR 모듈 보안 리뷰",
    feature: "hr",
    phase: "check",
    participants: ["cto-lead", "security-architect", "bkend-expert"],
    startedAt: "2026-03-23T10:00:00Z",
    status: "active",
    messages: [
      {
        id: "m5",
        sessionId: "session-2",
        from: "cto-lead",
        to: "security-architect",
        content: "HR 모듈의 직원 정보 API에 대한 보안 리뷰를 요청합니다. 특히 급여, 개인정보 관련 엔드포인트를 중점적으로 봐주세요.",
        timestamp: "2026-03-23T10:00:00Z",
        type: "request",
      },
      {
        id: "m6",
        sessionId: "session-2",
        from: "security-architect",
        to: "cto-lead",
        content: "리뷰 결과:\n\n🔴 Critical: /api/v1/employees/[id] 엔드포인트에 인가 체크 누락. 인증된 사용자라면 누구나 다른 직원 정보 조회 가능\n🟡 Warning: 급여 정보가 일반 employee 조회 응답에 포함됨. 별도 엔드포인트로 분리 권장\n🟢 OK: CSRF 토큰 적용, XSS 필터링 정상",
        timestamp: "2026-03-23T10:02:00Z",
        type: "response",
      },
      {
        id: "m7",
        sessionId: "session-2",
        from: "cto-lead",
        to: "bkend-expert",
        content: "보안 리뷰에서 Critical 이슈가 나왔습니다. employees/[id] 엔드포인트에 RBAC 미들웨어를 추가해주세요. self/admin/hr-manager만 접근 가능하도록요.",
        timestamp: "2026-03-23T10:03:00Z",
        type: "request",
      },
      {
        id: "m8",
        sessionId: "session-2",
        from: "bkend-expert",
        to: "cto-lead",
        content: "withAuth + withRole 미들웨어 체이닝으로 구현하겠습니다. self 접근은 요청자 ID와 params.id 비교로 처리합니다. 급여 분리 건도 /api/v1/employees/[id]/salary로 엔드포인트 추가할게요.",
        timestamp: "2026-03-23T10:04:30Z",
        type: "response",
      },
    ],
  },
  {
    id: "session-3",
    title: "Kanban 보드 코드 품질 분석",
    feature: "kanban",
    phase: "check",
    participants: ["code-analyzer", "cto-lead", "pdca-iterator"],
    startedAt: "2026-03-23T11:00:00Z",
    status: "completed",
    messages: [
      {
        id: "m9",
        sessionId: "session-3",
        from: "cto-lead",
        to: "code-analyzer",
        content: "kanban 모듈 전체 코드 품질을 분석해주세요. DnD 구현부 복잡도가 높아 보입니다.",
        timestamp: "2026-03-23T11:00:00Z",
        type: "request",
      },
      {
        id: "m10",
        sessionId: "session-3",
        from: "code-analyzer",
        to: "cto-lead",
        content: "분석 결과:\n• Cyclomatic Complexity: kanban/[boardId]/page.tsx → 15 (높음, 10 이하 권장)\n• 중복 코드: 드래그 핸들러 로직 3곳에서 반복\n• 타입 안전성: any 사용 4건\n• 번들 크기: @dnd-kit 전체 import → tree-shaking 필요",
        timestamp: "2026-03-23T11:01:30Z",
        type: "response",
      },
      {
        id: "m11",
        sessionId: "session-3",
        from: "cto-lead",
        to: "pdca-iterator",
        content: "코드 분석 결과를 바탕으로 자동 개선을 시작해주세요. 우선순위: 1) any 제거 2) 중복 드래그 핸들러 추출 3) import 최적화",
        timestamp: "2026-03-23T11:02:00Z",
        type: "request",
      },
      {
        id: "m12",
        sessionId: "session-3",
        from: "pdca-iterator",
        to: "cto-lead",
        content: "1차 반복 완료:\n✅ any → proper types 변환 (4/4)\n✅ useDragHandlers 커스텀 훅 추출\n✅ @dnd-kit named imports로 변경\n\nMatch Rate: 85% → 93% 달성. 추가 반복 불필요합니다.",
        timestamp: "2026-03-23T11:05:00Z",
        type: "response",
      },
    ],
  },
]

function AgentAvatar({ role }: { role: AgentRole }) {
  const meta = AGENT_META[role]
  return (
    <div
      className={cn(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm text-white",
        meta.color
      )}
      title={meta.label}
    >
      {meta.emoji}
    </div>
  )
}

function MessageBubble({ message }: { message: AgentMessage }) {
  const fromMeta = AGENT_META[message.from]
  const toMeta = AGENT_META[message.to]
  const time = new Date(message.timestamp).toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  })

  return (
    <div className="flex gap-3 py-3">
      <AgentAvatar role={message.from} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-semibold text-gray-900">{fromMeta.label}</span>
          <ChevronRight className="h-3 w-3 text-gray-400" />
          <span className="text-sm text-gray-500">{toMeta.label}</span>
          <span className="text-xs text-gray-400 ml-auto">{time}</span>
        </div>
        <div className="rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-700 whitespace-pre-line leading-relaxed">
          {message.content}
        </div>
      </div>
    </div>
  )
}

function SessionCard({ session }: { session: AgentSession }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const messageCount = session.messages.length
  const lastMessage = session.messages[messageCount - 1]
  const lastTime = new Date(lastMessage.timestamp).toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  })

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader className="cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3 min-w-0">
            <MessageSquare className="h-5 w-5 shrink-0 text-blue-600" />
            <div className="min-w-0">
              <CardTitle className="truncate">{session.title}</CardTitle>
              <p className="text-xs text-gray-500 mt-0.5">
                {session.participants.map((p) => AGENT_META[p].label).join(" · ")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-3">
            <Badge
              variant={session.status === "active" ? "default" : "secondary"}
              className={
                session.status === "active"
                  ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                  : ""
              }
            >
              {session.status === "active" && (
                <Circle className="h-2 w-2 fill-emerald-500 text-emerald-500 mr-1" />
              )}
              {session.status === "active" ? "진행중" : "완료"}
            </Badge>
            <span className="text-xs text-gray-400">{lastTime}</span>
            <ChevronRight
              className={cn(
                "h-4 w-4 text-gray-400 transition-transform",
                isExpanded && "rotate-90"
              )}
            />
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent>
          <div className="divide-y divide-gray-100">
            {session.messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
          </div>
        </CardContent>
      )}

      {!isExpanded && (
        <CardContent>
          <p className="text-sm text-gray-500 truncate">
            <span className="font-medium text-gray-700">{AGENT_META[lastMessage.from].label}:</span>{" "}
            {lastMessage.content.split("\n")[0]}
          </p>
          <p className="text-xs text-gray-400 mt-1">{messageCount}개 메시지</p>
        </CardContent>
      )}
    </Card>
  )
}

export function AgentConversations() {
  const activeSessions = MOCK_SESSIONS.filter((s) => s.status === "active")
  const completedSessions = MOCK_SESSIONS.filter((s) => s.status === "completed")

  return (
    <div className="space-y-6">
      {/* 요약 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl bg-white ring-1 ring-gray-200 p-4">
          <p className="text-sm text-gray-500">전체 세션</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{MOCK_SESSIONS.length}</p>
        </div>
        <div className="rounded-xl bg-white ring-1 ring-gray-200 p-4">
          <p className="text-sm text-gray-500">진행중</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{activeSessions.length}</p>
        </div>
        <div className="rounded-xl bg-white ring-1 ring-gray-200 p-4">
          <p className="text-sm text-gray-500">총 메시지</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            {MOCK_SESSIONS.reduce((acc, s) => acc + s.messages.length, 0)}
          </p>
        </div>
      </div>

      {/* 진행중 세션 */}
      {activeSessions.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">진행중 세션</h3>
          <div className="space-y-3">
            {activeSessions.map((session) => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>
        </div>
      )}

      {/* 완료된 세션 */}
      {completedSessions.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">완료된 세션</h3>
          <div className="space-y-3">
            {completedSessions.map((session) => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
