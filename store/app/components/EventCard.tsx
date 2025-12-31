'use client';

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
    <div
      onClick={onClick}
      style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        cursor: 'pointer',
        transition: 'transform 0.2s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {event.main_image_url && (
        <div style={{
          width: '100%',
          height: '200px',
          backgroundImage: `url(${event.main_image_url})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }} />
      )}
      <div style={{ padding: '16px' }}>
        <h3 style={{
          fontSize: '18px',
          fontWeight: 'bold',
          marginBottom: '8px',
          color: '#333',
        }}>
          {event.event_name}
        </h3>
        <div style={{
          fontSize: '14px',
          color: '#666',
          marginBottom: '8px',
        }}>
          📅 {formatDate(event.event_start_date)} - {formatDate(event.event_end_date)}
        </div>
        <div style={{
          fontSize: '14px',
          color: '#666',
          marginBottom: '8px',
        }}>
          📍 {event.venue_name}
          {event.venue_city && ` (${event.venue_city})`}
        </div>
        {event.lead_text && (
          <div style={{
            fontSize: '14px',
            color: '#999',
            marginTop: '8px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}>
            {event.lead_text}
          </div>
        )}
      </div>
    </div>
  );
}

