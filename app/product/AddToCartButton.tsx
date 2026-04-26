'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
}

const CART_KEY = 'beauty-shop-cart';
  const fmt = (n: number) => new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY' }).format(n);

export default function AddToCartButton({ product }: { product: Product }) {
  const [cart, setCart] = useState<Record<string, number>>({});
  const [added, setAdded] = useState(false);
  const [qty, setQty] = useState(1);
  const [cartCount, setCartCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);

  // 监听 cart-updated 事件（来自 products 等页面）
  useEffect(() => {
    const handler = () => {
      const saved = localStorage.getItem(CART_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setCart(parsed);
          setCartCount(Object.values(parsed).reduce((s: number, q: any) => s + Number(q), 0));
          // 实时计算当前商品的小计
          setCartTotal(Number(parsed[product.id] || 0) * product.price);
        } catch {}
      }
    };
    window.addEventListener('cart-updated', handler);
    return () => window.removeEventListener('cart-updated', handler);
  }, [product.id, product.price]);

  // 初始读取本地购物车
  useEffect(() => {
    const saved = localStorage.getItem(CART_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCart(parsed);
        setCartCount(Object.values(parsed).reduce((s: number, q: any) => s + Number(q), 0));
        if (parsed[product.id]) setQty(parsed[product.id]);
        setCartTotal(Number(parsed[product.id] || 0) * product.price);
      } catch {}
    }
  }, [product.id, product.price]);

  const saveCart = (next: Record<string, number>) => {
    setCart(next);
    localStorage.setItem(CART_KEY, JSON.stringify(next));
  };

  const addToCart = () => {
    if (product.stock === 0) return;
    const current = cart[product.id] || 0;
    const newQty = Math.min(current + qty, product.stock);
    const next = { ...cart, [product.id]: newQty };
    setCart(next);
    localStorage.setItem(CART_KEY, JSON.stringify(next));
    setAdded(true);
    const newCount = Object.values(next).reduce((s: number, q: any) => s + Number(q), 0);
    setCartCount(newCount);
    setCartTotal(newQty * product.price);
    setTimeout(() => setAdded(false), 2000);
    window.dispatchEvent(new Event('cart-updated'));
  };

  const changeQty = (delta: number) => {
    const newQty = Math.max(1, Math.min(qty + delta, product.stock));
    setQty(newQty);
  };

  if (product.stock === 0) {
    return (
      <div className="py-5 rounded-2xl text-center font-bold text-lg mb-6" style={{background:'#f5f2ed',color:'#9b9b98'}}>
        已售罄 · 敬请期待补货
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center gap-4 mb-6">
        <span className="font-medium" style={{color:'#2a2a28'}}>数量</span>
        <div className="flex items-center rounded-xl overflow-hidden" style={{border:'1.5px solid rgba(201,168,124,0.3)'}}>
          <button onClick={() => changeQty(-1)} className="w-11 h-11 flex items-center justify-center text-lg font-bold transition hover:bg-gray-100" style={{color:'#2a2a28',background:'white'}} disabled={qty <= 1}>−</button>
          <div className="w-16 h-11 flex items-center justify-center font-bold text-lg" style={{color:'#2a2a28',background:'white'}}>{qty}</div>
          <button onClick={() => changeQty(1)} className="w-11 h-11 flex items-center justify-center text-lg font-bold transition hover:bg-gray-100" style={{color:'var(--primary)',background:'white'}} disabled={qty >= product.stock}>+</button>
        </div>
        <span className="text-sm" style={{color:'#9b9b98'}}>共 {product.stock} 件</span>
      </div>

      <div className="flex gap-3">
        <button onClick={addToCart} className="flex-1 py-3 rounded-xl font-bold text-lg text-white transition-all"
          style={{background: added ? 'var(--accent)' : 'var(--primary)', boxShadow: added ? 'none' : '0 8px 25px rgba(201,168,124,0.35)'}}>
          <span className="flex items-center justify-center gap-2">
            {added ? (
              <><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> 已加入购物车</>
            ) : (
              <><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg> 加入购物车</>
            )}
          </span>
        </button>
        <Link href="/cart" className="px-8 py-3 rounded-xl font-bold text-lg transition-all hover:opacity-90"
          style={{background:'var(--accent)',color:'white',boxShadow:'0 8px 25px rgba(45,74,62,0.2)'}}>
          立即结算
        </Link>
      </div>

      {cartCount > 0 && (
        <div className="fixed bottom-6 right-6 bg-white rounded-2xl p-5 max-w-xs z-40" style={{boxShadow:'0 20px 60px rgba(0,0,0,0.12)',border:'1px solid rgba(201,168,124,0.15)'}}>
          <div className="flex justify-between items-center mb-3">
            <span className="font-bold" style={{color:'#2a2a28'}}>购物车 ({cartCount}件)</span>
            <Link href="/cart" className="text-sm font-medium" style={{color:'var(--primary)'}}>去结算 →</Link>
          </div>
          <div className="text-2xl font-bold mb-3" style={{color:'var(--primary)'}}>{fmt(cartTotal)}</div>
          <div className="text-sm text-center mb-3" style={{color:'var(--foreground-muted)'}}>本商品 {cart[product.id] || 0} 件 · 共 {cartCount} 件</div>
          <Link href="/cart" className="block w-full py-3 text-center rounded-xl font-bold text-sm text-white transition hover:opacity-85" style={{background:'var(--accent)'}}>去结算</Link>
        </div>
      )}
    </>
  );
}
