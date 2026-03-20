"use client"

import { Kanban, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function KanbanPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">칸반보드</h1>
          <p className="mt-1 text-sm text-gray-500">프로젝트별 보드를 관리합니다</p>
        </div>
        <Button className="rounded-full px-6 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.02] active:scale-[0.98]">
          <Plus className="mr-2 h-4 w-4" />
          새 보드
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 샘플 보드 카드 */}
        <Link href="/kanban/erp-project" className="group ring-1 ring-black/5 rounded-2xl p-1 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:ring-black/10 hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] cursor-pointer">
          <div className="rounded-[calc(1rem-0.25rem)] bg-white p-6">
            <h3 className="font-semibold text-gray-900 break-keep">ERP 프로젝트</h3>
            <p className="text-sm text-gray-500 mt-1">사내 ERP 시스템 구축</p>
            <div className="flex items-center gap-4 mt-4 text-xs text-gray-400">
              <span>4 컬럼</span>
              <span>12 태스크</span>
            </div>
            <div className="flex gap-1 mt-3">
              <div className="h-1 flex-1 rounded-full bg-emerald-500" />
              <div className="h-1 flex-1 rounded-full bg-blue-500" />
              <div className="h-1 flex-1 rounded-full bg-amber-500" />
              <div className="h-1 flex-1 rounded-full bg-gray-200" />
            </div>
          </div>
        </Link>

        {/* 새 보드 추가 카드 */}
        <div className="ring-1 ring-dashed ring-black/10 rounded-2xl p-1 transition-all duration-300 hover:ring-black/20 cursor-pointer">
          <div className="rounded-[calc(1rem-0.25rem)] p-6 flex flex-col items-center justify-center h-full min-h-[160px] text-gray-400 hover:text-gray-500 transition-colors">
            <Plus className="h-8 w-8 mb-2" />
            <p className="text-sm font-medium">새 보드 만들기</p>
          </div>
        </div>
      </div>
    </div>
  )
}
