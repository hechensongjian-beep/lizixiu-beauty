'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

// Toast 类型
type ToastType = 'success' | 'error' | 'warning' | 'info';

// Toast 数据
interface Toast {
  id: number;
  type: ToastType;
  message: string;
  duration?: number;
}

// Toast 对象接口（既是函数又有方法）
interface ToastFn {
  (type: ToastType, message: string, duration?: number): void;
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
  confirm: (message: string) => Promise<boolean>;
}

// Context 值
interface ToastContextValue {
  toast: ToastFn;
}

const ToastContext = createContext<ToastContextValue | null>(null);

// Hook
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

// 图标 SVG
const ICONS: Record<ToastType, ReactNode> = {
  success: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2d4a3e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  error: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c0392b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  ),
  warning: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c9a87c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  info: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2d4a3e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  ),
};

// 背景色
const BG_COLORS: Record<ToastType, string> = {
  success: '#f0faf4',
  error: '#fef2f2',
  warning: '#fefcf3',
  info: '#f0faf4',
};

const BORDER_COLORS: Record<ToastType, string> = {
  success: 'rgba(45,74,62,0.2)',
  error: 'rgba(192,57,43,0.2)',
  warning: 'rgba(201,168,124,0.3)',
  info: 'rgba(45,74,62,0.15)',
};

// Toast 项组件
function ToastItem({ toast, onClose }: { toast: Toast; onClose: (id: number) => void }) {
  return (
    <div
      className="flex items-start gap-3 px-4 py-3 rounded-lg shadow-lg border"
      style={{
        background: BG_COLORS[toast.type],
        borderColor: BORDER_COLORS[toast.type],
        animation: 'toastIn 0.3s ease-out',
        maxWidth: '380px',
        width: '100%',
      }}
    >
      <div className="flex-shrink-0 mt-0.5">{ICONS[toast.type]}</div>
      <p className="flex-1" style={{ fontSize: '0.8125rem', lineHeight: '1.5', color: 'var(--foreground)' }}>
        {toast.message}
      </p>
      <button
        onClick={() => onClose(toast.id)}
        className="flex-shrink-0 p-0.5 rounded hover:bg-black/5 transition-colors"
        style={{ color: 'var(--foreground-muted)' }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}

// Confirm 弹窗组件
function ConfirmDialog({ message, onResolve }: { message: string; onResolve: (v: boolean) => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.4)' }}>
      <div className="bg-white rounded-xl shadow-2xl border p-6" style={{ borderColor: 'rgba(201,168,124,0.2)', maxWidth: '400px', width: '90%' }}>
        <div className="flex items-start gap-3 mb-5">
          <div className="flex-shrink-0 mt-0.5">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c9a87c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <p style={{ fontSize: '0.875rem', lineHeight: '1.6', color: 'var(--foreground)' }}>{message}</p>
        </div>
        <div className="flex gap-3 justify-end">
          <button
            onClick={() => onResolve(false)}
            className="px-4 py-2 rounded-md font-medium transition-colors border-2"
            style={{
              borderColor: 'var(--primary)',
              color: 'var(--primary)',
              fontSize: '0.8125rem',
            }}
          >
            取消
          </button>
          <button
            onClick={() => onResolve(true)}
            className="px-4 py-2 rounded-md font-medium text-white transition-colors"
            style={{
              background: 'var(--accent)',
              fontSize: '0.8125rem',
            }}
          >
            确认
          </button>
        </div>
      </div>
    </div>
  );
}

// Provider
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirmState, setConfirmState] = useState<{ message: string; resolve: (v: boolean) => void } | null>(null);
  let nextId = 0;

  const addToast = useCallback((type: ToastType, message: string, duration = 3000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, type, message, duration }]);
    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const confirmFn = useCallback((message: string): Promise<boolean> => {
    return new Promise(resolve => {
      setConfirmState({ message, resolve });
    });
  }, []);

  const handleConfirmResolve = useCallback((value: boolean) => {
    confirmState?.resolve(value);
    setConfirmState(null);
  }, [confirmState]);

  // 创建 toast 函数对象
  const toastFn = addToast as ToastFn;
  toastFn.success = (msg) => addToast('success', msg);
  toastFn.error = (msg) => addToast('error', msg, 5000);
  toastFn.warning = (msg) => addToast('warning', msg, 4000);
  toastFn.info = (msg) => addToast('info', msg);
  toastFn.confirm = confirmFn;

  const value: ToastContextValue = {
    toast: toastFn,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Toast 容器 */}
      {toasts.length > 0 && (
        <div className="fixed top-20 right-4 z-[90] flex flex-col gap-2" style={{ maxWidth: '400px' }}>
          {toasts.map(t => (
            <ToastItem key={t.id} toast={t} onClose={removeToast} />
          ))}
        </div>
      )}
      {/* Confirm 弹窗 */}
      {confirmState && (
        <ConfirmDialog message={confirmState.message} onResolve={handleConfirmResolve} />
      )}
    </ToastContext.Provider>
  );
}
