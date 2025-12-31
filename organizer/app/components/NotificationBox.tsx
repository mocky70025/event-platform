'use client';

import { useState, useEffect } from 'react';
import { getCurrentUser } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import LoadingSpinner from './LoadingSpinner';

interface Notification {
  id: string;
  notification_type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  related_event_id?: string;
  related_application_id?: string;
}

export default function NotificationBox() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error: queryError } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .eq('user_type', 'organizer')
        .order('created_at', { ascending: false })
        .limit(50);

      if (queryError) throw queryError;

      setNotifications(data || []);
      setUnreadCount((data || []).filter(n => !n.is_read).length);
    } catch (err: any) {
      console.error('Error loading notifications:', err);
      setError(err.message || '通知の読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err: any) {
      console.error('Error marking notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const user = await getCurrentUser();
      if (!user) return;

      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('user_type', 'organizer')
        .eq('is_read', false);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(n => ({ ...n, is_read: true }))
      );
      setUnreadCount(0);
    } catch (err: any) {
      console.error('Error marking all as read:', err);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }

    if (notification.related_event_id) {
      window.location.href = `/events?eventId=${notification.related_event_id}`;
    } else if (notification.related_application_id) {
      window.location.href = `/applications?applicationId=${notification.related_application_id}`;
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '20px' }}>
        <LoadingSpinner />
      </div>
    );
  }

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
        <h1 style={{
          fontSize: '20px',
          fontWeight: 'bold',
        }}>
          通知
          {unreadCount > 0 && (
            <span style={{
              marginLeft: '8px',
              padding: '2px 8px',
              backgroundColor: '#e74c3c',
              color: 'white',
              borderRadius: '12px',
              fontSize: '12px',
            }}>
              {unreadCount}
            </span>
          )}
        </h1>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
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
            すべて既読にする
          </button>
        )}
      </div>

      <div style={{
        padding: '20px',
      }}>
        {error && (
          <div style={{
            padding: '16px',
            backgroundColor: '#fee',
            color: '#c33',
            borderRadius: '8px',
            marginBottom: '16px',
          }}>
            {error}
          </div>
        )}

        {notifications.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: '#999',
          }}>
            <div style={{
              fontSize: '48px',
              marginBottom: '16px',
            }}>🔔</div>
            <div style={{
              fontSize: '16px',
            }}>
              通知はありません
            </div>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gap: '12px',
          }}>
            {notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                style={{
                  backgroundColor: notification.is_read ? 'white' : '#fff5f0',
                  borderRadius: '8px',
                  padding: '16px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  cursor: 'pointer',
                  borderLeft: notification.is_read ? 'none' : '4px solid #FF6B35',
                }}
              >
                <div style={{
                  fontSize: '16px',
                  fontWeight: 'bold',
                  marginBottom: '8px',
                  color: notification.is_read ? '#666' : '#333',
                }}>
                  {notification.title}
                </div>
                <div style={{
                  fontSize: '14px',
                  color: '#666',
                  marginBottom: '8px',
                  lineHeight: '1.5',
                }}>
                  {notification.message}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: '#999',
                }}>
                  {new Date(notification.created_at).toLocaleString('ja-JP')}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

