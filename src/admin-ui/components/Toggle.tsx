"use client";
import React from 'react';
export const Toggle: React.FC<{
    checked: boolean;
    onChange: (next: boolean) => void;
    label?: string;
    description?: string;
    className?: string;
}> = ({ checked, onChange, label, description, className = '' }) => (<label className={`flex cursor-pointer items-start gap-3 group ${className}`}>
    <div className="relative mt-0.5 shrink-0">
      <input type="checkbox" className="sr-only focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#673742]" checked={checked} onChange={e => onChange(e.target.checked)}/>
      {/* Track */}
      <div className={`h-5 w-9 rounded-full transition-all duration-200 group-hover:shadow-sm ${checked
        ? 'bg-gradient-to-r from-[#673742] to-[#673742] border-transparent shadow-sm'
        : 'bg-slate-300 border border-slate-400 group-hover:border-slate-500 group-hover:bg-slate-400'}`}/>
      {/* Thumb */}
      <div className={`absolute top-[2px] left-[2px] h-4 w-4 rounded-full transition-transform duration-200 ${checked
        ? 'bg-white translate-x-[16px] shadow-sm'
        : 'bg-white translate-x-0 shadow-sm border border-slate-300'}`}/>
    </div>
    {(label || description) && (<div>
        {label && <span className="text-sm font-bold text-[#382b31] group-hover:text-black transition-colors">{label}</span>}
        {description && (<p className="mt-0.5 text-xs text-[#382b31]/50">{description}</p>)}
      </div>)}
  </label>);
