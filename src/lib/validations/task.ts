import { z } from "zod/v4"

export const createTaskSchema = z.object({
  columnId: z.string().min(1),
  title: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
  assigneeId: z.string().min(1).optional(),
  dueDate: z.string().datetime().optional(),
})

export const updateTaskSchema = createTaskSchema.partial()

export const moveTaskSchema = z.object({
  targetColumnId: z.string().min(1),
  newOrder: z.number().int().min(0),
})
