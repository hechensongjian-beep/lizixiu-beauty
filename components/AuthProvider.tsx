'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

export type UserRole = 'guest' | 'customer' | 'merchant' | 'admin' | 'staff';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  profile: { phone?: string; display_name?: string; staff_id?: string } | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: 'guest',
  profile: null,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

// 鍏煎鏃т唬鐮佺殑 useRole hook
export function useRole() {
  const { role, loading } = useAuth();
  return { role, setRole: () => {}, mounted: !loading };
}

async function fetchProfile(userId: string): Promise<{ role: UserRole; profile: any }> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('role, phone, display_name, staff_id')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      // Profile 涓嶅瓨鍦紝鍙兘鏄€佺敤鎴凤紝榛樿 customer
      return { role: 'customer', profile: null };
    }

    return {
      role: (data.role as UserRole) || 'customer',
      profile: data,
    };
  } catch {
    return { role: 'customer', profile: null };
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>('guest');
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUser(session.user);
      const { role: userRole, profile: userProfile } = await fetchProfile(session.user.id);
      setRole(userRole);
      setProfile(userProfile);
    } else {
      setUser(null);
      setRole('guest');
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    // 鍒濆鍖栵細鑾峰彇褰撳墠 session
    refreshProfile().finally(() => setLoading(false));

    // 鐩戝惉 auth 鐘舵€佸彉鍖?
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
        const { role: userRole, profile: userProfile } = await fetchProfile(session.user.id);
        setRole(userRole);
        setProfile(userProfile);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setRole('guest');
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [refreshProfile]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setRole('guest');
    setProfile(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, profile, loading, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}
