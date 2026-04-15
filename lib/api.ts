// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from '@/lib/supabase';

// ===== Formatters =====
function fmtProduct(p: any): any {
  return {
    id: p.id, name: p.name, description: p.description || '',
    price: p.price, originalPrice: p.price,
    category: p.category || '未分类', stock: p.stock || 0,
    imageColor: p.image_url ? 'from-blue-300 to-blue-400' : 'from-gray-300 to-gray-400',
    imageUrl: p.image_url || '', tags: [],
    createdAt: p.created_at, updatedAt: p.updated_at,
  };
}

function fmtOrder(o) {
  return {
    id: o.id, customerName: o.customer_name, customerPhone: o.customer_phone,
    customerEmail: o.customer_email || '', shippingAddress: o.shipping_address || '',
    items: (o.order_items || []).map(i => ({ id: i.id, productId: i.product_id, name: i.name, price: parseFloat(i.price), quantity: i.quantity })),
    subtotal: parseFloat(o.subtotal || 0), shippingFee: parseFloat(o.shipping_fee || 0),
    tax: parseFloat(o.tax || 0), total: parseFloat(o.total || 0),
    status: o.status, deliveryMethod: o.delivery_method || o.deliveryMethod || 'express',
    createdAt: o.created_at, updatedAt: o.updated_at,
  };
}

function fmtService(s) {
  return {
    id: s.id, name: s.name, description: s.description || '',
    duration: s.duration, price: s.price,
    category: s.category || '未分类', popularity: s.popularity || 3,
    is_active: s.is_active !== false, created_at: s.created_at,
  };
}

function fmtStaff(s) {
  return { id: s.id, name: s.name, role: s.role || '', phone: s.phone || '', specialties: s.specialties || [] };
}

function fmtAppointment(a) {
  return {
    id: a.id, service_id: a.service_id, staff_id: a.staff_id,
    start_time: a.start_time, end_time: a.end_time,
    status: a.status || 'pending',
    customer_name: a.customer_name || a.notes?.match(/客户:([^|]+)/)?.[1]?.trim() || '',
    customer_phone: a.customer_phone || a.notes?.match(/电话:([^|\n]+)/)?.[1]?.trim() || '',
    notes: a.notes || '',
    service_type: a.service_type || '', staff_name: a.staff_name || '',
    created_at: a.created_at,
  };
}

// ===== Products =====
export async function getProducts(): Promise<any> {
  try {
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (error) return { products: [] };
    return { products: data.map(fmtProduct) };
  } catch { return { products: [] }; }
}

export async function createProduct(payload): Promise<any> {
  try {
    const { data, error } = await supabase.from('products').insert(payload).select().single();
    if (error) return { error: error.message };
    return { product: fmtProduct(data) };
  } catch (e) { return { error: String(e) }; }
}

export async function updateProduct(id, payload): Promise<any> {
  try {
    const { data, error } = await supabase.from('products').update(payload).eq('id', id).select().single();
    if (error) return { error: error.message };
    return { product: fmtProduct(data) };
  } catch (e) { return { error: String(e) }; }
}

export async function deleteProduct(id): Promise<any> {
  try {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) return { error: error.message };
    return { success: true };
  } catch (e) { return { error: String(e) }; }
}

// ===== Orders =====
export async function getOrders(): Promise<any> {
  try {
    const { data, error } = await supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false });
    if (error) return { orders: [] };
    return { orders: (data || []).map(fmtOrder) };
  } catch { return { orders: [] }; }
}

export async function createOrder(body): Promise<any> {
  try {
    const subtotal = body.subtotal || body.items.reduce((s, i) => s + i.price * i.quantity, 0);
    const shippingFee = body.shippingFee || 0;
    const total = body.total || subtotal + shippingFee;

    const { data: orderData, error: orderError } = await supabase.from('orders').insert({
      customer_name: body.customerName, customer_phone: body.customerPhone || '',
      customer_email: body.customerEmail || '', shipping_address: body.shippingAddress || '',
      subtotal, shipping_fee: shippingFee, tax: 0, total, status: 'pending',
      delivery_method: body.deliveryMethod || 'express',
    }).select().single();

    if (orderError) return { error: orderError.message };

    const orderItems = body.items.map(item => ({
      order_id: orderData.id, product_id: item.productId,
      name: item.name, price: item.price, quantity: item.quantity,
    }));

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
    if (itemsError) {
      await supabase.from('orders').delete().eq('id', orderData.id);
      return { error: itemsError.message };
    }

    // Update stock
    for (const item of body.items) {
      const { data: product } = await supabase.from('products').select('stock').eq('id', item.productId).single();
      if (product) {
        await supabase.from('products').update({ stock: Math.max(0, product.stock - item.quantity) }).eq('id', item.productId);
      }
    }

    return { success: true, order: fmtOrder(orderData) };
  } catch (e) { return { error: String(e) }; }
}

