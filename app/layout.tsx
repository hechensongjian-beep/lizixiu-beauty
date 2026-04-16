'use client';

import "./globals.css";
import Link from "next/link";
import { useState, useEffect } from "react";
import { RoleProvider, useRole } from "@/components/RoleProvider";


type UserRole = 'guest' | 'customer' | 'merchant' | 'admin' | 'staff';

// 精简后的主导航
const MAIN_NAV: Record<UserRole, { href: string; label: string }[]> = {
  guest: [
    { href: '/', label: '首页' },
    { href: '/appointments', label: '预约' },
    { href: '/products', label: '产品' },
    { href: '/cart', label: '购物车' },
  ],
  customer: [
    { href: '/', label: '首页' },
    { href: '/appointments', label: '预约' },
    { href: '/products', label: '产品' },
    { href: '/cart', label: '购物车' },
  ],
  merchant: [
    { href: '/', label: '首页' },
    { href: '/admin/orders', label: '订单' },
    { href: '/admin/products', label: '商品' },
    { href: '/admin/services', label: '服务' },
  ],
  admin: [
    { href: '/', label: '首页' },
    { href: '/appointments', label: '预约' },
    { href: '/admin/orders', label: '订单' },
    { href: '/admin/products', label: '产品' },
  ],
  staff: [
    { href: '/', label: '首页' },
    { href: '/staff/workbench', label: '工作台' },
  ],
};

// 管理下拉菜单（商家后台）
const ADMIN_MENU: { href: string; label: string }[] = [
  { href: '/admin/dashboard', label: '商家数据中心' },
  { href: '/admin/staff', label: '员工管理' },
  { href: '/admin/schedule', label: '排班管理' },
  { href: '/customers', label: '客户管理' },
  { href: '/admin/payment', label: '收款码设置' },
  { href: '/admin/verify', label: '支付核验' },
];

// 我的下拉菜单
const MY_MENU: Record<UserRole, { href: string; label: string }[]> = {
  guest: [
    { href: '/products', label: '产品' },
    { href: '/chat', label: '在线咨询' },
    { href: '/auth/login', label: '登录/注册' },
  ],
  customer: [
    { href: '/orders', label: '我的订单' },
    { href: '/appointments', label: '我的预约' },
    { href: '/profile', label: '个人中心' },
    { href: '/chat', label: '在线咨询' },
  ],
  merchant: [
    { href: '/calendar', label: '日历视图' },
    { href: '/notifications', label: '通知中心' },
    { href: '/admin/payment', label: '收款码设置' },
  ],
  admin: [
    { href: '/calendar', label: '日历视图' },
    { href: '/notifications', label: '通知中心' },
  ],
  staff: [
    { href: '/staff/workbench', label: '我的工作台' },
    { href: '/calendar', label: '我的排班' },
  ],
};

const ROLE_LABELS: Record<UserRole, string> = {
  guest: '访客',
  customer: '客户',
  merchant: '商家',
  admin: '管理员',
  staff: '员工',
};

