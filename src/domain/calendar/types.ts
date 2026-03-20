export type AttendeeStatus = "PENDING" | "ACCEPTED" | "DECLINED" | "TENTATIVE"

export interface CalendarEvent {
  id: string
  title: string
  description: string | null
  startTime: string
  endTime: string
  allDay: boolean
  location: string | null
  color: string | null
  creatorId: string
  isRecurring: boolean
  recurrenceRule: string | null
  createdAt: string
  updatedAt: string
  creator: {
    id: string
    name: string
  }
  attendees: {
    employeeId: string
    name: string
    status: AttendeeStatus
  }[]
  meetingRoom: {
    id: string
    name: string
  } | null
}

export interface MeetingRoom {
  id: string
  name: string
  floor: string | null
  capacity: number
  equipment: string[]
  isActive: boolean
}
