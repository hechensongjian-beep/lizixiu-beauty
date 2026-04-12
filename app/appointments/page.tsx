'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Service { id: string; name: string; description?: string; price: number; duration?: number; }
interface Staff { id: string; name: string; role?: string; }
interface Appointment { id: string; start_time: string; status: string; service_type: string; staff_name: string; staff_id?: string; customer_name?: string; }

const TIMES = ['09:00','09:30','10:00','10:30','11:00','11:30','12:00','12:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30','18:00','18:30'];

export default function AppointmentsPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [serviceId, setServiceId] = useState('');
  const [staffId, setStaffId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [booked, setBooked] = useState(false);
  const [createdApt, setCreatedApt] = useState<any>(null);
  const [error, setError] = useState('');
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    Promise.all([
      fetch('/api/services').then(r => r.json()).catch(() => ({})),
      fetch('/api/staff').then(r => r.json()).catch(() => ({})),
      fetch('/api/appointments').then(r => r.json()).catch(() => ({})),
    ]).then(([svc, st, apt]) => {
      setServices(svc.services || []);
      setStaff(st.staff || []);
      setAppointments(apt.appointments || []);
      setLoading(false);
    });
  }, []);

  // 自动选择第一个服务/员工
  useEffect(() => {
    if (services.length > 0 && !serviceId) setServiceId(services[0].id);
    if (staff.length > 0 && !staffId) setStaffId(staff[0].id);
  }, [services, staff]);

  const getService = () => services.find(s => s.id === serviceId);

  const getUnavailableTimes = () => {
    const today = date || new Date().toISOString().split('T')[0];
    return appointments
      .filter(apt => apt.staff_id === staffId && apt.start_time?.startsWith(today) && apt.status !== 'cancelled')
      .map(apt => apt.start_time?.substring(11, 16))
      .filter(Boolean);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceId || !staffId || !date || !time || !name || !phone) {
      setError('请填写所有必填项'); return;
    }
    setSubmitting(true);
    setError('');
    const svc = getService();
    const start = `${date}T${time}:00`;
    const endH = parseInt(time.split(':')[0]) + Math.floor((parseInt(time.split(':')[1]) + (svc?.duration || 60)) / 60);
    const endM = (parseInt(time.split(':')[1]) + (svc?.duration || 60)) % 60;
    const end = `${date}T${String(endH).padStart(2,'0')}:${String(endM).padStart(2,'0')}:00`;
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ service_id: serviceId, staff_id: staffId, start_time: start, end_time: end, notes }),
      });
      const data = await res.json();
      if (res.ok) {
        setBooked(true);
        setCreatedApt(data);
      } else {
        setError(data.error || '预约失败');
      }
    } catch { setError('网络错误'); }
    finally { setSubmitting(false); }
  };

  const fmt = (n: number) => new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY' }).format(n);

  if (booked && createdApt) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-3xl shadow-xl p-10">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">✅</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">预约成功！</h1>
          <p className="text-gray-600 mb-8">我们将尽快确认您的预约，请保持手机畅通</p>
          <div className="bg-pink-50 rounded-2xl p-6 text-left space-y-3 mb-8 text-left">
            <div className="flex justify-between"><span className="text-gray-600">服务</span><span className="font-bold">{createdApt.service_type || getService()?.name}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">日期</span><span className="font-bold">{date}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">时间</span><span className="font-bold">{time}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">美容师</span><span className="font-bold">{createdApt.staff_name || staff.find(s=>s.id===staffId)?.name}</span></div>
          </div>
          <div className="flex gap-4">
            <Link href="/" className="flex-1 py-3 border border-gray-300 rounded-xl font-bold text-gray-700 hover:bg-gray-50">返回首页</Link>
            <button onClick={()=>{setBooked(false);setDate('');setTime('');setNotes('');}} className="flex-1 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-bold hover:opacity-90">再约一个</button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) return (
    <div className="flex justify-center py-32"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div></div>
  );

  const unavailable = getUnavailableTimes();
  const today = new Date().toISOString().split('T')[0];
  const selectedService = getService();

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-pink-100 to-rose-100 rounded-2xl mb-6"><span className="text-3xl">📅</span></div>
        <h1 className="text-4xl font-bold text-gray-900 mb-3">在线预约</h1>
        <p className="text-gray-600">选择服务、时间和美容师，快速完成预约</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 步骤指示器 */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {['选择服务','选择时间','填写信息'].map((step,i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${i===0?'bg-pink-500 text-white':'bg-gray-200 text-gray-500'}`}>{i+1}</div>
              <span className={`text-sm ${i===0?'text-pink-600 font-medium':'text-gray-500'}`}>{step}</span>
              {i<2 && <div className="w-8 h-px bg-gray-300 mx-2"></div>}
            </div>
          ))}
        </div>

        {/* 服务选择 */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">🧖 选择服务项目</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {services.map(svc => (
              <button key={svc.id} type="button" onClick={() => setServiceId(svc.id)}
                className={`p-4 rounded-xl border-2 text-left transition ${serviceId === svc.id ? 'border-pink-500 bg-pink-50' : 'border-gray-200 hover:border-pink-200'}`}>
                <div className="font-bold text-gray-900">{svc.name}</div>
                <div className="text-xs text-gray-500 mt-1">{svc.description?.substring(0,40) || ''}</div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-pink-600 font-bold">{fmt(svc.price)}</span>
                  <span className="text-xs text-gray-400">{svc.duration || 60}分钟</span>
                </div>
              </button>
            ))}
          </div>
          {selectedService && (
            <div className="mt-4 p-4 bg-pink-50 rounded-xl flex justify-between items-center">
              <div><div className="font-bold text-gray-900">{selectedService.name}</div><div className="text-sm text-gray-600">{selectedService.description}</div></div>
              <div className="text-right"><div className="text-pink-600 font-bold text-lg">{fmt(selectedService.price)}</div><div className="text-xs text-gray-500">约{serviceId ? (services.find(s=>s.id===serviceId)?.duration||60) : 60}分钟</div></div>
            </div>
          )}
        </div>

        {/* 日期+时间+员工 */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">🗓️ 选择时间与美容师</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">预约日期 *</label>
              <input type="date" value={date} min={today} onChange={e => {setDate(e.target.value);setTime('');}}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">服务美容师 *</label>
              <select value={staffId} onChange={e => {setStaffId(e.target.value);setTime('');}}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500" required>
                {staff.map(s => <option key={s.id} value={s.id}>{s.name} {s.role ? `· ${s.role}` : ''}</option>)}
              </select>
            </div>
          </div>
          {date && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">选择时间 *
                {unavailable.length > 0 && <span className="text-xs text-gray-400 ml-2">（灰色为已预约）</span>}
              </label>
              <div className="grid grid-cols-5 sm:grid-cols-7 gap-2">
                {TIMES.map(t => {
                  const taken = unavailable.includes(t);
                  return (
                    <button key={t} type="button" onClick={() => !taken && setTime(t)}
                      disabled={taken}
                      className={`py-2 rounded-lg text-sm font-medium transition ${time===t?'bg-pink-500 text-white':(taken ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-50 text-gray-700 hover:bg-pink-100')}`}>
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 联系信息 */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">👤 联系信息</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">姓名 *</label>
              <input type="text" value={name} onChange={e=>setName(e.target.value)} placeholder="您的姓名"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">手机号 *</label>
              <input type="tel" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="11位手机号"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500" required />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">备注</label>
              <textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={2} placeholder="如有特殊需求请注明"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500" />
            </div>
          </div>
        </div>

        {error && <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">{error}</div>}

        <button type="submit" disabled={submitting || !date || !time || !serviceId}
          className="w-full py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-lg rounded-2xl hover:opacity-90 transition shadow-lg disabled:opacity-50">
          {submitting ? '提交中...' : `确认预约 ${selectedService ? '· ' + fmt(selectedService.price) : ''}`}
        </button>
      </form>

      <div className="text-center mt-6">
        <Link href="/" className="text-gray-500 hover:text-gray-700 text-sm">← 返回首页</Link>
      </div>
    </div>
  );
}
