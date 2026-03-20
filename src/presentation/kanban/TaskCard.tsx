"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { cn } from "@/lib/utils"
import { MessageSquare, Calendar } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import type { KanbanTask, Priority } from "./KanbanBoard"

const PRIORITY_CONFIG: Record<Priority, { dot: string; bg: string; label: string }> = {
  LOW: { dot: "bg-emerald-500", bg: "bg-emerald-50 text-emerald-700", label: "낮음" },
  MEDIUM: { dot: "bg-amber-500", bg: "bg-amber-50 text-amber-700", label: "보통" },
  HIGH: { dot: "bg-red-500", bg: "bg-red-50 text-red-700", label: "높음" },
  URGENT: { dot: "bg-purple-500", bg: "bg-purple-50 text-purple-700", label: "긴급" },
}

interface TaskCardProps {
  task: KanbanTask
  isDragging?: boolean
}

export function TaskCard({ task, isDragging }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const config = PRIORITY_CONFIG[task.priority]

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "ring-1 ring-black/5 rounded-xl p-0.5 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-grab active:cursor-grabbing",
        isDragging && "shadow-xl ring-blue-500/30 scale-[1.03] rotate-[1deg]",
        isSortableDragging && "opacity-40",
        !isDragging && !isSortableDragging && "hover:ring-black/10 hover:shadow-[0_8px_30px_-10px_rgba(0,0,0,0.08)]"
      )}
    >
      <div className="rounded-[calc(0.75rem-0.125rem)] bg-white p-3.5">
        {/* 제목 */}
        <p className="text-sm font-medium text-gray-800 break-keep leading-snug">
          {task.title}
        </p>

        {/* 메타 정보 */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            {/* 우선순위 */}
            <span className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded-full", config.bg)}>
              {config.label}
            </span>

            {/* 마감일 */}
            {task.dueDate && (
              <span className="flex items-center gap-0.5 text-[11px] text-gray-400 tabular-nums">
                <Calendar className="h-3 w-3" />
                {task.dueDate}
              </span>
            )}

            {/* 코멘트 수 */}
            {task.commentCount > 0 && (
              <span className="flex items-center gap-0.5 text-[11px] text-gray-400 tabular-nums">
                <MessageSquare className="h-3 w-3" />
                {task.commentCount}
              </span>
            )}
          </div>

          {/* 담당자 */}
          {task.assignee && (
            <Avatar className="h-6 w-6">
              <AvatarFallback className="bg-gray-100 text-gray-500 text-[10px] font-medium">
                {task.assignee.slice(-2)}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      </div>
    </div>
  )
}
