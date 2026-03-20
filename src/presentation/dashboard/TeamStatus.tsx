"use client"

import { Users, Laptop, Palmtree, Car } from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

type MemberStatus = "working" | "leave" | "remote" | "away"

const STATUS_CONFIG: Record<
  MemberStatus,
  { label: string; icon: typeof Laptop; color: string; dot: string }
> = {
  working: { label: "근무중", icon: Laptop, color: "text-emerald-600", dot: "bg-emerald-500" },
  leave: { label: "휴가", icon: Palmtree, color: "text-amber-600", dot: "bg-amber-500" },
  remote: { label: "재택", icon: Laptop, color: "text-blue-600", dot: "bg-blue-500" },
  away: { label: "외근", icon: Car, color: "text-gray-500", dot: "bg-gray-400" },
}

interface TeamMember {
  id: string
  name: string
  position: string
  status: MemberStatus
  avatar?: string
}

// 목업 데이터
const MOCK_TEAM: TeamMember[] = [
  { id: "1", name: "홍길동", position: "시니어 개발자", status: "working" },
  { id: "2", name: "김철수", position: "프론트엔드 개발자", status: "leave" },
  { id: "3", name: "이영희", position: "백엔드 개발자", status: "working" },
  { id: "4", name: "박민수", position: "디자이너", status: "remote" },
  { id: "5", name: "정서연", position: "PM", status: "away" },
]

export function TeamStatus() {
  const members = MOCK_TEAM

  return (
    <div className="ring-1 ring-black/5 rounded-2xl p-1 h-full">
      <div className="rounded-[calc(1rem-0.25rem)] bg-white p-5 h-full flex flex-col">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-semibold text-gray-900 tracking-tight">
            팀 현황
          </h3>
          <div className="flex items-center gap-3 text-[11px] text-gray-400">
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {members.filter((m) => m.status === "working").length}명 근무
            </span>
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              {members.filter((m) => m.status === "leave").length}명 휴가
            </span>
          </div>
        </div>

        {members.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center py-8 text-gray-400">
            <Users className="h-10 w-10 mb-3 opacity-30" />
            <p className="text-sm">팀원 정보가 없습니다</p>
          </div>
        ) : (
          <div className="space-y-1 flex-1">
            {members.map((member, index) => {
              const config = STATUS_CONFIG[member.status]
              return (
                <div
                  key={member.id}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-gray-50"
                  style={{ animationDelay: `${index * 60}ms` }}
                >
                  <div className="relative">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-gray-100 text-gray-600 text-xs font-medium">
                        {member.name.slice(-2)}
                      </AvatarFallback>
                    </Avatar>
                    <span
                      className={cn(
                        "absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-white",
                        config.dot
                      )}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 break-keep">
                      {member.name}
                    </p>
                    <p className="text-[11px] text-gray-400">{member.position}</p>
                  </div>
                  <span
                    className={cn(
                      "text-[11px] font-medium",
                      config.color
                    )}
                  >
                    {config.label}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
