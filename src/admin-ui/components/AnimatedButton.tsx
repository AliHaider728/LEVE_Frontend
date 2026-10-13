"use client";
import React from 'react';
export interface AnimatedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'terracotta' | 'outline' | 'secondary' | 'danger' | 'white';
    size?: 'sm' | 'md' | 'lg' | 'full';
    children: React.ReactNode;
}
export const AnimatedButton: React.FC<AnimatedButtonProps> = ({ variant = 'primary', size = 'md', className = '', children, ...props }) => {
    let baseClass = "group relative inline-flex items-center justify-center whitespace-nowrap font-bold tracking-wide uppercase transition-all duration-300 rounded-xl ";
    if (size === 'sm')
        baseClass += "py-[6px] px-[20px] text-[10px] sm:text-[11px] ";
    else if (size === 'md')
        baseClass += "py-[10px] px-[24px] text-[12px] sm:text-[13px] ";
    else if (size === 'lg')
        baseClass += "py-[12px] px-[32px] text-[14px] sm:text-[15px] ";
    else if (size === 'full')
        baseClass += "w-full py-[10px] px-[20px] text-[11px] sm:text-[13px] ";
    if (variant === 'primary' || variant === 'terracotta') {
        baseClass += "bg-gradient-to-r from-[#673742] via-[#673742] to-[#673742] text-white hover:shadow-lg ";
    }
    else if (variant === 'white') {
        baseClass += "bg-white text-[#673742] border border-[#ecdfe4] hover:bg-[#FFF4F6] ";
    }
    else if (variant === 'outline') {
        baseClass += "bg-transparent text-[#181818] border border-[#181818] hover:bg-[#181818] hover:text-white ";
    }
    else if (variant === 'secondary') {
        baseClass += "bg-[#FFF4F6] text-[#382b31] hover:bg-[#E8DCCB] ";
    }
    else if (variant === 'danger') {
        baseClass += "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 ";
    }
    return (<button className={`${baseClass} ${className}`.trim()} {...props}>
      <span className="relative z-10 flex items-center justify-center gap-2">{children}</span>
    </button>);
};
