"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

export interface EventFormData {
  title: string
  description: string
  startTime: string
  endTime: string
  allDay: boolean
  location: string
  color: string
}

const COLORS = [
  { value: "#3b82f6", label: "파랑" },
  { value: "#10b981", label: "초록" },
  { value: "#f59e0b", label: "노랑" },
  { value: "#ef4444", label: "빨강" },
  { value: "#8b5cf6", label: "보라" },
  { value: "#ec4899", label: "분홍" },
]

function toLocalDatetimeString(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

interface EventFormProps {
  defaultStart?: Date
  defaultEnd?: Date
  onSubmit: (data: EventFormData) => void
  onCancel: () => void
}

export function EventForm({
  defaultStart,
  defaultEnd,
  onSubmit,
  onCancel,
}: EventFormProps) {
  const now = new Date()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [startTime, setStartTime] = useState(
    toLocalDatetimeString(defaultStart || now)
  )
  const [endTime, setEndTime] = useState(
    toLocalDatetimeString(
      defaultEnd || new Date(now.getTime() + 60 * 60 * 1000)
    )
  )
  const [allDay, setAllDay] = useState(false)
  const [location, setLocation] = useState("")
  const [color, setColor] = useState("#3b82f6")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    onSubmit({
      title: title.trim(),
      description,
      startTime: new Date(startTime).toISOString(),
      endTime: new Date(endTime).toISOString(),
      allDay,
      location,
      color,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title" className="text-sm font-medium">
          제목
        </Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="일정 제목을 입력하세요"
          className="rounded-lg"
          autoFocus
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-sm font-medium">
          설명
        </Label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="설명 (선택)"
          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
          rows={2}
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="allDay"
          checked={allDay}
          onChange={(e) => setAllDay(e.target.checked)}
          className="rounded border-gray-300"
        />
        <Label htmlFor="allDay" className="text-sm">
          종일
        </Label>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label className="text-sm font-medium">시작</Label>
          <Input
            type={allDay ? "date" : "datetime-local"}
            value={allDay ? startTime.split("T")[0] : startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="rounded-lg text-sm"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium">종료</Label>
          <Input
            type={allDay ? "date" : "datetime-local"}
            value={allDay ? endTime.split("T")[0] : endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="rounded-lg text-sm"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="location" className="text-sm font-medium">
          장소
        </Label>
        <Input
          id="location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="장소 (선택)"
          className="rounded-lg"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">색상</Label>
        <div className="flex gap-2">
          {COLORS.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => setColor(c.value)}
              className={cn(
                "h-7 w-7 rounded-full transition-all duration-200",
                color === c.value
                  ? "ring-2 ring-offset-2 ring-gray-400 scale-110"
                  : "hover:scale-105"
              )}
              style={{ backgroundColor: c.value }}
              title={c.label}
            />
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="rounded-full px-6"
        >
          취소
        </Button>
        <Button
          type="submit"
          disabled={!title.trim()}
          className="rounded-full px-6 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.02] active:scale-[0.98]"
        >
          저장
        </Button>
      </div>
    </form>
  )
}
