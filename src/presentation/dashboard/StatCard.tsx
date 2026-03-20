"use client"

import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  iconColor?: string
  iconBg?: string
  trend?: {
    value: string
    isPositive: boolean
  }
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = "text-blue-600",
  iconBg = "bg-blue-500/10",
  trend,
}: StatCardProps) {
  return (
    <div className="group ring-1 ring-black/5 rounded-2xl p-1 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:ring-black/10 hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)]">
      <div className="rounded-[calc(1rem-0.25rem)] bg-white p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            <p className="text-[13px] font-medium text-gray-500 tracking-wide">
              {title}
            </p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-gray-900 tabular-nums tracking-tight">
                {value}
              </p>
              {trend && (
                <span
                  className={cn(
                    "text-xs font-semibold px-1.5 py-0.5 rounded-full",
                    trend.isPositive
                      ? "text-emerald-700 bg-emerald-50"
                      : "text-red-700 bg-red-50"
                  )}
                >
                  {trend.isPositive ? "+" : ""}
                  {trend.value}
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-xs text-gray-400">{subtitle}</p>
            )}
          </div>
          <div
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-xl transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110",
              iconBg
            )}
          >
            <Icon className={cn("h-5 w-5", iconColor)} />
          </div>
        </div>
      </div>
    </div>
  )
}
