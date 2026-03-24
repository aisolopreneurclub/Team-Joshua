import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/infrastructure/db/prisma"
import { notifyDailySummary } from "@/lib/slack"

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization")

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const now = new Date()
    const todayStart = new Date(now)
    todayStart.setHours(0, 0, 0, 0)
    const todayEnd = new Date(now)
    todayEnd.setHours(23, 59, 59, 999)
    const threeDaysLater = new Date(todayStart)
    threeDaysLater.setDate(threeDaysLater.getDate() + 3)

    // Fetch today's calendar events
    const events = await prisma.calendarEvent.findMany({
      where: {
        startTime: { gte: todayStart, lte: todayEnd },
      },
      select: {
        id: true,
        title: true,
        startTime: true,
        endTime: true,
        location: true,
      },
      orderBy: { startTime: "asc" },
    })

    // Fetch tasks due within 3 days or overdue
    const tasks = await prisma.task.findMany({
      where: {
        dueDate: { lte: threeDaysLater },
        column: { name: { not: "Done" } },
      },
      select: {
        id: true,
        title: true,
        priority: true,
        dueDate: true,
        assignee: { select: { user: { select: { name: true } } } },
        column: { select: { name: true } },
      },
      orderBy: { dueDate: "asc" },
    })

    const mappedTasks = tasks.map((t) => ({
      ...t,
      assignee: t.assignee ? { name: t.assignee.user.name } : null,
    }))

    const success = await notifyDailySummary(mappedTasks, events)

    return NextResponse.json({
      ok: success,
      summary: {
        events: events.length,
        tasks: tasks.length,
      },
    })
  } catch (error) {
    console.error("[cron/daily-summary] Error:", error)
    return NextResponse.json(
      { error: "일일 요약 생성 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}
