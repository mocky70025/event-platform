"use client"

export function StatusBadge({ 
  status,
  size = "default" 
}: { 
  status: string
  size?: "default" | "sm"
}) {
  const statusConfig: Record<string, { label: string; color: string }> = {
    pending: { label: "審査中", color: "bg-amber-50 text-amber-700 border-amber-200" },
    approved: { label: "承認済み", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    rejected: { label: "却下", color: "bg-red-50 text-red-700 border-red-200" },
    open: { label: "募集中", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    closed: { label: "募集終了", color: "bg-gray-50 text-gray-700 border-gray-200" },
    draft: { label: "下書き", color: "bg-gray-50 text-gray-700 border-gray-200" },
    published: { label: "公開中", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  }

  const config = statusConfig[status] || statusConfig.pending
  const sizeClass = size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm"

  return (
    <span 
      className={`inline-flex items-center rounded-md border font-medium ${sizeClass} ${config.color}`}
    >
      {config.label}
    </span>
  )
}