function NavContent() {
  const { role, setRole, mounted } = useRole();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);
  const [myMenuOpen, setMyMenuOpen] = useState(false);

  const mainNav = MAIN_NAV[role] || MAIN_NAV.guest;
  const myMenu = MY_MENU[role] || MY_MENU.guest;
  const showAdminMenu = role === 'admin' || role === 'merchant';

  const closeAllMenus = () => {
    setRoleMenuOpen(false);
    setAdminMenuOpen(false);
    setMyMenuOpen(false);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* 顶部导航栏 */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-[var(--primary-light)]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <span className="text-2xl font-semibold tracking-wide" style={{ fontFamily: 'var(--font-serif)' }}>
                丽姿秀
              </span>
              <span className="text-xs text-[var(--foreground-muted)] hidden md:inline">
                · {ROLE_LABELS[role]}专属
              </span>
            </Link>

            {/* 桌面端导航 */}
            <div className="hidden lg:flex items-center gap-1">
              {mainNav.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-[var(--foreground)] hover:text-[var(--primary)] px-4 py-2 text-sm font-medium transition-colors"
                >
                  {item.label}
                </Link>
              ))}
              
              {/* 管理下拉菜单 */}
              {showAdminMenu && (
                <div className="relative">
                  <button
                    onClick={() => { setAdminMenuOpen(!adminMenuOpen); setMyMenuOpen(false); setRoleMenuOpen(false); }}
                    className="flex items-center gap-1 text-[var(--foreground)] hover:text-[var(--primary)] px-4 py-2 text-sm font-medium transition-colors"
                  >
                    管理
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {adminMenuOpen && (
                    <div className="absolute left-0 mt-1 w-44 bg-white rounded-lg shadow-lg border border-[var(--primary-light)]/30 py-1 z-[60]">
                      {ADMIN_MENU.map(item => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={closeAllMenus}
                          className="block px-4 py-2.5 text-sm text-[var(--foreground)] hover:bg-[var(--background-secondary)] hover:text-[var(--primary)] transition-colors"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
              
              {/* 我的下拉菜单 */}
              <div className="relative">
                <button
                  onClick={() => { setMyMenuOpen(!myMenuOpen); setAdminMenuOpen(false); setRoleMenuOpen(false); }}
                  className="flex items-center gap-1 text-[var(--foreground)] hover:text-[var(--primary)] px-4 py-2 text-sm font-medium transition-colors"
                >
                  我的
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {myMenuOpen && (
                  <div className="absolute left-0 mt-1 w-44 bg-white rounded-lg shadow-lg border border-[var(--primary-light)]/30 py-1 z-50">
                    {myMenu.map(item => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={closeAllMenus}
                        className="block px-4 py-2.5 text-sm text-[var(--foreground)] hover:bg-[var(--background-secondary)] hover:text-[var(--primary)] transition-colors"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 右侧 */}
            <div className="flex items-center gap-3">
              {/* 角色切换 */}
              {mounted && (
                <div className="relative">
                  <button
                    onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-[var(--accent)] hover:text-[var(--accent-light)] transition-colors"
                  >
                    <span>{ROLE_LABELS[role]}</span>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {roleMenuOpen && (
                    <div className="absolute right-0 mt-1 w-32 bg-white rounded-lg shadow-lg border border-[var(--primary-light)]/30 py-1 z-50">
                      {(Object.entries(ROLE_LABELS) as [UserRole, string][]).map(([r, label]) => (
                        <button
                          key={r}
                          onClick={() => { setRole(r); closeAllMenus(); }}
                          className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                            r === role 
                              ? 'bg-[var(--background-secondary)] text-[var(--primary)] font-medium' 
                              : 'text-[var(--foreground)] hover:bg-[var(--background-secondary)]'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 登录按钮（访客） */}
              {mounted && role === 'guest' && (
                <Link href="/auth/login" className="btn-primary text-sm">
                  登录
                </Link>
              )}

              {/* 移动端菜单按钮 */}
              <button
                className="lg:hidden p-2 text-[var(--foreground)] hover:text-[var(--primary)] transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* 移动端菜单 */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-[var(--primary-light)]/30 shadow-lg max-h-[70vh] overflow-y-auto">
            <div className="px-4 py-2 space-y-1">
              {mainNav.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeAllMenus}
                  className="block py-3 px-4 text-[var(--foreground)] hover:bg-[var(--background-secondary)] rounded-lg transition-colors"
                >
                  {item.label}
                </Link>
              ))}
              
              {showAdminMenu && (
                <>
                  <div className="py-2 px-4 text-xs text-[var(--foreground-muted)] font-medium">— 管理 —</div>
                  {ADMIN_MENU.map(item => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={closeAllMenus}
                      className="block py-3 px-4 pl-6 text-[var(--foreground)] hover:bg-[var(--background-secondary)] rounded-lg transition-colors"
                    >
                      {item.label}
                    </Link>
                  ))}
                </>
              )}
              
              <div className="py-2 px-4 text-xs text-[var(--foreground-muted)] font-medium">— 我的 —</div>
              {myMenu.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeAllMenus}
                  className="block py-3 px-4 pl-6 text-[var(--foreground)] hover:bg-[var(--background-secondary)] rounded-lg transition-colors"
                >
                  {item.label}
                </Link>
              ))}
              
              {mounted && role === 'guest' && (
                <Link href="/auth/login" onClick={closeAllMenus}
                  className="block py-3 px-4 text-[var(--primary)] font-medium">
                  登录 / 注册
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* 点击空白关闭下拉菜单 */}
      {(roleMenuOpen || adminMenuOpen || myMenuOpen) && (
        <div className="fixed inset-0 z-40" onClick={closeAllMenus} />
      )}
    </>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full">
      <head>
        <title>丽姿秀 · 美容管理系统</title>
        <meta name="description" content="丽姿秀专业美容服务与电商平台" />
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={`min-h-full`} style={{ background: 'var(--background)' }}>
        <RoleProvider>
          <NavContent />
          <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </main>
          <footer className="border-t border-[var(--primary-light)]/30 bg-[var(--background-secondary)] py-6 mt-8">
            <div className="max-w-7xl mx-auto px-4 text-center">
              <p className="text-sm text-[var(--foreground-muted)]">
                丽姿秀美容工作室 · {new Date().getFullYear()}
              </p>
            </div>
          </footer>
        </RoleProvider>
      </body>
    </html>
  );
}
