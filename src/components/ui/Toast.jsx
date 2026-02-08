'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

const Icons = {
  Shield: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>,
  Check: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
};

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