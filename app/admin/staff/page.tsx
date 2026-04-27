'use client';

import { useState, useEffect } from 'react';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';

interface Staff {
  id: string;
  name: string;
  role: string;
  email?: string;
  phone?: string;
  is_active: boolean;
  created_at: string;
  user_id?: string;
}

interface NewStaff {
  name: string;
  role: string;
  email: string;
  password: string;
}

export default function AdminStaffPage() {
    useEffect(() => { document.title = '员工管理 - 丽姿秀'; }, []);

const { role } = useAuth();
  const router = useRouter();
  
  // 权限守卫
  if (role && role !== 'merchant' && role !== 'admin') {
    router.replace('/auth/login');
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#c9a87c] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm var(--foreground-muted)">Loading...</p>
        </div>
      </div>
    );
  }
  
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newStaff, setNewStaff] = useState<NewStaff>({ name: '', role: '', email: '', password: '' });
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [resetPwd, setResetPwd] = useState<{ id: string; email: string; pwd: string } | null>(null);
  const [adding, setAdding] = useState(false);

  const loadStaff = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('staff')
        .select('id, name, role, email, phone, is_active, created_at, user_id')
        .order('created_at', { ascending: false });
      if (!error && data) setStaffList(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadStaff(); }, []);

  // Add staff: via API route (uses supabaseAdmin, won't log out merchant)
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaff.name || !newStaff.email || !newStaff.password) {
      setMsg({ type: 'error', text: 'Please fill all fields' });
      return;
    }
    if (newStaff.password.length < 6) {
      setMsg({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }
    setAdding(true);
    setMsg(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const authHeaders: Record<string,string> = { 'Content-Type': 'application/json' };
      if (session?.access_token) authHeaders['Authorization'] = `Bearer ${session.access_token}`;
      const res = await fetch('/api/admin/create-staff', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          email: newStaff.email,
          password: newStaff.password,
          name: newStaff.name,
          staffRole: newStaff.role || 'beautician',
        }),
      });
      const result = await res.json();
      if (result.error) {
        setMsg({ type: 'error', text: result.error });
      } else {
        setMsg({ type: 'success', text: `${newStaff.name} added successfully` });
        setNewStaff({ name: '', role: '', email: '', password: '' });
        setShowAdd(false);
        loadStaff();
      }
    } catch (e: any) {
      setMsg({ type: 'error', text: 'Error: ' + e.message });
    } finally {
      setAdding(false);
    }
  };

  // 重置密码
  const handleResetPwd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPwd || !resetPwd.pwd || resetPwd.pwd.length < 6) {
      setMsg({ type: 'error', text: '密码至少6位' });
      return;
    }
    
    setAdding(true);
    setMsg(null);
    
    try {
      // 查找对应的 user_id
      const staff = staffList.find(s => s.id === resetPwd.id);
      if (!staff?.user_id) {
        setMsg({ type: 'error', text: '未找到关联的用户账号' });
        setAdding(false);
        return;
      }
      
      // 使用 admin API 更新用户密码
      const { data: { session: s2 } } = await supabase.auth.getSession();
      const pwdHeaders: Record<string,string> = { 'Content-Type': 'application/json' };
      if (s2?.access_token) pwdHeaders['Authorization'] = `Bearer ${s2.access_token}`;
      const res = await fetch('/api/admin/update-user-password', {
        method: 'POST',
        headers: pwdHeaders,
        body: JSON.stringify({ userId: staff.user_id, newPassword: resetPwd.pwd })
      });
      
      const result = await res.json();
      if (result.error) {
        setMsg({ type: 'error', text: '重置密码失败：' + result.error });
      } else {
        setMsg({ type: 'success', text: '密码已重置，请告知员工' });
        setResetPwd(null);
      }
    } catch (e: any) {
      setMsg({ type: 'error', text: '重置失败：' + e.message });
    } finally {
      setAdding(false);
    }
  };

  const handleToggleActive = async (staff: Staff) => {
    await supabase.from('staff').update({ is_active: !staff.is_active }).eq('id', staff.id);
    loadStaff();
    setMsg({ type: 'success', text: `${staff.is_active ? '已停用' : '已启用'} ${staff.name}` });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* 头部 */}
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin/dashboard" className="text-sm text-[var(--foreground-muted)] hover:text-[var(--primary)] mb-1 inline-block">← 返回后台</Link>
          <h1 className="text-xl text-[var(--foreground)]" style={{ fontFamily: 'var(--font-serif)' }}>员工管理</h1>
          <p className="text-sm text-[var(--foreground-muted)] mt-1">添加员工账号，设置登录密码（Supabase Auth）</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="px-5 py-2.5 rounded-xl text-white text-sm font-medium hover:shadow-md transition-all"
          style={{ background: 'var(--primary)' }}
        >
          + 添加员工
        </button>
      </div>

      {msg && (
        <div className={`rounded-xl px-4 py-3 text-sm ${msg.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
          {msg.text}
          <button onClick={() => setMsg(null)} className="float-right font-bold">×</button>
        </div>
      )}

      {/* 员工列表 */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-white rounded-2xl animate-pulse border border-[var(--primary-light)]" />
          ))}
        </div>
      ) : staffList.length === 0 ? (
        <div className="text-center py-16 text-[var(--foreground-muted)]">
          <div className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: 'var(--primary-light)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.5">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <p>暂无员工，点击上方按钮添加</p>
        </div>
      ) : (
        <div className="space-y-3">
          {staffList.map(staff => (
            <div key={staff.id} className="bg-white rounded-2xl border border-[var(--primary-light)] p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-medium" style={{ background: 'var(--primary)' }}>
                {staff.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-[var(--foreground)]">{staff.name}</span>
                  <span className={`text-sm px-2 py-0.5 rounded-full ${staff.is_active ? 'bg-green-50 text-green-700' : 'var(--background-secondary) var(--foreground-muted)'}`}>
                    {staff.is_active ? '已激活' : '已停用'}
                  </span>
                  {staff.user_id && (
                    <span className="text-sm px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">已绑定账号</span>
                  )}
                </div>
                <div className="text-sm text-[var(--foreground-muted)] mt-0.5">
                  {staff.role} · {staff.email || staff.phone || '未设置联系方式'}
                </div>
              </div>
              <div className="flex gap-2">
                {staff.user_id && (
                  <button
                    onClick={() => setResetPwd({ id: staff.id, email: staff.email || '', pwd: '' })}
                    className="px-3 py-1.5 rounded-lg border border-[var(--primary-light)] text-sm text-[var(--primary)] hover:bg-[var(--primary-light)] transition-all"
                  >
                    重置密码
                  </button>
                )}
                <button
                  onClick={() => handleToggleActive(staff)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-all ${staff.is_active ? 'text-red-500 border border-red-200 hover:bg-red-50' : 'text-green-600 border border-green-200 hover:bg-green-50'}`}
                >
                  {staff.is_active ? '停用' : '启用'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 密码说明 */}
      <div className="bg-[var(--background-secondary)] rounded-2xl p-5 border border-[var(--primary-light)]">
        <h3 className="font-medium text-[var(--foreground)] mb-2 text-sm">账号说明</h3>
        <ul className="text-sm text-[var(--foreground-muted)] space-y-1">
          <li>· 员工账号使用 Supabase Auth，安全可靠</li>
          <li>· 添加员工时自动创建登录账号，密码加密存储</li>
          <li>· 员工使用邮箱 + 密码在员工登录页登录</li>
          <li>· 商家可随时重置员工密码</li>
        </ul>
      </div>

      {/* 添加员工弹窗 */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4" onClick={e => { if (e.target === e.currentTarget) setShowAdd(false); }}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl text-[var(--foreground)] mb-5" style={{ fontFamily: 'var(--font-serif)' }}>添加员工</h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block font-medium text-[var(--foreground)] mb-1">姓名</label>
                <input value={newStaff.name} onChange={e => setNewStaff(s => ({ ...s, name: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--primary-light)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]" placeholder="员工姓名" />
              </div>
              <div>
                <label className="block font-medium text-[var(--foreground)] mb-1">职位</label>
                <input value={newStaff.role} onChange={e => setNewStaff(s => ({ ...s, role: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--primary-light)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]" placeholder="美容师 / 按摩师" />
              </div>
              <div>
                <label className="block font-medium text-[var(--foreground)] mb-1">邮箱（登录账号）</label>
                <input type="email" value={newStaff.email} onChange={e => setNewStaff(s => ({ ...s, email: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--primary-light)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]" placeholder="staff@example.com" />
              </div>
              <div>
                <label className="block font-medium text-[var(--foreground)] mb-1">初始密码</label>
                <input type="password" value={newStaff.password} onChange={e => setNewStaff(s => ({ ...s, password: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--primary-light)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]" placeholder="至少6位" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAdd(false)} className="flex-1 py-2.5 rounded-xl border border-[var(--primary-light)] text-sm text-[var(--foreground-muted)]">取消</button>
                <button type="submit" disabled={adding} className="flex-1 py-2.5 rounded-xl text-white text-sm font-medium disabled:opacity-50" style={{ background: 'var(--accent)' }}>
                  {adding ? '创建中...' : '确认添加'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 重置密码弹窗 */}
      {resetPwd && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4" onClick={e => { if (e.target === e.currentTarget) setResetPwd(null); }}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h2 className="text-xl text-[var(--foreground)] mb-2" style={{ fontFamily: 'var(--font-serif)' }}>重置密码</h2>
            <p className="text-sm text-[var(--foreground-muted)] mb-5">账号：{resetPwd.email}</p>
            <form onSubmit={handleResetPwd} className="space-y-4">
              <div>
                <label className="block font-medium text-[var(--foreground)] mb-1">新密码</label>
                <input type="password" value={resetPwd.pwd} onChange={e => setResetPwd(s => s ? ({ ...s, pwd: e.target.value }) : null)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--primary-light)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]" placeholder="至少6位" autoFocus />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setResetPwd(null)} className="flex-1 py-2.5 rounded-xl border border-[var(--primary-light)] text-sm text-[var(--foreground-muted)]">取消</button>
                <button type="submit" disabled={adding} className="flex-1 py-2.5 rounded-xl text-white text-sm font-medium disabled:opacity-50" style={{ background: 'var(--accent)' }}>
                  {adding ? '处理中...' : '确认'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
