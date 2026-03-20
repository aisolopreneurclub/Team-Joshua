export type Role = "ADMIN" | "MANAGER" | "EMPLOYEE"

export interface PaginationParams {
  page: number
  limit: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ApiResponse<T> {
  data: T
}

export interface ApiErrorResponse {
  error: {
    code: string
    message: string
    details?: Record<string, string[]>
  }
}

export interface SortParams {
  sort: string
  order: "asc" | "desc"
}
