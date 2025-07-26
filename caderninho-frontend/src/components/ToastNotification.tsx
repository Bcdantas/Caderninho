import React, { useEffect, useRef } from 'react';
import { Toast } from 'bootstrap'; // Importa a classe Toast do Bootstrap JS

// Definimos a interface para o Toast
export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'danger' | 'info' | 'warning';
}

interface ToastNotificationProps {
  toast: ToastMessage;
  onClose: (id: string) => void;
}

const ToastNotification: React.FC<ToastNotificationProps> = ({ toast, onClose }) => {
  const toastRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (toastRef.current) {
      const bsToast = new Toast(toastRef.current, {
        autohide: true,
        delay: 5000, // Toast some depois de 5 segundos
      });
      bsToast.show();

      // Quando o toast sumir, chamamos o onClose para removê-lo do estado
      toastRef.current.addEventListener('hidden.bs.toast', () => {
        onClose(toast.id);
      });
    }
  }, [toast, onClose]);

  const getHeaderBgClass = (type: string) => {
    switch (type) {
      case 'success': return 'bg-success text-white';
      case 'danger': return 'bg-danger text-white';
      case 'info': return 'bg-info text-white';
      case 'warning': return 'bg-warning text-dark';
      default: return 'bg-secondary text-white';
    }
  };

  return (
    <div
      className={`toast align-items-center text-white border-0 ${getHeaderBgClass(toast.type)}`}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      ref={toastRef}
    >
      <div className="d-flex">
        <div className="toast-body">
          {toast.message}
        </div>
        <button
          type="button"
          className="btn-close btn-close-white me-2 m-auto"
          data-bs-dismiss="toast"
          aria-label="Close"
        ></button>
      </div>
    </div>
  );
};

export default ToastNotification;