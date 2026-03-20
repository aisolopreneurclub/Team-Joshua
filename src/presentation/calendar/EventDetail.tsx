"use client"

import { Clock, MapPin, FileText, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { EventInput } from "@fullcalendar/core"

interface EventDetailProps {
  event: EventInput
  onDelete: (id: string) => void
  onClose: () => void
}

export function EventDetail({ event, onDelete, onClose }: EventDetailProps) {
  const start = event.start ? new Date(event.start as string) : null
  const end = event.end ? new Date(event.end as string) : null

  const formatTime = (date: Date) =>
    date.toLocaleString("ko-KR", {
      month: "short",
      day: "numeric",
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <div
          className="mt-1 h-3 w-3 shrink-0 rounded-full"
          style={{ backgroundColor: event.backgroundColor as string }}
        />
        <h3 className="text-base font-semibold text-gray-900 break-keep">
          {event.title as string}
        </h3>
      </div>

      {start && (
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <Clock className="h-4 w-4 text-gray-400" />
          <span className="tabular-nums">
            {formatTime(start)}
            {end && ` — ${formatTime(end)}`}
          </span>
        </div>
      )}

      {event.extendedProps?.location && (
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <MapPin className="h-4 w-4 text-gray-400" />
          <span>{event.extendedProps.location}</span>
        </div>
      )}

      {event.extendedProps?.description && (
        <div className="flex items-start gap-3 text-sm text-gray-600">
          <FileText className="h-4 w-4 mt-0.5 text-gray-400" />
          <span className="break-keep">{event.extendedProps.description}</span>
        </div>
      )}

      <div className="flex justify-between pt-4 border-t border-gray-100">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDelete(event.id as string)}
          className="rounded-full text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
        >
          <Trash2 className="h-3.5 w-3.5 mr-1.5" />
          삭제
        </Button>
        <Button
          size="sm"
          onClick={onClose}
          className="rounded-full px-6"
        >
          닫기
        </Button>
      </div>
    </div>
  )
}
