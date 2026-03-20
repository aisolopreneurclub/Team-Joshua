"use client"

import { CalendarOff, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function LeavesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">휴가 관리</h1>
          <p className="mt-1 text-sm text-gray-500">휴가 신청 및 승인을 관리합니다</p>
        </div>
        <Button className="rounded-full px-6 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.02] active:scale-[0.98]">
          <Plus className="mr-2 h-4 w-4" />
          휴가 신청
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="ring-1 ring-black/5 rounded-2xl p-1">
          <div className="rounded-[calc(1rem-0.25rem)] bg-white p-6">
            <p className="text-sm font-semibold text-gray-900 mb-3">잔여 연차</p>
            <p className="text-4xl font-bold text-gray-900 tabular-nums">12<span className="text-lg text-gray-400 font-normal">일</span></p>
            <p className="text-xs text-gray-400 mt-1">전체 15일 중 3일 사용</p>
          </div>
        </div>
        <div className="lg:col-span-2 ring-1 ring-black/5 rounded-2xl p-1">
          <div className="rounded-[calc(1rem-0.25rem)] bg-white p-12">
            <div className="flex flex-col items-center justify-center text-gray-400">
              <CalendarOff className="h-12 w-12 mb-4 opacity-30" />
              <p className="text-sm font-medium">휴가 신청 내역이 여기에 표시됩니다</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
