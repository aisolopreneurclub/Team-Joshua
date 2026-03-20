"use client"

import { Network } from "lucide-react"

export default function OrgChartPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">조직도</h1>
        <p className="mt-1 text-sm text-gray-500">부서 및 팀 구조를 확인합니다</p>
      </div>

      <div className="ring-1 ring-black/5 rounded-2xl p-1">
        <div className="rounded-[calc(1rem-0.25rem)] bg-white p-12">
          <div className="flex flex-col items-center justify-center text-gray-400">
            <Network className="h-12 w-12 mb-4 opacity-30" />
            <p className="text-sm font-medium">조직도가 여기에 표시됩니다</p>
            <p className="text-xs mt-1">부서 데이터 연결 후 트리 뷰로 렌더링됩니다</p>
          </div>
        </div>
      </div>
    </div>
  )
}
