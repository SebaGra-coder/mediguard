'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Icons } from "@/components/ui/Icons";

const Toast = ({ message, type, onClose }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!message || !mounted) return null;

  const bg = type === 'success' ? 'bg-emerald-600' : 'bg-rose-600';
  
  return createPortal(
    <div className={`fixed bottom-6 right-6 ${bg} text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-in slide-in-from-bottom-5 z-[9999]`}>
      {type === 'success' ? <Icons.Check className="w-5 h-5"/> : <Icons.Shield className="w-5 h-5"/>}
      <span>{message}</span>
    </div>,
    document.body
  );
};

export default Toast;