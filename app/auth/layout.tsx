import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--background)] to-[var(--background-secondary)]">
      {/* 顶部导航 */}
      <header className="border-b rgba(201,168,124,0.2) bg-white">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] rounded-lg"></div>
              <span className="text-xl font-bold text-[var(--foreground)]">丽姿秀</span>
            </Link>
            <span className="text-[var(--foreground-muted)]">|</span>
            <span className="text-[var(--foreground-muted)] font-medium">账户中心</span>
          </div>
          <div className="text-sm text-[var(--foreground-muted)]">
            需要帮助？{' '}
            <a href="mailto:support@example.com" className="text-[var(--foreground)] hover:underline">
              联系客服
            </a>
          </div>
        </div>
      </header>

      {/* 主内容 */}
      <main className="py-8">
        {children}
      </main>

      {/* 页脚 */}
      <footer className="border-t rgba(201,168,124,0.2) bg-white py-6">
        <div className="max-w-6xl mx-auto px-4 text-center text-[var(--foreground-muted)] text-sm">
          <p>© 2026 丽姿秀美容预约系统 · 保留所有权利</p>
          <p className="mt-2">
            <Link href="/privacy" className="hover:underline">隐私政策</Link>
            {' · '}
            <Link href="/terms" className="hover:underline">服务条款</Link>
            {' · '}
            <Link href="/contact" className="hover:underline">联系我们</Link>
          </p>
        </div>
      </footer>
    </div>
  );
}