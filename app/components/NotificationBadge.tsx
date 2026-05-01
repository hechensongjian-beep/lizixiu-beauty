'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface NotificationBadgeProps {
  userId?: string;
}

export default function NotificationBadge({ userId }: NotificationBadgeProps) {
  const [newOrders, setNewOrders] = useState(0);
  const [newAppointments, setNewAppointments] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchNotifications = async () => {
      try {
        // 检查待处理订单（待付款状态）
        const { count: orderCount } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending');

        // 检查待确认预约
        const { count: appointmentCount } = await supabase
          .from('appointments')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending');

        setNewOrders(orderCount || 0);
        setNewAppointments(appointmentCount || 0);
      } catch (error) {
        console.error('获取通知失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
    
    // 每30秒刷新一次
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  const total = newOrders + newAppointments;
  
  if (loading || total === 0) return null;

  return (
    <span 
      className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full text-white text-xs font-bold flex items-center justify-center animate-pulse"
      style={{ 
        background: 'linear-gradient(135deg, var(--rose), var(--rose))',
        padding: '0 5px',
        fontSize: '0.6875rem',
        boxShadow: '0 2px 8px rgba(239,68,68,0.4)'
      }}
    >
      {total > 99 ? '99+' : total}
    </span>
  );
}
