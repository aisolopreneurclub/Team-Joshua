import type { Role } from "@/domain/common/types"

export interface Employee {
  id: string
  userId: string
  employeeNo: string
  position: string
  phone: string | null
  hireDate: string
  birthDate: string | null
  address: string | null
  createdAt: string
  updatedAt: string
  user: {
    id: string
    email: string
    name: string
    role: Role
    avatar: string | null
  }
  departments: {
    id: string
    name: string
    isHead: boolean
  }[]
}

export interface Department {
  id: string
  name: string
  description: string | null
  parentId: string | null
  children: Department[]
  members: {
    employeeId: string
    employeeName: string
    isHead: boolean
  }[]
}

export type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED"
export type LeaveType =
  | "ANNUAL"
  | "SICK"
  | "PERSONAL"
  | "MATERNITY"
  | "BEREAVEMENT"

export interface LeaveRequest {
  id: string
  employeeId: string
  type: LeaveType
  startDate: string
  endDate: string
  reason: string | null
  status: LeaveStatus
  approverId: string | null
  approvedAt: string | null
  createdAt: string
}

export interface Attendance {
  id: string
  employeeId: string
  date: string
  checkIn: string | null
  checkOut: string | null
  overtime: number
  note: string | null
}
