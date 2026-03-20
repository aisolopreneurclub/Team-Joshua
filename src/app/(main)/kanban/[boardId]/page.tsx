"use client"

import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { KanbanBoard } from "@/presentation/kanban/KanbanBoard"

export default function BoardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/kanban"
          className="rounded-lg p-2 hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            ERP 프로젝트
          </h1>
          <p className="text-sm text-gray-500">
            태스크를 드래그하여 상태를 변경하세요
          </p>
        </div>
      </div>
      <KanbanBoard />
    </div>
  )
}
