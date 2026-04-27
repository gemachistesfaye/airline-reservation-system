import { useState, useEffect, createContext, useContext } from 'react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`
              flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border animate-slide-in-right
              ${t.type === 'success' 
                ? 'bg-white border-green-100 text-green-800' 
                : 'bg-white border-red-100 text-red-800'}
            `}
          >
            <span className={`
              w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold
              ${t.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}
            `}>
              {t.type === 'success' ? '✓' : '!'}
            </span>
            <p className="font-medium">{t.message}</p>
            <button 
              onClick={() => setToasts(prev => prev.filter(toast => toast.id !== t.id))}
              className="ml-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes slide-in-right {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
