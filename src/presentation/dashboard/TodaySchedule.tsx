"use client"

import { useEffect, useState } from "react"
import { Calendar, MapPin, Clock, ExternalLink, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface ScheduleEvent {
  id: string
  title: string
  startTime: string
  endTime: string
  location?: string
  isAllDay?: boolean
  htmlLink?: string
}

const COLORS = [
  "bg-blue-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-violet-500",
  "bg-rose-500",
]

export function TodaySchedule() {
  const [events, setEvents] = useState<ScheduleEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchEvents() {
      try {
        const res = await fetch("/api/calendar/events")
        if (!res.ok) {
          const data = await res.json()
          setError(data.error ?? "일정을 불러올 수 없습니다")
          return
        }
        const data = await res.json()
        setEvents(data.events)
      } catch {
        setError("일정을 불러올 수 없습니다")
      } finally {
        setLoading(false)
      }
    }
    fetchEvents()
  }, [])

  return (
    <div className="ring-1 ring-black/5 rounded-2xl p-1 h-full">
      <div className="rounded-[calc(1rem-0.25rem)] bg-white p-5 h-full flex flex-col">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-semibold text-gray-900 tracking-tight flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-blue-600" />
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

        {loading ? (
          <div className="flex flex-1 flex-col items-center justify-center py-8 text-gray-400">
            <Loader2 className="h-6 w-6 animate-spin mb-2" />
            <p className="text-xs">Google Calendar 불러오는 중...</p>
          </div>
        ) : error ? (
          <div className="flex flex-1 flex-col items-center justify-center py-8 text-gray-400">
            <Calendar className="h-10 w-10 mb-3 opacity-30" />
            <p className="text-sm">{error}</p>
            <p className="text-xs mt-1">Google 계정으로 로그인해주세요</p>
          </div>
        ) : events.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center py-8 text-gray-400">
            <Calendar className="h-10 w-10 mb-3 opacity-30" />
            <p className="text-sm">오늘 예정된 일정이 없습니다</p>
          </div>
        ) : (
          <div className="space-y-3 flex-1">
            {events.map((event, index) => (
              <a
                key={event.id}
                href={event.htmlLink}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex gap-3 rounded-xl p-3 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-gray-50 cursor-pointer"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <div
                  className={cn(
                    "mt-0.5 h-2 w-2 shrink-0 rounded-full",
                    COLORS[index % COLORS.length]
                  )}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate break-keep flex items-center gap-1">
                    {event.title}
                    <ExternalLink className="h-3 w-3 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </p>
                  <div className="mt-1 flex items-center gap-3 text-xs text-gray-400">
                    {event.isAllDay ? (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        종일
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 tabular-nums">
                        <Clock className="h-3 w-3" />
                        {event.startTime} - {event.endTime}
                      </span>
                    )}
                    {event.location && (
                      <span className="flex items-center gap-1 truncate">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span className="truncate">
                          {event.location.startsWith("http")
                            ? "온라인 (Zoom)"
                            : event.location}
                        </span>
                      </span>
                    )}
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
