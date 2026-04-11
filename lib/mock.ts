// 模拟数据层，用于数据库连接失败时展示 UI
export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  notes?: string;
  created_at: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  duration: number; // 分钟
  price: number;
  category: string;
}

export interface Staff {
  id: string;
  name: string;
  role: string;
  phone: string;
  email?: string;
  avatar?: string;
}

export interface Appointment {
  id: string;
  customer_id: string;
  service_id: string;
  staff_id: string;
  start_time: string;
  end_time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
}

// 模拟数据
export const mockCustomers: Customer[] = [
  {
    id: 'cus_001',
    name: '张美丽',
    phone: '13800138001',
    email: 'zhangmeili@example.com',
    notes: '偏好周末预约',
    created_at: '2026-03-15',
  },
  {
    id: 'cus_002',
    name: '王先生',
    phone: '13900139002',
    email: 'wangxiansheng@example.com',
    notes: '常做面部护理',
    created_at: '2026-03-20',
  },
  {
    id: 'cus_003',
    name: '李小姐',
    phone: '13700137003',
    email: 'lixiaojie@example.com',
    notes: '新客户',
    created_at: '2026-04-01',
  },
  {
    id: 'cus_004',
    name: '赵女士',
    phone: '13600136004',
    email: 'zhaonvshi@example.com',
    notes: '会员卡客户',
    created_at: '2026-04-05',
  },
];

export const mockServices: Service[] = [
  {
    id: 'svc_001',
    name: '深层清洁面部护理',
    description: '彻底清洁毛孔，去除黑头粉刺',
    duration: 60,
    price: 298,
    category: '面部护理',
  },
  {
    id: 'svc_002',
    name: '水光针注射',
    description: '补水保湿，提亮肤色',
    duration: 90,
    price: 880,
    category: '微整形',
  },
  {
    id: 'svc_003',
    name: '热玛吉紧肤',
    description: '提升皮肤紧致度，减少皱纹',
    duration: 120,
    price: 3500,
    category: '抗衰老',
  },
  {
    id: 'svc_004',
    name: '美甲护理',
    description: '基础美甲 + 手部护理',
    duration: 45,
    price: 128,
    category: '手足护理',
  },
  {
    id: 'svc_005',
    name: '全身按摩',
    description: '舒缓肌肉，放松身心',
    duration: 90,
    price: 258,
    category: '身体护理',
  },
];

export const mockStaff: Staff[] = [
  {
    id: 'staff_001',
    name: '刘技师',
    role: '高级美容师',
    phone: '13800138005',
    email: 'liujishi@example.com',
    avatar: '/avatars/staff1.png',
  },
  {
    id: 'staff_002',
    name: '陈顾问',
    role: '美容顾问',
    phone: '13900139006',
    email: 'chenguwen@example.com',
    avatar: '/avatars/staff2.png',
  },
  {
    id: 'staff_003',
    name: '王医生',
    role: '医美医师',
    phone: '13700137007',
    email: 'wangyisheng@example.com',
    avatar: '/avatars/staff3.png',
  },
  {
    id: 'staff_004',
    name: '李助理',
    role: '助理美容师',
    phone: '13600136008',
    email: 'lizhuli@example.com',
    avatar: '/avatars/staff4.png',
  },
];

export const mockAppointments: Appointment[] = [
  {
    id: 'app_001',
    customer_id: 'cus_001',
    service_id: 'svc_001',
    staff_id: 'staff_001',
    start_time: '2026-04-10T10:00:00',
    end_time: '2026-04-10T11:00:00',
    status: 'confirmed',
    notes: '自带产品',
  },
  {
    id: 'app_002',
    customer_id: 'cus_002',
    service_id: 'svc_003',
    staff_id: 'staff_003',
    start_time: '2026-04-10T14:00:00',
    end_time: '2026-04-10T16:00:00',
    status: 'pending',
    notes: '首次体验',
  },
  {
    id: 'app_003',
    customer_id: 'cus_003',
    service_id: 'svc_004',
    staff_id: 'staff_004',
    start_time: '2026-04-11T09:30:00',
    end_time: '2026-04-11T10:15:00',
    status: 'completed',
    notes: '已付款',
  },
  {
    id: 'app_004',
    customer_id: 'cus_004',
    service_id: 'svc_002',
    staff_id: 'staff_002',
    start_time: '2026-04-12T13:00:00',
    end_time: '2026-04-12T14:30:00',
    status: 'confirmed',
    notes: '会员折扣',
  },
];

// 模拟 API 函数（与真实 Supabase 客户端接口保持一致）
export const mockSupabase = {
  from: (table: string) => ({
    select: (columns = '*') => ({
      data: mockData(table),
      error: null,
    }),
    insert: (data: any) => ({
      data: { ...data, id: `new_${Date.now()}` },
      error: null,
    }),
    update: (data: any) => ({
      data: { ...data, updated_at: new Date().toISOString() },
      error: null,
    }),
    delete: () => ({
      data: null,
      error: null,
    }),
  }),
};

function mockData(table: string): any[] {
  switch (table) {
    case 'customers':
      return mockCustomers;
    case 'services':
      return mockServices;
    case 'staff':
      return mockStaff;
    case 'appointments':
      return mockAppointments;
    default:
      return [];
  }
}

// 检查是否使用模拟模式（根据环境变量或 Supabase 连接状态）
export const isMockMode = () => {
  return process.env.NEXT_PUBLIC_MOCK_MODE === 'true' || !process.env.NEXT_PUBLIC_SUPABASE_URL;
};

// 获取模拟或真实客户端
export const getClient = () => {
  if (isMockMode()) {
    console.log('⚠️ 使用模拟数据模式（数据库未连接）');
    return mockSupabase;
  }
  // 真实客户端在 supabase.ts 中导出
  return require('./supabase').supabase;
};