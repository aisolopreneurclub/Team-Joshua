"use client"

import { CalendarView } from "@/presentation/calendar/CalendarView"

export default function CalendarPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">캘린더</h1>
        <p className="mt-1 text-sm text-gray-500">
          일정을 관리하고 팀원과 공유합니다
        </p>
      </div>
      <CalendarView />
    </div>
  )
}
