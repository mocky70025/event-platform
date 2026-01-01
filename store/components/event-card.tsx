"use client"

import { useState } from "react"
import Image from "next/image"
import { 
  Calendar, 
  MapPin, 
  Users, 
  Heart,
  CheckCircle,
  AlertTriangle,
  XCircle,
  DollarSign
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

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
  store: {
    primary: "#5DABA8",
    light: "#F0F9F9",
    text: "text-[#5DABA8]"
  },
  organizer: {
    primary: "#E58A7B",
    light: "#FEF5F3",
    text: "text-[#E58A7B]"
  },
  admin: {
    primary: "#3B82F6",
    light: "#DBEAFE",
    text: "text-[#3B82F6]"
  },
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
  const colors = accentColors[accent]

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsFavorited(!isFavorited)
    onFavoriteToggle?.()
  }

  const handleApplyClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onApply?.()
  }

  // ステータス設定
  const statusConfig = {
    open: {
      label: '募集中',
      bgColor: 'bg-green-500',
      textColor: 'text-white',
      icon: <CheckCircle className="w-3.5 h-3.5" />
    },
    closing_soon: {
      label: '締切間近',
      bgColor: 'bg-orange-500',
      textColor: 'text-white',
      icon: <AlertTriangle className="w-3.5 h-3.5" />
    },
    closed: {
      label: '募集終了',
      bgColor: 'bg-gray-500',
      textColor: 'text-white',
      icon: <XCircle className="w-3.5 h-3.5" />
    },
    approved: {
      label: '承認済み',
      bgColor: 'bg-green-500',
      textColor: 'text-white',
      icon: <CheckCircle className="w-3.5 h-3.5" />
    },
    pending: {
      label: '審査中',
      bgColor: 'bg-yellow-500',
      textColor: 'text-white',
      icon: <AlertTriangle className="w-3.5 h-3.5" />
    },
    rejected: {
      label: '却下',
      bgColor: 'bg-red-500',
      textColor: 'text-white',
      icon: <XCircle className="w-3.5 h-3.5" />
    },
    draft: {
      label: '下書き',
      bgColor: 'bg-gray-400',
      textColor: 'text-white',
      icon: <XCircle className="w-3.5 h-3.5" />
    },
    published: {
      label: '公開中',
      bgColor: 'bg-green-500',
      textColor: 'text-white',
      icon: <CheckCircle className="w-3.5 h-3.5" />
    }
  }

  const statusStyle = statusConfig[status] || statusConfig.open

  return (
    <Card
      className={cn(
        "group cursor-pointer overflow-hidden rounded-xl hover:shadow-xl transition-all duration-300 hover:-translate-y-1",
        className,
      )}
      onClick={onClick}
    >
      {/* 画像エリア */}
      <div className="relative aspect-video overflow-hidden bg-gray-200">
        {image ? (
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
            <Calendar className="w-12 h-12 text-gray-400" />
          </div>
        )}
        
        {/* グラデーションオーバーレイ */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        
        {/* ステータスバッジ（右上） */}
        <div className="absolute top-4 right-4 z-10">
          <div
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md shadow-lg",
              statusStyle.bgColor,
              statusStyle.textColor
            )}
          >
            {statusStyle.icon}
            <span>{statusStyle.label}</span>
          </div>
        </div>
        
        {/* お気に入りボタン（左上） */}
        <button
          onClick={handleFavoriteClick}
          className="absolute top-4 left-4 z-10 p-2.5 bg-white/95 backdrop-blur-sm rounded-full hover:bg-white transition-all shadow-lg hover:scale-110"
        >
          <Heart
            className={cn(
              "w-5 h-5 transition-all",
              isFavorited
                ? "fill-red-500 text-red-500"
                : "text-gray-600 hover:text-red-500"
            )}
          />
        </button>
        
        {/* イベント名（画像下部オーバーレイ） */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <h3 className="text-xl font-bold text-white line-clamp-2 drop-shadow-lg">
            {title}
          </h3>
        </div>
      </div>
      
      {/* コンテンツエリア */}
      <CardContent className="p-5">
        {/* メタ情報 */}
        <div className="space-y-2.5 mb-4">
          {/* 日付 */}
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Calendar className={cn("w-4 h-4 flex-shrink-0", colors.text)} />
            <span className="font-medium">{date}</span>
          </div>
          
          {/* 場所 */}
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <MapPin className={cn("w-4 h-4 flex-shrink-0", colors.text)} />
            <span className="truncate">{location}</span>
          </div>
          
          {/* 募集人数 */}
          {capacity && (
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Users className={cn("w-4 h-4 flex-shrink-0", colors.text)} />
              <span>募集: {capacity}店舗</span>
            </div>
          )}
          
          {/* 出店料（オプション） */}
          {fee !== undefined && (
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <DollarSign className={cn("w-4 h-4 flex-shrink-0", colors.text)} />
              <span>{fee === 0 ? '無料' : `${fee.toLocaleString()}円`}</span>
            </div>
          )}
        </div>
        
        {/* タグ */}
        {tags.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-4">
            {tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                style={{ backgroundColor: colors.light, color: colors.primary }}
                className="px-3 py-1 text-xs font-semibold rounded-full hover:opacity-80 transition-opacity"
              >
                {tag}
              </span>
            ))}
            {tags.length > 3 && (
              <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full">
                +{tags.length - 3}
              </span>
            )}
          </div>
        )}
        
        {/* 説明文 */}
        {description && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-4 leading-relaxed">
            {description}
          </p>
        )}
        
        {/* 主催者情報 */}
        {organizer && (
          <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-100">
            <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0 ring-2 ring-gray-100">
              {organizer.avatar ? (
                <Image
                  src={organizer.avatar}
                  alt={organizer.name}
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div 
                  style={{ 
                    background: `linear-gradient(135deg, ${colors.primary}20 0%, ${colors.primary} 100%)` 
                  }}
                  className="w-full h-full flex items-center justify-center text-white font-bold text-sm"
                >
                  {organizer.name[0]}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 mb-0.5">主催</p>
              <p className="text-sm font-semibold text-gray-900 truncate">
                {organizer.name}
              </p>
            </div>
          </div>
        )}
        
        {/* アクションボタン */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            className={cn(
              "flex-1 border-2 border-gray-300 hover:bg-opacity-10 transition-all font-semibold"
            )}
            style={{ 
              borderColor: colors.primary,
              backgroundColor: 'transparent',
              color: colors.primary
            }}
            onClick={(e) => {
              e.stopPropagation()
              onClick?.()
            }}
          >
            詳細を見る
          </Button>
          {onApply && (
            <Button
              className="flex-1 font-semibold shadow-sm hover:shadow-md transition-all"
              style={{ 
                backgroundColor: status === 'closed' ? '#9CA3AF' : colors.primary
              }}
              onClick={handleApplyClick}
              disabled={status === 'closed'}
            >
              {status === 'closed' ? '募集終了' : '今すぐ申し込む'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
