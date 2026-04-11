// 服务器端内存存储（全局变量），在服务器运行期间持久化数据
// 注意：服务器重启后数据丢失，不同用户共享同一份数据（演示用途）

import { Product, Order } from './mockData';

// 类型定义
export interface Appointment {
  id: string;
  customer_id: string;
  service_id: string;
  staff_id: string;
  start_time: string;
  end_time: string;
  status: string;
  notes: string;
  created_at: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  notes: string;
  created_at: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  category: string;
  created_at: string;
}

export interface Staff {
  id: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  avatar: string;
  created_at: string;
}

// 初始数据
const initialProducts: Product[] = [
  {
    id: '1',
    name: '玫瑰精油焕肤套装',
    description: '深层滋养，修复肌肤屏障，焕发自然光泽。',
    price: 299,
    originalPrice: 399,
    category: '护肤套装',
    stock: 15,
    imageColor: 'from-rose-100 to-pink-200',
  },
  {
    id: '2',
    name: '玻尿酸补水精华',
    description: '高浓度玻尿酸，24小时持续补水，改善干燥细纹。',
    price: 189,
    category: '精华液',
    stock: 32,
    imageColor: 'from-blue-100 to-cyan-200',
  },
  {
    id: '3',
    name: '茶树祛痘洁面乳',
    description: '温和控油，深层清洁毛孔，预防痘痘生成。',
    price: 89,
    category: '洁面',
    stock: 48,
    imageColor: 'from-green-100 to-emerald-200',
  },
  {
    id: '4',
    name: '抗皱紧致眼霜',
    description: '淡化黑眼圈，抚平眼周细纹，提升肌肤弹性。',
    price: 259,
    originalPrice: 329,
    category: '眼霜',
    stock: 12,
    imageColor: 'from-purple-100 to-violet-200',
  },
  {
    id: '5',
    name: '防晒隔离霜 SPF50+',
    description: '高效防晒，轻薄不油腻，妆前打底一体。',
    price: 149,
    category: '防晒',
    stock: 25,
    imageColor: 'from-amber-100 to-orange-200',
  },
  {
    id: '6',
    name: '胶原蛋白面膜（10片装）',
    description: '密集补水，提升肌肤弹性，恢复年轻光泽。',
    price: 129,
    category: '面膜',
    stock: 60,
    imageColor: 'from-pink-100 to-rose-200',
  },
  {
    id: '7',
    name: '男士控油护肤套装',
    description: '专为男士肌肤设计，控油保湿，清爽一整天。',
    price: 199,
    category: '男士护肤',
    stock: 18,
    imageColor: 'from-gray-100 to-blue-200',
  },
  {
    id: '8',
    name: '香氛身体乳',
    description: '持久留香，滋润保湿，改善肌肤干燥。',
    price: 79,
    category: '身体护理',
    stock: 45,
    imageColor: 'from-yellow-100 to-amber-200',
  },
];

const initialOrders: Order[] = [];

const initialAppointments: Appointment[] = [
  {
    id: '1',
    customer_id: '1',
    service_id: '1',
    staff_id: '1',
    start_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 明天
    end_time: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(),
    status: 'confirmed',
    notes: '首次预约',
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    customer_id: '2',
    service_id: '2',
    staff_id: '2',
    start_time: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), // 后天
    end_time: new Date(Date.now() + 49 * 60 * 60 * 1000).toISOString(),
    status: 'pending',
    notes: '需确认时间',
    created_at: new Date().toISOString(),
  },
];

const initialCustomers: Customer[] = [
  {
    id: '1',
    name: '张美丽',
    phone: '13800138001',
    email: 'zhangmeili@example.com',
    notes: '偏好周末预约',
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    name: '王先生',
    phone: '13900139002',
    email: 'wangxiansheng@example.com',
    notes: '常做面部护理',
    created_at: new Date().toISOString(),
  },
  {
    id: '3',
    name: '李小姐',
    phone: '13700137003',
    email: 'lixiaojie@example.com',
    notes: '新客户',
    created_at: new Date().toISOString(),
  },
  {
    id: '4',
    name: '赵女士',
    phone: '13600136004',
    email: 'zhaonvshi@example.com',
    notes: '会员卡客户',
    created_at: new Date().toISOString(),
  },
];

