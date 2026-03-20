"use client"

import { useState, useCallback } from "react"
import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/daygrid"
import timeGridPlugin from "@fullcalendar/timegrid"
import interactionPlugin from "@fullcalendar/interaction"
import type { DateSelectArg, EventClickArg, EventInput } from "@fullcalendar/core"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { EventForm, type EventFormData } from "./EventForm"
import { EventDetail } from "./EventDetail"

const INITIAL_EVENTS: EventInput[] = [
  {
    id: "1",
    title: "스탠드업 미팅",
    start: todayAt(9, 0),
    end: todayAt(9, 30),
    backgroundColor: "#3b82f6",
    borderColor: "#3b82f6",
    extendedProps: { location: "회의실 A", description: "일일 스탠드업" },
  },
  {
    id: "2",
    title: "스프린트 리뷰",
    start: todayAt(14, 0),
    end: todayAt(15, 0),
    backgroundColor: "#10b981",
    borderColor: "#10b981",
    extendedProps: { location: "회의실 B", description: "이번 주 스프린트 리뷰" },
  },
  {
    id: "3",
    title: "1:1 미팅",
    start: todayAt(16, 0),
    end: todayAt(16, 30),
    backgroundColor: "#f59e0b",
    borderColor: "#f59e0b",
    extendedProps: { description: "민재 팀장과 1:1" },
  },
  {
    id: "4",
    title: "디자인 리뷰",
    start: tomorrowAt(10, 0),
    end: tomorrowAt(11, 0),
    backgroundColor: "#8b5cf6",
    borderColor: "#8b5cf6",
    extendedProps: { location: "회의실 C", description: "UI/UX 디자인 리뷰" },
  },
  {
    id: "5",
    title: "팀 점심",
    start: offsetDay(2, 12, 0),
    end: offsetDay(2, 13, 0),
    backgroundColor: "#ec4899",
    borderColor: "#ec4899",
    extendedProps: { description: "개발팀 회식" },
  },
  {
    id: "6",
    title: "배포 일정",
    start: offsetDay(3, 9, 0),
    end: offsetDay(3, 18, 0),
    backgroundColor: "#ef4444",
    borderColor: "#ef4444",
    extendedProps: { description: "v1.0 프로덕션 배포" },
  },
]

function todayAt(h: number, m: number) {
  const d = new Date()
  d.setHours(h, m, 0, 0)
  return d.toISOString()
}

function tomorrowAt(h: number, m: number) {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  d.setHours(h, m, 0, 0)
  return d.toISOString()
}

function offsetDay(offset: number, h: number, m: number) {
  const d = new Date()
  d.setDate(d.getDate() + offset)
  d.setHours(h, m, 0, 0)
  return d.toISOString()
}

let eventId = 100

export function CalendarView() {
  const [events, setEvents] = useState<EventInput[]>(INITIAL_EVENTS)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [selectedDate, setSelectedDate] = useState<{ start: Date; end: Date } | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<EventInput | null>(null)

  const handleDateSelect = useCallback((selectInfo: DateSelectArg) => {
    setSelectedDate({ start: selectInfo.start, end: selectInfo.end })
    setShowCreateDialog(true)
    selectInfo.view.calendar.unselect()
  }, [])

  const handleEventClick = useCallback((clickInfo: EventClickArg) => {
    const ev = clickInfo.event
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
      setEvents((prev) => [...prev, newEvent])
      setShowCreateDialog(false)
    },
    []
  )

  const handleDeleteEvent = useCallback(
    (id: string) => {
      setEvents((prev) => prev.filter((e) => e.id !== id))
      setShowDetailDialog(false)
    },
    []
  )

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
            events={events}
            select={handleDateSelect}
            eventClick={handleEventClick}
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
