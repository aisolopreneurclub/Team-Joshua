import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { google } from "googleapis"
import type { calendar_v3 } from "googleapis"

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 })
  }

  const { searchParams } = request.nextUrl
  const timeMin = searchParams.get("timeMin")
  const timeMax = searchParams.get("timeMax")

  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000)

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  )

  if (session.accessToken) {
    oauth2Client.setCredentials({ access_token: session.accessToken })
  } else {
    const { prisma } = await import("@/infrastructure/db/prisma")
    const account = await prisma.account.findFirst({
      where: { provider: "google" },
      select: { refresh_token: true },
    })
    if (!account?.refresh_token) {
      return NextResponse.json(
        { error: "Google 연동 계정이 없습니다" },
        { status: 500 }
      )
    }
    oauth2Client.setCredentials({ refresh_token: account.refresh_token })
  }

  const calendar = google.calendar({ version: "v3", auth: oauth2Client })

  try {
    const calendarIds = [
      process.env.GOOGLE_SHARED_CALENDAR_ID ?? "primary",
    ]

    // 모든 캘린더에서 일정 병합
    const allItems: calendar_v3.Schema$Event[] = []
    await Promise.all(
      calendarIds.map(async (calId) => {
        try {
          const response = await calendar.events.list({
            calendarId: calId,
            timeMin: timeMin ?? startOfDay.toISOString(),
            timeMax: timeMax ?? endOfDay.toISOString(),
            singleEvents: true,
            orderBy: "startTime",
            timeZone: "Asia/Seoul",
            maxResults: 100,
          })
          if (response.data.items) {
            allItems.push(...response.data.items)
          }
        } catch {
          // 개별 캘린더 에러는 무시
        }
      })
    )

    // 시작 시간순 정렬
    allItems.sort((a, b) => {
      const aTime = a.start?.dateTime ?? a.start?.date ?? ""
      const bTime = b.start?.dateTime ?? b.start?.date ?? ""
      return aTime.localeCompare(bTime)
    })

    const events = allItems.map((event) => {
      const isAllDay = !!event.start?.date
      const start = event.start?.dateTime ?? event.start?.date ?? ""
      const end = event.end?.dateTime ?? event.end?.date ?? ""

      return {
        id: event.id ?? "",
        title: event.summary ?? "(제목 없음)",
        start,
        end,
        startTime: isAllDay ? "종일" : formatTime(start),
        endTime: isAllDay ? "" : formatTime(end),
        location: event.location ?? undefined,
        description: event.description ?? undefined,
        isAllDay,
        htmlLink: event.htmlLink ?? undefined,
      }
    })

    return NextResponse.json({ events })
  } catch (error) {
    console.error("[Calendar API Error]", error)
    return NextResponse.json(
      { error: "캘린더 일정을 가져올 수 없습니다", detail: String(error) },
      { status: 500 }
    )
  }
}

function formatTime(dateTimeStr: string): string {
  const date = new Date(dateTimeStr)
  return date.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Seoul",
  })
}
