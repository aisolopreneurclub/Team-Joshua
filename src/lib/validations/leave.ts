import { z } from "zod/v4"

export const createLeaveSchema = z.object({
  type: z.enum(["ANNUAL", "SICK", "PERSONAL", "MATERNITY", "BEREAVEMENT"]),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  reason: z.string().max(500).optional(),
})
