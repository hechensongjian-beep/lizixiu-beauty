'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';


export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const role = session?.user?.user_metadata?.role;
      if (role === 'merchant' || role === 'admin') {
        setAuthorized(true);
      } else {
        router.replace('/auth/login');
      }
      setLoading(false);
    });
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#c9a87c] mb-4"></div>
          <p className="var(--foreground-muted)">检查权限中...</p>
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
      <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b rgba(201,168,124,0.2)">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-2xl font-bold bg-gradient-to-r from-[#c9a87c] to-[#e8d5b8] bg-clip-text text-transparent">
                  商家后台
                </span>
                <span className="ml-2 var(--foreground-muted) text-sm hidden md:inline">· 丽姿秀管理面板</span>
              </div>
              <div className="hidden md:block ml-12">
                <div className="flex items-baseline space-x-8">
                  <a
                    href="/admin/dashboard"
                    className="var(--foreground) hover:text-[var(--primary-dark)] font-medium px-3 py-2 rounded-lg hover:bg-[#c9a87c]/10 transition"
                  >
                     数据面板
                  </a>
                  <a
                    href="/admin/orders"
                    className="var(--foreground) hover:text-[var(--primary-dark)] font-medium px-3 py-2 rounded-lg hover:bg-[#c9a87c]/10 transition"
                  >
                     订单管理
                  </a>
                  <a
                    href="/admin/products"
                    className="var(--foreground) hover:text-[var(--primary-dark)] font-medium px-3 py-2 rounded-lg hover:bg-[#c9a87c]/10 transition"
                  >
                    产品管理
                  </a>

                  <a
                    href="/admin/services"
                    className="var(--foreground) hover:text-[var(--primary-dark)] font-medium px-3 py-2 rounded-lg hover:bg-[#c9a87c]/10 transition"
                  >
                    服务项目管理
                  </a>
                  <a
                    href="/admin/staff"
                    className="var(--foreground) hover:text-[var(--primary-dark)] font-medium px-3 py-2 rounded-lg hover:bg-[#c9a87c]/10 transition"
                  >
                    员工管理
                  </a>
                  <a
                    href="/admin/schedule"
                    className="var(--foreground) hover:text-[var(--primary-dark)] font-medium px-3 py-2 rounded-lg hover:bg-[#c9a87c]/10 transition"
                  >
                    排班日历
                  </a>
                  <a
                    href="/admin/payment"
                    className="var(--foreground) hover:text-[var(--primary-dark)] font-medium px-3 py-2 rounded-lg hover:bg-[#c9a87c]/10 transition"
                  >
                    收款设置
                  </a>
                  <a
                    href="/"
                    className="var(--foreground-muted) hover:var(--foreground) text-sm font-medium px-3 py-2 rounded-lg hover:var(--background-secondary) transition"
                  >
                    返回主站
                  </a>
                </div>
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={() => router.push('/')}
                className="ml-4 px-4 py-2 text-sm font-medium var(--foreground) bg-white border rgba(201,168,124,0.3) rounded-lg hover:var(--background-card) transition"
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
      <footer className="bg-white/80 border-t rgba(201,168,124,0.2) mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center var(--foreground-muted) text-sm">
          © {new Date().getFullYear()} 丽姿秀美容工作室 · 商家后台管理系统 v1.0
        </div>
      </footer>
    </div>
  );
}