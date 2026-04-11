// 模拟数据共享模块

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  stock: number;
  imageColor: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  shippingAddress: string;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  tax: number;
  total: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

// 初始产品数据
export const initialProducts: Product[] = [
  {
    id: '1',
    name: '玫瑰精油焕肤套装',
    description: '深层滋养，修复肌肤屏障，焕发自然光泽。',
    price: 299,
    originalPrice: 399,
    category: '护肤套装',
    stock: 15,
    imageColor: 'bg-gradient-to-r from-rose-100 to-pink-200',
  },
  {
    id: '2',
    name: '玻尿酸补水精华',
    description: '高浓度玻尿酸，24小时持续补水，改善干燥细纹。',
    price: 189,
    category: '精华液',
    stock: 32,
    imageColor: 'bg-gradient-to-r from-blue-100 to-cyan-200',
  },
  {
    id: '3',
    name: '茶树祛痘洁面乳',
    description: '温和控油，深层清洁毛孔，预防痘痘生成。',
    price: 89,
    category: '洁面',
    stock: 48,
    imageColor: 'bg-gradient-to-r from-green-100 to-emerald-200',
  },
  {
    id: '4',
    name: '抗皱紧致眼霜',
    description: '淡化黑眼圈，抚平眼周细纹，提升肌肤弹性。',
    price: 259,
    originalPrice: 329,
    category: '眼霜',
    stock: 12,
    imageColor: 'bg-gradient-to-r from-purple-100 to-violet-200',
  },
  {
    id: '5',
    name: '防晒隔离霜 SPF50+',
    description: '高效防晒，轻薄不油腻，妆前打底一体。',
    price: 149,
    category: '防晒',
    stock: 25,
    imageColor: 'bg-gradient-to-r from-amber-100 to-orange-200',
  },
  {
    id: '6',
    name: '胶原蛋白面膜（10片装）',
    description: '密集补水，提升肌肤弹性，恢复年轻光泽。',
    price: 129,
    category: '面膜',
    stock: 60,
    imageColor: 'bg-gradient-to-r from-pink-100 to-rose-200',
  },
  {
    id: '7',
    name: '男士控油护肤套装',
    description: '专为男士肌肤设计，控油保湿，清爽一整天。',
    price: 199,
    category: '男士护肤',
    stock: 18,
    imageColor: 'bg-gradient-to-r from-gray-100 to-blue-200',
  },
  {
    id: '8',
    name: '香氛身体乳',
    description: '持久留香，滋润保湿，改善肌肤干燥。',
    price: 79,
    category: '身体护理',
    stock: 45,
    imageColor: 'bg-gradient-to-r from-yellow-100 to-amber-200',
  },
];

// 可变的模拟数据（允许修改）
export let products: Product[] = [...initialProducts];
export let orders: Order[] = [];

// 重置数据（用于测试）
export function resetMockData() {
  products = [...initialProducts];
  orders = [];
}