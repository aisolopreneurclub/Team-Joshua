"use client"

import { Calendar, MapPin, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface ScheduleEvent {
  id: string
  title: string
  startTime: string
  endTime: string
  location?: string
  color?: string
}

// 목업 데이터
const MOCK_EVENTS: ScheduleEvent[] = [
  {
    id: "1",
    title: "스탠드업 미팅",
    startTime: "09:00",
    endTime: "09:30",
    location: "회의실 A",
    color: "bg-blue-500",
  },
  {
    id: "2",
    title: "스프린트 리뷰",
    startTime: "14:00",
    endTime: "15:00",
    location: "회의실 B",
    color: "bg-emerald-500",
  },
  {
    id: "3",
    title: "1:1 미팅 (민재 팀장)",
    startTime: "16:00",
    endTime: "16:30",
    color: "bg-amber-500",
  },
]

export function TodaySchedule() {
  const events = MOCK_EVENTS

  return (
    <div className="ring-1 ring-black/5 rounded-2xl p-1 h-full">
      <div className="rounded-[calc(1rem-0.25rem)] bg-white p-5 h-full flex flex-col">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-semibold text-gray-900 tracking-tight">
            오늘 일정
          </h3>
          <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">
            {new Date().toLocaleDateString("ko-KR", {
              month: "short",
              day: "numeric",
              weekday: "short",
            })}
          </span>
        </div>

        {events.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center py-8 text-gray-400">
            <Calendar className="h-10 w-10 mb-3 opacity-30" />
            <p className="text-sm">오늘 예정된 일정이 없습니다</p>
          </div>
        ) : (
          <div className="space-y-3 flex-1">
            {events.map((event, index) => (
              <div
                key={event.id}
                className="group flex gap-3 rounded-xl p-3 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-gray-50 cursor-pointer"
                style={{
                  animationDelay: `${index * 80}ms`,
                }}
              >
                <div
                  className={cn(
                    "mt-0.5 h-2 w-2 shrink-0 rounded-full",
                    event.color || "bg-blue-500"
                  )}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate break-keep">
                    {event.title}
                  </p>
                  <div className="mt-1 flex items-center gap-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1 tabular-nums">
                      <Clock className="h-3 w-3" />
                      {event.startTime} - {event.endTime}
                    </span>
                    {event.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {event.location}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
