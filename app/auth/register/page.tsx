'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    if (!email || !password || !phone || !confirmPassword) { setError('请填写所有必填字段'); setLoading(false); return; }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { setError('邮箱格式不正确'); setLoading(false); return; }
    if (password.length < 6) { setError('密码至少6位'); setLoading(false); return; }
    if (password !== confirmPassword) { setError('两次密码输入不一致'); setLoading(false); return; }
    if (!/^[0-9]{11}$/.test(phone)) { setError('手机号必须是11位数字'); setLoading(false); return; }
    if (!agreed) { setError('请先阅读并同意服务条款'); setLoading(false); return; }
    try {
      const { error: authError } = await supabase.auth.signUp({
        email, password,
        options: { data: { phone, role: 'customer' } },
      });
      if (authError) throw authError;
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || '注册失败，请重试');
    } finally { setLoading(false); }
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-6"
          style={{background:'linear-gradient(135deg,var(--primary-light) 0%,var(--primary-ultra-light) 100%)'}}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <h1 style={{fontFamily:'var(--font-serif)',fontSize:'1.5rem',fontWeight:400,color:'var(--foreground)',marginBottom:'1rem'}}>注册成功</h1>
        <p style={{color:'var(--foreground)',fontSize:'0.9375rem',marginBottom:'0.5rem'}}>
          我们已向 <strong>{email}</strong> 发送了一封验证邮件。
        </p>
        <p style={{color:'var(--foreground-muted)',fontSize:'0.875rem',marginBottom:'2rem'}}>
          请点击邮件中的链接验证邮箱，然后即可登录。
        </p>
        <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
          <button onClick={() => router.push('/auth/login')}
            className="w-full px-6 py-3 text-white font-semibold rounded-lg transition"
            style={{background:'linear-gradient(135deg,var(--primary) 0%,var(--primary-dark) 100%)',boxShadow:'0 4px 15px rgba(201,168,124,0.3)'}}>
            前往登录
          </button>
          <Link href="/"
            className="block w-full px-6 py-3 text-center rounded-lg font-medium transition"
            style={{border:'1.5px solid rgba(201,168,124,0.3)',color:'var(--foreground)'}}>
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-6"
          style={{background:'linear-gradient(135deg,var(--primary-light) 0%,var(--primary-ultra-light) 100%)'}}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
          </svg>
        </div>
        <h1 style={{fontFamily:'var(--font-serif)',fontSize:'1.5rem',fontWeight:400,color:'var(--foreground)',marginBottom:'0.75rem'}}>创建账号</h1>
        <p style={{color:'var(--foreground-muted)',fontSize:'0.9375rem'}}>注册后即可预约美容服务、查看订单</p>
      </div>

      <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:'1.5rem'}}>
        <div>
          <label style={{fontWeight:500,color:'var(--foreground)',marginBottom:'0.5rem',display:'block',fontSize:'0.875rem'}}>邮箱地址 *</label>
          <input type="email" required placeholder="用于登录和接收通知"
            value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading}
            className="w-full px-4 py-3 border rounded-lg focus:outline-none"
            style={{borderColor:'rgba(201,168,124,0.3)',background:'var(--background-card)',color:'var(--foreground)',fontSize:'0.875rem'}} />
        </div>
        <div>
          <label style={{fontWeight:500,color:'var(--foreground)',marginBottom:'0.5rem',display:'block',fontSize:'0.875rem'}}>设置密码 *</label>
          <input type="password" required placeholder="至少6位字符"
            value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading}
            className="w-full px-4 py-3 border rounded-lg focus:outline-none"
            style={{borderColor:'rgba(201,168,124,0.3)',background:'var(--background-card)',color:'var(--foreground)',fontSize:'0.875rem'}} />
        </div>
        <div>
          <label style={{fontWeight:500,color:'var(--foreground)',marginBottom:'0.5rem',display:'block',fontSize:'0.875rem'}}>确认密码 *</label>
          <input type="password" required placeholder="再次输入密码"
            value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} disabled={loading}
            className="w-full px-4 py-3 border rounded-lg focus:outline-none"
            style={{borderColor:'rgba(201,168,124,0.3)',background:'var(--background-card)',color:'var(--foreground)',fontSize:'0.875rem'}} />
        </div>
        <div>
          <label style={{fontWeight:500,color:'var(--foreground)',marginBottom:'0.5rem',display:'block',fontSize:'0.875rem'}}>手机号 *</label>
          <input type="tel" required placeholder="11位数字，仅用于联系"
            value={phone} onChange={(e) => setPhone(e.target.value)} disabled={loading}
            className="w-full px-4 py-3 border rounded-lg focus:outline-none"
            style={{borderColor:'rgba(201,168,124,0.3)',background:'var(--background-card)',color:'var(--foreground)',fontSize:'0.875rem'}} />
          <p style={{marginTop:'0.375rem',fontSize:'0.8125rem',color:'var(--foreground-muted)'}}>我们不会公开您的手机号</p>
        </div>

        {error && (
          <div className="p-4 rounded-lg" style={{background:'#fef2f2',border:'1px solid #fecaca',color:'#991b1b'}}>
            <p style={{fontWeight:600,fontSize:'0.875rem'}}>注册失败</p>
            <p style={{fontSize:'0.8125rem',marginTop:'0.25rem'}}>{error}</p>
          </div>
        )}

        <div className="p-4 rounded-lg" style={{background:'var(--background-secondary)',border:'1px solid rgba(201,168,124,0.12)'}}>
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 flex-shrink-0" style={{accentColor:'var(--primary)'}} />
            <span style={{fontSize:'0.8125rem',color:'var(--foreground)'}}>
              我已阅读并同意 <a href="#" style={{color:'var(--primary)'}}>服务条款</a> 与 <a href="#" style={{color:'var(--primary)'}}>隐私政策</a>
            </span>
          </label>
        </div>

        <button type="submit" disabled={loading}
          className="w-full px-6 py-3 text-white font-semibold rounded-lg transition disabled:opacity-50"
          style={{background:'linear-gradient(135deg,var(--primary) 0%,var(--primary-dark) 100%)',fontSize:'1rem',boxShadow:'0 4px 15px rgba(201,168,124,0.3)'}}>
          {loading ? '注册中...' : '立即注册'}
        </button>
      </form>

      <div style={{marginTop:'2rem',textAlign:'center',color:'var(--foreground-muted)',fontSize:'0.875rem'}}>
        已有账号？{' '}
        <Link href="/auth/login" style={{fontWeight:600,color:'var(--primary)'}}>直接登录</Link>
      </div>
    </div>
  );
}
