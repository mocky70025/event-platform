import { cn } from "@/lib/utils"

type StatusType =
  | "pending" // 審査中
  | "approved" // 承認済み
  | "rejected" // 却下
  | "draft" // 下書き
  | "published" // 公開中
  | "closed" // 終了

interface StatusBadgeProps {
  status: StatusType
  className?: string
}

const statusConfig = {
  pending: {
    label: "審査中",
    className: "bg-orange-100 text-orange-800 border-orange-200",
  },
  approved: {
    label: "承認済み",
    className: "bg-green-100 text-green-800 border-green-200",
  },
  rejected: {
    label: "却下",
    className: "bg-red-100 text-red-800 border-red-200",
  },
  draft: {
    label: "下書き",
    className: "bg-gray-100 text-gray-800 border-gray-200",
  },
  published: {
    label: "公開中",
    className: "bg-blue-100 text-blue-800 border-blue-200",
  },
  closed: {
    label: "終了",
    className: "bg-gray-100 text-gray-600 border-gray-200",
  },
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium",
        config.className,
        className,
      )}
    >
      {config.label}
    </span>
  )
}

