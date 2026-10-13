"use client";
import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle2, Info, TriangleAlert, X } from 'lucide-react';
import { useAdminUI } from '../context/AdminUIContext';
export const ToastAndDialog: React.FC = () => {
    const { toasts, dismissToast, dialogState, closeDialog } = useAdminUI();
    const [promptInput, setPromptInput] = useState('');
    useEffect(() => {
        if (dialogState?.type === 'prompt') {
            setPromptInput(dialogState.options.defaultValue || '');
        }
    }, [dialogState]);
    return (<>
      {/* Toast notifications container */}
      <div className="pointer-events-none fixed inset-x-3 top-3 z-[110] flex flex-col items-stretch gap-2 sm:inset-x-auto sm:right-5 sm:top-5 sm:w-full sm:max-w-sm" aria-label="Notifications">
        {toasts.map(item => {
            const isError = item.type === 'error';
            const Icon = item.type === 'success'
                ? CheckCircle2
                : isError
                    ? AlertCircle
                    : item.type === 'warning'
                        ? TriangleAlert
                        : Info;
            const style = item.type === 'success'
                ? 'border-[#ecdfe4] bg-white text-[#673742] shadow-emerald-900/10'
                : isError
                    ? 'border-rose-200 bg-white text-rose-900 shadow-rose-900/10'
                    : item.type === 'warning'
                        ? 'border-[#ecdfe4] bg-white text-[#673742] shadow-amber-900/10'
                        : 'border-[#ecdfe4] bg-white text-slate-800 shadow-slate-900/10';
            return (<div key={item.id} role="alert" className={`pointer-events-auto flex items-start gap-3 rounded-2xl border p-3.5 shadow-xl transition-all ${style}`}>
              <Icon className="mt-0.5 h-5 w-5 shrink-0"/>
              <span className="min-w-0 flex-1 text-sm font-semibold leading-5">{item.message}</span>
              <button type="button" onClick={() => dismissToast(item.id)} aria-label="Dismiss notification" className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer">
                <X className="h-4 w-4"/>
              </button>
            </div>);
        })}
      </div>

      {/* Confirmation & Prompt Modal */}
      {dialogState?.isOpen && (<div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-heading">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-[#ecdfe4] space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div>
              <h3 className="text-lg font-black text-[#382b31]">{dialogState.options.title}</h3>
              <p className="mt-1 text-xs text-[#382b31]/70 leading-relaxed">{dialogState.options.description}</p>
            </div>

            {dialogState.type === 'prompt' && (<div>
                {dialogState.options.inputLabel && (<label className="block text-xs font-bold text-[#382b31]/80 mb-1">
                    {dialogState.options.inputLabel}
                  </label>)}
                <input type="text" value={promptInput} onChange={e => setPromptInput(e.target.value)} placeholder={dialogState.options.placeholder} className="w-full rounded-xl border border-[#ecdfe4] px-3.5 py-2 text-xs focus:outline-[#673742]" autoFocus/>
              </div>)}

            <div className="flex justify-end gap-2.5 pt-2">
              <button type="button" onClick={() => closeDialog(dialogState.type === 'confirm' ? false : null)} className="rounded-xl px-4 py-2 text-xs font-bold text-[#382b31]/70 hover:bg-[#FFF4F6] cursor-pointer">
                {dialogState.options.cancelLabel || 'Cancel'}
              </button>
              <button type="button" onClick={() => closeDialog(dialogState.type === 'confirm' ? true : promptInput)} className={`rounded-xl px-4 py-2 text-xs font-bold text-white shadow-xs cursor-pointer ${dialogState.options.destructive
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-[#673742] hover:bg-[#673742]'}`}>
                {dialogState.options.confirmLabel || (dialogState.type === 'confirm' ? 'Confirm' : 'Submit')}
              </button>
            </div>
          </div>
        </div>)}
    </>);
};
export const ToastContainer = ToastAndDialog;
export const ConfirmationDialog = ToastAndDialog;
