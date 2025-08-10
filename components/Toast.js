import { useState, useEffect } from 'react';
import { FiCheck, FiAlertCircle, FiInfo, FiX } from 'react-icons/fi';

const toastTypes = {
  success: {
    icon: FiCheck,
    bgColor: 'bg-green-600',
    borderColor: 'border-green-500',
    textColor: 'text-green-100'
  },
  error: {
    icon: FiAlertCircle,
    bgColor: 'bg-red-600',
    borderColor: 'border-red-500',
    textColor: 'text-red-100'
  },
  warning: {
    icon: FiAlertCircle,
    bgColor: 'bg-yellow-600',
    borderColor: 'border-yellow-500',
    textColor: 'text-yellow-100'
  },
  info: {
    icon: FiInfo,
    bgColor: 'bg-blue-600',
    borderColor: 'border-blue-500',
    textColor: 'text-blue-100'
  }
};

export default function Toast({ 
  message, 
  type = 'info', 
  duration = 5000, 
  onClose, 
  position = 'top-right' 
}) {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  const toastStyle = toastTypes[type] || toastTypes.info;
  const IconComponent = toastStyle.icon;

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, 300);
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4';
      case 'top-center':
        return 'top-4 left-1/2 transform -translate-x-1/2';
      case 'top-right':
        return 'top-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'bottom-center':
        return 'bottom-4 left-1/2 transform -translate-x-1/2';
      case 'bottom-right':
        return 'bottom-4 right-4';
      default:
        return 'top-4 right-4';
    }
  };

  if (!isVisible) return null;

  return (
    <div className={`fixed z-50 ${getPositionClasses()}`}>
      <div
        className={`
          ${toastStyle.bgColor} ${toastStyle.borderColor} ${toastStyle.textColor}
          border rounded-lg shadow-lg p-4 min-w-80 max-w-sm
          transform transition-all duration-300 ease-in-out
          ${isExiting ? 'opacity-0 scale-95 translate-y-2' : 'opacity-100 scale-100 translate-y-0'}
        `}
      >
        <div className="flex items-start space-x-3">
          <IconComponent className="w-5 h-5 mt-0.5 flex-shrink-0" />
          
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium leading-5">
              {message}
            </p>
          </div>
          
          <button
            onClick={handleClose}
            className="ml-3 flex-shrink-0 text-current hover:opacity-75 transition-opacity"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Toast Container untuk mengelola multiple toasts
export function ToastContainer({ toasts, onRemoveToast }) {
  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          position={toast.position}
          onClose={() => onRemoveToast(toast.id)}
        />
      ))}
    </div>
  );
}

// Hook untuk menggunakan toast
export function useToast() {
  const [toasts, setToasts] = useState([]);

  const addToast = (toast) => {
    const id = Date.now() + Math.random();
    const newToast = { id, ...toast };
    setToasts(prev => [...prev, newToast]);
    return id;
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const showSuccess = (message, options = {}) => {
    return addToast({ message, type: 'success', ...options });
  };

  const showError = (message, options = {}) => {
    return addToast({ message, type: 'error', ...options });
  };

  const showWarning = (message, options = {}) => {
    return addToast({ message, type: 'warning', ...options });
  };

  const showInfo = (message, options = {}) => {
    return addToast({ message, type: 'info', ...options });
  };

  return {
    toasts,
    addToast,
    removeToast,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };
}
