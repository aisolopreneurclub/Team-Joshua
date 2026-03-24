import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { google } from "googleapis"

export async function POST() {
  const session = await getServerSession(authOptions)

  if (!session?.accessToken) {
    return NextResponse.json(
      { error: "Google 로그인이 필요합니다" },
      { status: 401 }
    )
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  )
  oauth2Client.setCredentials({ access_token: session.accessToken })

  const calendar = google.calendar({ version: "v3", auth: oauth2Client })

  try {
    const res = await calendar.calendars.insert({
      requestBody: {
        summary: "Team Joshua",
        description: "ASC Joshua ERP 조직 공용 캘린더",
        timeZone: "Asia/Seoul",
      },
    })

    const calendarId = res.data.id

    // 공개 읽기 권한 설정
    await calendar.acl.insert({
      calendarId: calendarId!,
      requestBody: {
        role: "reader",
        scope: { type: "default" },
      },
    })

    return NextResponse.json({
      calendarId,
      message: "공용 캘린더가 생성되었습니다. 이 ID를 .env에 GOOGLE_SHARED_CALENDAR_ID로 설정하세요.",
    })
  } catch (error) {
    return NextResponse.json(
      { error: "캘린더 생성 실패", detail: String(error) },
      { status: 500 }
    )
  }
}
