// 内存存储（开发备用，生产使用 Supabase）
export interface Product { id: string; name: string; description: string; price: number; category: string; stock: number; imageUrl?: string; }
export interface Order { id: string; customerName: string; items: any[]; total: number; status: string; }
let products: Product[] = [];
let orders: Order[] = [];
export function getProducts() { return products; }
export function setProducts(p: Product[]) { products = p; }
export function reduceProductStock(productId: string, quantity: number): boolean {
  const p = products.find(x => x.id === productId);
  if (!p || p.stock < quantity) return false;
  p.stock -= quantity;
  return true;
}
export function getOrders() { return orders; }
export function addOrder(order: Order) { orders.push(order); }
