'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

export type UserRole = 'guest' | 'customer' | 'merchant' | 'admin' | 'staff';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  profile: { phone?: string; display_name?: string } | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: 'guest',
  profile: null,
  loading: true,
  signOut: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

// 兼容旧的 useRole hook
export function useRole() {
  const { role, loading } = useAuth();
  return { role, setRole: () => {}, mounted: !loading };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>('guest');
  const [loading, setLoading] = useState(true);

  // 从 Auth metadata 读取角色，不需要 profiles 表
  const syncUser = useCallback((u: User | null) => {
    if (u) {
      const meta = u.user_metadata || {};
      const r = meta.role as UserRole;
      // 必须是有效角色，否则默认 customer
      const validRoles: UserRole[] = ['customer', 'merchant', 'admin', 'staff'];
      setRole(validRoles.includes(r) ? r : 'customer');
      setUser(u);
    } else {
      setUser(null);
      setRole('guest');
    }
  }, []);

  useEffect(() => {
    // 初始化：获取当前 session
    supabase.auth.getSession().then(({ data: { session } }) => {
      syncUser(session?.user ?? null);
      setLoading(false);
    });

    // 监听 auth 状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      syncUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [syncUser]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setRole('guest');
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, profile: null, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
