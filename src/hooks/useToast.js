import { useState, useCallback } from 'react';
import Toast from '@/components/ui/Toast';

export const useToast = () => {
  const [toast, setToast] = useState({ message: null, type: null });

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: null, type: null }), 3000);
  }, []);

  const ToastComponent = () => (
    <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: null, type: null })} />
  );

  return { showToast, ToastComponent };
};
