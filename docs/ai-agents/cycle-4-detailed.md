# Cycle 4: Calendar Module (상세 지시서)

---

## 작업 지시

Cycle 4를 시작합니다. 캘린더 모듈 전체를 구현하세요.

---

## 1. Domain 타입

```typescript
// src/domain/calendar/types.ts

export type AttendeeStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'TENTATIVE'

export interface CalendarEvent {
  id: string
  title: string
  description: string | null
  startTime: Date
  endTime: Date
  allDay: boolean
  location: string | null
  color: string | null
  creatorId: string
  isRecurring: boolean
  recurrenceRule: string | null
  creator?: { id: string; user: { name: string } }
  attendees?: EventAttendee[]
  googleSync?: { googleEventId: string } | null
  meetingRoom?: { room: MeetingRoom } | null
}

export interface EventAttendee {
  id: string
  eventId: string
  employeeId: string
  status: AttendeeStatus
  employee?: { id: string; user: { name: string; avatar: string | null } }
}

export interface MeetingRoom {
  id: string
  name: string
  floor: string | null
  capacity: number
  equipment: string[]
  isActive: boolean
}

export type CreateEventInput = {
  title: string
  startTime: string
  endTime: string
  description?: string
  allDay?: boolean
  location?: string
  color?: string
  attendeeIds?: string[]
  meetingRoomId?: string
  syncToGoogle?: boolean
}

export type EventFilters = {
  start: string  // ISO date
  end: string    // ISO date
}

// FullCalendar 이벤트 형식 변환
export interface FullCalendarEvent {
  id: string
  title: string
  start: string
  end: string
  allDay: boolean
  backgroundColor?: string
  extendedProps: {
    description: string | null
    location: string | null
    creator: string
    attendeeCount: number
  }
}
```

## 2. Zod Validation

```typescript
// src/lib/validations/event.ts
import { z } from 'zod'

export const createEventSchema = z.object({
  title: z.string().min(1, '제목을 입력하세요').max(200),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  description: z.string().max(5000).optional(),
  allDay: z.boolean().default(false),
  location: z.string().max(200).optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  attendeeIds: z.array(z.string()).optional().default([]),
  meetingRoomId: z.string().optional(),
  syncToGoogle: z.boolean().default(false),
}).refine(
  (data) => new Date(data.endTime) > new Date(data.startTime),
  { message: '종료 시간은 시작 시간 이후여야 합니다', path: ['endTime'] }
)

export const respondEventSchema = z.object({
  status: z.enum(['ACCEPTED', 'DECLINED', 'TENTATIVE']),
})
```

## 3. Google Calendar 연동

```typescript
// src/infrastructure/calendar/GoogleCalendarClient.ts
import { google } from 'googleapis'

const SCOPES = ['https://www.googleapis.com/auth/calendar']

export class GoogleCalendarClient {
  private getAuth(accessToken: string) {
    const auth = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
    )
    auth.setCredentials({ access_token: accessToken })
    return auth
  }

  async createEvent(accessToken: string, event: {
    summary: string
    description?: string
    start: { dateTime: string; timeZone: string }
    end: { dateTime: string; timeZone: string }
    attendees?: { email: string }[]
    location?: string
  }) {
    const calendar = google.calendar({ version: 'v3', auth: this.getAuth(accessToken) })
    const result = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
    })
    return result.data
  }

  async updateEvent(accessToken: string, googleEventId: string, event: Record<string, unknown>) {
    const calendar = google.calendar({ version: 'v3', auth: this.getAuth(accessToken) })
    const result = await calendar.events.update({
      calendarId: 'primary',
      eventId: googleEventId,
      requestBody: event,
    })
    return result.data
  }

  async deleteEvent(accessToken: string, googleEventId: string) {
    const calendar = google.calendar({ version: 'v3', auth: this.getAuth(accessToken) })
    await calendar.events.delete({
      calendarId: 'primary',
      eventId: googleEventId,
    })
  }

  async listEvents(accessToken: string, timeMin: string, timeMax: string) {
    const calendar = google.calendar({ version: 'v3', auth: this.getAuth(accessToken) })
    const result = await calendar.events.list({
      calendarId: 'primary',
      timeMin,
      timeMax,
      singleEvents: true,
      orderBy: 'startTime',
    })
    return result.data.items || []
  }
}
```

