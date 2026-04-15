'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useRole } from '@/components/RoleProvider';
import { supabase } from '@/lib/supabase';

export default function StaffLoginPage() {
  const router = useRouter();
  const { role, setRole, mounted } = useRole();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (mounted && (role === 'merchant' || role === 'admin')) {
      router.push('/admin/dashboard');
    }
  }, [mounted, role, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('请输入邮箱和密码');
      return;
    }
    setLoading(true);
    setError('');
    try {
      // 通过 email 查找 staff 记录
      const { data: staffList, error: fetchError } = await supabase
        .from('staff')
        .select('id, name')
        .eq('email', email)
        .eq('is_active', true)
        .limit(1);

      if (fetchError || !staffList || staffList.length === 0) {
        setError('未找到该员工账号，请联系商家添加');
        setLoading(false);
        return;
      }

      // 验证密码（简单比对，实际生产用 bcrypt）
      const storedPwd = localStorage.getItem(`staff_pwd_${email}`);
      if (!storedPwd || storedPwd !== password) {
        // 首次登录无密码记录，需要商家先设置
        setError('密码错误或账号尚未激活，请联系商家设置密码');
        setLoading(false);
        return;
      }

      // 登录成功
      setRole('staff');
      localStorage.setItem('staff_id', staffList[0].id);
      localStorage.setItem('staff_name', staffList[0].name);
      localStorage.setItem('staff_email', email);
      router.push('/staff/workbench');
    } catch {
      setError('登录失败，请稍后重试');
    }
    setLoading(false);
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--background)' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4" style={{ background: 'var(--primary-light)' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </div>
          <h1 className="text-2xl text-[var(--foreground)]" style={{ fontFamily: 'var(--font-serif)' }}>员工登录</h1>
          <p className="text-[var(--foreground-muted)] text-sm mt-2">丽姿秀美容 · 员工专用入口</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">邮箱</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="请输入邮箱"
              className="w-full px-4 py-3 rounded-xl border border-[var(--primary-light)] bg-white text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">密码</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="请输入密码"
              className="w-full px-4 py-3 rounded-xl border border-[var(--primary-light)] bg-white text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all text-sm"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-white font-medium text-base transition-all hover:shadow-md disabled:opacity-60"
            style={{ background: 'var(--primary)' }}
          >
            {loading ? '登录中...' : '登录'}
          </button>
        </form>

        <div className="mt-6 text-center space-y-2">
          <Link href="/auth/login" className="block text-sm text-[var(--primary)] hover:underline">
            客户登录入口
          </Link>
          <Link href="/" className="block text-xs text-[var(--foreground-muted)] hover:text-[var(--foreground)]">
            ← 返回首页
          </Link>
        </div>

        <p className="text-xs text-center text-[var(--foreground-muted)] mt-6">
          密码由商家在后台设置，如有问题请联系商家
        </p>
      </div>
    </div>
  );
}
