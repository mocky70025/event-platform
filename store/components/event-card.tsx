"use client"

import { useState } from "react"
import Image from "next/image"
import { 
  Calendar, 
  MapPin, 
  Users, 
  Heart
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface EventCardProps {
  title: string
  date: string
  location: string
  capacity?: number
  image?: string
  status?: "pending" | "approved" | "rejected" | "draft" | "published" | "closed" | "open" | "closing_soon"
  accent?: "store" | "organizer" | "admin"
  onClick?: () => void
  onFavoriteToggle?: () => void
  onApply?: () => void
  isFavorite?: boolean
  fee?: number
  tags?: string[]
  description?: string
  organizer?: {
    name: string
    avatar?: string
  }
  className?: string
}

const accentColors = {
  store: "#0EA5E9",
  organizer: "#F97316",
  admin: "#6366F1",
}

const statusConfig = {
  open: { label: "募集中", color: "bg-emerald-500" },
  closing_soon: { label: "締切間近", color: "bg-amber-500" },
  closed: { label: "募集終了", color: "bg-gray-400" },
  pending: { label: "審査中", color: "bg-amber-500" },
  approved: { label: "承認済み", color: "bg-emerald-500" },
  rejected: { label: "却下", color: "bg-red-500" },
  draft: { label: "下書き", color: "bg-gray-400" },
  published: { label: "公開中", color: "bg-emerald-500" },
}

export function EventCard({
  title,
  date,
  location,
  capacity,
  image,
  status = "open",
  accent = "store",
  onClick,
  onFavoriteToggle,
  onApply,
  isFavorite: initialFavorite = false,
  fee,
  tags = [],
  description,
  organizer,
  className,
}: EventCardProps) {
  const [isFavorited, setIsFavorited] = useState(initialFavorite)
  const accentColor = accentColors[accent]
  const statusInfo = statusConfig[status]

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsFavorited(!isFavorited)
    onFavoriteToggle?.()
  }

  return (
    <Card 
      className={`bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow transition-all ${className || ''}`}
      onClick={onClick}
    >
      {/* Image */}
      <div className="relative aspect-video bg-gray-100">
        {image ? (
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Calendar className="w-12 h-12 text-gray-300" />
          </div>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${statusInfo.color}`}>
            {statusInfo.label}
          </span>
        </div>

        {/* Favorite Button */}
        {onFavoriteToggle && (
          <button
            onClick={handleFavoriteClick}
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors"
          >
            <Heart 
              className={`w-5 h-5 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
            />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Title */}
        <h3 className="font-semibold text-gray-900 mb-3 line-clamp-2 text-base">
          {title}
        </h3>

        {/* Meta Info */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>{date}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4" />
            <span className="line-clamp-1">{location}</span>
          </div>
          {capacity !== undefined && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="w-4 h-4" />
              <span>募集 {capacity}名</span>
            </div>
          )}
        </div>

        {/* Description */}
        {description && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-4">
            {description}
          </p>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {tags.slice(0, 3).map((tag, index) => (
              <span 
                key={index}
                className="px-2 py-1 rounded-md bg-gray-100 text-xs text-gray-700"
              >
                {tag}
              </span>
            ))}
            {tags.length > 3 && (
              <span className="px-2 py-1 rounded-md bg-gray-100 text-xs text-gray-700">
                +{tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Organizer */}
        {organizer && (
          <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-100">
            {organizer.avatar ? (
              <Image
                src={organizer.avatar}
                alt={organizer.name}
                width={24}
                height={24}
                className="rounded-full"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-xs text-gray-600">
                  {organizer.name.charAt(0)}
                </span>
              </div>
            )}
            <span className="text-sm text-gray-600">{organizer.name}</span>
          </div>
        )}

        {/* Actions */}
        {onApply && (
          <Button
            onClick={(e) => {
              e.stopPropagation()
              onApply()
            }}
            disabled={status === 'closed' || status === 'rejected'}
            style={{ backgroundColor: status === 'closed' || status === 'rejected' ? undefined : accentColor }}
            className="w-full h-10 text-white text-sm font-medium rounded-lg transition-all hover:brightness-90 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {status === 'closed' ? '募集終了' : status === 'rejected' ? '却下済み' : '申し込む'}
          </Button>
        )}
      </div>
    </Card>
  )
}