"use client"

import { useState, useCallback } from "react"
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { KanbanColumn } from "./KanbanColumn"
import { TaskCard } from "./TaskCard"

export type Priority = "LOW" | "MEDIUM" | "HIGH" | "URGENT"

export interface KanbanTask {
  id: string
  title: string
  priority: Priority
  assignee?: string
  dueDate?: string
  commentCount: number
}

export interface KanbanColumnData {
  id: string
  name: string
  color: string
  tasks: KanbanTask[]
}

const INITIAL_COLUMNS: KanbanColumnData[] = [
  {
    id: "todo",
    name: "To Do",
    color: "#94a3b8",
    tasks: [
      { id: "t1", title: "회의실 예약 기능", priority: "MEDIUM", assignee: "박민수", dueDate: "03/28", commentCount: 2 },
      { id: "t2", title: "알림 시스템 설계", priority: "LOW", assignee: "정서연", commentCount: 0 },
      { id: "t3", title: "이메일 템플릿 작성", priority: "LOW", commentCount: 1 },
    ],
  },
  {
    id: "progress",
    name: "In Progress",
    color: "#3b82f6",
    tasks: [
      { id: "t4", title: "HR API 엔드포인트 구현", priority: "HIGH", assignee: "홍길동", dueDate: "03/25", commentCount: 5 },
      { id: "t5", title: "칸반보드 DnD 구현", priority: "HIGH", assignee: "홍길동", dueDate: "03/27", commentCount: 3 },
    ],
  },
  {
    id: "review",
    name: "Review",
    color: "#f59e0b",
    tasks: [
      { id: "t6", title: "캘린더 연동 QA", priority: "MEDIUM", assignee: "이영희", dueDate: "03/26", commentCount: 4 },
    ],
  },
  {
    id: "done",
    name: "Done",
    color: "#10b981",
    tasks: [
      { id: "t7", title: "DB 스키마 설계", priority: "LOW", assignee: "김철수", commentCount: 2 },
      { id: "t8", title: "인증 모듈 구현", priority: "HIGH", assignee: "홍길동", commentCount: 7 },
      { id: "t9", title: "레이아웃 시스템", priority: "MEDIUM", assignee: "이영희", commentCount: 1 },
    ],
  },
]

export function KanbanBoard() {
  const [columns, setColumns] = useState<KanbanColumnData[]>(INITIAL_COLUMNS)
  const [activeTask, setActiveTask] = useState<KanbanTask | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  )

  const findColumn = (taskId: string) =>
    columns.find((col) => col.tasks.some((t) => t.id === taskId))

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event
    const col = columns.find((c) => c.tasks.some((t) => t.id === active.id))
    const task = col?.tasks.find((t) => t.id === active.id)
    if (task) setActiveTask(task)
  }, [columns])

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    const activeCol = findColumn(activeId)
    // over가 컬럼 ID일 수도, 태스크 ID일 수도 있음
    const overCol = columns.find((c) => c.id === overId) || findColumn(overId)

    if (!activeCol || !overCol || activeCol.id === overCol.id) return

    setColumns((prev) => {
      const activeItems = [...activeCol.tasks]
      const overItems = [...overCol.tasks]

      const activeIndex = activeItems.findIndex((t) => t.id === activeId)
      const overIndex = overItems.findIndex((t) => t.id === overId)

      const [movedTask] = activeItems.splice(activeIndex, 1)
      const insertIndex = overIndex >= 0 ? overIndex : overItems.length
      overItems.splice(insertIndex, 0, movedTask)

      return prev.map((col) => {
        if (col.id === activeCol.id) return { ...col, tasks: activeItems }
        if (col.id === overCol.id) return { ...col, tasks: overItems }
        return col
      })
    })
  }, [columns])

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    setActiveTask(null)

    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    if (activeId === overId) return

    const activeCol = findColumn(activeId)
    if (!activeCol) return

    // 같은 컬럼 내 순서 변경
    const overInSameCol = activeCol.tasks.some((t) => t.id === overId)
    if (overInSameCol) {
      setColumns((prev) =>
        prev.map((col) => {
          if (col.id !== activeCol.id) return col
          const oldIndex = col.tasks.findIndex((t) => t.id === activeId)
          const newIndex = col.tasks.findIndex((t) => t.id === overId)
          return { ...col, tasks: arrayMove(col.tasks, oldIndex, newIndex) }
        })
      )
    }
  }, [columns])

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((column) => (
          <KanbanColumn key={column.id} column={column}>
            <SortableContext
              items={column.tasks.map((t) => t.id)}
              strategy={verticalListSortingStrategy}
            >
              {column.tasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </SortableContext>
          </KanbanColumn>
        ))}
      </div>

      <DragOverlay>
        {activeTask && <TaskCard task={activeTask} isDragging />}
      </DragOverlay>
    </DndContext>
  )
}