const initialServices: Service[] = [
  {
    id: '1',
    name: '深层清洁面部护理',
    description: '彻底清洁毛孔，去除黑头粉刺',
    duration: 60,
    price: 298.0,
    category: '面部护理',
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    name: '水光针注射',
    description: '补水保湿，提亮肤色',
    duration: 90,
    price: 880.0,
    category: '微整形',
    created_at: new Date().toISOString(),
  },
  {
    id: '3',
    name: '热玛吉紧肤',
    description: '提升皮肤紧致度，减少皱纹',
    duration: 120,
    price: 3500.0,
    category: '抗衰老',
    created_at: new Date().toISOString(),
  },
  {
    id: '4',
    name: '美甲护理',
    description: '基础美甲 + 手部护理',
    duration: 45,
    price: 128.0,
    category: '手足护理',
    created_at: new Date().toISOString(),
  },
  {
    id: '5',
    name: '全身按摩',
    description: '舒缓肌肉，放松身心',
    duration: 90,
    price: 258.0,
    category: '身体护理',
    created_at: new Date().toISOString(),
  },
];

const initialStaff: Staff[] = [
  {
    id: '1',
    name: '刘技师',
    role: '高级美容师',
    phone: '13800138005',
    email: 'liujishi@example.com',
    avatar: '/avatars/staff1.png',
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    name: '陈顾问',
    role: '美容顾问',
    phone: '13900139006',
    email: 'chenguwen@example.com',
    avatar: '/avatars/staff2.png',
    created_at: new Date().toISOString(),
  },
  {
    id: '3',
    name: '王医生',
    role: '医美医师',
    phone: '13700137007',
    email: 'wangyisheng@example.com',
    avatar: '/avatars/staff3.png',
    created_at: new Date().toISOString(),
  },
  {
    id: '4',
    name: '李助理',
    role: '助理美容师',
    phone: '13600136008',
    email: 'lizhuli@example.com',
    avatar: '/avatars/staff4.png',
    created_at: new Date().toISOString(),
  },
];

// 全局存储对象
let memoryStore: {
  products: Product[];
  orders: Order[];
  appointments: Appointment[];
  customers: Customer[];
  services: Service[];
  staff: Staff[];
} = {
  products: [...initialProducts],
  orders: [...initialOrders],
  appointments: [...initialAppointments],
  customers: [...initialCustomers],
  services: [...initialServices],
  staff: [...initialStaff],
};

// 产品操作
export const getProducts = () => memoryStore.products;
export const getProductById = (id: string) => memoryStore.products.find(p => p.id === id);
export const addProduct = (product: Omit<Product, 'id'>) => {
  const newProduct: Product = {
    ...product,
    id: `product_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  };
  memoryStore.products.push(newProduct);
  return newProduct;
};
export const updateProduct = (id: string, updates: Partial<Product>) => {
  const index = memoryStore.products.findIndex(p => p.id === id);
  if (index >= 0) {
    memoryStore.products[index] = { ...memoryStore.products[index], ...updates };
    return memoryStore.products[index];
  }
  return null;
};
export const deleteProduct = (id: string) => {
  const index = memoryStore.products.findIndex(p => p.id === id);
  if (index >= 0) {
    memoryStore.products.splice(index, 1);
    return true;
  }
  return false;
};

// 订单操作
export const getOrders = () => memoryStore.orders;
export const getOrderById = (id: string) => memoryStore.orders.find(o => o.id === id);
export const addOrder = (order: Omit<Order, 'id' | 'createdAt'>) => {
  const newOrder: Order = {
    ...order,
    id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
  };
  memoryStore.orders.push(newOrder);
  return newOrder;
};
export const updateOrder = (id: string, updates: Partial<Order>) => {
  const index = memoryStore.orders.findIndex(o => o.id === id);
  if (index >= 0) {
    memoryStore.orders[index] = { ...memoryStore.orders[index], ...updates };
    return memoryStore.orders[index];
  }
  return null;
};
export const deleteOrder = (id: string) => {
  const index = memoryStore.orders.findIndex(o => o.id === id);
  if (index >= 0) {
    memoryStore.orders.splice(index, 1);
    return true;
  }
  return false;
};

// 预约操作
export const getAppointments = () => memoryStore.appointments;
export const getAppointmentById = (id: string) => memoryStore.appointments.find(a => a.id === id);
export const addAppointment = (appointment: Omit<Appointment, 'id'>) => {
  const newAppointment: Appointment = {
    ...appointment,
    id: `appointment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  };
  memoryStore.appointments.push(newAppointment);
  return newAppointment;
};
export const updateAppointment = (id: string, updates: Partial<Appointment>) => {
  const index = memoryStore.appointments.findIndex(a => a.id === id);
  if (index >= 0) {
    memoryStore.appointments[index] = { ...memoryStore.appointments[index], ...updates };
    return memoryStore.appointments[index];
  }
  return null;
};
export const deleteAppointment = (id: string) => {
  const index = memoryStore.appointments.findIndex(a => a.id === id);
  if (index >= 0) {
    memoryStore.appointments.splice(index, 1);
    return true;
  }
  return false;
};

