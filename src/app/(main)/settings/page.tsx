"use client"

import { Settings } from "lucide-react"

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">설정</h1>
        <p className="mt-1 text-sm text-gray-500">계정 및 시스템 설정을 관리합니다</p>
      </div>

      <div className="ring-1 ring-black/5 rounded-2xl p-1">
        <div className="rounded-[calc(1rem-0.25rem)] bg-white p-12">
          <div className="flex flex-col items-center justify-center text-gray-400">
            <Settings className="h-12 w-12 mb-4 opacity-30" />
            <p className="text-sm font-medium">설정 페이지가 여기에 표시됩니다</p>
            <p className="text-xs mt-1">프로필 수정, 알림 설정, 시스템 관리</p>
          </div>
        </div>
      </div>
    </div>
  )
}
