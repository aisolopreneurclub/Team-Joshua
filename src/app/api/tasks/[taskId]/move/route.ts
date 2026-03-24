import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/infrastructure/db/prisma"
import { requireAuth } from "@/lib/auth-utils"
import { createApiError } from "@/lib/errors"
import { moveTaskSchema } from "@/lib/validations/task"
import { notifyTaskUpdate } from "@/lib/slack"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const session = await requireAuth()
    if (session instanceof NextResponse) return session

    const { taskId } = await params
    const body = await request.json()
    const parsed = moveTaskSchema.safeParse(body)

    if (!parsed.success) {
      return createApiError("VALIDATION_ERROR", "잘못된 요청 데이터입니다")
    }

    const { targetColumnId, newOrder } = parsed.data

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        column: { select: { name: true } },
        assignee: { select: { user: { select: { name: true } } } },
      },
    })

    if (!task) {
      return createApiError("NOT_FOUND", "태스크를 찾을 수 없습니다")
    }

    const targetColumn = await prisma.column.findUnique({
      where: { id: targetColumnId },
      select: { name: true },
    })

    if (!targetColumn) {
      return createApiError("NOT_FOUND", "대상 컬럼을 찾을 수 없습니다")
    }

    const fromColumnName = task.column.name

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        columnId: targetColumnId,
        order: newOrder,
      },
      include: {
        column: { select: { name: true } },
        assignee: { select: { user: { select: { name: true } } } },
      },
    })

    // Send Slack notification (non-blocking)
    notifyTaskUpdate(
      {
        id: updatedTask.id,
        title: updatedTask.title,
        priority: updatedTask.priority,
        dueDate: updatedTask.dueDate?.toISOString() ?? null,
        assignee: updatedTask.assignee ? { name: updatedTask.assignee.user.name } : null,
        fromColumn: fromColumnName,
        toColumn: updatedTask.column.name,
      },
      "moved",
      session.user.name ?? session.user.email ?? "알 수 없음"
    )

    return NextResponse.json({
      data: {
        id: updatedTask.id,
        columnId: updatedTask.columnId,
        order: updatedTask.order,
        column: updatedTask.column,
      },
    })
  } catch (error) {
    if (error instanceof NextResponse) return error
    console.error("[tasks/move] Error:", error)
    return createApiError("INTERNAL_ERROR", "태스크 이동 중 오류가 발생했습니다")
  }
}
