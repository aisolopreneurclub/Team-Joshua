"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import {
  LayoutDashboard,
  Users,
  Calendar,
  Kanban,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Network,
  Clock,
  CalendarOff,
  UserCircle,
} from "lucide-react"
import { useSidebarStore } from "@/stores/useSidebarStore"
import { cn } from "@/lib/utils"

interface NavItem {
  href: string
  icon: typeof LayoutDashboard
  label: string
  children?: { href: string; icon: typeof LayoutDashboard; label: string }[]
}

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", icon: LayoutDashboard, label: "대시보드" },
  {
    href: "/hr",
    icon: Users,
    label: "HR",
    children: [
      { href: "/hr/employees", icon: UserCircle, label: "직원 관리" },
      { href: "/hr/org-chart", icon: Network, label: "조직도" },
      { href: "/hr/attendance", icon: Clock, label: "근태 관리" },
      { href: "/hr/leaves", icon: CalendarOff, label: "휴가 관리" },
    ],
  },
  { href: "/calendar", icon: Calendar, label: "캘린더" },
  { href: "/kanban", icon: Kanban, label: "칸반보드" },
]

const BOTTOM_ITEMS = [
  { href: "/settings", icon: Settings, label: "설정" },
] as const

export function Sidebar() {
  const pathname = usePathname()
  const { isOpen, toggle } = useSidebarStore()
  const [expandedMenus, setExpandedMenus] = useState<string[]>(["/hr"])

  const toggleMenu = (href: string) => {
    setExpandedMenus((prev) =>
      prev.includes(href) ? prev.filter((h) => h !== href) : [...prev, href]
    )
  }

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-gray-200 bg-white transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
        isOpen ? "w-60" : "w-16"
      )}
    >
      <div className="flex h-14 items-center justify-between border-b border-gray-200 px-4">
        {isOpen && (
          <span className="text-lg font-bold text-gray-900">Joshua</span>
        )}
        <button
          onClick={toggle}
          className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 transition-colors"
        >
          {isOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>
      </div>

      <nav className="flex-1 space-y-1 p-2 overflow-y-auto">
        {isOpen && (
          <p className="px-3 py-2 text-[11px] font-medium text-gray-400 uppercase tracking-wider">
            메뉴
          </p>
        )}
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/")
          const isExpanded = expandedMenus.includes(item.href)

          if (item.children && isOpen) {
            return (
              <div key={item.href}>
                <button
                  onClick={() => toggleMenu(item.href)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <item.icon size={20} />
                  <span className="flex-1 text-left">{item.label}</span>
                  <ChevronDown
                    size={14}
                    className={cn(
                      "transition-transform duration-200",
                      isExpanded && "rotate-180"
                    )}
                  />
                </button>
                {isExpanded && (
                  <div className="ml-5 mt-1 space-y-0.5 border-l border-gray-100 pl-3">
                    {item.children.map((child) => {
                      const isChildActive = pathname === child.href
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={cn(
                            "flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors",
                            isChildActive
                              ? "text-blue-700 bg-blue-50/50"
                              : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                          )}
                        >
                          <child.icon size={16} />
                          <span>{child.label}</span>
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          }

          // 하위 메뉴가 있지만 접힌 상태
          if (item.children && !isOpen) {
            return (
              <Link
                key={item.href}
                href={item.children[0].href}
                className={cn(
                  "flex items-center justify-center rounded-lg p-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
                title={item.label}
              >
                <item.icon size={20} />
              </Link>
            )
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                !isOpen && "justify-center",
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
              title={!isOpen ? item.label : undefined}
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
                !isOpen && "justify-center",
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
              title={!isOpen ? item.label : undefined}
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
