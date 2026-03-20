export type Priority = "LOW" | "MEDIUM" | "HIGH" | "URGENT"

export interface Board {
  id: string
  name: string
  description: string | null
  isArchived: boolean
  createdAt: string
  updatedAt: string
  columns: Column[]
}

export interface Column {
  id: string
  boardId: string
  name: string
  order: number
  color: string | null
  tasks: Task[]
}

export interface Task {
  id: string
  columnId: string
  title: string
  description: string | null
  order: number
  priority: Priority
  dueDate: string | null
  assigneeId: string | null
  creatorId: string
  createdAt: string
  updatedAt: string
  assignee: {
    id: string
    name: string
  } | null
  labels: {
    id: string
    name: string
    color: string
  }[]
  commentCount: number
}

export interface Comment {
  id: string
  taskId: string
  authorId: string
  content: string
  createdAt: string
  updatedAt: string
  author: {
    id: string
    name: string
    avatar: string | null
  }
}

export interface Label {
  id: string
  name: string
  color: string
}
