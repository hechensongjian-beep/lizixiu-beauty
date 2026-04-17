'use client';

import RouteGuard from './RouteGuard';

interface AdminPageProps {
  children: React.ReactNode;
  /** 默认只允许商家/管理员，后续可扩展如 staff */
  allowedRoles?: ('merchant' | 'admin')[];
}

export default function AdminPage({ children, allowedRoles = ['merchant', 'admin'] }: AdminPageProps) {
  return (
    <RouteGuard allowedRoles={allowedRoles} redirectTo="/auth/login">
      {children}
    </RouteGuard>
  );
}
