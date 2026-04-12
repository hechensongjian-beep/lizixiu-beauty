import { supabase } from '@/lib/supabase';

// ===== Formatters =====
function fmtProduct(p) {
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
    status: o.status, createdAt: o.created_at, updatedAt: o.updated_at,
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
    status: a.status || 'pending', customer_name: a.customer_name || '',
    customer_phone: a.customer_phone || '', notes: a.notes || '',
    service_type: a.service_type || '', staff_name: a.staff_name || '',
    created_at: a.created_at,
  };
}

// ===== Products =====
export async function getProducts() {
  try {
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (error) return { products: [] };
    return { products: data.map(fmtProduct) };
  } catch { return { products: [] }; }
}

export async function createProduct(payload) {
  try {
    const { data, error } = await supabase.from('products').insert(payload).select().single();
    if (error) return { error: error.message };
    return { product: fmtProduct(data) };
  } catch (e) { return { error: String(e) }; }
}

export async function updateProduct(id, payload) {
  try {
    const { data, error } = await supabase.from('products').update(payload).eq('id', id).select().single();
    if (error) return { error: error.message };
    return { product: fmtProduct(data) };
  } catch (e) { return { error: String(e) }; }
}

export async function deleteProduct(id) {
  try {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) return { error: error.message };
    return { success: true };
  } catch (e) { return { error: String(e) }; }
}

// ===== Orders =====
export async function getOrders() {
  try {
    const { data, error } = await supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false });
    if (error) return { orders: [] };
    return { orders: (data || []).map(fmtOrder) };
  } catch { return { orders: [] }; }
}

export async function createOrder(body) {
  try {
    const subtotal = body.subtotal || body.items.reduce((s, i) => s + i.price * i.quantity, 0);
    const shippingFee = body.shippingFee || (subtotal > 500 ? 0 : 15);
    const tax = body.tax || subtotal * 0.06;
    const total = body.total || subtotal + shippingFee + tax;

    const { data: orderData, error: orderError } = await supabase.from('orders').insert({
      customer_name: body.customerName, customer_phone: body.customerPhone || '',
      customer_email: body.customerEmail || '', shipping_address: body.shippingAddress || '',
      subtotal, shipping_fee: shippingFee, tax, total, status: 'pending',
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

export async function updateOrderStatus(id, status) {
  try {
    const { data, error } = await supabase.from('orders').update({ status, updated_at: new Date().toISOString() }).eq('id', id).select().single();
    if (error) return { error: error.message };
    return { success: true, order: { id: data.id, status: data.status } };
  } catch (e) { return { error: String(e) }; }
}

// ===== Services =====
export async function getServices() {
  try {
    const { data, error } = await supabase.from('services').select('*').order('created_at', { ascending: false });
    if (error) return { services: [] };
    return { services: data.map(fmtService) };
  } catch { return { services: [] }; }
}

export async function createService(payload) {
  try {
    const { data, error } = await supabase.from('services').insert(payload).select().single();
    if (error) return { error: error.message };
    return { service: fmtService(data) };
  } catch (e) { return { error: String(e) }; }
}

export async function updateService(id, payload) {
  try {
    const { data, error } = await supabase.from('services').update(payload).eq('id', id).select().single();
    if (error) return { error: error.message };
    return { service: fmtService(data) };
  } catch (e) { return { error: String(e) }; }
}

export async function deleteService(id) {
  try {
    const { error } = await supabase.from('services').delete().eq('id', id);
    if (error) return { error: error.message };
    return { success: true };
  } catch (e) { return { error: String(e) }; }
}

// ===== Appointments =====
export async function getAppointments() {
  try {
    const { data, error } = await supabase.from('appointments').select('*').order('created_at', { ascending: false });
    if (error) return { appointments: [] };
    return { appointments: data.map(fmtAppointment) };
  } catch { return { appointments: [] }; }
}

export async function createAppointment(payload) {
  try {
    const { data: staffData } = await supabase.from('staff').select('name').eq('id', payload.staff_id).single();
    const { data: svcData } = await supabase.from('services').select('name').eq('id', payload.service_id).single();

    const insertPayload = {
      service_id: payload.service_id,
      staff_id: payload.staff_id,
      start_time: payload.start_time,
      end_time: payload.end_time,
      notes: payload.notes || '',
      status: 'confirmed',
      customer_name: payload.customer_name || '',
      customer_phone: payload.customer_phone || '',
      service_type: svcData?.name || '',
      staff_name: staffData?.name || '',
    };

    const { data, error } = await supabase.from('appointments').insert(insertPayload).select().single();
    if (error) return { error: error.message };
    return { success: true, ...fmtAppointment(data) };
  } catch (e) { return { error: String(e) }; }
}

// ===== Staff =====
export async function getStaff() {
  try {
    const { data, error } = await supabase.from('staff').select('*').order('created_at', { ascending: false });
    if (error) return { staff: [] };
    return { staff: data.map(fmtStaff) };
  } catch { return { staff: [] }; }
}

// ===== Payment Verifications =====
export async function createPaymentVerification(payload) {
  try {
    const { data, error } = await supabase.from('payment_verifications').insert(payload).select().single();
    if (error) return { error: error.message };
    return { success: true, verification: data };
  } catch (e) { return { error: String(e) }; }
}

// ===== Customers =====
export async function getCustomers() {
  try {
    const { data, error } = await supabase.from('customers').select('*').order('created_at', { ascending: false });
    if (error) return { customers: [] };
    return { customers: data || [] };
  } catch { return { customers: [] }; }
}
