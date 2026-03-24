"use client"

import { useState, useCallback, useEffect } from "react"
import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/daygrid"
import timeGridPlugin from "@fullcalendar/timegrid"
import interactionPlugin from "@fullcalendar/interaction"
import type {
  DateSelectArg,
  EventClickArg,
  EventInput,
  DatesSetArg,
} from "@fullcalendar/core"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { EventForm, type EventFormData } from "./EventForm"
import { EventDetail } from "./EventDetail"

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#ef4444"]

let eventId = 100

export function CalendarView() {
  const [events, setEvents] = useState<EventInput[]>([])
  const [localEvents, setLocalEvents] = useState<EventInput[]>([])
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [selectedDate, setSelectedDate] = useState<{ start: Date; end: Date } | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<EventInput | null>(null)
  const [dateRange, setDateRange] = useState<{ start: string; end: string } | null>(null)

  // Google Calendar에서 일정 가져오기
  useEffect(() => {
    if (!dateRange) return

    async function fetchEvents() {
      try {
        const params = new URLSearchParams({
          timeMin: dateRange!.start,
          timeMax: dateRange!.end,
        })
        const res = await fetch(`/api/calendar/events?${params}`)
        if (!res.ok) return

        const data = await res.json()
        const googleEvents: EventInput[] = data.events.map(
          (ev: { id: string; title: string; start: string; end: string; isAllDay: boolean; location?: string; description?: string; htmlLink?: string }, index: number) => ({
            id: `google-${ev.id}`,
            title: ev.title,
            start: ev.start,
            end: ev.end,
            allDay: ev.isAllDay,
            backgroundColor: COLORS[index % COLORS.length],
            borderColor: COLORS[index % COLORS.length],
            extendedProps: {
              location: ev.location,
              description: ev.description,
              htmlLink: ev.htmlLink,
              source: "google",
            },
          })
        )
        setEvents(googleEvents)
      } catch {
        // 실패 시 빈 배열 유지
      }
    }
    fetchEvents()
  }, [dateRange])

  // FullCalendar 날짜 범위 변경 시
  const handleDatesSet = useCallback((arg: DatesSetArg) => {
    setDateRange({
      start: arg.start.toISOString(),
      end: arg.end.toISOString(),
    })
  }, [])

  const handleDateSelect = useCallback((selectInfo: DateSelectArg) => {
    setSelectedDate({ start: selectInfo.start, end: selectInfo.end })
    setShowCreateDialog(true)
    selectInfo.view.calendar.unselect()
  }, [])

  const handleEventClick = useCallback((clickInfo: EventClickArg) => {
    const ev = clickInfo.event
    // Google 일정 클릭 시 Google Calendar로 이동
    if (ev.extendedProps?.htmlLink) {
      window.open(ev.extendedProps.htmlLink, "_blank")
      return
    }
    setSelectedEvent({
      id: ev.id,
      title: ev.title,
      start: ev.start?.toISOString(),
      end: ev.end?.toISOString(),
      backgroundColor: ev.backgroundColor,
      extendedProps: ev.extendedProps,
    })
    setShowDetailDialog(true)
  }, [])

  const handleCreateEvent = useCallback(
    (data: EventFormData) => {
      eventId++
      const newEvent: EventInput = {
        id: String(eventId),
        title: data.title,
        start: data.startTime,
        end: data.endTime,
        allDay: data.allDay,
        backgroundColor: data.color,
        borderColor: data.color,
        extendedProps: {
          description: data.description,
          location: data.location,
        },
      }
      setLocalEvents((prev) => [...prev, newEvent])
      setShowCreateDialog(false)
    },
    []
  )

  const handleDeleteEvent = useCallback(
    (id: string) => {
      setLocalEvents((prev) => prev.filter((e) => e.id !== id))
      setShowDetailDialog(false)
    },
    []
  )

  // Google 일정 + 로컬 일정 병합
  const allEvents = [...events, ...localEvents]

  return (
    <>
      <div className="ring-1 ring-black/5 rounded-2xl p-1">
        <div className="rounded-[calc(1rem-0.25rem)] bg-white p-4 [&_.fc]:border-0 [&_.fc-toolbar-title]:text-lg [&_.fc-toolbar-title]:font-bold [&_.fc-toolbar-title]:tracking-tight [&_.fc-button]:rounded-lg [&_.fc-button]:text-sm [&_.fc-button]:font-medium [&_.fc-button]:shadow-none [&_.fc-button-primary]:bg-blue-600 [&_.fc-button-primary:hover]:bg-blue-700 [&_.fc-button-primary:not(:disabled).fc-button-active]:bg-blue-700 [&_.fc-day-today]:bg-blue-50/50 [&_.fc-event]:rounded-md [&_.fc-event]:border-0 [&_.fc-event]:px-2 [&_.fc-event]:py-0.5 [&_.fc-event]:text-xs [&_.fc-event]:font-medium [&_.fc-event]:cursor-pointer [&_.fc-event:hover]:opacity-90 [&_.fc-col-header-cell]:text-xs [&_.fc-col-header-cell]:font-semibold [&_.fc-col-header-cell]:text-gray-500 [&_.fc-col-header-cell]:uppercase [&_.fc-col-header-cell]:tracking-wider [&_.fc-daygrid-day-number]:text-sm [&_.fc-daygrid-day-number]:text-gray-600 [&_.fc-daygrid-day-number]:p-2 [&_.fc-scrollgrid]:border-gray-100 [&_td]:border-gray-100 [&_th]:border-gray-100">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay",
            }}
            locale="ko"
            selectable
            selectMirror
            dayMaxEvents={3}
            weekends
            events={allEvents}
            select={handleDateSelect}
            eventClick={handleEventClick}
            datesSet={handleDatesSet}
            height="auto"
            buttonText={{
              today: "오늘",
              month: "월",
              week: "주",
              day: "일",
            }}
          />
        </div>
      </div>

      {/* 일정 생성 Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold tracking-tight">
              새 일정 만들기
            </DialogTitle>
          </DialogHeader>
          <EventForm
            defaultStart={selectedDate?.start}
            defaultEnd={selectedDate?.end}
            onSubmit={handleCreateEvent}
            onCancel={() => setShowCreateDialog(false)}
          />
        </DialogContent>
      </Dialog>

      {/* 일정 상세 Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold tracking-tight">
              일정 상세
            </DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <EventDetail
              event={selectedEvent}
              onDelete={handleDeleteEvent}
              onClose={() => setShowDetailDialog(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
