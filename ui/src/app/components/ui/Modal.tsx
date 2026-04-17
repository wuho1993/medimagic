"use client";

import { AnimatePresence, motion } from 'motion/react';
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  type?: 'info' | 'danger' | 'success';
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
}

export function Modal({ isOpen, onClose, title, description, type = 'info', confirmLabel, cancelLabel, onConfirm }: ModalProps) {
  const icons = {
    info: Info,
    danger: AlertTriangle,
    success: CheckCircle2,
  };

  const typeStyles = {
    info: 'bg-slate-900 hover:bg-slate-800 text-white',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white',
    success: 'bg-emerald-600 hover:bg-emerald-700 text-white',
  };

  const iconBgStyles = {
    info: 'bg-blue-50 text-blue-600',
    danger: 'bg-rose-50 text-rose-600',
    success: 'bg-emerald-50 text-emerald-600',
  };

  const Icon = icons[type];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="pointer-events-auto w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl"
            >
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${iconBgStyles[type]}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="mt-1 flex-1">
                    <h3 className="text-lg font-bold text-slate-900">{title}</h3>
                    {description ? <p className="mt-2 text-sm leading-relaxed text-slate-500">{description}</p> : null}
                  </div>
                  <button onClick={onClose} className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600">
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <div className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50/50 px-6 py-4">
                <button onClick={onClose} className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900">
                  {cancelLabel}
                </button>
                <button onClick={() => { onConfirm(); onClose(); }} className={`rounded-xl px-5 py-2 text-sm font-semibold shadow-sm transition-colors ${typeStyles[type]}`}>
                  {confirmLabel}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
