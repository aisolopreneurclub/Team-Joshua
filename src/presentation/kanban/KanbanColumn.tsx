"use client"

import { useDroppable } from "@dnd-kit/core"
import { cn } from "@/lib/utils"
import { Plus } from "lucide-react"
import type { KanbanColumnData } from "./KanbanBoard"

interface KanbanColumnProps {
  column: KanbanColumnData
  children: React.ReactNode
}

export function KanbanColumn({ column, children }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "w-72 shrink-0 rounded-2xl p-3 transition-colors duration-200",
        isOver ? "bg-blue-50/70" : "bg-gray-50/50"
      )}
    >
      {/* 컬럼 헤더 */}
      <div className="flex items-center gap-2 mb-3 px-1">
        <div
          className="h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: column.color }}
        />
        <h3 className="text-sm font-semibold text-gray-700 flex-1">
          {column.name}
        </h3>
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-gray-200/80 text-[11px] font-semibold text-gray-500 tabular-nums px-1.5">
          {column.tasks.length}
        </span>
      </div>

      {/* 태스크 목록 */}
      <div className="space-y-2 min-h-[60px]">
        {children}
      </div>

      {/* 태스크 추가 버튼 */}
      <button className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-gray-200 py-2 text-xs font-medium text-gray-400 transition-all duration-200 hover:border-gray-300 hover:text-gray-500 hover:bg-white/50">
        <Plus className="h-3.5 w-3.5" />
        태스크 추가
      </button>
    </div>
  )
}
