'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAppointments } from '@/lib/api';

interface Appointment {
  id: string; start_time: string; end_time: string; status: string;
  service_name?: string; service_type?: string; staff_name?: string; customer_name?: string; notes?: string;
}

const TIMES = ['09:00','09:30','10:00','10:30','11:00','11:30','12:00','12:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30','18:00','18:30'];
const STATUS_COLORS: Record<string, string> = { pending: 'bg-yellow-100 var(--primary-light) var(--foreground)', confirmed: 'bg-[#c9a87c] border-[#c9a87c] text-white', completed: 'bg-green-100 border-green-400 var(--sage)', cancelled: 'var(--background-secondary) rgba(201,168,124,0.3) var(--foreground-muted)' };
const STATUS_LABEL: Record<string, string> = { pending: '待确认', confirmed: '已确认', completed: '已完成', cancelled: '已取消' };

function IconWarning() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>; }
function IconCheck() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>; }
function IconDone() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>; }

function CalendarGrid({ date, appointments, onPrev, onNext, today }: { date: Date; appointments: Appointment[]; onPrev: () => void; onNext: () => void; today: Date }) {
  const dayAppts = appointments.filter(apt => apt.start_time?.startsWith(date.toISOString().split('T')[0]));
  const isToday = date.toDateString() === today.toDateString();
  return (
    <div className="bg-white rounded-2xl shadow overflow-hidden">
      <div className="flex items-center justify-between bg-[#2d4a3e] text-white px-6 py-4">
        <button onClick={onPrev} className="w-9 h-9 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg></button>
        <h2 className="text-lg font-bold">{date.getFullYear()}年{date.getMonth()+1}月{date.getDate()}日 {['日','一','二','三','四','五','六'][date.getDay()]}{isToday ? ' · 今天' : ''}</h2>
        <button onClick={onNext} className="w-9 h-9 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg></button>
      </div>
      <div className="divide-y divide-[var(--background-secondary)]">
        {TIMES.map(time => {
          const appt = dayAppts.find(a => a.start_time?.substring(11,16) === time);
          return (
            <div key={time} className="flex items-stretch min-h-[52px]">
              <div className="w-20 py-3 px-3 text-sm var(--foreground-muted) font-medium border-r border-[var(--background-secondary)] flex-shrink-0">{time}</div>
              <div className="flex-1 py-2 px-3">
                {appt ? (
                  <div className={`px-3 py-2 rounded-lg border-l-4 text-sm ${STATUS_COLORS[appt.status] || STATUS_COLORS.pending}`}>
                    <div className="font-bold">{appt.service_name || appt.service_type || '服务'}</div>
                    <div className="opacity-75">{appt.customer_name || '客户'} · {appt.staff_name || '美容师'}</div>
                    <div className="opacity-60">{appt.start_time?.substring(11,16)} – {appt.end_time?.substring(11,16)}</div>
                    {appt.notes && <div className="opacity-60 mt-1">备注：{appt.notes}</div>}
                  </div>
                ) : (
                  <div className="h-8 flex items-center text-sm var(--foreground-light)">空闲</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ pending: 0, confirmed: 0, completed: 0 });
  const today = new Date();

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const data = await getAppointments();
      setAppointments(data?.appointments || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  
    useEffect(() => { document.title = '预约日历 - 丽姿秀'; fetchAppointments(); }, []);

  useEffect(() => {
    const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString().split('T')[0];
    const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth()+1, 0).toISOString().split('T')[0];
    const monthApts = appointments.filter((a: Appointment) => a.start_time >= monthStart && a.start_time <= monthEnd+'T23:59:59');
    setStats({
      pending: monthApts.filter((a: Appointment) => a.status === 'pending').length,
      confirmed: monthApts.filter((a: Appointment) => a.status === 'confirmed').length,
      completed: monthApts.filter((a: Appointment) => a.status === 'completed').length,
    });
  }, [appointments, currentDate]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month+1, 0).getDate();
  const monthName = year+'年'+(month+1)+'月';

  const navigateMonth = (delta: number) => {
    const d = new Date(currentDate);
    d.setMonth(d.getMonth() + delta);
    setCurrentDate(d);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-xl font-bold var(--foreground)">预约日历</h1>
          <p className="var(--foreground-muted) mt-1">查看和管理所有预约</p>
        </div>
        <div className="flex gap-3">
          <Link href="/appointments" className="px-4 py-2 bg-[#c9a87c] text-white rounded-lg font-medium text-sm">＋ 新建预约</Link>
          <button onClick={fetchAppointments} disabled={loading} className="px-4 py-2 var(--background-secondary) var(--foreground) rounded-lg text-sm">{loading ? '刷新中...' : '刷新'}</button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-gradient-to-br from-yellow-400 to-amber-500 text-white rounded-2xl p-5 shadow">
          <IconWarning />
          <div className="text-xl font-bold">{stats.pending}</div>
          <div className="text-sm opacity-80">待确认</div>
        </div>
        <div className="bg-gradient-to-br from-[#2d4a3e] to-[#4a7c6f] text-white rounded-2xl p-5 shadow">
          <IconCheck />
          <div className="text-xl font-bold">{stats.confirmed}</div>
          <div className="text-sm opacity-80">已确认</div>
        </div>
        <div className="bg-gradient-to-br from-green-400 to-emerald-500 text-white rounded-2xl p-5 shadow">
          <IconDone />
          <div className="text-xl font-bold">{stats.completed}</div>
          <div className="text-sm opacity-80">已完成</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow overflow-hidden">
            <div className="flex items-center justify-between bg-gradient-to-r from-[#2d4a3e] to-[#c9a87c] text-white px-6 py-4">
              <button onClick={() => navigateMonth(-1)} className="w-9 h-9 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center text-lg">‹</button>
              <h2 className="text-xl font-bold">{monthName}</h2>
              <button onClick={() => navigateMonth(1)} className="w-9 h-9 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center text-lg">›</button>
            </div>
            <div className="grid grid-cols-7 var(--background-card) border-b">
              {['日','一','二','三','四','五','六'].map(d => (
                <div key={d} className="py-2 text-center text-sm font-semibold var(--foreground-muted)">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {[...Array(firstDay).fill(null), ...[...Array(daysInMonth)].map((_, i) => i+1)].map((day, idx) => {
                if (!day) return <div key={'empty-'+idx} className="min-h-[70px] var(--background-card) border-r border-b border-[var(--background-secondary)]"></div>;
                const dStr = year+'-'+String(month+1).padStart(2,'0')+'-'+String(day).padStart(2,'0');
                const isToday = dStr === today.toISOString().split('T')[0];
                const count = appointments.filter(a => a.start_time?.startsWith(dStr)).length;
                return (
                  <div key={day}
                    onClick={() => setCurrentDate(new Date(year, month, day))}
                    className={`min-h-[70px] border-r border-b border-[var(--background-secondary)] p-1.5 cursor-pointer ${isToday ? 'bg-[#c9a87c]/10' : ''} hover:var(--background-card)`}>
                    <div className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-medium mb-1 ${isToday ? 'bg-[#c9a87c] text-white' : 'var(--foreground)'}`}>{day}</div>
                    {count > 0 && <div className="flex flex-wrap gap-1">{[...Array(Math.min(count,3))].map((_,i) => <div key={i} className="w-2 h-2 bg-[#c9a87c] rounded-full"></div>)}</div>}
                    {count > 3 && <div className="text-sm var(--foreground-muted) mt-0.5">+{count-3}</div>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <CalendarGrid date={currentDate} appointments={appointments} onPrev={() => { const d=new Date(currentDate);d.setDate(d.getDate()-1);setCurrentDate(d);}} onNext={() => { const d=new Date(currentDate);d.setDate(d.getDate()+1);setCurrentDate(d);}} today={today} />
        </div>
      </div>

      <div className="mt-6 bg-white rounded-2xl shadow p-5">
        <h3 className="font-bold var(--foreground) mb-3">状态说明</h3>
        <div className="flex flex-wrap gap-4">
          {Object.entries(STATUS_COLORS).map(([status, cls]) => (
            <div key={status} className={`px-3 py-1.5 rounded-full text-sm font-medium ${cls}`}>{STATUS_LABEL[status] || status}</div>
          ))}
        </div>
      </div>
    </div>
  );
}