'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getServices, getStaff, getAppointments, createAppointment } from '@/lib/api';

interface Service { id: string; name: string; description?: string; price: number; duration?: number; }
interface Staff { id: string; name: string; role?: string; }
interface Appointment { id: string; start_time: string; status: string; service_name: string; staff_name: string; staff_id?: string; customer_name?: string; }

const TIMES = ['09:00','09:30','10:00','10:30','11:00','11:30','12:00','12:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30','18:00','18:30'];

export default function AppointmentsPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
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

  
    useEffect(() => { document.title = '在线预约 - 丽姿秀'; }, []);

  useEffect(() => {
    Promise.all([
      getServices(),
      getStaff(),
      getAppointments(),
    ]).then(([svc, st, apt]) => {
      setServices(svc?.services || []);
      setStaff(st?.staff || []);
      setAppointments(apt?.appointments || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (services.length > 0 && selectedServices.length === 0) setSelectedServices([services[0].id]);
    if (staff.length > 0 && !staffId) setStaffId(staff[0].id);
  }, [services, staff]);

  const toggleService = (id: string) => {
    setSelectedServices(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  const getTotalDuration = () => selectedServices.reduce((sum, id) => sum + (services.find(s => s.id === id)?.duration || 60), 0);
  const getTotalPrice = () => selectedServices.reduce((sum, id) => sum + (services.find(s => s.id === id)?.price || 0), 0);
  const getSelectedServiceNames = () => selectedServices.map(id => services.find(s => s.id === id)?.name).filter(Boolean).join('、');

  const getUnavailableTimes = () => {
    const today = date || new Date().toISOString().split('T')[0];
    return appointments
      .filter(apt => apt.staff_id === staffId && apt.start_time?.startsWith(today) && apt.status !== 'cancelled')
      .map(apt => apt.start_time?.substring(11, 16))
      .filter(Boolean);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedServices.length === 0 || !staffId || !date || !time || !name || !phone) {
      setError('请填写所有必填项'); return;
    }
    setSubmitting(true);
    setError('');
    const totalDuration = getTotalDuration();
    const start = `${date}T${time}:00`;
    const startH = parseInt(time.split(':')[0]);
    const startM = parseInt(time.split(':')[1]);
    const totalMinutes = startH * 60 + startM + totalDuration;
    const endH = Math.floor(totalMinutes / 60) % 24;
    const endDayOffset = Math.floor(totalMinutes / 60 / 24);
    const endM = totalMinutes % 60;
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + endDayOffset);
    const endDateStr = endDate.toISOString().split('T')[0];
    const end = `${endDateStr}T${String(endH).padStart(2,'0')}:${String(endM).padStart(2,'0')}:00`;
    try {
      // Create one appointment for all selected services
      const result = await createAppointment({
        service_id: selectedServices[0],
        service_ids: selectedServices,
        staff_id: staffId,
        start_time: start, end_time: end,
        customer_name: name, customer_phone: phone,
        notes: notes + (selectedServices.length > 1 ? ` | 项目: ${getSelectedServiceNames()}` : ''),
        status: 'pending'
      });
      if (result.success) {
        setBooked(true);
        setCreatedApt(result.appointment);
      } else {
        setError(result.error || '预约失败');
      }
    } catch { setError('网络错误'); }
    finally { setSubmitting(false); }
  };

  const fmt = (n: number) => new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY' }).format(n);

  if (booked && createdApt) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-3xl shadow-lg p-10" style={{border:'1px solid rgba(201,168,124,0.2)'}}>
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{background:'linear-gradient(135deg, #c9a87c22 0%, #e8d5b822 100%)'}}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#2d4a3e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5"/>
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-3" style={{fontFamily:"'Noto Serif SC',serif",color:'#2a2a28'}}>预约成功</h1>
          <p className="mb-8" style={{color:'#6b6b68'}}>我们将尽快确认您的预约，请保持手机畅通</p>
          <div className="rounded-2xl p-6 mb-8 text-left" style={{background:'#faf8f5',border:'1px solid rgba(201,168,124,0.15)'}}>
            <div className="flex justify-between py-3" style={{borderBottom:'1px solid rgba(201,168,124,0.1)'}}>
              <span style={{color:'#6b6b68'}}>服务项目</span>
              <span className="font-bold text-right" style={{color:'#2a2a28'}}>{getSelectedServiceNames()}</span>
            </div>
            <div className="flex justify-between py-3" style={{borderBottom:'1px solid rgba(201,168,124,0.1)'}}>
              <span style={{color:'#6b6b68'}}>预计时长</span>
              <span className="font-bold" style={{color:'#2a2a28'}}>约{getTotalDuration()}分钟</span>
            </div>
            <div className="flex justify-between py-3" style={{borderBottom:'1px solid rgba(201,168,124,0.1)'}}>
              <span style={{color:'#6b6b68'}}>日期</span>
              <span className="font-bold" style={{color:'#2a2a28'}}>{date}</span>
            </div>
            <div className="flex justify-between py-3" style={{borderBottom:'1px solid rgba(201,168,124,0.1)'}}>
              <span style={{color:'#6b6b68'}}>时间</span>
              <span className="font-bold" style={{color:'#2a2a28'}}>{time}</span>
            </div>
            <div className="flex justify-between py-3">
              <span style={{color:'#6b6b68'}}>美容师</span>
              <span className="font-bold" style={{color:'#2a2a28'}}>{createdApt.staff_name || staff.find(s=>s.id===staffId)?.name}</span>
            </div>
          </div>
          <div className="flex gap-4">
            <Link href="/" className="flex-1 py-3 rounded-xl font-bold text-center" style={{border:'1.5px solid #c9a87c',color:'#a88a5c'}}>
              返回首页
            </Link>
            <button onClick={()=>{setBooked(false);setDate('');setTime('');setNotes('');setSelectedServices(services.length > 0 ? [services[0].id] : []);}} 
              className="flex-1 py-3 rounded-xl font-bold text-white" style={{background:'linear-gradient(135deg, #c9a87c 0%, #e8d5b8 100%)'}}>
              再约一个
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) return (
    <div className="max-w-4xl mx-auto px-4 py-12"><div className="h-10 w-48 rounded-lg animate-pulse bg-gray-200 mb-8"></div><div className="space-y-4"><div className="bg-white rounded-2xl p-6 animate-pulse"><div className="flex gap-4"><div className="w-16 h-16 rounded-xl bg-gray-200"></div><div className="flex-1 space-y-2"><div className="h-5 bg-gray-200 rounded w-1/3"></div><div className="h-4 bg-gray-200 rounded w-1/2"></div><div className="h-4 bg-gray-200 rounded w-1/4"></div></div></div></div><div className="bg-white rounded-2xl p-6 animate-pulse"><div className="flex gap-4"><div className="w-16 h-16 rounded-xl bg-gray-200"></div><div className="flex-1 space-y-2"><div className="h-5 bg-gray-200 rounded w-1/3"></div><div className="h-4 bg-gray-200 rounded w-1/2"></div><div className="h-4 bg-gray-200 rounded w-1/4"></div></div></div></div></div></div>
  );

  const unavailable = getUnavailableTimes();
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6" style={{background:'linear-gradient(135deg, #c9a87c22 0%, #e8d5b822 100%)'}}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#a88a5c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
        </div>
        <h1 className="text-4xl font-bold mb-3" style={{fontFamily:"'Noto Serif SC',serif",color:'#2a2a28'}}>在线预约</h1>
        <p style={{color:'#6b6b68'}}>选择服务、时间和美容师，快速完成预约</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 服务选择 */}
        <div className="bg-white rounded-2xl p-6" style={{boxShadow:'0 4px 20px rgba(0,0,0,0.04)',border:'1px solid rgba(201,168,124,0.15)'}}>
          <h2 className="text-xl font-bold mb-5" style={{fontFamily:"'Noto Serif SC',serif",color:'#2a2a28'}}>选择服务项目</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {services.map(svc => (
              <button key={svc.id} type="button" onClick={() => toggleService(svc.id)}
                className="p-4 rounded-xl text-left transition"
                style={{
                  border:'2px solid',
                  borderColor: selectedServices.includes(svc.id) ? '#c9a87c' : '#e8e4df',
                  background: selectedServices.includes(svc.id) ? '#faf8f5' : 'white',
                }}>
                <div className="font-bold text-lg" style={{color:'#2a2a28'}}>{svc.name}</div>
                <div className="text-sm mt-1" style={{color:'#6b6b68'}}>{svc.description?.substring(0,40) || ''}</div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-lg" style={{color:'#a88a5c',fontWeight:700}}>{fmt(svc.price)}</span>
                  <span className="text-sm" style={{color:'#9b9b98'}}>{svc.duration || 60}分钟</span>
                </div>
              </button>
            ))}
          </div>
          {selectedServices.length > 0 && (
            <div className="mt-4 p-4 rounded-xl flex justify-between items-center" style={{background:'#faf8f5',border:'1px solid rgba(201,168,124,0.15)'}}>
              <div>
                <div className="font-bold" style={{color:'#2a2a28'}}>{getSelectedServiceNames()}</div>
                <div className="text-sm" style={{color:'#6b6b68'}}>约{getTotalDuration()}分钟</div>
              </div>
              <div className="text-right">
                <div className="font-bold text-lg" style={{color:'#a88a5c'}}>{fmt(getTotalPrice())}</div>
                <div className="text-xs" style={{color:'#9b9b98'}}>{selectedServices.length}个项目</div>
              </div>
            </div>
          )}
        </div>

        {/* 日期+时间+员工 */}
        <div className="bg-white rounded-2xl p-6" style={{boxShadow:'0 4px 20px rgba(0,0,0,0.04)',border:'1px solid rgba(201,168,124,0.15)'}}>
          <h2 className="text-xl font-bold mb-5" style={{fontFamily:"'Noto Serif SC',serif",color:'#2a2a28'}}>选择时间与美容师</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <div>
              <label className="block font-medium mb-2" style={{color:'#2a2a28',fontSize:'1rem'}}>预约日期</label>
              <input type="date" value={date} min={today} onChange={e => {setDate(e.target.value);setTime('');}}
                className="w-full px-4 py-3 rounded-xl outline-none transition"
                style={{border:'1.5px solid #e8e4df',background:'white',fontSize:'1rem'}}
                onFocus={e=>e.target.style.borderColor='#c9a87c'}
                onBlur={e=>e.target.style.borderColor='#e8e4df'}
                required />
            </div>
            <div>
              <label className="block font-medium mb-2" style={{color:'#2a2a28',fontSize:'1rem'}}>服务美容师</label>
              <select value={staffId} onChange={e => {setStaffId(e.target.value);setTime('');}}
                className="w-full px-4 py-3 rounded-xl outline-none transition"
                style={{border:'1.5px solid #e8e4df',background:'white',color:'#2a2a28',fontSize:'1rem'}}
                onFocus={e=>e.target.style.borderColor='#c9a87c'}
                onBlur={e=>e.target.style.borderColor='#e8e4df'}
                required>
                {staff.map(s => <option key={s.id} value={s.id}>{s.name} {s.role ? ` · ${s.role}` : ''}</option>)}
              </select>
            </div>
          </div>
          {date && (
            <div>
              <label className="block text-sm font-medium mb-2" style={{color:'#2a2a28'}}>
                选择时间
                {unavailable.length > 0 && <span className="text-xs ml-2" style={{color:'#9b9b98'}}>（灰色为已预约）</span>}
              </label>
              <div className="grid grid-cols-5 sm:grid-cols-7 gap-2">
                {TIMES.map(t => {
                  const taken = unavailable.includes(t);
                  return (
                    <button key={t} type="button" onClick={() => !taken && setTime(t)}
                      disabled={taken}
                      className="py-2 rounded-lg text-sm font-medium transition"
                      style={{
                        background: time===t ? '#2d4a3e' : (taken ? '#f5f2ed' : 'white'),
                        color: time===t ? 'white' : (taken ? '#c0bdb8' : '#2a2a28'),
                        border: time===t ? 'none' : '1.5px solid #e8e4df',
                        cursor: taken ? 'not-allowed' : 'pointer',
                      }}>
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 联系信息 */}
        <div className="bg-white rounded-2xl p-6" style={{boxShadow:'0 4px 20px rgba(0,0,0,0.04)',border:'1px solid rgba(201,168,124,0.15)'}}>
          <h2 className="text-lg font-bold mb-4" style={{fontFamily:"'Noto Serif SC',serif",color:'#2a2a28'}}>联系信息</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{color:'#2a2a28'}}>姓名</label>
              <input type="text" value={name} onChange={e=>setName(e.target.value)} placeholder="您的姓名"
                className="w-full px-4 py-3 rounded-xl outline-none transition"
                style={{border:'1.5px solid #e8e4df',background:'white'}}
                onFocus={e=>e.target.style.borderColor='#c9a87c'}
                onBlur={e=>e.target.style.borderColor='#e8e4df'}
                required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{color:'#2a2a28'}}>手机号</label>
              <input type="tel" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="11位手机号"
                className="w-full px-4 py-3 rounded-xl outline-none transition"
                style={{border:'1.5px solid #e8e4df',background:'white'}}
                onFocus={e=>e.target.style.borderColor='#c9a87c'}
                onBlur={e=>e.target.style.borderColor='#e8e4df'}
                required />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2" style={{color:'#2a2a28'}}>备注</label>
              <textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={2} placeholder="如有特殊需求请注明"
                className="w-full px-4 py-3 rounded-xl outline-none transition resize-none"
                style={{border:'1.5px solid #e8e4df',background:'white'}}
                onFocus={e=>e.target.style.borderColor='#c9a87c'}
                onBlur={e=>e.target.style.borderColor='#e8e4df'} />
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl" style={{background:'#fef2f2',border:'1px solid #fecaca',color:'#991b1b'}}>{error}</div>
        )}

        <button type="submit" disabled={submitting || !date || !time || selectedServices.length === 0}
          className="w-full py-4 rounded-2xl font-bold text-lg text-white transition shadow-lg"
          style={{
            background: (submitting || !date || !time || selectedServices.length === 0) ? '#c0bdb8' : 'linear-gradient(135deg, #c9a87c 0%, #e8d5b8 100%)',
            boxShadow: (submitting || !date || !time || selectedServices.length === 0) ? 'none' : '0 8px 25px rgba(201,168,124,0.35)',
          }}>
          {submitting ? '提交中...' : `确认预约${selectedServices.length > 0 ? ' · ' + fmt(getTotalPrice()) : ''}`}
        </button>
      </form>

      <div className="text-center mt-6">
        <Link href="/" className="text-sm transition" style={{color:'#6b6b68'}}>
          <span className="mr-1">←</span>返回首页
        </Link>
      </div>
    </div>
  );
}
