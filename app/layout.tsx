'use client';

import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { useState, useEffect } from "react";
import { RoleProvider, useRole } from "@/components/RoleProvider";

const inter = Inter({ subsets: ["latin"] });

type UserRole = 'guest' | 'customer' | 'merchant' | 'admin';

// 各角色专属导航
const ROLE_NAV: Record<UserRole, { href: string; label: string }[]> = {
  guest: [
    { href: '/', label: '🏠 首页' },
    { href: '/appointments', label: '📅 预约' },
    { href: '/services', label: '💅 服务' },
    { href: '/products', label: '🛍️ 产品商店' },
    { href: '/cart', label: '🛒 购物车' },
    { href: '/orders', label: '📦 我的订单' },
    { href: '/chat', label: '💬 咨询' },
  ],
  customer: [
    { href: '/', label: '🏠 首页' },
    { href: '/appointments', label: '📅 预约' },
    { href: '/services', label: '💅 服务' },
    { href: '/products', label: '🛍️ 产品商店' },
    { href: '/cart', label: '🛒 购物车' },
    { href: '/orders', label: '📦 我的订单' },
    { href: '/profile', label: '👤 个人中心' },
    { href: '/chat', label: '💬 咨询' },
  ],
  merchant: [
    { href: '/', label: '🏠 首页' },
    { href: '/calendar', label: '📅 日历' },
    { href: '/appointments', label: '📆 预约管理' },
    { href: '/admin/orders', label: '📊 订单' },
    { href: '/admin/products', label: '📦 产品' },
    { href: '/admin/payment', label: '💳 收款码' },
    { href: '/admin/dashboard', label: '📈 数据' },
    { href: '/customers', label: '👥 客户' },
    { href: '/chat', label: '💬 客服' },
    { href: '/notifications', label: '🔔 通知' },
  ],
  admin: [
    { href: '/', label: '🏠 首页' },
    { href: '/calendar', label: '📅 日历' },
    { href: '/appointments', label: '📆 预约' },
    { href: '/admin/orders', label: '📊 订单' },
    { href: '/admin/products', label: '📦 产品' },
    { href: '/admin/payment', label: '💳 收款码' },
    { href: '/admin/dashboard', label: '📈 数据面板' },
    { href: '/customers', label: '👥 客户' },
    { href: '/staff', label: '👩‍💼 员工' },
    { href: '/chat', label: '💬 客服' },
    { href: '/notifications', label: '🔔 通知' },
  ],
};

const ROLE_LABELS: Record<UserRole, string> = {
  guest: '👤 访客',
  customer: '👩‍🦰 客户',
  merchant: '🏪 商家',
  admin: '👑 管理员',
};

const ROLE_COLORS: Record<UserRole, string> = {
  guest: 'from-gray-400 to-gray-500',
  customer: 'from-pink-400 to-rose-500',
  merchant: 'from-purple-500 to-indigo-600',
  admin: 'from-amber-400 to-orange-500',
};

function NavContent() {
  const { role, setRole, mounted } = useRole();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  const navItems = ROLE_NAV[role] || ROLE_NAV.guest;
  const colorClass = ROLE_COLORS[role];

  return (
    <>
      {/* 顶部导航栏 */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center flex-shrink-0">
              <Link href="/" className="flex items-center gap-2">
                <span className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                  丽姿秀
                </span>
                <span className="text-gray-500 text-sm hidden md:inline">· {ROLE_LABELS[role]}专属</span>
              </Link>

              {/* 桌面端导航 — 按角色显示 */}
              <div className="hidden lg:flex items-baseline ml-8 space-x-1">
                {navItems.map(item => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-gray-700 hover:text-pink-600 font-medium px-3 py-2 rounded-lg hover:bg-pink-50 transition text-sm"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* 右侧 */}
            <div className="flex items-center space-x-3">
              {/* 通知铃铛 */}
              <Link href="/notifications"
                className="relative w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-lg hover:bg-gray-200 transition">
                🔔
              </Link>

              {/* 角色切换 */}
              {mounted && (
                <div className="relative">
                  <button
                    onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                    className={`flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r ${colorClass} text-white rounded-lg text-sm font-semibold hover:opacity-90 transition shadow-sm`}
                  >
                    <span>{ROLE_LABELS[role]}</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {roleMenuOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50">
                      <div className="px-4 py-2 text-xs text-gray-500 font-medium border-b border-gray-100">
                        切换角色视角
                      </div>
                      {(Object.entries(ROLE_LABELS) as [UserRole, string][]).map(([r, label]) => (
                        <button
                          key={r}
                          onClick={() => { setRole(r); setRoleMenuOpen(false); }}
                          className={`w-full text-left px-4 py-2.5 text-sm hover:bg-pink-50 transition flex items-center gap-2 ${
                            r === role ? 'bg-pink-50 text-pink-600 font-semibold' : 'text-gray-700'
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full bg-gradient-to-r ${ROLE_COLORS[r]}`}></span>
                          {label}
                          {r === role && <span className="ml-auto text-pink-500">✓</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 登录按钮（访客） */}
              {mounted && role === 'guest' && (
                <Link href="/auth/login"
                  className="px-4 py-2 text-sm bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-semibold hover:opacity-90 transition">
                  登录 / 注册
                </Link>
              )}

              {/* 用户头像 */}
              <div className="h-9 w-9 rounded-full bg-gradient-to-r from-pink-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                {mounted ? role[0].toUpperCase() : '?'}
              </div>

              {/* 移动端菜单按钮 */}
              <button
                className="lg:hidden p-2 rounded-lg text-gray-700 hover:text-pink-600 hover:bg-pink-50 transition"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* 移动端菜单 */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white/95 border-t border-gray-100 shadow-lg">
            <div className="px-4 py-2 space-y-1">
              {navItems.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-3 px-4 text-gray-800 hover:text-pink-600 hover:bg-pink-50 rounded-lg font-medium transition"
                >
                  {item.label}
                </Link>
              ))}
              {mounted && role === 'guest' && (
                <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}
                  className="block py-3 px-4 text-pink-600 font-semibold">
                  登录 / 注册
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* 点击空白关闭角色菜单 */}
      {roleMenuOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setRoleMenuOpen(false)} />
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
      <body className={`${inter.className} min-h-full bg-gradient-to-br from-pink-50 to-purple-100`}>
        <RoleProvider>
          <NavContent />
          <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
          <footer className="border-t border-gray-200 bg-white/50 py-6 mt-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500 text-sm">
              <p>丽姿秀美容工作室 · {new Date().getFullYear()}</p>
              <p className="mt-1">数据安全存储于 Supabase 云端</p>
            </div>
          </footer>
        </RoleProvider>
      </body>
    </html>
  );
}
