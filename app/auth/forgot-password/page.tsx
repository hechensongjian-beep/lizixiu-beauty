'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!email) {
      setError('请输入邮箱地址');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) throw error;
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || '发送重置邮件失败，请重试');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-r from-green-100 to-emerald-100 rounded-2xl mb-6">
          <div className="text-xl"></div>
        </div>
        <h1 className="text-xl font-medium var(--foreground) mb-4">邮件已发送！</h1>
        <p className="var(--foreground) mb-6">
          我们已向 <strong>{email}</strong> 发送了一封密码重置邮件。请点击邮件中的链接设置新密码。
        </p>
        <p className="var(--foreground-muted) text-sm mb-8">
          如果您没有收到邮件，请检查垃圾邮件文件夹，或稍后重试。
        </p>
        <div className="space-y-4">
          <Link
            href="/auth/login"
            className="block px-6 py-3 text-white font-semibold rounded-lg hover:opacity-90 transition" style={{ background: 'var(--accent)' }}
          >
            返回登录
          </Link>
          <Link
            href="/"
            className="block px-6 py-3 border rgba(201,168,124,0.3) var(--foreground) font-semibold rounded-lg hover:var(--background-card) transition"
          >
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-2xl mb-6">
          <div className="text-xl"></div>
        </div>
        <h1 className="text-xl font-medium var(--foreground) mb-3">重置密码</h1>
        <p className="var(--foreground-muted)">
          输入您的邮箱地址，我们将发送重置链接
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block font-medium var(--foreground) mb-2">
            邮箱地址
          </label>
          <input
            type="email"
            required
            className="w-full px-4 py-3 border rgba(201,168,124,0.3) rounded-lg focus:ring-2 focus:ring-[#c9a87c] focus:border-transparent"
            placeholder="请输入邮箱"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
          <p className="mt-2 text-sm var(--foreground-muted)">
            请输入您注册时使用的邮箱地址
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            <p className="font-semibold">发送失败</p>
            <p>{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full px-6 py-3 bg-[var(--accent)] text-white font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              发送中...
            </span>
          ) : '发送重置链接'}
        </button>
      </form>

      <div className="mt-8 text-center var(--foreground-muted)">
        <Link href="/auth/login" className="text-[#a88a5c] font-semibold hover:underline">
          ← 返回登录
        </Link>
      </div>

      <div className="mt-12 p-6 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl">
        <h3 className="font-semibold var(--foreground) mb-2">注意事项</h3>
        <ul className="text-sm var(--foreground) space-y-1">
          <li>• 重置链接有效期 <strong>24 小时</strong>，请尽快操作</li>
          <li>• 如果收不到邮件，请检查垃圾邮件文件夹</li>
          <li>• 重置后您可以使用新密码立即登录</li>
          <li>• 如有问题，请联系客服 support@example.com</li>
        </ul>
      </div>
    </div>
  );
}