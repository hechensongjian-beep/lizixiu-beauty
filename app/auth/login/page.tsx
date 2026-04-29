'use client';

import { useState, useEffect } from 'react';
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";

function IconLock({ className }: { className?: string }) {
  return <svg className={className} width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
}
function IconUser({ className }: { className?: string }) {
  return <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
}
function IconStore({ className }: { className?: string }) {
  return <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
}

export default function LoginPage() {
  useEffect(() => { document.title = '登录 - 丽姿秀'; }, []);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    if (!email || !password) { setError("请输入邮箱和密码"); setLoading(false); return; }
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      router.push("/");
      router.refresh();
    } catch (err: any) {
      // 将 Supabase 英文错误转换为友好的中文提示
      const msg = err.message || "";
      if (msg.includes("Invalid login credentials") || msg.includes("Invalid credentials")) {
        setError("邮箱或密码错误，请重新输入");
      } else if (msg.includes("Email not confirmed")) {
        setError("邮箱尚未验证，请先查收验证邮件");
      } else if (msg.includes("Too many requests")) {
        setError("请求过于频繁，请稍后再试");
      } else if (msg.includes("User not found") || msg.includes("not found")) {
        setError("该邮箱尚未注册，请先注册账号");
      } else if (msg.includes("Network") || msg.includes("fetch")) {
        setError("网络连接失败，请检查网络后重试");
      } else {
        setError("登录失败：" + msg);
      }
    } finally { setLoading(false); }
  };

  const handleDemoLogin = async (role: "customer" | "merchant") => {
    setLoading(true); setError(null);
    const demoEmail = role === "customer" ? "customer@demo.com" : "merchant@demo.com";
    const demoPassword = "demo123456";
    try {
      let { error } = await supabase.auth.signInWithPassword({ email: demoEmail, password: demoPassword });
      if (error) {
        await supabase.auth.signUp({ email: demoEmail, password: demoPassword, options: { data: { phone: "13800138000", role } } });
        const { error: loginError } = await supabase.auth.signInWithPassword({ email: demoEmail, password: demoPassword });
        if (loginError) throw loginError;
      }
      router.push("/"); router.refresh();
    } catch (err: any) {
      setError("演示登录失败：" + (err.message || "未知错误"));
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-6"
          style={{background:"rgba(201,168,124,0.15)"}}>
          <IconLock />
        </div>
        <h1 style={{fontFamily:"var(--font-serif)",fontSize:"1.5rem",fontWeight:400,color:"var(--foreground)",marginBottom:"0.75rem"}}>登录账号</h1>
        <p style={{color:"var(--foreground-muted)",fontSize:"0.9375rem"}}>使用邮箱密码登录，管理您的预约或店铺</p>
      </div>

      <div className="mb-8">
        <h3 style={{fontSize:"0.875rem",fontWeight:500,color:"var(--foreground-muted)",marginBottom:"1rem"}}>快速体验（无需注册）</h3>
        <div className="grid grid-cols-2 gap-4">
          <button onClick={() => handleDemoLogin("customer")} disabled={loading}
            className="px-4 py-5 rounded-xl transition disabled:opacity-50 text-center"
            style={{border:"1px solid rgba(201,168,124,0.2)",background:"var(--background-card)"}}>
            <div className="w-10 h-10 mx-auto mb-2 rounded-full flex items-center justify-center" style={{background:"var(--primary-light)"}}>
              <IconUser />
            </div>
            <div style={{fontWeight:500,color:"var(--foreground)",fontSize:"0.875rem"}}>客户演示</div>
            <div style={{fontSize:"0.875rem",color:"var(--foreground-muted)"}}>体验预约流程</div>
          </button>
          <button onClick={() => handleDemoLogin("merchant")} disabled={loading}
            className="px-4 py-5 rounded-xl transition disabled:opacity-50 text-center"
            style={{border:"1px solid rgba(201,168,124,0.2)",background:"var(--background-card)"}}>
            <div className="w-10 h-10 mx-auto mb-2 rounded-full flex items-center justify-center" style={{background:"var(--accent)"}}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            </div>
            <div style={{fontWeight:500,color:"var(--foreground)",fontSize:"0.875rem"}}>商家演示</div>
            <div style={{fontSize:"0.875rem",color:"var(--foreground-muted)"}}>体验后台管理</div>
          </button>
        </div>
        <p style={{marginTop:"0.75rem",fontSize:"0.8125rem",color:"var(--foreground-muted)"}}>演示账户数据为临时生成，重启服务后会重置</p>
      </div>

      <div className="relative mb-8">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t" style={{borderColor:"rgba(201,168,124,0.15)"}}></div></div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4" style={{background:"var(--background)",color:"var(--foreground-muted)"}}>或使用正式账户登录</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label style={{fontWeight:500,color:"var(--foreground)",marginBottom:"0.5rem",display:"block"}}>邮箱地址</label>
          <input type="email" required className="w-full px-4 py-3 border rounded-lg focus:outline-none" placeholder="请输入邮箱"
            value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading}
            style={{borderColor:"rgba(201,168,124,0.3)",background:"var(--background-card)",color:"var(--foreground)",fontSize:"0.875rem"}} />
        </div>
        <div>
          <label style={{fontWeight:500,color:"var(--foreground)",marginBottom:"0.5rem",display:"block"}}>密码</label>
          <input type="password" required className="w-full px-4 py-3 border rounded-lg focus:outline-none" placeholder="输入您的密码"
            value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading}
            style={{borderColor:"rgba(201,168,124,0.3)",background:"var(--background-card)",color:"var(--foreground)",fontSize:"0.875rem"}} />
          <div className="mt-2 text-right">
            <Link href="/auth/forgot-password" style={{fontSize:"0.8125rem",color:"var(--primary)"}}>忘记密码？</Link>
          </div>
        </div>
        {error && (
          <div className="p-4 rounded-lg" style={{background:"#fef2f2",border:"1px solid #fecaca",color:"#991b1b"}}>
            <p style={{fontWeight:600,fontSize:"0.875rem"}}>登录失败</p>
            <p style={{fontSize:"0.8125rem",marginTop:"0.25rem"}}>{error}</p>
          </div>
        )}
        <button type="submit" disabled={loading}
          className="w-full py-3 font-bold rounded-lg text-white transition disabled:opacity-50"
          style={{background:"var(--accent)",fontSize:"1rem",boxShadow:"0 4px 15px rgba(45,74,62,0.4)"}}>
          {loading ? "登录中..." : "登录"}
        </button>
      </form>

      <div style={{marginTop:"2rem",textAlign:"center",color:"var(--foreground-muted)",fontSize:"0.875rem"}}>
        还没有账号？{" "}
        <Link href="/auth/register" style={{fontWeight:600,color:"var(--primary)"}}>立即注册</Link>
      </div>

      <div className="mt-8 p-6 rounded-xl" style={{background:"var(--background-secondary)",border:"1px solid rgba(201,168,124,0.15)"}}>
        <h3 style={{fontWeight:600,color:"var(--foreground)",marginBottom:"0.75rem",fontSize:"0.9375rem"}}>登录后您可以</h3>
        <ul style={{listStyle:"none",padding:0,margin:0,fontSize:"0.8125rem",color:"var(--foreground)"}}>
          <li style={{display:"flex",alignItems:"flex-start",gap:"0.5rem",marginBottom:"0.5rem"}}>
            <svg style={{marginTop:"2px",flexShrink:0}} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            <span><strong>客户</strong>：查看个人预约记录、管理预约、修改资料</span>
          </li>
          <li style={{display:"flex",alignItems:"flex-start",gap:"0.5rem",marginBottom:"0.5rem"}}>
            <svg style={{marginTop:"2px",flexShrink:0}} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            <span><strong>商家</strong>：管理所有预约、查看员工排班、统计收入</span>
          </li>
          <li style={{display:"flex",alignItems:"flex-start",gap:"0.5rem"}}>
            <svg style={{marginTop:"2px",flexShrink:0}} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            <span><strong>通用</strong>：接收邮件通知、设置提醒偏好、导出数据</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
