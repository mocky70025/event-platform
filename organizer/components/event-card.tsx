"use client"

import { Calendar, MapPin, Users } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { StatusBadge } from "@/components/status-badge"
import { cn } from "@/lib/utils"

interface EventCardProps {
  title: string
  date: string
  location: string
  capacity?: number
  image?: string
  status?: "pending" | "approved" | "rejected" | "draft" | "published" | "closed"
  accent?: "store" | "organizer" | "admin"
  onClick?: () => void
  className?: string
}

const accentColors = {
  store: "hover:border-[#5DABA8]",
  organizer: "hover:border-[#FF6B35]",
  admin: "hover:border-[#3B82F6]",
}

export function EventCard({
  title,
  date,
  location,
  capacity,
  image,
  status,
  accent = "store",
  onClick,
  className,
}: EventCardProps) {
  return (
    <Card
      className={cn(
        "cursor-pointer overflow-hidden rounded-lg transition-all hover:shadow-lg",
        accentColors[accent],
        className,
      )}
      onClick={onClick}
    >
      {image && (
        <div className="aspect-video w-full overflow-hidden bg-gray-100">
          <img src={image || "/placeholder.svg"} alt={title} className="h-full w-full object-cover" />
        </div>
      )}
      <CardContent className="p-4">
        <div className="mb-2 flex items-start justify-between gap-2">
          <h3 className="text-balance text-lg font-semibold leading-snug">{title}</h3>
          {status && <StatusBadge status={status} />}
        </div>
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{date}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>{location}</span>
          </div>
          {capacity && (
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>募集: {capacity}店舗</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
