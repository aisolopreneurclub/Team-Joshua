"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  Calendar,
  Kanban,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { useSidebarStore } from "@/stores/useSidebarStore"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  { href: "/dashboard", icon: LayoutDashboard, label: "대시보드" },
  { href: "/hr/employees", icon: Users, label: "HR" },
  { href: "/calendar", icon: Calendar, label: "캘린더" },
  { href: "/kanban", icon: Kanban, label: "칸반보드" },
] as const

const BOTTOM_ITEMS = [
  { href: "/settings", icon: Settings, label: "설정" },
] as const

export function Sidebar() {
  const pathname = usePathname()
  const { isOpen, toggle } = useSidebarStore()

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-gray-200 bg-white transition-all duration-200",
        isOpen ? "w-60" : "w-16"
      )}
    >
      <div className="flex h-14 items-center justify-between border-b border-gray-200 px-4">
        {isOpen && (
          <span className="text-lg font-bold text-gray-900">Joshua</span>
        )}
        <button
          onClick={toggle}
          className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100"
        >
          {isOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>
      </div>

      <nav className="flex-1 space-y-1 p-2">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <item.icon size={20} />
              {isOpen && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-gray-200 p-2">
        {BOTTOM_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <item.icon size={20} />
              {isOpen && <span>{item.label}</span>}
            </Link>
          )
        })}
      </div>
    </aside>
  )
}
