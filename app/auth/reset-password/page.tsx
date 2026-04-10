'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [session, setSession] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    // 检查当前是否有恢复会话
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSession(session);
      } else {
        setError('重置链接无效或已过期，请重新申请');
      }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!password || !confirmPassword) {
      setError('请输入新密码和确认密码');
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      setError('密码至少6位');
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) throw error;
      setSuccess(true);
      setTimeout(() => {
        router.push('/auth/login');
      }, 3000);
    } catch (err: any) {
      setError(err.message || '密码更新失败，请重试');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!session && !error) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500 mb-4"></div>
        <p className="text-gray-500">验证重置链接中...</p>
      </div>
    );
  }

  if (error && !session) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-red-100 to-orange-100 rounded-2xl mb-6">
          <div className="text-3xl">⚠️</div>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">链接无效</h1>
        <p className="text-gray-700 mb-6">{error}</p>
        <div className="space-y-4">
          <Link
            href="/auth/forgot-password"
            className="block px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-lg hover:opacity-90 transition"
          >
            重新申请重置
          </Link>
          <Link
            href="/auth/login"
            className="block px-6 py-3 border border-gray-300 text-gray-800 font-semibold rounded-lg hover:bg-gray-50 transition"
          >
            返回登录
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-100 to-emerald-100 rounded-2xl mb-6">
          <div className="text-3xl">✅</div>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">密码重置成功！</h1>
        <p className="text-gray-700 mb-6">
          您的新密码已生效，3 秒后将自动跳转到登录页面。
        </p>
        <div className="space-y-4">
          <Link
            href="/auth/login"
            className="block px-6 py-3 bg-gradient-to-r from-gray-800 to-gray-900 text-white font-semibold rounded-lg hover:opacity-90 transition"
          >
            立即登录
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-2xl mb-6">
          <div className="text-3xl">🔒</div>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">设置新密码</h1>
        <p className="text-gray-600">
          请设置一个至少6位字符的新密码
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-800 mb-2">
            新密码
          </label>
          <input
            type="password"
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            placeholder="至少6位字符"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-800 mb-2">
            确认新密码
          </label>
          <input
            type="password"
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            placeholder="再次输入新密码"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={loading}
          />
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            <p className="font-semibold">设置失败</p>
            <p>{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              更新中...
            </span>
          ) : '更新密码'}
        </button>
      </form>

      <div className="mt-8 text-center text-gray-600">
        <Link href="/auth/login" className="text-pink-600 font-semibold hover:underline">
          ← 返回登录
        </Link>
      </div>
    </div>
  );
}