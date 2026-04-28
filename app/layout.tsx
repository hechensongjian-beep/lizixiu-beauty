'use client';

import "./globals.css";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { AuthProvider, useAuth } from "@/components/AuthProvider";
import { ToastProvider } from "@/components/Toast";
import Footer from './components/Footer';
import NotificationBadge from './components/NotificationBadge';

type UserRole = 'guest' | 'customer' | 'merchant' | 'admin' | 'staff';

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
    { href: '/admin/dashboard', label: '数据' },
    { href: '/admin/orders', label: '订单' },
    { href: '/appointments', label: '预约' },
  ],
  admin: [
    { href: '/', label: '首页' },
    { href: '/admin/dashboard', label: '数据' },
    { href: '/admin/orders', label: '订单' },
  ],
  staff: [
    { href: '/', label: '首页' },
    { href: '/appointments', label: '预约' },
    { href: '/staff/workbench', label: '工作台' },
  ],
};

const ADMIN_MENU: { href: string; label: string }[] = [
  { href: '/admin/settings', label: '首页内容设置' },
  { href: '/admin/promotions', label: '促销活动' },
  { href: '/admin/products', label: '商品管理' },
  { href: '/admin/services', label: '服务管理' },
  { href: '/admin/staff', label: '员工管理' },
  { href: '/admin/schedule', label: '排班管理' },
  { href: '/admin/testimonials', label: '口碑管理' },
  { href: '/customers', label: '客户管理' },
  { href: '/admin/payment', label: '收款码设置' },
  { href: '/admin/verify', label: '支付核验' },
];

