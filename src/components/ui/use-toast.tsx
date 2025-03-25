'use client';

import * as React from 'react';
import { createContext, useContext, useState } from 'react';

// Toast types
export type ToastVariant = 'default' | 'success' | 'destructive';

interface ToastProps {
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

interface ToastContextType {
  toast: (props: ToastProps) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Array<ToastProps & { id: string }>>([]);

  const toast = (props: ToastProps) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...props, id }]);
    
    // Auto-dismiss after duration
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, props.duration || 3000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`p-4 rounded-md shadow-md min-w-[300px] max-w-md animate-in slide-in-from-right 
            ${
              t.variant === 'destructive'
                ? 'bg-red-50 border-l-4 border-red-500 text-red-700'
                : t.variant === 'success'
                ? 'bg-green-50 border-l-4 border-green-500 text-green-700'
                : 'bg-white border-l-4 border-blue-500 text-gray-700'
            }`}
          >
            <div className="flex justify-between">
              <div className="font-medium">{t.title}</div>
              <button
                onClick={() => removeToast(t.id)}
                className="text-gray-400 hover:text-gray-500"
              >
                ×
              </button>
            </div>
            {t.description && <div className="text-sm mt-1">{t.description}</div>}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function toast(props: ToastProps) {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context.toast(props);
} 