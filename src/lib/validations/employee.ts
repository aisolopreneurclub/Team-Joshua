import { z } from "zod/v4"

export const createEmployeeSchema = z.object({
  email: z.string().email("유효한 이메일을 입력하세요"),
  name: z.string().min(2, "이름은 2자 이상이어야 합니다"),
  employeeNo: z
    .string()
    .regex(/^ASC-\d{4}-\d{3}$/, "사번 형식: ASC-YYYY-NNN"),
  position: z.string().min(1),
  departmentId: z.string().min(1),
  phone: z
    .string()
    .regex(/^010-\d{4}-\d{4}$/)
    .optional(),
  hireDate: z.string().datetime(),
})

export const updateEmployeeSchema = createEmployeeSchema.partial()
