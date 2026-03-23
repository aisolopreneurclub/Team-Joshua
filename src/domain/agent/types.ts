export type AgentRole =
  | "cto-lead"
  | "frontend-architect"
  | "bkend-expert"
  | "code-analyzer"
  | "gap-detector"
  | "qa-strategist"
  | "security-architect"
  | "pdca-iterator"
  | "report-generator"

export interface AgentMessage {
  id: string
  sessionId: string
  from: AgentRole
  to: AgentRole
  content: string
  timestamp: string
  type: "request" | "response" | "broadcast"
}

export interface AgentSession {
  id: string
  title: string
  feature: string
  phase: "plan" | "design" | "do" | "check" | "act" | "report"
  participants: AgentRole[]
  messages: AgentMessage[]
  startedAt: string
  status: "active" | "completed"
}

export const AGENT_META: Record<AgentRole, { label: string; color: string; emoji: string }> = {
  "cto-lead": { label: "CTO Lead", color: "bg-purple-500", emoji: "👔" },
  "frontend-architect": { label: "Frontend", color: "bg-blue-500", emoji: "🎨" },
  "bkend-expert": { label: "Backend", color: "bg-green-500", emoji: "⚙️" },
  "code-analyzer": { label: "Analyzer", color: "bg-amber-500", emoji: "🔍" },
  "gap-detector": { label: "Gap Detector", color: "bg-red-500", emoji: "🎯" },
  "qa-strategist": { label: "QA", color: "bg-teal-500", emoji: "✅" },
  "security-architect": { label: "Security", color: "bg-rose-500", emoji: "🛡️" },
  "pdca-iterator": { label: "Iterator", color: "bg-indigo-500", emoji: "🔄" },
  "report-generator": { label: "Reporter", color: "bg-cyan-500", emoji: "📊" },
}
