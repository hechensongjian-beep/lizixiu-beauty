'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserRole = 'guest' | 'customer' | 'merchant' | 'admin';

interface RoleContextType {
  role: UserRole;
  setRole: (r: UserRole) => void;
  mounted: boolean;
}

const RoleContext = createContext<RoleContextType>({
  role: 'guest',
  setRole: () => {},
  mounted: false,
});

export function useRole() {
  return useContext(RoleContext);
}

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<UserRole>('guest');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('app_role') as UserRole;
    if (saved && ['guest', 'customer', 'merchant', 'admin'].includes(saved)) {
      setRoleState(saved);
    } else {
      setRoleState('customer');
      localStorage.setItem('app_role', 'customer');
    }
    setMounted(true);
  }, []);

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    localStorage.setItem('app_role', newRole);
  };

  return (
    <RoleContext.Provider value={{ role, setRole, mounted }}>
      {children}
    </RoleContext.Provider>
  );
}