export async function updateOrderStatus(id: string, status: string): Promise<any> {
  try {
    const { data, error } = await supabase.from('orders').update({ status, updated_at: new Date().toISOString() }).eq('id', id).select().single();
    if (error) return { error: error.message };
    return { success: true, order: { id: data.id, status: data.status } };
  } catch (e) { return { error: String(e) }; }
}

// ===== Services =====
export async function getServices(): Promise<any> {
  try {
    const { data, error } = await supabase.from('services').select('*').order('created_at', { ascending: false });
    if (error) return { services: [] };
    return { services: data.map(fmtService) };
  } catch { return { services: [] }; }
}

export async function createService(payload): Promise<any> {
  try {
    const { data, error } = await supabase.from('services').insert(payload).select().single();
    if (error) return { error: error.message };
    return { service: fmtService(data) };
  } catch (e) { return { error: String(e) }; }
}

export async function updateService(id, payload): Promise<any> {
  try {
    const { data, error } = await supabase.from('services').update(payload).eq('id', id).select().single();
    if (error) return { error: error.message };
    return { service: fmtService(data) };
  } catch (e) { return { error: String(e) }; }
}

export async function deleteService(id): Promise<any> {
  try {
    const { error } = await supabase.from('services').delete().eq('id', id);
    if (error) return { error: error.message };
    return { success: true };
  } catch (e) { return { error: String(e) }; }
}

// ===== Appointments =====
export async function getAppointments(): Promise<any> {
  try {
    const { data, error } = await supabase.from('appointments').select('*').order('created_at', { ascending: false });
    if (error) return { appointments: [] };
    return { appointments: data.map(fmtAppointment) };
  } catch { return { appointments: [] }; }
}

export async function createAppointment(payload): Promise<any> {
  try {
    const { data: staffData } = await supabase.from('staff').select('name').eq('id', payload.staff_id).single();
    const { data: svcData } = await supabase.from('services').select('name').eq('id', payload.service_id).single();

    const insertPayload = {
      service_id: payload.service_id,
      staff_id: payload.staff_id,
      start_time: payload.start_time,
      end_time: payload.end_time,
      notes: `客户:${payload.customer_name || ''}|电话:${payload.customer_phone || ''}${payload.notes ? '|' + payload.notes : ''}`,
      status: 'confirmed',
    };

    const { data, error } = await supabase.from('appointments').insert(insertPayload).select().single();
    if (error) return { error: error.message };
    return { success: true, appointment: fmtAppointment(data) };
  } catch (e) { return { error: String(e) }; }
}

// ===== Staff =====
export async function getStaff(): Promise<any> {
  try {
    const { data, error } = await supabase.from('staff').select('*').order('created_at', { ascending: false });
    if (error) return { staff: [] };
    return { staff: data.map(fmtStaff) };
  } catch { return { staff: [] }; }
}

// ===== Payment Verifications =====
export async function createPaymentVerification(payload): Promise<any> {
  try {
    const { data, error } = await supabase.from('payment_verifications').insert(payload).select().single();
    if (error) return { error: error.message };
    return { success: true, verification: data };
  } catch (e) { return { error: String(e) }; }
}

// ===== Customers =====
export async function getCustomers(): Promise<any> {
  try {
    const { data, error } = await supabase.from('customers').select('*').order('created_at', { ascending: false });
    if (error) return { customers: [] };
    return { customers: data || [] };
  } catch { return { customers: [] }; }
}

// ===== Payment Settings =====
export async function getPaymentSettings(): Promise<any> {
  try {
    const { data, error } = await supabase.from('payment_settings').select('*').limit(1).single();
    if (error) return { wechatQr: '', alipayQr: '', merchantName: '丽姿秀' };
    return {
      wechatQr: data.wechat_qr_url || data.wechat_qr || '',
      alipayQr: data.alipay_qr_url || data.alipay_qr || '',
      merchantName: data.merchant_name || '丽姿秀',
    };
  } catch { return { wechatQr: '', alipayQr: '', merchantName: '丽姿秀' }; }
}

