import { z } from "zod/v4"

export const createEventSchema = z.object({
  title: z.string().min(1).max(200),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  description: z.string().max(5000).optional(),
  allDay: z.boolean().default(false),
  location: z.string().optional(),
  attendeeIds: z.array(z.string().min(1)).optional(),
  meetingRoomId: z.string().min(1).optional(),
  syncToGoogle: z.boolean().default(false),
})

export const updateEventSchema = createEventSchema.partial()
