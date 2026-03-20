"use client"

import { useState } from "react"
import { LogIn, LogOut, Clock, Timer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type AttendanceState = "before-checkin" | "checked-in" | "checked-out"

export function AttendanceWidget() {
  const [state, setState] = useState<AttendanceState>("before-checkin")
  const [checkInTime, setCheckInTime] = useState<string | null>(null)
  const [checkOutTime, setCheckOutTime] = useState<string | null>(null)

  const now = new Date()
  const timeStr = now.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })

  const handleCheckIn = () => {
    setCheckInTime(timeStr)
    setState("checked-in")
  }

  const handleCheckOut = () => {
    setCheckOutTime(timeStr)
    setState("checked-out")
  }

  return (
    <div className="ring-1 ring-black/5 rounded-2xl p-1 h-full">
      <div className="rounded-[calc(1rem-0.25rem)] bg-white p-5 h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900 tracking-tight">
            출퇴근
          </h3>
          <span className="text-2xl font-bold text-gray-900 tabular-nums tracking-tight">
            {timeStr}
          </span>
        </div>

        <div className="flex-1 flex flex-col justify-center">
          {state === "before-checkin" && (
            <div className="text-center space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10">
                <LogIn className="h-7 w-7 text-blue-600" />
              </div>
              <Button
                onClick={handleCheckIn}
                className="w-full rounded-full px-8 py-5 text-base font-semibold bg-blue-600 hover:bg-blue-700 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.02] active:scale-[0.98]"
              >
                출근하기
              </Button>
            </div>
          )}

          {state === "checked-in" && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-xl bg-emerald-50 p-3">
                <Clock className="h-4 w-4 text-emerald-600" />
                <div>
                  <p className="text-xs text-emerald-600 font-medium">출근</p>
                  <p className="text-sm font-bold text-emerald-700 tabular-nums">
                    {checkInTime}
                  </p>
                </div>
              </div>
              <Button
                onClick={handleCheckOut}
                variant="outline"
                className="w-full rounded-full px-8 py-5 text-base font-semibold border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.02] active:scale-[0.98]"
              >
                퇴근하기
              </Button>
            </div>
          )}

          {state === "checked-out" && (
            <div className="space-y-3">
              <div className="flex items-center gap-3 rounded-xl bg-emerald-50 p-3">
                <LogIn className="h-4 w-4 text-emerald-600" />
                <div>
                  <p className="text-xs text-emerald-600 font-medium">출근</p>
                  <p className="text-sm font-bold text-emerald-700 tabular-nums">
                    {checkInTime}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
                <LogOut className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500 font-medium">퇴근</p>
                  <p className="text-sm font-bold text-gray-700 tabular-nums">
                    {checkOutTime}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-center gap-2 text-xs text-gray-400 pt-1">
                <Timer className="h-3 w-3" />
                <span className="tabular-nums">근무시간 8시간 32분</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
