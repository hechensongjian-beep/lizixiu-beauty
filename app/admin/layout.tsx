'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

type UserRole = 'guest' | 'customer' | 'merchant' | 'admin';

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      // 先尝试从 Supabase 获取当前会话
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // 未登录，重定向到登录页
        router.replace('/auth/login?redirect=/admin');
        return;
      }

      // 从 user_metadata 读取角色，默认为 'customer'
      const userRole = session.user.user_metadata?.role as UserRole;
      if (userRole !== 'merchant' && userRole !== 'admin') {
        // 无权限，重定向到首页
        router.replace('/');
        return;
      }

      // 授权通过
      setAuthorized(true);
      setLoading(false);
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500 mb-4"></div>
          <p className="text-gray-600">检查权限中...</p>
        </div>
      </div>
    );
  }

  if (!authorized) {
    // 空白页面，重定向会很快发生
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* 商家后台导航栏 */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                  商家后台
                </span>
                <span className="ml-2 text-gray-500 text-sm hidden md:inline">· 丽姿秀管理面板</span>
              </div>
              <div className="hidden md:block ml-12">
                <div className="flex items-baseline space-x-8">
                  <a
                    href="/admin/dashboard"
                    className="text-gray-700 hover:text-pink-600 font-medium px-3 py-2 rounded-lg hover:bg-pink-50 transition"
                  >
                    📊 数据面板
                  </a>
                  <a
                    href="/admin/orders"
                    className="text-gray-700 hover:text-pink-600 font-medium px-3 py-2 rounded-lg hover:bg-pink-50 transition"
                  >
                    📦 订单管理
                  </a>
                  <a
                    href="/admin/products"
                    className="text-gray-700 hover:text-pink-600 font-medium px-3 py-2 rounded-lg hover:bg-pink-50 transition"
                  >
                    🛍️ 产品管理
                  </a>
                  <a
                    href="/"
                    className="text-gray-600 hover:text-gray-800 text-sm font-medium px-3 py-2 rounded-lg hover:bg-gray-100 transition"
                  >
                    ← 返回主站
                  </a>
                </div>
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={async () => {
                  await supabase.auth.signOut();
                  router.push('/');
                }}
                className="ml-4 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                退出商家后台
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* 页面内容 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* 页脚 */}
      <footer className="bg-white/80 border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} 丽姿秀美容工作室 · 商家后台管理系统 v1.0
        </div>
      </footer>
    </div>
  );
}