# Cycle 5: Kanban Module (상세 지시서)

---

## 작업 지시

Cycle 5를 시작합니다. 칸반보드 모듈 전체를 구현하세요.

---

## 1. Domain 타입

```typescript
// src/domain/kanban/types.ts

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'

export const PRIORITY_CONFIG = {
  LOW: { label: '낮음', color: 'bg-green-100 text-green-800', icon: '🟢' },
  MEDIUM: { label: '보통', color: 'bg-yellow-100 text-yellow-800', icon: '🟡' },
  HIGH: { label: '높음', color: 'bg-red-100 text-red-800', icon: '🔴' },
  URGENT: { label: '긴급', color: 'bg-purple-100 text-purple-800', icon: '🟣' },
} as const

export interface Board {
  id: string
  name: string
  description: string | null
  isArchived: boolean
  createdAt: Date
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
  dueDate: Date | null
  assigneeId: string | null
  creatorId: string
  createdAt: Date
  updatedAt: Date
  assignee?: { id: string; user: { name: string; avatar: string | null } }
  creator?: { id: string; user: { name: string } }
  comments?: Comment[]
  labels?: { label: Label }[]
  _count?: { comments: number }
}

export interface Comment {
  id: string
  taskId: string
  authorId: string
  content: string
  createdAt: Date
  // authorId는 Employee.id → user.name 조인 필요
}

export interface Label {
  id: string
  name: string
  color: string
}

export type CreateBoardInput = {
  name: string
  description?: string
  columns?: string[] // 기본 컬럼 이름들
}

export type CreateTaskInput = {
  columnId: string
  title: string
  description?: string
  priority?: Priority
  assigneeId?: string
  dueDate?: string
}

export type MoveTaskInput = {
  targetColumnId: string
  newOrder: number
}

export type TaskFilters = {
  assigneeId?: string
  priority?: Priority
  dueBefore?: string
  search?: string
}
```

## 2. Zod Validation

```typescript
// src/lib/validations/task.ts
import { z } from 'zod'

export const createBoardSchema = z.object({
  name: z.string().min(1, '보드 이름을 입력하세요').max(100),
  description: z.string().max(500).optional(),
  columns: z.array(z.string()).optional().default(['To Do', 'In Progress', 'Review', 'Done']),
})

export const createTaskSchema = z.object({
  columnId: z.string().min(1),
  title: z.string().min(1, '제목을 입력하세요').max(200),
  description: z.string().max(5000).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  assigneeId: z.string().optional(),
  dueDate: z.string().optional(),
})

export const moveTaskSchema = z.object({
  targetColumnId: z.string().min(1),
  newOrder: z.number().int().min(0),
})

export const createCommentSchema = z.object({
  content: z.string().min(1, '내용을 입력하세요').max(2000),
})

export const reorderColumnsSchema = z.object({
  columns: z.array(z.object({
    id: z.string(),
    order: z.number().int().min(0),
  })),
})
```

## 3. Service 핵심 로직

```typescript
// src/application/kanban/BoardService.ts

export class BoardService {
  async createBoard(input: CreateBoardInput) {
    return prisma.board.create({
      data: {
        name: input.name,
        description: input.description,
        columns: {
          create: (input.columns || ['To Do', 'In Progress', 'Review', 'Done']).map(
            (name, index) => ({
              name,
              order: index,
              color: ['#e2e8f0', '#bfdbfe', '#fde68a', '#bbf7d0'][index] || '#e2e8f0',
            })
          ),
        },
      },
      include: { columns: { orderBy: { order: 'asc' } } },
    })
  }

  async getBoardDetail(id: string, filters?: TaskFilters) {
    const board = await prisma.board.findUnique({
      where: { id },
      include: {
        columns: {
          orderBy: { order: 'asc' },
          include: {
            tasks: {
              where: {
                ...(filters?.assigneeId && { assigneeId: filters.assigneeId }),
                ...(filters?.priority && { priority: filters.priority }),
                ...(filters?.dueBefore && { dueDate: { lte: new Date(filters.dueBefore) } }),
                ...(filters?.search && {
                  OR: [
                    { title: { contains: filters.search, mode: 'insensitive' } },
                    { description: { contains: filters.search, mode: 'insensitive' } },
                  ],
                }),
              },
              orderBy: { order: 'asc' },
              include: {
                assignee: { include: { user: { select: { name: true, avatar: true } } } },
                labels: { include: { label: true } },
                _count: { select: { comments: true } },
              },
            },
          },
        },
      },
    })
    if (!board) throw new Error('보드를 찾을 수 없습니다')
    return board
  }
}

// src/application/kanban/TaskService.ts

export class TaskService {
  async moveTask(taskId: string, input: MoveTaskInput) {
    const task = await prisma.task.findUnique({ where: { id: taskId } })
    if (!task) throw new Error('태스크를 찾을 수 없습니다')

    await prisma.$transaction(async (tx) => {
      // 1. 원래 컬럼에서 뒤의 태스크들 order -1
      await tx.task.updateMany({
        where: {
          columnId: task.columnId,
          order: { gt: task.order },
        },
        data: { order: { decrement: 1 } },
      })

      // 2. 타겟 컬럼에서 삽입 위치 이후 태스크들 order +1
      await tx.task.updateMany({
        where: {
          columnId: input.targetColumnId,
          order: { gte: input.newOrder },
        },
        data: { order: { increment: 1 } },
      })

      // 3. 태스크 이동
      await tx.task.update({
        where: { id: taskId },
        data: {
          columnId: input.targetColumnId,
          order: input.newOrder,
        },
      })
    })

    return prisma.task.findUnique({
      where: { id: taskId },
      include: {
        assignee: { include: { user: { select: { name: true, avatar: true } } } },
      },
    })
  }
}
```

