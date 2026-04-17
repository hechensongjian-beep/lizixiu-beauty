'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, UserRole } from '@/components/AuthProvider';

interface RouteGuardProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
  redirectTo?: string;
}

export default function RouteGuard({ allowedRoles, children, redirectTo = '/auth/login' }: RouteGuardProps) {
  const { role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !allowedRoles.includes(role)) {
      router.replace(redirectTo);
    }
  }, [role, loading, allowedRoles, redirectTo, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-[var(--foreground-muted)]">加载中...</span>
        </div>
      </div>
    );
  }

  if (!allowedRoles.includes(role)) {
    return null;
  }

  return <>{children}</>;
}
