"use client"

import { ClipboardList, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

type Priority = "LOW" | "MEDIUM" | "HIGH" | "URGENT"

const PRIORITY_CONFIG: Record<
  Priority,
  { label: string; dot: string; bg: string }
> = {
  LOW: { label: "낮음", dot: "bg-emerald-500", bg: "bg-emerald-50 text-emerald-700" },
  MEDIUM: { label: "보통", dot: "bg-amber-500", bg: "bg-amber-50 text-amber-700" },
  HIGH: { label: "높음", dot: "bg-red-500", bg: "bg-red-50 text-red-700" },
  URGENT: { label: "긴급", dot: "bg-purple-500", bg: "bg-purple-50 text-purple-700" },
}

interface TaskItem {
  id: string
  title: string
  priority: Priority
  dueDate?: string
  columnName: string
}

// 목업 데이터
const MOCK_TASKS: TaskItem[] = [
  {
    id: "1",
    title: "HR API 엔드포인트 구현",
    priority: "HIGH",
    dueDate: "03/25",
    columnName: "In Progress",
  },
  {
    id: "2",
    title: "칸반보드 드래그앤드롭 구현",
    priority: "HIGH",
    dueDate: "03/27",
    columnName: "In Progress",
  },
  {
    id: "3",
    title: "캘린더 Google 연동 QA",
    priority: "MEDIUM",
    dueDate: "03/28",
    columnName: "Review",
  },
  {
    id: "4",
    title: "회의실 예약 기능",
    priority: "MEDIUM",
    columnName: "To Do",
  },
  {
    id: "5",
    title: "알림 시스템 설계",
    priority: "LOW",
    columnName: "To Do",
  },
]

export function MyTasks() {
  const tasks = MOCK_TASKS

  return (
    <div className="ring-1 ring-black/5 rounded-2xl p-1 h-full">
      <div className="rounded-[calc(1rem-0.25rem)] bg-white p-5 h-full flex flex-col">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-semibold text-gray-900 tracking-tight">
            내 태스크
          </h3>
          <Link
            href="/kanban"
            className="flex items-center gap-1 text-[11px] font-medium text-gray-400 uppercase tracking-wider hover:text-gray-600 transition-colors"
          >
            모두 보기
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {tasks.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center py-8 text-gray-400">
            <ClipboardList className="h-10 w-10 mb-3 opacity-30" />
            <p className="text-sm">할당된 태스크가 없습니다</p>
          </div>
        ) : (
          <div className="space-y-1 flex-1">
            {tasks.map((task, index) => {
              const config = PRIORITY_CONFIG[task.priority]
              return (
                <div
                  key={task.id}
                  className="group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-gray-50 cursor-pointer"
                  style={{ animationDelay: `${index * 60}ms` }}
                >
                  <div
                    className={cn("h-1.5 w-1.5 shrink-0 rounded-full", config.dot)}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 truncate break-keep">
                      {task.title}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {task.dueDate && (
                      <span className="text-[11px] text-gray-400 tabular-nums">
                        {task.dueDate}
                      </span>
                    )}
                    <span
                      className={cn(
                        "text-[10px] font-medium px-1.5 py-0.5 rounded-full",
                        config.bg
                      )}
                    >
                      {config.label}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
