'use client';

import { Calendar, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface EventCardProps {
  event: {
    id: string;
    event_name: string;
    event_start_date: string;
    event_end_date: string;
    venue_name: string;
    venue_city?: string;
    main_image_url?: string;
    lead_text?: string;
  };
  onClick: () => void;
}

export default function EventCard({ event, onClick }: EventCardProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  return (
    <Card
      onClick={onClick}
      className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm cursor-pointer transition-transform hover:-translate-y-0.5"
    >
      {event.main_image_url && (
        <div
          className="w-full h-48 bg-cover bg-center"
          style={{ backgroundImage: `url(${event.main_image_url})` }}
        />
      )}
      <CardContent className="p-4">
        <h3 className="text-lg font-bold mb-2 text-gray-900">
          {event.event_name}
        </h3>
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
          <Calendar className="h-4 w-4" />
          <span>{formatDate(event.event_start_date)} - {formatDate(event.event_end_date)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
          <MapPin className="h-4 w-4" />
          <span>
            {event.venue_name}
            {event.venue_city && ` (${event.venue_city})`}
          </span>
        </div>
        {event.lead_text && (
          <div className="text-sm text-gray-500 mt-2 line-clamp-2">
            {event.lead_text}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
