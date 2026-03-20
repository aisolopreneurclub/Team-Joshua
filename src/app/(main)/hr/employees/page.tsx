"use client"

import { Users, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function EmployeesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">직원 관리</h1>
          <p className="mt-1 text-sm text-gray-500">전체 직원 목록을 관리합니다</p>
        </div>
        <Button className="rounded-full px-6 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.02] active:scale-[0.98]">
          <Plus className="mr-2 h-4 w-4" />
          직원 추가
        </Button>
      </div>

      <div className="ring-1 ring-black/5 rounded-2xl p-1">
        <div className="rounded-[calc(1rem-0.25rem)] bg-white p-12">
          <div className="flex flex-col items-center justify-center text-gray-400">
            <Users className="h-12 w-12 mb-4 opacity-30" />
            <p className="text-sm font-medium">직원 데이터를 불러오는 중...</p>
            <p className="text-xs mt-1">DB 연결 후 실제 데이터가 표시됩니다</p>
          </div>
        </div>
      </div>
    </div>
  )
}