export async function savePaymentSettings(settings: { wechatQr: string; alipayQr: string; merchantName: string }): Promise<any> {
  try {
    // Try update first, insert if no row exists
    const { data: existing } = await supabase.from('payment_settings').select('id').limit(1).single();
    if (existing) {
      const { error } = await supabase.from('payment_settings').update({
        wechat_qr_url: settings.wechatQr, alipay_qr_url: settings.alipayQr, merchant_name: settings.merchantName,
      }).eq('id', existing.id);
      if (error) return { error: error.message };
      return { success: true };
    } else {
      const { error } = await supabase.from('payment_settings').insert({
        wechat_qr_url: settings.wechatQr, alipay_qr_url: settings.alipayQr, merchant_name: settings.merchantName,
      });
      if (error) return { error: error.message };
      return { success: true };
    }
  } catch (e) { return { error: String(e) }; }
}

// ===== Payment Verifications (full) =====
export async function getPaymentVerifications(status?: string): Promise<any> {
  try {
    let query = supabase.from('payment_verifications').select('*').order('created_at', { ascending: false });
    if (status) query = query.eq('status', status);
    const { data, error } = await query;
    if (error) return { verifications: [] };
    return { verifications: data || [] };
  } catch { return { verifications: [] }; }
}

export async function updatePaymentVerification(id: string, patch: Record<string, any>): Promise<any> {
  try {
    const { data, error } = await supabase.from('payment_verifications').update(patch).eq('id', id).select().single();
    if (error) return { error: error.message };
    return { success: true, verification: data };
  } catch (e) { return { error: String(e) }; }
}

// ===== Staff CRUD =====
export async function createStaff(payload): Promise<any> {
  try {
    const { data, error } = await supabase.from('staff').insert(payload).select().single();
    if (error) return { error: error.message };
    return { staff: fmtStaff(data) };
  } catch (e) { return { error: String(e) }; }
}

export async function updateStaff(id, payload): Promise<any> {
  try {
    const { data, error } = await supabase.from('staff').update(payload).eq('id', id).select().single();
    if (error) return { error: error.message };
    return { staff: fmtStaff(data) };
  } catch (e) { return { error: String(e) }; }
}

export async function deleteStaff(id): Promise<any> {
  try {
    const { error } = await supabase.from('staff').delete().eq('id', id);
    if (error) return { error: error.message };
    return { success: true };
  } catch (e) { return { error: String(e) }; }
}

// ===== Staff Schedule =====
export async function getStaffSchedule(date: string, view: string): Promise<any> {
  try {
    const { data, error } = await supabase.from('staff_schedule').select('*').eq('date', date);
    if (error) return { schedule: [] };
    return { schedule: data || [] };
  } catch { return { schedule: [] }; }
}

export async function updateStaffSchedule(id: string, patch: Record<string, any>): Promise<any> {
  try {
    const { data, error } = await supabase.from('staff_schedule').update(patch).eq('id', id).select().single();
    if (error) return { error: error.message };
    return { success: true, schedule: data };
  } catch (e) { return { error: String(e) }; }
}

// ===== Staff Dashboard =====
export async function getStaffDashboard(staffId: string): Promise<any> {
  try {
    const today = new Date().toISOString().split('T')[0];
    const { data: appointments } = await supabase.from('appointments')
      .select('*').eq('staff_id', staffId).gte('start_time', today).lt('start_time', today + 'T23:59:59').order('start_time');
    const { data: allAppointments } = await supabase.from('appointments')
      .select('*').eq('staff_id', staffId).gte('start_time', today + 'T00:00:00').lt('start_time', new Date(Date.now() + 7*86400000).toISOString().split('T')[0]);
    const completed = (appointments || []).filter(a => a.status === 'completed');
    const revenue = completed.reduce((s: number, a: any) => s + (a.total || 0), 0);
    return {
      todayAppointments: appointments || [],
      weeklyStats: {
        completedCount: completed.length,
        revenue,
        pendingCount: (appointments || []).filter(a => a.status === 'pending' || a.status === 'confirmed').length,
      },
    };
  } catch { return { todayAppointments: [], weeklyStats: { completedCount: 0, revenue: 0, pendingCount: 0 } }; }
}

export async function updateAppointmentStatus(id: string, status: string): Promise<any> {
  try {
    const { data, error } = await supabase.from('appointments').update({ status }).eq('id', id).select().single();
    if (error) return { error: error.message };
    return { success: true, appointment: fmtAppointment(data) };
  } catch (e) { return { error: String(e) }; }
}

export async function deleteAppointment(id: string): Promise<any> {
  try {
    const { error } = await supabase.from('appointments').delete().eq('id', id);
    if (error) return { error: error.message };
    return { success: true };
  } catch (e) { return { error: String(e) }; }
}
