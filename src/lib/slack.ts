interface SlackBlock {
  type: string
  text?: { type: string; text: string; emoji?: boolean }
  fields?: { type: string; text: string }[]
  elements?: { type: string; text: string }[]
}

interface SlackMessage {
  text: string
  blocks?: SlackBlock[]
}

export async function sendSlackMessage(
  text: string,
  blocks?: SlackBlock[]
): Promise<boolean> {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL
  if (!webhookUrl) {
    console.warn("[Slack] SLACK_WEBHOOK_URL이 설정되지 않았습니다")
    return false
  }

  const payload: SlackMessage = { text }
  if (blocks) payload.blocks = blocks

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      console.error(`[Slack] 메시지 전송 실패: ${res.status} ${res.statusText}`)
      return false
    }
    return true
  } catch (error) {
    console.error("[Slack] 메시지 전송 오류:", error)
    return false
  }
}

interface TaskInfo {
  id: string
  title: string
  priority: string
  dueDate: string | null
  assignee: { name: string } | null
  fromColumn: string
  toColumn: string
}

type TaskAction = "moved" | "created" | "completed"

export async function notifyTaskUpdate(
  task: TaskInfo,
  action: TaskAction,
  changedBy: string
): Promise<boolean> {
  const priorityEmoji: Record<string, string> = {
    LOW: "🟢",
    MEDIUM: "🟡",
    HIGH: "🟠",
    URGENT: "🔴",
  }

  const actionLabel: Record<TaskAction, string> = {
    moved: "이동됨",
    created: "생성됨",
    completed: "완료됨",
  }

  const emoji = priorityEmoji[task.priority] ?? "⚪"
  const dueDateText = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString("ko-KR")
    : "없음"

  const text = `${emoji} 태스크 ${actionLabel[action]}: ${task.title}`

  const blocks: SlackBlock[] = [
    {
      type: "header",
      text: { type: "plain_text", text: `${emoji} 태스크 ${actionLabel[action]}`, emoji: true },
    },
    {
      type: "section",
      fields: [
        { type: "mrkdwn", text: `*태스크:*\n${task.title}` },
        { type: "mrkdwn", text: `*처리자:*\n${changedBy}` },
        { type: "mrkdwn", text: `*상태 변경:*\n${task.fromColumn} → ${task.toColumn}` },
        { type: "mrkdwn", text: `*우선순위:*\n${emoji} ${task.priority}` },
        { type: "mrkdwn", text: `*담당자:*\n${task.assignee?.name ?? "미배정"}` },
        { type: "mrkdwn", text: `*마감일:*\n${dueDateText}` },
      ],
    },
  ]

  return sendSlackMessage(text, blocks)
}

interface DailySummaryTask {
  id: string
  title: string
  priority: string
  dueDate: Date | null
  assignee: { name: string } | null
  column: { name: string }
}

interface DailySummaryEvent {
  id: string
  title: string
  startTime: Date
  endTime: Date
  location: string | null
}

export async function notifyDailySummary(
  tasks: DailySummaryTask[],
  events: DailySummaryEvent[]
): Promise<boolean> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const threeDaysLater = new Date(today)
  threeDaysLater.setDate(threeDaysLater.getDate() + 3)

  const overdueTasks = tasks.filter(
    (t) => t.dueDate && new Date(t.dueDate) < today
  )
  const urgentTasks = tasks.filter(
    (t) =>
      t.dueDate &&
      new Date(t.dueDate) >= today &&
      new Date(t.dueDate) <= threeDaysLater
  )

  const formatTime = (d: Date) =>
    new Date(d).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })

  const text = `📋 일일 요약: 일정 ${events.length}건, 마감 임박 ${urgentTasks.length}건, 마감 초과 ${overdueTasks.length}건`

  const blocks: SlackBlock[] = [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: `📋 일일 업무 요약 — ${today.toLocaleDateString("ko-KR")}`,
        emoji: true,
      },
    },
  ]

  // Today's events
  if (events.length > 0) {
    const eventList = events
      .map((e) => {
        const loc = e.location ? ` (${e.location})` : ""
        return `• ${formatTime(e.startTime)}~${formatTime(e.endTime)} ${e.title}${loc}`
      })
      .join("\n")
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*📅 오늘 일정 (${events.length}건)*\n${eventList}`,
      },
    })
  } else {
    blocks.push({
      type: "section",
      text: { type: "mrkdwn", text: "*📅 오늘 일정*\n예정된 일정이 없습니다." },
    })
  }

  // Overdue tasks
  if (overdueTasks.length > 0) {
    const list = overdueTasks
      .map((t) => {
        const assignee = t.assignee?.name ?? "미배정"
        const due = t.dueDate!.toLocaleDateString("ko-KR")
        return `• 🔴 ${t.title} (담당: ${assignee}, 마감: ${due})`
      })
      .join("\n")
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*⚠️ 마감 초과 태스크 (${overdueTasks.length}건)*\n${list}`,
      },
    })
  }

  // Urgent tasks (due within 3 days)
  if (urgentTasks.length > 0) {
    const list = urgentTasks
      .map((t) => {
        const assignee = t.assignee?.name ?? "미배정"
        const due = t.dueDate!.toLocaleDateString("ko-KR")
        return `• 🟡 ${t.title} (담당: ${assignee}, 마감: ${due})`
      })
      .join("\n")
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*⏰ 마감 임박 태스크 — 3일 이내 (${urgentTasks.length}건)*\n${list}`,
      },
    })
  }

  if (overdueTasks.length === 0 && urgentTasks.length === 0) {
    blocks.push({
      type: "section",
      text: { type: "mrkdwn", text: "*✅ 마감 관련 태스크*\n마감 임박 또는 초과 태스크가 없습니다." },
    })
  }

  return sendSlackMessage(text, blocks)
}