const MY_MENU: Record<UserRole, { href: string; label: string }[]> = {
  guest: [
    { href: '/products', label: '产品' },
    { href: '/chat', label: '在线咨询' },
  ],
  customer: [
    { href: '/orders', label: '我的订单' },
    { href: '/appointments', label: '我的预约' },
    { href: '/profile', label: '个人中心' },
    { href: '/chat', label: '在线咨询' },
  ],
  merchant: [
    { href: '/orders', label: '我的订单' },
    { href: '/appointments', label: '我的预约' },
    { href: '/calendar', label: '日历视图' },
    { href: '/notifications', label: '通知中心' },
  ],
  admin: [
    { href: '/orders', label: '我的订单' },
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

function Dropdown({ label, items, isOpen, onToggle, onClose }: {
  label: string;
  items: { href: string; label: string }[];
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen, onClose]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={onToggle}
        className="flex items-center gap-1 text-[var(--foreground)] hover:text-[var(--primary)] px-4 py-2 font-medium transition-colors"
        style={{ fontSize: '0.875rem', letterSpacing: '0.03em' }}
      >
        {label}
        <svg className="w-3.5 h-3.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ transform: isOpen ? 'rotate(180deg)' : undefined }}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="absolute left-0 mt-1.5 w-48 bg-white rounded-lg shadow-lg border border-[var(--primary-light)]/30 py-1.5 z-[60]">
          {items.map(item => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className="block px-4 py-2.5 text-[var(--foreground)] hover:bg-[var(--background-secondary)] hover:text-[var(--primary)] transition-colors"
              style={{ fontSize: '0.8125rem' }}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function NavContent() {
  const { role, loading, user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);
  const [myMenuOpen, setMyMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem('beauty-shop-cart');
    if (saved) {
      try {
        const cart: Record<string, number> = JSON.parse(saved);
        setCartCount(Object.values(cart).reduce((a: number, b: number) => a + b, 0));
      } catch {}
    }
    const onCart = () => {
      const s = localStorage.getItem('beauty-shop-cart');
      if (s) {
        try {
          const c: Record<string, number> = JSON.parse(s);
          setCartCount(Object.values(c).reduce((a: number, b: number) => a + b, 0));
        } catch {}
      } else {
        setCartCount(0);
      }
    };
    window.addEventListener('cart-updated', onCart);
    return () => window.removeEventListener('cart-updated', onCart);
  }, []);

  const mainNav = MAIN_NAV[role] || MAIN_NAV.guest;
  const myMenu = MY_MENU[role] || MY_MENU.guest;
  const showAdminMenu = role === 'merchant' || role === 'admin';
  const showUserMenu = role === 'customer' || role === 'merchant' || role === 'admin' || role === 'staff';

  const closeAll = () => {
    setAdminMenuOpen(false);
    setMyMenuOpen(false);
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* 导航栏 - 暖白背景金色品牌 */}
      <nav className="sticky top-0 z-50" style={{ background: 'var(--background)', borderBottom: '1px solid rgba(201,168,124,0.15)' }}>
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-10">
          <div className="flex items-center justify-between" style={{ height: '64px' }}>
            {/* Logo - 金色品牌字 */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <span className="tracking-wide" style={{ fontFamily: 'var(--font-serif)', fontSize: '1.375rem', fontWeight: 400, color: 'var(--primary)' }}>
                丽姿秀
              </span>
              {loading ? null : (
                <span className="hidden md:inline" style={{ color: 'var(--foreground-muted)', fontSize: '0.75rem' }}>
                  · {ROLE_LABELS[role]}
                </span>
              )}
            </Link>

            {/* 桌面端导航 */}
            <div className="hidden lg:flex items-center gap-1">
              {mainNav.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative text-[var(--foreground)] hover:text-[var(--primary)] px-4 py-2 font-medium transition-colors"
                  style={{ fontSize: '0.875rem', letterSpacing: '0.03em' }}
                >
                  {item.label}
                  {showAdminMenu && item.href === '/admin/orders' && (
                    <NotificationBadge userId={user?.id} />
                  )}
                </Link>
              ))}

              {showAdminMenu && (
                <Dropdown
                  label="管理"
                  items={ADMIN_MENU}
                  isOpen={adminMenuOpen}
                  onToggle={() => { setAdminMenuOpen(!adminMenuOpen); setMyMenuOpen(false); setUserMenuOpen(false); }}
                  onClose={() => setAdminMenuOpen(false)}
                />
              )}

              <Dropdown
                label="我的"
                items={myMenu}
                isOpen={myMenuOpen}
                onToggle={() => { setMyMenuOpen(!myMenuOpen); setAdminMenuOpen(false); setUserMenuOpen(false); }}
                onClose={() => setMyMenuOpen(false)}
              />
            </div>

            {/* 右侧 */}
            <div className="flex items-center gap-2.5">
              {loading ? (
                <div className="w-4 h-4 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
              ) : (
                <Link href="/cart" className="relative p-1.5 rounded-md transition-colors hover:bg-[var(--background-secondary)]" aria-label="购物车">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--foreground)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                  </svg>
                  {cartCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 rounded-full text-white font-bold flex items-center justify-center"
                      style={{ background: 'var(--primary)', minWidth: '16px', minHeight: '16px', fontSize: '0.625rem', padding: '0 3px' }}>
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </Link>
              )}
              {showUserMenu ? (
                <div className="relative">
                  <button
                    onClick={() => { setUserMenuOpen(!userMenuOpen); setAdminMenuOpen(false); setMyMenuOpen(false); }}
                    className="flex items-center gap-1.5 px-2 py-1 font-medium text-[var(--accent)] hover:text-[var(--accent-light)] transition-colors"
                  >
                    <div className="w-6 h-6 rounded-full bg-[var(--primary)] flex items-center justify-center text-white font-medium" style={{ fontSize: '0.6875rem' }}>
                      {user?.email?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <span className="hidden sm:inline" style={{ fontSize: '0.8125rem' }}>{user?.email?.split('@')[0]}</span>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-1.5 w-52 bg-white rounded-lg shadow-lg border border-[var(--primary-light)]/30 py-1.5 z-50">
                      <div className="px-4 py-2.5 border-b border-[var(--background-secondary)]">
                        <div style={{ color: 'var(--foreground-muted)', fontSize: '0.75rem' }}>已登录</div>
                        <div className="font-medium truncate" style={{ fontSize: '0.8125rem' }}>{user?.email}</div>
                      </div>
                      <Link href="/profile" onClick={closeAll}
                        className="block px-4 py-2.5 text-[var(--foreground)] hover:bg-[var(--background-secondary)]" style={{ fontSize: '0.8125rem' }}>
                        个人设置
                      </Link>
                      <button onClick={() => { signOut(); closeAll(); }}
                        className="w-full text-left px-4 py-2.5 text-[var(--rose)] rgba(177,93,94,0.1)" style={{ fontSize: '0.8125rem' }}>
                        退出登录
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link href="/auth/login"
                  className="hidden sm:inline-flex items-center justify-center px-4 py-1.5 rounded-md font-medium text-white transition-all"
                  style={{
                    fontSize: '0.8125rem',
                    letterSpacing: '0.03em',
                    background: 'linear-gradient(135deg,#c9a87c 0%,#b8976a 100%)',
                    boxShadow: '0 2px 10px rgba(201,168,124,0.25)',
                  }}
                >
                  登录
                </Link>
              )}

              {/* 移动端菜单按钮 */}
              <button
                className="lg:hidden p-1.5 text-[var(--foreground)] hover:text-[var(--primary)] transition-colors"
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
            <div className="px-4 py-2 space-y-0.5">
              {mainNav.map(item => (
                <Link key={item.href} href={item.href} onClick={closeAll}
                  className="block py-2.5 px-4 text-[var(--foreground)] hover:bg-[var(--background-secondary)] rounded-md transition-colors" style={{ fontSize: '0.875rem' }}>
                  {item.label}
                </Link>
              ))}

              {showAdminMenu && (
                <>
                  <div className="py-1.5 px-4 text-[var(--foreground-muted)] font-medium" style={{ fontSize: '0.75rem' }}>— 管理 —</div>
                  {ADMIN_MENU.map(item => (
                    <Link key={item.href} href={item.href} onClick={closeAll}
                      className="block py-2.5 px-4 pl-6 text-[var(--foreground)] hover:bg-[var(--background-secondary)] rounded-md transition-colors" style={{ fontSize: '0.875rem' }}>
                      {item.label}
                    </Link>
                  ))}
                </>
              )}

              <div className="py-1.5 px-4 text-[var(--foreground-muted)] font-medium" style={{ fontSize: '0.75rem' }}>— 我的 —</div>
              {myMenu.map(item => (
                <Link key={item.href} href={item.href} onClick={closeAll}
                  className="block py-2.5 px-4 pl-6 text-[var(--foreground)] hover:bg-[var(--background-secondary)] rounded-md transition-colors" style={{ fontSize: '0.875rem' }}>
                  {item.label}
                </Link>
              ))}

              {!loading && !showUserMenu && (
                <Link href="/auth/login" onClick={closeAll}
                  className="block py-2.5 px-4 text-[var(--primary)] font-medium" style={{ fontSize: '0.875rem' }}>
                  登录 / 注册
                </Link>
              )}
              {showUserMenu && (
                <button onClick={() => { signOut(); closeAll(); }}
                  className="w-full text-left py-2.5 px-4 text-[var(--rose)]" style={{ fontSize: '0.875rem' }}>
                  退出登录
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* 点击空白关闭下拉 */}
      {(adminMenuOpen || myMenuOpen || userMenuOpen) && (
        <div className="fixed inset-0 z-40" onClick={closeAll} />
      )}
    </>
  );
}

// 回到顶部按钮
function ScrollToTop() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  if (!visible) return null;
  return (
    <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-16 right-6 w-9 h-9 rounded-full bg-white border shadow-md flex items-center justify-center z-40 transition-all hover:-translate-y-0.5 hover:shadow-lg"
      style={{ borderColor: 'rgba(201,168,124,0.2)' }}
      aria-label="回到顶部">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c9a87c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="18 15 12 9 6 15"/>
      </svg>
    </button>
  );
}

// Cookie 提示
function CookieNotice() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (!localStorage.getItem('cookie_accepted')) setShow(true);
  }, []);
  const accept = () => { localStorage.setItem('cookie_accepted', '1'); setShow(false); };
  if (!show) return null;
  return (
    <div className="fixed left-4 right-4 md:left-auto md:right-6 md:max-w-xs z-50"
      style={{ bottom: '72px' }}>
      <div className="bg-white rounded-lg p-4 shadow-xl border" style={{ borderColor: 'rgba(201,168,124,0.2)' }}>
        <p className="mb-2.5" style={{ color: 'var(--foreground-muted)', fontSize: '0.75rem', lineHeight: '1.5' }}>
          我们使用 Cookie 来改善您的浏览体验。访问我们的网站即表示您同意我们的使用条款。
        </p>
        <button onClick={accept}
          className="w-full py-2 rounded-md text-white font-medium transition hover:opacity-90"
          style={{ background: 'var(--accent)', fontSize: '0.75rem' }}>
          我知道了
        </button>
      </div>
    </div>
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
        <title>丽姿秀 · 专业美容服务</title>
        <meta name="description" content="丽姿秀专业美容服务与电商平台。面部护理、身体SPA、美甲美睫，精选草本成分，现代美容科技。立即预约，享受专属美丽蜕变。" />
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="keywords" content="美容,面部护理,身体SPA,美甲,美睫,美容工作室,丽姿秀" />
        <meta name="theme-color" content="#faf8f3" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="丽姿秀" />
        <link rel="manifest" href="/manifest.json" />
        <meta property="og:title" content="丽姿秀 · 专业美容服务" />
        <meta property="og:description" content="东方草本 · 现代美容科技 · 专属定制服务" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='40' fill='%23c9a87c'/><text x='50' y='68' font-size='50' text-anchor='middle' fill='white' font-family='serif'>丽</text></svg>" />
      </head>
      <body className="min-h-full" style={{ background: 'var(--background)' }}>
        <ToastProvider>
          <AuthProvider>
            <NavContent />
            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              {children}
            </main>
            <Footer />
            {/* 回到顶部 */}
            <ScrollToTop />
            {/* Cookie提示 */}
            <CookieNotice />
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}