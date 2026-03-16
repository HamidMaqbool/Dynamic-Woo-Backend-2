
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Icon } from './Icon';
import { useCRMStore } from '../store/useStore';
import { cn } from '../utils/cn';

export const Notification: React.FC = () => {
  const { notification, setNotification } = useCRMStore();

  return (
    <AnimatePresence>
      {notification && (
        <motion.div 
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 20 }}
          exit={{ opacity: 0, y: -50 }}
          className={cn(
            "fixed top-4 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 border",
            notification.type === 'success' ? "bg-emerald-500 text-white border-emerald-400" : "bg-rose-500 text-white border-rose-400"
          )}
        >
          {notification.type === 'success' ? <Icon name="check-circle" className="w-5 h-5" /> : <Icon name="alert-circle" className="w-5 h-5" />}
          <span className="font-semibold text-sm">{notification.message}</span>
          <button onClick={() => setNotification(null)} className="ml-2 hover:opacity-70">
            <Icon name="x" className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
