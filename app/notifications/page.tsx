'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Notification {
  id: string;
  type: 'promotion' | 'appointment' | 'order' | 'system';
  title: string;
  content: string;
  time: string;
  read: boolean;
  emoji: string;
}

function loadNotifications(): Notification[] {
  try {
    const saved = localStorage.getItem('lizixiu_notifications');
    if (saved) return JSON.parse(saved);
  } catch {}
  // 默认通知
  return [
    { id: '1', type: 'promotion', title: '🎉 新品上市', content: '玫瑰精油焕肤套装全新上线！限时8折优惠，原价¥688，现价¥550。', time: new Date(Date.now() - 3600000).toISOString(), read: false, emoji: '🎉' },
    { id: '2', type: 'appointment', title: '📅 预约提醒', content: '您有一项预约：明天（周一）14:00 深层清洁面部护理，请准时到店。', time: new Date(Date.now() - 86400000).toISOString(), read: false, emoji: '📅' },
    { id: '3', type: 'order', title: '📦 订单已发货', content: '您的订单 #20240315 已发货，预计2-3个工作日送达，请保持手机畅通。', time: new Date(Date.now() - 172800000).toISOString(), read: true, emoji: '📦' },
    { id: '4', type: 'system', title: '💡 使用提示', content: '现在可以在「产品商城」使用收款码支付了！支持微信、支付宝，安全便捷。', time: new Date(Date.now() - 259200000).toISOString(), read: true, emoji: '💡' },
    { id: '5', type: 'promotion', title: '🌸 女神节活动', content: '3月8日当天，所有面部护理项目享5折优惠！预约从速，名额有限。', time: new Date(Date.now() - 604800000).toISOString(), read: true, emoji: '🌸' },
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

const TYPE_CONFIG: Record<string, { color: string; border: string; label: string }> = {
  promotion: { color: 'text-pink-600 bg-pink-50', border: 'border-pink-200', label: '促销' },
  appointment: { color: 'text-blue-600 bg-blue-50', border: 'border-blue-200', label: '预约' },
  order: { color: 'text-purple-600 bg-purple-50', border: 'border-purple-200', label: '订单' },
  system: { color: 'text-gray-600 bg-gray-50', border: 'border-gray-200', label: '系统' },
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [showPanel, setShowPanel] = useState(false);

  useEffect(() => {
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

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {/* 头部 */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl">
              <span className="text-2xl">🔔</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">消息通知</h1>
              <p className="text-gray-500 mt-1">
                {unreadCount > 0 ? <span className="text-pink-600 font-bold">{unreadCount} 条未读</span> : '暂无未读消息'}
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition">
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
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${filter === f.key ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow' : 'bg-white border text-gray-700 hover:bg-gray-50'}`}>
            {f.label}
          </button>
        ))}
      </div>

      {/* 通知列表 */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl shadow">
          <div className="text-6xl mb-4">🔔</div>
          <h3 className="text-2xl font-bold text-gray-800 mb-3">{filter === 'all' ? '暂无通知' : `暂无${TYPE_CONFIG[filter]?.label || ''}通知`}</h3>
          <p className="text-gray-500">有新消息时会在这里显示</p>
          <Link href="/products" className="inline-block mt-6 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-bold hover:opacity-90">
            去逛逛产品商城 →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(notif => (
            <div key={notif.id}
              className={`bg-white rounded-2xl border ${notif.read ? 'border-gray-100 shadow-sm' : `border ${TYPE_CONFIG[notif.type]?.border || 'border-gray-200'} shadow-md`} ${!notif.read ? 'bg-gradient-to-r from-white to-gray-50' : ''}`}>
              {/* 顶部条 */}
              {!notif.read && <div className={`h-1 rounded-t-2xl bg-gradient-to-r ${TYPE_CONFIG[notif.type]?.border?.replace('border-', 'from-').replace('200', '400').replace('border-', 'to-') || 'from-pink-400 to-purple-500'}`}></div>}
              <div className="p-5">
                <div className="flex items-start gap-4">
                  {/* 图标 */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${TYPE_CONFIG[notif.type]?.color || 'bg-gray-100'}`}>
                    {notif.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className={`font-bold text-gray-900 ${!notif.read ? 'text-pink-700' : ''}`}>{notif.title}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${TYPE_CONFIG[notif.type]?.color || ''}`}>
                          {TYPE_CONFIG[notif.type]?.label || '通知'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                        {!notif.read && (
                          <div className="w-2.5 h-2.5 bg-pink-500 rounded-full"></div>
                        )}
                        <span className="text-xs text-gray-400 whitespace-nowrap">{formatRelativeTime(notif.time)}</span>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm mt-2 leading-relaxed">{notif.content}</p>
                    <div className="flex gap-3 mt-3">
                      {!notif.read && (
                        <button onClick={() => markRead(notif.id)} className="text-xs text-pink-600 font-medium hover:underline">
                          标为已读
                        </button>
                      )}
                      {notif.type === 'promotion' && !notif.read && (
                        <Link href="/products" onClick={() => markRead(notif.id)} className="text-xs text-purple-600 font-medium hover:underline">
                          查看商品 →
                        </Link>
                      )}
                      {notif.type === 'appointment' && (
                        <Link href="/appointments" onClick={() => markRead(notif.id)} className="text-xs text-blue-600 font-medium hover:underline">
                          查看预约 →
                        </Link>
                      )}
                      {notif.type === 'order' && (
                        <Link href="/orders" onClick={() => markRead(notif.id)} className="text-xs text-purple-600 font-medium hover:underline">
                          查看订单 →
                        </Link>
                      )}
                      <button onClick={() => deleteNotif(notif.id)} className="text-xs text-gray-400 hover:text-red-500 ml-auto transition">
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
      <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
        <h3 className="font-bold text-gray-800 mb-3">💡 通知说明</h3>
        <ul className="space-y-2 text-gray-700 text-sm">
          <li>• <b>促销通知</b>：新品上市、活动优惠等营销信息</li>
          <li>• <b>预约提醒</b>：预约确认、时间变更、到店提醒</li>
          <li>• <b>订单通知</b>：支付成功、发货、物流配送</li>
          <li>• <b>系统通知</b>：账户变动、安全提醒、重要公告</li>
          <li className="pt-2 text-gray-500">* 当前为本地演示通知，正式版将接入微信/短信推送服务</li>
        </ul>
      </div>
    </div>
  );
}
