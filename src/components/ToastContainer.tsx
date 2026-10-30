import React from 'react';
import { ToastItem } from '../types';

interface ToastContainerProps {
  toasts: ToastItem[];
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts }) => {
  return (
    <div id="toast-container" role="status" aria-live="polite">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast-notification toast-${toast.type}${toast.visible ? ' is-visible' : ''}`}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
};
