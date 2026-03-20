import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function EmployeeDetailPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/hr/employees" className="rounded-lg p-2 hover:bg-gray-100 transition-colors">
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">직원 상세</h1>
      </div>

      <div className="ring-1 ring-black/5 rounded-2xl p-1">
        <div className="rounded-[calc(1rem-0.25rem)] bg-white p-12 text-center text-gray-400">
          <p className="text-sm">직원 상세 정보가 여기에 표시됩니다</p>
        </div>
      </div>
    </div>
  )
}
