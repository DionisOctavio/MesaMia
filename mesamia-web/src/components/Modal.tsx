'use client';

import { useState, useEffect, useRef } from 'react';
import { X, AlertTriangle, Info, CheckCircle } from 'lucide-react';

type ModalType = 'confirm' | 'prompt' | 'alert' | 'danger';

interface ModalProps {
  open: boolean;
  type?: ModalType;
  title: string;
  message?: string;
  placeholder?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: (value?: string) => void;
  onCancel?: () => void;
}

export function Modal({
  open,
  type = 'confirm',
  title,
  message,
  placeholder,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
}: ModalProps) {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setInputValue('');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  if (!open) return null;

  const Icon = type === 'danger' ? AlertTriangle : type === 'alert' ? Info : CheckCircle;
  const iconColor = type === 'danger' ? 'text-red-500 bg-red-50' : type === 'alert' ? 'text-blue-500 bg-blue-50' : 'text-brand bg-brand-ultra-light';
  const btnColor = type === 'danger' ? 'bg-red-500 hover:bg-red-600' : 'bg-brand hover:bg-brand-light';

  const handleConfirm = () => onConfirm(type === 'prompt' ? inputValue : undefined);
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleConfirm();
    if (e.key === 'Escape' && onCancel) onCancel();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      onKeyDown={handleKeyDown}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Panel */}
      <div className="relative w-full max-w-sm bg-white rounded-[2rem] shadow-2xl p-8 animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200 text-left">
        {/* Icon */}
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${iconColor}`}>
          <Icon className="w-6 h-6" />
        </div>

        {/* Close button */}
        {onCancel && (
          <button onClick={onCancel} className="absolute top-6 right-6 text-slate-300 hover:text-slate-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        )}

        <h3 className="text-xl font-black uppercase tracking-tight text-brand mb-2">{title}</h3>
        {message && <p className="text-slate-500 text-sm leading-relaxed mb-6">{message}</p>}

        {type === 'prompt' && (
          <input
            ref={inputRef}
            type="text"
            placeholder={placeholder || ''}
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            className="w-full px-5 py-4 bg-brand-ultra-light rounded-2xl outline-none border-2 border-transparent focus:border-brand font-bold text-brand mb-6 text-lg"
          />
        )}

        <div className={`flex gap-3 ${type === 'alert' ? 'justify-center' : ''}`}>
          {(type === 'confirm' || type === 'danger') && onCancel && (
            <button
              onClick={onCancel}
              className="flex-1 py-4 bg-slate-100 text-slate-500 font-black rounded-2xl uppercase text-[10px] tracking-widest hover:bg-slate-200 transition-colors"
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={handleConfirm}
            className={`flex-[2] py-4 text-white font-black rounded-2xl uppercase text-[10px] tracking-widest transition-colors shadow-lg ${btnColor}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Hook for easy usage ──────────────────────────────────────────────
interface ModalState {
  open: boolean;
  type: ModalType;
  title: string;
  message?: string;
  placeholder?: string;
  confirmText?: string;
  cancelText?: string;
  resolve?: (value: string | boolean | null) => void;
}

const defaultState: ModalState = {
  open: false, type: 'confirm', title: '',
};

let _setState: ((s: ModalState) => void) | null = null;

export function useModal() {
  const [state, setState] = useState<ModalState>(defaultState);
  _setState = setState;

  const modal: ModalProps = {
    ...state,
    onConfirm: (value) => {
      setState(defaultState);
      state.resolve?.(value ?? true);
    },
    onCancel: () => {
      setState(defaultState);
      state.resolve?.(null);
    },
  };

  return { modal };
}

export function showConfirm(title: string, message?: string, opts?: { danger?: boolean, confirmText?: string }): Promise<boolean> {
  return new Promise((resolve) => {
    _setState?.({
      open: true,
      type: opts?.danger ? 'danger' : 'confirm',
      title,
      message,
      confirmText: opts?.confirmText || 'Confirmar',
      cancelText: 'Cancelar',
      resolve: (v) => resolve(v === true || v === 'true'),
    });
  });
}

export function showPrompt(title: string, placeholder?: string, message?: string): Promise<string | null> {
  return new Promise((resolve) => {
    _setState?.({
      open: true,
      type: 'prompt',
      title,
      message,
      placeholder,
      confirmText: 'Aceptar',
      cancelText: 'Cancelar',
      resolve: (v) => resolve(typeof v === 'string' ? v : null),
    });
  });
}
