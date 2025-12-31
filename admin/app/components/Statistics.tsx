'use client';

interface StatisticsProps {
  stats: {
    organizers: { total: number; pending: number; approved: number };
    exhibitors: { total: number };
    events: { total: number; pending: number; approved: number };
    applications: { total: number; pending: number; approved: number; rejected: number };
  };
  onRefresh: () => void;
}

export default function Statistics({ stats, onRefresh }: StatisticsProps) {
  const StatCard = ({ title, value, subtitle, color = '#8B5CF6' }: {
    title: string;
    value: number;
    subtitle?: string;
    color?: string;
  }) => (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: '20px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    }}>
      <div style={{
        fontSize: '14px',
        color: '#666',
        marginBottom: '8px',
      }}>
        {title}
      </div>
      <div style={{
        fontSize: '32px',
        fontWeight: 'bold',
        color: color,
        marginBottom: subtitle ? '4px' : '0',
      }}>
        {value.toLocaleString()}
      </div>
      {subtitle && (
        <div style={{
          fontSize: '12px',
          color: '#999',
        }}>
          {subtitle}
        </div>
      )}
    </div>
  );

  return (
    <div>
      <h2 style={{
        fontSize: '24px',
        fontWeight: 'bold',
        marginBottom: '20px',
      }}>
        統計情報
      </h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '30px',
      }}>
        <StatCard
          title="主催者"
          value={stats.organizers.total}
          subtitle={`承認待ち: ${stats.organizers.pending} | 承認済み: ${stats.organizers.approved}`}
          color="#8B5CF6"
        />
        <StatCard
          title="出店者"
          value={stats.exhibitors.total}
          color="#10B981"
        />
        <StatCard
          title="イベント"
          value={stats.events.total}
          subtitle={`承認待ち: ${stats.events.pending} | 承認済み: ${stats.events.approved}`}
          color="#3B82F6"
        />
        <StatCard
          title="申し込み"
          value={stats.applications.total}
          subtitle={`審査中: ${stats.applications.pending} | 承認: ${stats.applications.approved} | 却下: ${stats.applications.rejected}`}
          color="#F59E0B"
        />
      </div>

      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}>
        <h3 style={{
          fontSize: '18px',
          fontWeight: 'bold',
          marginBottom: '16px',
        }}>
          承認待ち項目
        </h3>
        <div style={{
          display: 'grid',
          gap: '12px',
        }}>
          {stats.organizers.pending > 0 && (
            <div style={{
              padding: '12px',
              backgroundColor: '#fef3c7',
              borderRadius: '4px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <span>主催者承認待ち: {stats.organizers.pending}件</span>
              <button
                onClick={() => window.location.href = '/admin?view=organizers'}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#8B5CF6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                確認する
              </button>
            </div>
          )}
          {stats.events.pending > 0 && (
            <div style={{
              padding: '12px',
              backgroundColor: '#dbeafe',
              borderRadius: '4px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <span>イベント承認待ち: {stats.events.pending}件</span>
              <button
                onClick={() => window.location.href = '/admin?view=events'}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#3B82F6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                確認する
              </button>
            </div>
          )}
          {stats.applications.pending > 0 && (
            <div style={{
              padding: '12px',
              backgroundColor: '#fef3c7',
              borderRadius: '4px',
            }}>
              <span>申し込み審査中: {stats.applications.pending}件</span>
            </div>
          )}
          {stats.organizers.pending === 0 && stats.events.pending === 0 && stats.applications.pending === 0 && (
            <div style={{
              padding: '12px',
              backgroundColor: '#d1fae5',
              borderRadius: '4px',
              textAlign: 'center',
              color: '#065f46',
            }}>
              ✅ 承認待ちの項目はありません
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

