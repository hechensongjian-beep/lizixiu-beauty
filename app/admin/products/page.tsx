'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  stock: number;
  imageColor: string;
  tags: string[];
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '',
    description: '',
    price: 0,
    category: '',
    stock: 0,
    imageColor: 'from-gray-300 to-gray-400',
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('加载产品失败', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setNewProduct(product);
    setShowForm(true);
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('确定要删除这个商品吗？删除后无法恢复。')) return;
    try {
      const res = await fetch(`/api/products?id=${productId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        alert('删除成功');
        fetchProducts(); // 重新加载列表
      } else {
        const error = await res.json();
        alert(`删除失败: ${error.error || '未知错误'}`);
      }
    } catch (error) {
      console.error('删除失败', error);
      alert('删除失败，请检查网络连接');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price || !newProduct.category) {
      alert('请填写名称、价格和分类');
      return;
    }
    try {
      const method = editingProduct ? 'PUT' : 'POST';
      const url = editingProduct ? `/api/products?id=${editingProduct.id}` : '/api/products';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct),
      });
      if (res.ok) {
        alert(editingProduct ? '更新成功' : '添加成功');
        setShowForm(false);
        setEditingProduct(null);
        setNewProduct({
          name: '',
          description: '',
          price: 0,
          category: '',
          stock: 0,
          imageColor: 'from-gray-300 to-gray-400',
        });
        fetchProducts(); // 重新加载列表
      } else {
        const error = await res.json();
        alert(`${editingProduct ? '更新' : '添加'}失败: ${error.error || '未知错误'}`);
      }
    } catch (error) {
      console.error('保存失败', error);
      alert('保存失败，请检查网络连接');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
    }).format(amount);
  };

  const categories = Array.from(new Set(products.map(p => p.category)));

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-32 text-center">
        <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-pink-500 mb-6"></div>
        <p className="text-gray-600">加载产品中...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-12">
        <div>
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-emerald-100 to-green-100 rounded-2xl mb-6">
            <div className="text-3xl">📦</div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">产品管理</h1>
          <p className="text-gray-600 max-w-2xl">
            管理您的所有商品，更新库存、价格与分类。
          </p>
        </div>
        <div className="mt-6 md:mt-0">
          <button
            onClick={() => setShowForm(true)}
            className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold text-lg rounded-lg hover:opacity-90 transition"
          >
            ＋ 添加新产品
          </button>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingProduct ? '编辑产品' : '添加新产品'}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingProduct(null);
                  setNewProduct({
                    name: '',
                    description: '',
                    price: 0,
                    category: '',
                    stock: 0,
                    imageColor: 'from-gray-300 to-gray-400',
                  });
                }}
                className="text-gray-500 hover:text-gray-800 text-2xl"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-2">
                    产品名称 *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    value={newProduct.name || ''}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-2">
                    分类 *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    value={newProduct.category || ''}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-2">
                    价格（元） *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    value={newProduct.price || ''}
                    onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-2">
                    库存数量 *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    value={newProduct.stock || ''}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-800 mb-2">
                    产品描述
                  </label>
                  <textarea
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    value={newProduct.description || ''}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-800 mb-2">
                    背景颜色（Tailwind 渐变）
                  </label>
                  <input
                    type="text"
                    placeholder="例如：from-pink-300 to-rose-400"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    value={newProduct.imageColor || ''}
                    onChange={(e) => setNewProduct({ ...newProduct, imageColor: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-800 font-bold rounded-lg hover:bg-gray-50 transition"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold rounded-lg hover:opacity-90 transition"
                >
                  {editingProduct ? '保存更改' : '创建产品'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 产品统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="bg-white border border-gray-200 rounded-2xl p-8">
          <div className="text-4xl mb-4">📦</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">商品总数</h3>
          <p className="text-3xl font-bold text-gray-900">{products.length} 个</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-8">
          <div className="text-4xl mb-4">💰</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">总库存</h3>
          <p className="text-3xl font-bold text-gray-900">
            {products.reduce((sum, p) => sum + p.stock, 0)} 件
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-8">
          <div className="text-4xl mb-4">🏷️</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">分类数量</h3>
          <p className="text-3xl font-bold text-gray-900">{categories.length} 类</p>
        </div>
      </div>

      {/* 产品表格 */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-4 px-6 text-left font-bold text-gray-900">产品</th>
                <th className="py-4 px-6 text-left font-bold text-gray-900">分类</th>
                <th className="py-4 px-6 text-left font-bold text-gray-900">价格</th>
                <th className="py-4 px-6 text-left font-bold text-gray-900">库存</th>
                <th className="py-4 px-6 text-left font-bold text-gray-900">状态</th>
                <th className="py-4 px-6 text-left font-bold text-gray-900">操作</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-t border-gray-200 hover:bg-gray-50">
                  <td className="py-4 px-6">
                    <div className="flex items-center">
                      <div className={`w-12 h-12 ${product.imageColor} rounded-lg mr-4`}></div>
                      <div>
                        <div className="font-bold text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-600 truncate max-w-xs">{product.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="px-3 py-1 bg-gray-100 text-gray-800 text-sm font-medium rounded-full">
                      {product.category}
                    </span>
                  </td>
                  <td className="py-4 px-6 font-bold text-gray-900">
                    {formatCurrency(product.price)}
                    {product.originalPrice && (
                      <div className="text-sm text-gray-500 line-through">
                        {formatCurrency(product.originalPrice)}
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center">
                      <div className="w-24 bg-gray-200 rounded-full h-2 mr-4">
                        <div
                          className={`h-2 rounded-full ${product.stock > 10 ? 'bg-green-500' : product.stock > 0 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ width: `${Math.min(product.stock, 50) * 2}%` }}
                        ></div>
                      </div>
                      <span className={`font-bold ${product.stock > 10 ? 'text-green-700' : product.stock > 0 ? 'text-yellow-700' : 'text-red-700'}`}>
                        {product.stock} 件
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${product.stock > 10 ? 'bg-green-100 text-green-800' : product.stock > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                      {product.stock > 10 ? '充足' : product.stock > 0 ? '紧张' : '缺货'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleEdit(product)}
                        className="px-4 py-2 bg-blue-50 text-blue-700 font-medium rounded-lg hover:bg-blue-100 transition"
                      >
                        编辑
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="px-4 py-2 bg-red-50 text-red-700 font-medium rounded-lg hover:bg-red-100 transition"
                      >
                        删除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 返回链接 */}
      <div className="text-center mt-12">
        <Link
          href="/admin/orders"
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-gray-800 to-gray-900 text-white font-semibold rounded-lg hover:opacity-90 transition"
        >
          ← 返回订单管理
        </Link>
      </div>
    </div>
  );
}