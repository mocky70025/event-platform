'use client';

interface Event {
  id: string;
  event_name: string;
  event_start_date: string;
  event_end_date: string;
  venue_name: string;
  main_image_url?: string;
  lead_text?: string;
  event_description?: string;
}

interface EventDetailProps {
  event: Event;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onViewApplications: (eventId: string) => void;
}

export default function EventDetail({
  event,
  onBack,
  onEdit,
  onDelete,
  onViewApplications,
}: EventDetailProps) {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      paddingBottom: '80px',
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '16px',
        borderBottom: '1px solid #e0e0e0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <button
          onClick={onBack}
          style={{
            padding: '8px 16px',
            backgroundColor: '#f0f0f0',
            border: 'none',
            borderRadius: '4px',
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          ← 戻る
        </button>
        <div style={{
          display: 'flex',
          gap: '8px',
        }}>
          <button
            onClick={onEdit}
            style={{
              padding: '8px 16px',
              backgroundColor: '#FF6B35',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            編集
          </button>
          <button
            onClick={onDelete}
            style={{
              padding: '8px 16px',
              backgroundColor: '#e74c3c',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            削除
          </button>
        </div>
      </div>

      <div style={{
        padding: '20px',
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        }}>
          {event.main_image_url && (
            <img
              src={event.main_image_url}
              alt={event.event_name}
              style={{
                width: '100%',
                maxHeight: '300px',
                objectFit: 'cover',
                borderRadius: '8px',
                marginBottom: '20px',
              }}
            />
          )}

          <h1 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            marginBottom: '16px',
          }}>
            {event.event_name}
          </h1>

          <div style={{
            fontSize: '16px',
            color: '#666',
            marginBottom: '20px',
            lineHeight: '1.6',
          }}>
            <div style={{ marginBottom: '8px' }}>
              📅 {new Date(event.event_start_date).toLocaleDateString('ja-JP')} - {new Date(event.event_end_date).toLocaleDateString('ja-JP')}
            </div>
            <div style={{ marginBottom: '8px' }}>
              📍 {event.venue_name}
            </div>
          </div>

          {event.lead_text && (
            <div style={{
              fontSize: '16px',
              lineHeight: '1.6',
              marginBottom: '20px',
              padding: '16px',
              backgroundColor: '#f9f9f9',
              borderRadius: '8px',
            }}>
              {event.lead_text}
            </div>
          )}

          {event.event_description && (
            <div style={{
              fontSize: '16px',
              lineHeight: '1.6',
              marginBottom: '20px',
              whiteSpace: 'pre-wrap',
            }}>
              {event.event_description}
            </div>
          )}

          <button
            onClick={() => onViewApplications(event.id)}
            style={{
              width: '100%',
              padding: '16px',
              backgroundColor: '#FF6B35',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '18px',
              fontWeight: 'bold',
              cursor: 'pointer',
              marginTop: '20px',
            }}
          >
            申し込み管理
          </button>
        </div>
      </div>
    </div>
  );
}

