import { ReactNode, useEffect } from 'react';
import { Icon } from './Icon';

interface ModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
}

export function Modal({ title, onClose, children }: ModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="dpo-modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="dpo-modal" role="dialog" aria-modal="true" aria-label={title}>
        <div className="dpo-modal-header">
          <h3>{title}</h3>
          <button className="dpo-modal-close" onClick={onClose} aria-label="Cerrar">
            <Icon name="close" size={18} />
          </button>
        </div>
        <div className="dpo-modal-body">{children}</div>
      </div>
    </div>
  );
}