## 4. DnD 구현 핵심 (가장 중요)

```tsx
// src/presentation/kanban/KanbanBoard.tsx
'use client'

import { useState, useCallback } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { KanbanColumn } from './KanbanColumn'
import { TaskCard } from './TaskCard'
import type { Board, Task, Column } from '@/domain/kanban/types'

// 구현 요점:

// 1. DndContext 설정
// - sensors: PointerSensor (distance: 5), KeyboardSensor
// - collisionDetection: closestCorners
// - onDragStart: 드래그 중인 태스크 상태 저장 (DragOverlay용)
// - onDragOver: 다른 컬럼 위로 이동 시 optimistic UI 업데이트
// - onDragEnd: 최종 위치로 API 호출

// 2. Optimistic Update 패턴
// onDragEnd에서:
//   a. 로컬 상태를 먼저 업데이트 (즉시 UI 반영)
//   b. PUT /api/v1/tasks/:id/move 호출
//   c. 성공: queryClient.invalidateQueries (서버 데이터로 동기화)
//   d. 실패: 로컬 상태 롤백 + toast.error('이동 실패')

// 3. 컬럼 구조
// <DndContext>
//   {columns.map(column => (
//     <KanbanColumn key={column.id} column={column}>
//       <SortableContext items={column.tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
//         {column.tasks.map(task => (
//           <TaskCard key={task.id} task={task} />
//         ))}
//       </SortableContext>
//     </KanbanColumn>
//   ))}
//   <DragOverlay>
//     {activeTask && <TaskCard task={activeTask} isDragging />}
//   </DragOverlay>
// </DndContext>

// 4. 필터 바
// - 담당자 Select (직원 목록)
// - 우선순위 Select (LOW/MEDIUM/HIGH/URGENT)
// - 마감일 DatePicker (이전)
// - 검색 Input
// - 필터 변경 시 queryKey에 포함하여 자동 재조회

// src/presentation/kanban/KanbanColumn.tsx
// - useDroppable({ id: column.id })
// - 헤더: 컬럼 이름 + 태스크 수 뱃지 + 색상 라인
// - [+ 태스크] 버튼 (하단)
// - isOver 상태 시 배경색 변경 (하이라이트)

// src/presentation/kanban/TaskCard.tsx
// - useSortable({ id: task.id })
// - 제목 (1줄 truncate)
// - 우선순위 뱃지 (PRIORITY_CONFIG 색상 사용)
// - 담당자 아바타 (Avatar 컴포넌트)
// - 마감일 (지난 경우 빨간색)
// - 코멘트 수 아이콘
// - 클릭 → TaskDetailModal 열기
// - isDragging일 때 opacity-50 + ring 스타일

// src/presentation/kanban/TaskDetailModal.tsx
// - Sheet (우측에서 슬라이드) 또는 Dialog
// - 상단: 제목 (인라인 수정), 상태(컬럼 이름)
// - 본문: 설명 (Textarea), 담당자, 우선순위, 마감일
// - 하단: CommentList + 새 코멘트 입력
// - 우측 상단: 삭제 버튼 (확인 Dialog)

// src/presentation/kanban/CommentList.tsx
// - GET /api/v1/tasks/:id/comments
// - 코멘트: 작성자 이름 + 시간 + 내용
// - 새 코멘트: Textarea + 전송 버튼
// - POST /api/v1/tasks/:id/comments
```

## 5. 페이지

```tsx
// app/(main)/kanban/page.tsx
// 보드 목록 페이지
// - GET /api/v1/boards
// - 카드 형태 (보드 이름, 설명, 컬럼 수, 태스크 수)
// - [+ 새 보드] 버튼 → Dialog에서 이름/설명/기본컬럼 입력
// - 보드 클릭 → /kanban/[boardId]

// app/(main)/kanban/[boardId]/page.tsx
// 칸반보드 페이지
// - KanbanBoard 컴포넌트 렌더링
// - 상단: 보드 이름 + [+ 컬럼 추가] + [필터] + [검색]
// - 전체 화면 활용 (min-h-screen, overflow-x-auto)
```

---

DnD 구현이 이 사이클의 핵심입니다. @dnd-kit/core와 @dnd-kit/sortable을 반드시 사용하세요.
optimistic update가 정상 동작해야 PASS입니다.

구현 완료 후 리뷰 보고서를 작성해 주세요.
