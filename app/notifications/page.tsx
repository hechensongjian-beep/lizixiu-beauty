'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

// 图标组件
const Icons = {
  promotion: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#c9a87c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 12L12 20l-8-8 8-8 8 8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  ),
  appointment: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#c9a87c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  order: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#a88a5c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
    </svg>
  ),
  system: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#c9a87c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2v1"/><path d="M12 7a5 5 0 0 1 5 5c0 2.5-2 4-3 5.5V18H10v-1.5C9 16 7 14.5 7 12a5 5 0 0 1 5-5z"/>
    </svg>
  ),
  bell: () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#c9a87c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  ),
  info: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c9a87c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
    </svg>
  ),
};

interface Notification {
  id: string;
  type: 'promotion' | 'appointment' | 'order' | 'system';
  title: string;
  content: string;
  time: string;
  read: boolean;
}

function loadNotifications(): Notification[] {
  try {
    const saved = localStorage.getItem('lizixiu_notifications');
    if (saved) return JSON.parse(saved);
  } catch {}
  return [
    { id: '1', type: 'promotion', title: '新品上市', content: '玫瑰精油焕肤套装全新上线！限时8折优惠，原价¥688，现价¥550。', time: new Date(Date.now() - 3600000).toISOString(), read: false },
    { id: '2', type: 'appointment', title: '预约提醒', content: '您有一项预约：明天（周一）14:00 深层清洁面部护理，请准时到店。', time: new Date(Date.now() - 86400000).toISOString(), read: false },
    { id: '3', type: 'order', title: '订单已发货', content: '您的订单 #20240315 已发货，预计2-3个工作日送达，请保持手机畅通。', time: new Date(Date.now() - 172800000).toISOString(), read: true },
    { id: '4', type: 'system', title: '使用提示', content: '现在可以在「产品商城」使用收款码支付了！支持微信、支付宝，安全便捷。', time: new Date(Date.now() - 259200000).toISOString(), read: true },
    { id: '5', type: 'promotion', title: '女神节活动', content: '3月8日当天，所有面部护理项目享5折优惠！预约从速，名额有限。', time: new Date(Date.now() - 604800000).toISOString(), read: true },
  ];
}

function saveNotifications(notifs: Notification[]) {
  localStorage.setItem('lizixiu_notifications', JSON.stringify(notifs));
}

function formatRelativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return '刚刚';
  if (min < 60) return `${min}分钟前`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}小时前`;
  const day = Math.floor(hr / 24);
  return `${day}天前`;
}

const TYPE_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
  promotion: { bg: 'bg-[#c9a87c]/10', text: 'text-[#a88a5c]', label: '促销' },
  appointment: { bg: 'bg-[#2d4a3e]/10', text: 'text-[#2d4a3e]', label: '预约' },
  order: { bg: 'bg-[#c9a87c]/10', text: 'text-[#a88a5c]', label: '订单' },
  system: { bg: 'bg-gray-100', text: 'text-gray-600', label: '系统' },
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<string>('all');

  
    useEffect(() => { document.title = '我的通知 - 丽姿秀';
    setNotifications(loadNotifications());
  }, []);

  const markAllRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    saveNotifications(updated);
  };

  const markRead = (id: string) => {
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    setNotifications(updated);
    saveNotifications(updated);
  };

  const deleteNotif = (id: string) => {
    const updated = notifications.filter(n => n.id !== id);
    setNotifications(updated);
    saveNotifications(updated);
  };

  const clearAll = () => {
    setNotifications([]);
    saveNotifications([]);
  };

  const filtered = filter === 'all' ? notifications : notifications.filter(n => n.type === filter);
  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type: string) => {
    const IconComponent = Icons[type as keyof typeof Icons] || Icons.system;
    return <IconComponent />;
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {/* 头部 */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 bg-gradient-to-r from-[#c9a87c]/10 to-[#e8d5b8]/10 rounded-2xl flex items-center justify-center">
            <Icons.bell />
          </div>
          <div>
            <h1 className="text-xl font-serif font-bold text-[#2a2a28]">消息通知</h1>
            <p className="text-[#6b6b68] mt-1">
              {unreadCount > 0 ? <span className="text-[#c9a87c] font-bold">{unreadCount} 条未读</span> : '暂无未读消息'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="px-4 py-2 bg-[#f5f2ed] text-[#2a2a28] rounded-lg text-sm font-medium hover:bg-[#e8d5b8]/30 transition">
              全部已读
            </button>
          )}
          {notifications.length > 0 && (
            <button onClick={clearAll} className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition">
              清空全部
            </button>
          )}
        </div>
      </div>

      {/* 分类筛选 */}
      <div className="flex gap-2 mb-8 flex-wrap">
        {[{ key: 'all', label: '全部' }, ...Object.entries(TYPE_CONFIG).map(([k, v]) => ({ key: k, label: v.label }))].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${filter === f.key ? 'bg-gradient-to-r from-[#c9a87c] to-[#e8d5b8] text-white shadow' : 'bg-white border border-[#e8d5b8]/50 text-[#2a2a28] hover:bg-[#f5f2ed]'}`}>
            {f.label}
          </button>
        ))}
      </div>

      {/* 通知列表 */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl shadow border border-[#e8d5b8]/30">
          <div className="w-14 h-14 mx-auto mb-4 bg-[#f5f2ed] rounded-full flex items-center justify-center">
            <Icons.bell />
          </div>
          <h3 className="text-xl font-serif font-medium text-[#2a2a28] mb-3">{filter === 'all' ? '暂无通知' : `暂无${TYPE_CONFIG[filter]?.label || ''}通知`}</h3>
          <p className="text-[#6b6b68]">有新消息时会在这里显示</p>
          <Link href="/products" className="inline-block mt-6 px-6 py-3 bg-gradient-to-r from-[#c9a87c] to-[#e8d5b8] text-white rounded-xl font-bold hover:opacity-90 transition">
            去逛逛产品商城
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(notif => (
            <div key={notif.id}
              className={`bg-white rounded-2xl border ${notif.read ? 'border-[#e8d5b8]/30 shadow-sm' : 'border-[#c9a87c]/40 shadow-md'} transition hover:shadow-lg`}>
              {!notif.read && <div className="h-1 rounded-t-2xl bg-gradient-to-r from-[#c9a87c] to-[#e8d5b8]"></div>}
              <div className="p-5">
                <div className="flex items-start gap-4">
                  {/* 图标 */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${TYPE_CONFIG[notif.type]?.bg || 'bg-gray-100'}`}>
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className={`font-bold ${notif.read ? 'text-[#2a2a28]' : 'text-[#a88a5c]'}`}>{notif.title}</h3>
                        <span className={`text-sm px-2 py-0.5 rounded-full mt-1 inline-block ${TYPE_CONFIG[notif.type]?.bg || ''} ${TYPE_CONFIG[notif.type]?.text || ''}`}>
                          {TYPE_CONFIG[notif.type]?.label || '通知'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                        {!notif.read && <div className="w-2.5 h-2.5 bg-[#c9a87c] rounded-full"></div>}
                        <span className="text-sm text-[#6b6b68] whitespace-nowrap">{formatRelativeTime(notif.time)}</span>
                      </div>
                    </div>
                    <p className="text-[#6b6b68] text-sm mt-2 leading-relaxed">{notif.content}</p>
                    <div className="flex gap-3 mt-3">
                      {!notif.read && (
                        <button onClick={() => markRead(notif.id)} className="text-sm text-[#c9a87c] font-medium hover:underline">
                          标为已读
                        </button>
                      )}
                      {notif.type === 'promotion' && !notif.read && (
                        <Link href="/products" onClick={() => markRead(notif.id)} className="text-sm text-[#2d4a3e] font-medium hover:underline">
                          查看商品
                        </Link>
                      )}
                      {notif.type === 'appointment' && (
                        <Link href="/appointments" onClick={() => markRead(notif.id)} className="text-sm text-[#2d4a3e] font-medium hover:underline">
                          查看预约
                        </Link>
                      )}
                      {notif.type === 'order' && (
                        <Link href="/orders" onClick={() => markRead(notif.id)} className="text-sm text-[#2d4a3e] font-medium hover:underline">
                          查看订单
                        </Link>
                      )}
                      <button onClick={() => deleteNotif(notif.id)} className="text-sm text-[#6b6b68] hover:text-red-500 ml-auto transition">
                        删除
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 说明 */}
      <div className="mt-8 bg-[#faf8f5] rounded-2xl p-6 border border-[#c9a87c]/20">
        <div className="flex items-center gap-2 mb-3">
          <Icons.info />
          <h3 className="font-bold text-[#2a2a28]">通知说明</h3>
        </div>
        <ul className="space-y-2 text-[#2a2a28] text-sm">
          <li>• <b>促销通知</b>：新品上市、活动优惠等营销信息</li>
          <li>• <b>预约提醒</b>：预约确认、时间变更、到店提醒</li>
          <li>• <b>订单通知</b>：支付成功、发货、物流配送</li>
          <li>• <b>系统通知</b>：账户变动、安全提醒、重要公告</li>
          <li className="pt-2 text-[#6b6b68]">* 当前为本地演示通知，正式版将接入微信/短信推送服务</li>
        </ul>
      </div>
    </div>
  );
}
