'use client';

import { useState, useEffect } from 'react';
import { getCurrentUser, isAdmin, signOut } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import WelcomeScreen from './components/WelcomeScreen';
import Dashboard from './components/Dashboard';
import LoadingSpinner from './components/LoadingSpinner';

export default function AdminPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    checkAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          if (typeof window !== 'undefined') {
            sessionStorage.clear();
          }
          setUser(null);
          setIsAuthorized(false);
        } else if (event === 'SIGNED_IN' && session) {
          await checkAuth();
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkAuth = async () => {
    try {
      setLoading(true);
      
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        if (typeof window !== 'undefined') {
          sessionStorage.clear();
        }
        setUser(null);
        setIsAuthorized(false);
        setLoading(false);
        return;
      }

      const currentUser = await getCurrentUser();
      if (!currentUser) {
        if (typeof window !== 'undefined') {
          sessionStorage.clear();
        }
        setUser(null);
        setIsAuthorized(false);
        setLoading(false);
        return;
      }

      setUser(currentUser);

      // 管理者権限チェック
      if (isAdmin(currentUser)) {
        setIsAuthorized(true);
      } else {
        setIsAuthorized(false);
        alert('管理者権限がありません');
        await signOut();
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      if (typeof window !== 'undefined') {
        sessionStorage.clear();
      }
      setUser(null);
      setIsAuthorized(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <LoadingSpinner />
      </div>
    );
  }

  if (!user || !isAuthorized) {
    return <WelcomeScreen />;
  }

  return <Dashboard />;
}