// 客户操作
export const getCustomers = () => memoryStore.customers;
export const getCustomerById = (id: string) => memoryStore.customers.find(c => c.id === id);
export const addCustomer = (customer: Omit<Customer, 'id'>) => {
  const newCustomer: Customer = {
    ...customer,
    id: `customer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  };
  memoryStore.customers.push(newCustomer);
  return newCustomer;
};
export const updateCustomer = (id: string, updates: Partial<Customer>) => {
  const index = memoryStore.customers.findIndex(c => c.id === id);
  if (index >= 0) {
    memoryStore.customers[index] = { ...memoryStore.customers[index], ...updates };
    return memoryStore.customers[index];
  }
  return null;
};
export const deleteCustomer = (id: string) => {
  const index = memoryStore.customers.findIndex(c => c.id === id);
  if (index >= 0) {
    memoryStore.customers.splice(index, 1);
    return true;
  }
  return false;
};

// 服务操作
export const getServices = () => memoryStore.services;
export const getServiceById = (id: string) => memoryStore.services.find(s => s.id === id);
export const addService = (service: Omit<Service, 'id'>) => {
  const newService: Service = {
    ...service,
    id: `service_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  };
  memoryStore.services.push(newService);
  return newService;
};
export const updateService = (id: string, updates: Partial<Service>) => {
  const index = memoryStore.services.findIndex(s => s.id === id);
  if (index >= 0) {
    memoryStore.services[index] = { ...memoryStore.services[index], ...updates };
    return memoryStore.services[index];
  }
  return null;
};
export const deleteService = (id: string) => {
  const index = memoryStore.services.findIndex(s => s.id === id);
  if (index >= 0) {
    memoryStore.services.splice(index, 1);
    return true;
  }
  return false;
};

// 员工操作
export const getStaff = () => memoryStore.staff;
export const getStaffById = (id: string) => memoryStore.staff.find(s => s.id === id);
export const addStaff = (staff: Omit<Staff, 'id'>) => {
  const newStaff: Staff = {
    ...staff,
    id: `staff_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  };
  memoryStore.staff.push(newStaff);
  return newStaff;
};
export const updateStaff = (id: string, updates: Partial<Staff>) => {
  const index = memoryStore.staff.findIndex(s => s.id === id);
  if (index >= 0) {
    memoryStore.staff[index] = { ...memoryStore.staff[index], ...updates };
    return memoryStore.staff[index];
  }
  return null;
};
export const deleteStaff = (id: string) => {
  const index = memoryStore.staff.findIndex(s => s.id === id);
  if (index >= 0) {
    memoryStore.staff.splice(index, 1);
    return true;
  }
  return false;
};

// 库存扣减
export const reduceProductStock = (productId: string, quantity: number): boolean => {
  const product = memoryStore.products.find(p => p.id === productId);
  if (!product || product.stock < quantity) return false;
  product.stock -= quantity;
  return true;
};

// 重置存储（用于测试）
export const resetStore = () => {
  memoryStore = {
    products: [...initialProducts],
    orders: [...initialOrders],
    appointments: [...initialAppointments],
    customers: [...initialCustomers],
    services: [...initialServices],
    staff: [...initialStaff],
  };
};