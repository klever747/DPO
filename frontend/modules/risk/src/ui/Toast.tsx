import { createContext, ReactNode, useCallback, useContext, useRef, useState } from 'react';
import { Icon } from './Icon';

interface ToastItem {
  id: number;
  type: 'success' | 'error';
  message: string;
}

interface ToastContextValue {
  success: (message: string) => void;
  error: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const counter = useRef(0);

  const push = useCallback((type: ToastItem['type'], message: string) => {
    const id = ++counter.current;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const value: ToastContextValue = {
    success: (message) => push('success', message),
    error: (message) => push('error', message),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="dpo-toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`dpo-toast dpo-toast-${t.type}`}>
            <span className="dpo-toast-icon">
              <Icon name={t.type === 'success' ? 'check-circle' : 'x-circle'} size={18} />
            </span>
            <span>{t.message}</span>
            <button
              className="dpo-toast-close"
              onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
              aria-label="Cerrar"
            >
              <Icon name="close" size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Fallback silencioso si el módulo corre standalone sin el provider
    return { success: () => {}, error: () => {} };
  }
  return ctx;
}