## 4. Service 핵심 로직

```typescript
// src/application/calendar/EventService.ts

export class EventService {
  async createEvent(creatorId: string, input: CreateEventInput) {
    // 1. 회의실 중복 체크
    if (input.meetingRoomId) {
      const isAvailable = await this.checkRoomAvailability(
        input.meetingRoomId, input.startTime, input.endTime
      )
      if (!isAvailable) throw new Error('해당 시간에 회의실이 이미 예약되어 있습니다')
    }

    // 2. 이벤트 생성 (트랜잭션)
    const event = await prisma.$transaction(async (tx) => {
      const created = await tx.calendarEvent.create({
        data: {
          title: input.title,
          description: input.description,
          startTime: new Date(input.startTime),
          endTime: new Date(input.endTime),
          allDay: input.allDay ?? false,
          location: input.location,
          color: input.color,
          creatorId,
        },
      })

      // 참석자 추가
      if (input.attendeeIds?.length) {
        await tx.eventAttendee.createMany({
          data: input.attendeeIds.map(employeeId => ({
            eventId: created.id,
            employeeId,
            status: 'PENDING',
          })),
        })
      }

      // 회의실 예약
      if (input.meetingRoomId) {
        await tx.meetingRoomBooking.create({
          data: { roomId: input.meetingRoomId, eventId: created.id },
        })
      }

      return created
    })

    // 3. Google Calendar 동기화 (비동기, 실패해도 이벤트는 생성됨)
    if (input.syncToGoogle) {
      // TODO: Google Calendar에 이벤트 생성 + GoogleCalendarSync 레코드 저장
    }

    return event
  }

  private async checkRoomAvailability(roomId: string, start: string, end: string) {
    const conflicts = await prisma.meetingRoomBooking.count({
      where: {
        roomId,
        event: {
          OR: [
            { startTime: { lt: new Date(end) }, endTime: { gt: new Date(start) } },
          ],
        },
      },
    })
    return conflicts === 0
  }
}
```

## 5. FullCalendar UI

```tsx
// src/presentation/calendar/CalendarView.tsx
'use client'

import { useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { useQuery } from '@tanstack/react-query'
import { Dialog } from '@/presentation/components/ui/dialog'
import { EventForm } from './EventForm'
import type { FullCalendarEvent } from '@/domain/calendar/types'

// 구현 요점:
// - plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin]
// - headerToolbar: { left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay' }
// - locale: 'ko'
// - dateClick: 빈 날짜 클릭 → EventForm Dialog 열기 (해당 날짜 prefill)
// - eventClick: 이벤트 클릭 → EventDetail Dialog 열기
// - datesSet: 뷰 변경 시 해당 기간 이벤트 재조회
// - events: useQuery로 /api/v1/events?start=&end= 호출하여 FullCalendarEvent[] 변환

// src/presentation/calendar/EventForm.tsx
// 구현 요점:
// - react-hook-form + zod (createEventSchema)
// - 제목, 설명, 시작/종료 시간 (DateTimePicker)
// - 종일 체크박스 → 시간 선택 숨김
// - 참석자 검색: 직원 목록에서 다중 선택 (Combobox)
// - 회의실 선택: MeetingRoomPicker 컴포넌트
// - Google Calendar 동기화 체크박스
// - 색상 선택 (6가지 프리셋: 파랑, 빨강, 초록, 노랑, 보라, 주황)

// src/presentation/calendar/MeetingRoomPicker.tsx
// 구현 요점:
// - GET /api/v1/meeting-rooms로 목록 조회
// - GET /api/v1/meeting-rooms/:id/availability?start=&end= 로 가용 체크
// - 가용한 회의실만 선택 가능 (unavailable은 회색 처리)
// - 표시: 이름, 층, 수용인원, 장비 목록
```

---

시간대 주의사항:
- 모든 날짜/시간은 'Asia/Seoul' 기준으로 저장/표시
- FullCalendar에 timeZone: 'Asia/Seoul' 설정
- API 요청/응답은 ISO 8601 형식 (2026-03-25T10:00:00+09:00)

구현 완료 후 리뷰 보고서를 작성해 주세요.
