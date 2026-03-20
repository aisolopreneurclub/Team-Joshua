"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight } from "lucide-react"

const LABEL_MAP: Record<string, string> = {
  dashboard: "대시보드",
  hr: "HR",
  employees: "직원 관리",
  "org-chart": "조직도",
  attendance: "근태 관리",
  leaves: "휴가 관리",
  calendar: "캘린더",
  kanban: "칸반보드",
  settings: "설정",
}

export function Breadcrumb() {
  const pathname = usePathname()
  const segments = pathname.split("/").filter(Boolean)

  if (segments.length <= 1) return null

  return (
    <nav className="mb-4 flex items-center gap-1 text-sm text-gray-500">
      {segments.map((segment, i) => {
        const href = "/" + segments.slice(0, i + 1).join("/")
        const label = LABEL_MAP[segment] ?? segment
        const isLast = i === segments.length - 1

        return (
          <span key={href} className="flex items-center gap-1">
            {i > 0 && <ChevronRight size={14} />}
            {isLast ? (
              <span className="font-medium text-gray-900">{label}</span>
            ) : (
              <Link href={href} className="hover:text-gray-700">
                {label}
              </Link>
            )}
          </span>
        )
      })}
    </nav>
  )
}
