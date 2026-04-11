'use client';

import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { useState, useEffect } from "react";
import Head from "next/head";
import { supabase } from "@/lib/supabase";

const inter = Inter({ subsets: ["latin"] });

type UserRole = 'guest' | 'customer' | 'merchant' | 'admin';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [role, setRole] = useState<UserRole>('guest');
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // 获取当前 Supabase 会话
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // 从 user_metadata 中读取角色，默认为 'customer'
        const userRole = session.user.user_metadata?.role as UserRole;
        if (userRole && ['customer', 'merchant', 'admin'].includes(userRole)) {
          setRole(userRole);
          localStorage.setItem('app_role', userRole);
        } else {
          // 如果没有元数据角色，设为 'customer'
          setRole('customer');
          localStorage.setItem('app_role', 'customer');
        }
      } else {
        // 没有会话，设为 'guest'
        setRole('guest');
        localStorage.setItem('app_role', 'guest');
      }
      setMounted(true);
    };

    initAuth();

    // 监听身份验证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const userRole = session.user.user_metadata?.role as UserRole;
        if (userRole && ['customer', 'merchant', 'admin'].includes(userRole)) {
          setRole(userRole);
          localStorage.setItem('app_role', userRole);
        } else {
          setRole('customer');
          localStorage.setItem('app_role', 'customer');
        }
      } else {
        setRole('guest');
        localStorage.setItem('app_role', 'guest');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const changeRole = (newRole: UserRole) => {
    setRole(newRole);
    localStorage.setItem('app_role', newRole);
    // 刷新页面以应用角色变化（简单处理）
    window.location.reload();
  };

  return (
    <html lang="zh-CN" className="h-full">
      <Head>
        <title>丽姿秀 · 预约管理系统</title>
        <meta name="description" content="专为美容工作室设计的智能预约管理平台" />
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <body className={`${inter.className} min-h-full bg-gradient-to-br from-pink-50 to-purple-100`}>
        {/* 顶部导航栏 */}
        <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <div className="flex-shrink-0 flex items-center">
                  <span className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                    丽姿秀
                  </span>
                  <span className="ml-2 text-gray-500 text-sm hidden md:inline">预约管理系统</span>
                </div>
                {/* 桌面端导航 */}
                <div className="hidden md:block ml-12">
                  <div className="flex items-baseline space-x-8">
                    <Link
                      href="/"
                      className="text-gray-700 hover:text-pink-600 font-medium px-3 py-2 rounded-lg hover:bg-pink-50 transition"
                    >
                      🏠 首页
                    </Link>
                    <Link
                      href="/appointments"
                      className="text-gray-700 hover:text-pink-600 font-medium px-3 py-2 rounded-lg hover:bg-pink-50 transition"
                    >
                      📅 预约
                    </Link>
                    <Link
                      href="/customers"
                      className="text-gray-700 hover:text-pink-600 font-medium px-3 py-2 rounded-lg hover:bg-pink-50 transition"
                    >
                      👥 客户
                    </Link>
                    <Link
                      href="/services"
                      className="text-gray-700 hover:text-pink-600 font-medium px-3 py-2 rounded-lg hover:bg-pink-50 transition"
                    >
                      💅 服务
                    </Link>
                    <Link
                      href="/staff"
                      className="text-gray-700 hover:text-pink-600 font-medium px-3 py-2 rounded-lg hover:bg-pink-50 transition"
                    >
                      👩‍💼 员工
                    </Link>
                    <Link
                      href="/products"
                      className="text-gray-700 hover:text-pink-600 font-medium px-3 py-2 rounded-lg hover:bg-pink-50 transition"
                    >
                      🛍️ 产品商店
                    </Link>
                  </div>
                </div>

                {/* 移动端菜单按钮 */}
                <div className="md:hidden ml-4">
                  <button
                    type="button"
                    className="inline-flex items-center justify-center p-2 rounded-lg text-gray-700 hover:text-pink-600 hover:bg-pink-50 transition"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  >
                    <span className="sr-only">打开菜单</span>
                    {mobileMenuOpen ? (
                      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    ) : (
                      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* 移动端菜单面板 */}
              {mobileMenuOpen && (
                <div className="absolute top-16 left-0 right-0 z-40 md:hidden bg-white/95 backdrop-blur-lg border-b border-gray-200 shadow-lg">
                  <div className="px-4 py-3 space-y-2">
                    <Link
                      href="/"
                      className="block py-3 px-4 text-gray-800 hover:text-pink-600 hover:bg-pink-50 rounded-lg font-medium transition"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      🏠 首页
                    </Link>
                    <Link
                      href="/appointments"
                      className="block py-3 px-4 text-gray-800 hover:text-pink-600 hover:bg-pink-50 rounded-lg font-medium transition"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      📅 预约
                    </Link>
                    <Link
                      href="/customers"
                      className="block py-3 px-4 text-gray-800 hover:text-pink-600 hover:bg-pink-50 rounded-lg font-medium transition"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      👥 客户
                    </Link>
                    <Link
                      href="/services"
                      className="block py-3 px-4 text-gray-800 hover:text-pink-600 hover:bg-pink-50 rounded-lg font-medium transition"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      💅 服务
                    </Link>
                    <Link
                      href="/staff"
                      className="block py-3 px-4 text-gray-800 hover:text-pink-600 hover:bg-pink-50 rounded-lg font-medium transition"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      👩‍💼 员工
                    </Link>
                    <Link
                      href="/products"
                      className="block py-3 px-4 text-gray-800 hover:text-pink-600 hover:bg-pink-50 rounded-lg font-medium transition"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      🛍️ 产品商店
                    </Link>
                    {/* 根据角色显示额外链接 */}
                    {mounted && role === 'customer' && (
                      <>
                        <Link
                          href="/cart"
                          className="block py-3 px-4 text-gray-800 hover:text-pink-600 hover:bg-pink-50 rounded-lg font-medium transition"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          🛒 购物车
                        </Link>
                        <Link
                          href="/orders"
                          className="block py-3 px-4 text-gray-800 hover:text-pink-600 hover:bg-pink-50 rounded-lg font-medium transition"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          📦 我的订单
                        </Link>
                        <Link
                          href="/profile"
                          className="block py-3 px-4 text-gray-800 hover:text-pink-600 hover:bg-pink-50 rounded-lg font-medium transition"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          👤 个人中心
                        </Link>
                      </>
                    )}
                    {mounted && role === 'merchant' && (
                      <>
                        <Link
                          href="/admin/orders"
                          className="block py-3 px-4 text-gray-800 hover:text-pink-600 hover:bg-pink-50 rounded-lg font-medium transition"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          📊 订单管理
                        </Link>
                        <Link
                          href="/admin/products"
                          className="block py-3 px-4 text-gray-800 hover:text-pink-600 hover:bg-pink-50 rounded-lg font-medium transition"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          📦 产品管理
                        </Link>
                        <Link
                          href="/admin/dashboard"
                          className="block py-3 px-4 text-gray-800 hover:text-pink-600 hover:bg-pink-50 rounded-lg font-medium transition"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          📈 数据面板
                        </Link>
                      </>
                    )}
                    {mounted && role === 'admin' && (
                      <>
                        <Link
                          href="/admin/orders"
                          className="block py-3 px-4 text-gray-800 hover:text-pink-600 hover:bg-pink-50 rounded-lg font-medium transition"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          📊 订单管理
                        </Link>
                        <Link
                          href="/admin/products"
                          className="block py-3 px-4 text-gray-800 hover:text-pink-600 hover:bg-pink-50 rounded-lg font-medium transition"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          📦 产品管理
                        </Link>
                        <Link
                          href="/admin/dashboard"
                          className="block py-3 px-4 text-gray-800 hover:text-pink-600 hover:bg-pink-50 rounded-lg font-medium transition"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          📈 数据面板
                        </Link>
                        <Link
                          href="/admin/users"
                          className="block py-3 px-4 text-gray-800 hover:text-pink-600 hover:bg-pink-50 rounded-lg font-medium transition"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          👥 用户管理
                        </Link>
                      </>
                    )}
                    {mounted && role === 'guest' && (
                      <>
                        <Link
                          href="/cart"
                          className="block py-3 px-4 text-gray-800 hover:text-pink-600 hover:bg-pink-50 rounded-lg font-medium transition"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          🛒 购物车
                        </Link>
                        <Link
                          href="/orders"
                          className="block py-3 px-4 text-gray-800 hover:text-pink-600 hover:bg-pink-50 rounded-lg font-medium transition"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          📦 我的订单
                        </Link>
                        <Link
                          href="/auth/login"
                          className="block py-3 px-4 text-pink-600 hover:text-pink-700 font-semibold"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          登录/注册
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-4">
                {/* 根据角色显示不同的导航链接 */}
                {mounted && role === 'customer' && (
                  <>
                    <Link href="/cart" className="text-gray-700 hover:text-pink-600 font-medium px-3 py-2 rounded-lg hover:bg-pink-50 transition">
                      🛒 购物车
                    </Link>
                    <Link href="/orders" className="text-gray-700 hover:text-pink-600 font-medium px-3 py-2 rounded-lg hover:bg-pink-50 transition">
                      📦 我的订单
                    </Link>
                    <Link href="/profile" className="text-gray-700 hover:text-pink-600 font-medium px-3 py-2 rounded-lg hover:bg-pink-50 transition">
                      👤 个人中心
                    </Link>
                  </>
                )}
                {mounted && role === 'merchant' && (
                  <>
                    <Link href="/admin/orders" className="text-gray-700 hover:text-pink-600 font-medium px-3 py-2 rounded-lg hover:bg-pink-50 transition">
                      📊 订单管理
                    </Link>
                    <Link href="/admin/products" className="text-gray-700 hover:text-pink-600 font-medium px-3 py-2 rounded-lg hover:bg-pink-50 transition">
                      📦 产品管理
                    </Link>
                    <Link href="/admin/dashboard" className="text-gray-700 hover:text-pink-600 font-medium px-3 py-2 rounded-lg hover:bg-pink-50 transition">
                      📈 数据面板
                    </Link>
                  </>
                )}
                {mounted && role === 'admin' && (
                  <>
                    <Link href="/admin/orders" className="text-gray-700 hover:text-pink-600 font-medium px-3 py-2 rounded-lg hover:bg-pink-50 transition">
                      📊 订单管理
                    </Link>
                    <Link href="/admin/products" className="text-gray-700 hover:text-pink-600 font-medium px-3 py-2 rounded-lg hover:bg-pink-50 transition">
                      📦 产品管理
                    </Link>
                    <Link href="/admin/dashboard" className="text-gray-700 hover:text-pink-600 font-medium px-3 py-2 rounded-lg hover:bg-pink-50 transition">
                      📈 数据面板
                    </Link>
                    <Link href="/admin/users" className="text-gray-700 hover:text-pink-600 font-medium px-3 py-2 rounded-lg hover:bg-pink-50 transition">
                      👥 用户管理
                    </Link>
                  </>
                )}
                {mounted && role === 'guest' && (
                  <>
                    <Link href="/cart" className="text-gray-700 hover:text-pink-600 font-medium px-3 py-2 rounded-lg hover:bg-pink-50 transition">
                      🛒 购物车
                    </Link>
                    <Link href="/orders" className="text-gray-700 hover:text-pink-600 font-medium px-3 py-2 rounded-lg hover:bg-pink-50 transition">
                      📦 我的订单
                    </Link>
                    <Link href="/auth/login" className="px-4 py-2 text-sm bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-semibold hover:opacity-90 transition">
                      登录/注册
                    </Link>
                  </>
                )}

                {/* 角色选择下拉菜单（仅用于演示） */}
                <div className="relative">
                  <select
                    value={role}
                    onChange={(e) => changeRole(e.target.value as UserRole)}
                    className="pl-3 pr-8 py-2 border border-gray-300 rounded-lg text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                  >
                    <option value="guest">👤 访客</option>
                    <option value="customer">👩‍🦰 客户</option>
                    <option value="merchant">🏪 商家</option>
                    <option value="admin">👑 管理员</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* 用户头像占位 */}
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-pink-400 to-purple-500"></div>
              </div>
            </div>
          </div>
        </nav>

        {/* 主内容 */}
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>

        {/* 页脚 */}
        <footer className="border-t border-gray-200 bg-white/50 py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500 text-sm">
            <p>丽姿秀美容工作室 · 使用 Next.js + Supabase + Tailwind CSS 构建 · {new Date().getFullYear()}</p>
            <p className="mt-1">数据安全存储于 Supabase 云端，支持多端实时同步</p>
          </div>
        </footer>
      </body>
    </html>
  );
}