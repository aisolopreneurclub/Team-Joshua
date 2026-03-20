"use client"

import { Clock } from "lucide-react"
import { AttendanceWidget } from "@/presentation/dashboard/AttendanceWidget"

export default function AttendancePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">근태 관리</h1>
        <p className="mt-1 text-sm text-gray-500">출퇴근 기록을 관리합니다</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div>
          <AttendanceWidget />
        </div>
        <div className="lg:col-span-2 ring-1 ring-black/5 rounded-2xl p-1">
          <div className="rounded-[calc(1rem-0.25rem)] bg-white p-12">
            <div className="flex flex-col items-center justify-center text-gray-400">
              <Clock className="h-12 w-12 mb-4 opacity-30" />
              <p className="text-sm font-medium">이번 주 근태 기록</p>
              <p className="text-xs mt-1">DB 연결 후 실제 기록이 표시됩니다</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
