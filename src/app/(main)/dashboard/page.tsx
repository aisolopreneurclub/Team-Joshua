"use client"

import {
  ClipboardList,
  AlertTriangle,
  CalendarCheck,
  Bell,
} from "lucide-react"
import { StatCard } from "@/presentation/dashboard/StatCard"
import { TodaySchedule } from "@/presentation/dashboard/TodaySchedule"
import { MyTasks } from "@/presentation/dashboard/MyTasks"
import { TeamStatus } from "@/presentation/dashboard/TeamStatus"
import { AttendanceWidget } from "@/presentation/dashboard/AttendanceWidget"

export default function DashboardPage() {
  const today = new Date()
  const greeting = today.getHours() < 12 ? "좋은 아침이에요" : today.getHours() < 18 ? "좋은 오후에요" : "수고하셨어요"

  return (
    <div className="space-y-6">
      {/* 인사 헤더 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight break-keep">
          {greeting}, 홍길동님
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {today.toLocaleDateString("ko-KR", {
            year: "numeric",
            month: "long",
            day: "numeric",
            weekday: "long",
          })}
        </p>
      </div>

      {/* 요약 카드 4개 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="진행중 태스크"
          value={5}
          subtitle="2건 마감 임박"
          icon={ClipboardList}
          iconColor="text-blue-600"
          iconBg="bg-blue-500/10"
        />
        <StatCard
          title="마감 초과"
          value={1}
          subtitle="즉시 확인 필요"
          icon={AlertTriangle}
          iconColor="text-red-600"
          iconBg="bg-red-500/10"
          trend={{ value: "1", isPositive: false }}
        />
        <StatCard
          title="이번 주 일정"
          value={7}
          subtitle="오늘 3건"
          icon={CalendarCheck}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-500/10"
        />
        <StatCard
          title="안 읽은 알림"
          value={3}
          icon={Bell}
          iconColor="text-amber-600"
          iconBg="bg-amber-500/10"
        />
      </div>

      {/* Bento Grid: 비대칭 레이아웃 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 왼쪽 2/3 */}
        <div className="lg:col-span-2 space-y-4">
          {/* 내 태스크 */}
          <MyTasks />
          {/* 팀 현황 */}
          <TeamStatus />
        </div>

        {/* 오른쪽 1/3 */}
        <div className="space-y-4">
          {/* 출퇴근 위젯 */}
          <AttendanceWidget />
          {/* 오늘 일정 */}
          <TodaySchedule />
        </div>
      </div>
    </div>
  )
}
