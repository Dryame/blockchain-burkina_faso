import React from 'react';
import { motion } from 'motion/react';
import { Loader2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to merge Tailwind classes efficiently
 */
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  loading = false, 
  icon: Icon,
  className = '',
  ...props 
}: { 
  children: React.ReactNode; 
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline'; 
  size?: 'sm' | 'md' | 'lg'; 
  loading?: boolean; 
  icon?: any; 
  className?: string; 
  [key: string]: any; 
}) {
  const variants = {
    primary: 'bg-burkina-green text-white shadow-burkina-green/20 hover:shadow-burkina-green/40',
    secondary: 'bg-burkina-yellow text-dark-deep shadow-burkina-yellow/20 hover:shadow-burkina-yellow/40',
    danger: 'bg-burkina-red text-white shadow-burkina-red/20 hover:shadow-burkina-red/40',
    ghost: 'bg-white/5 text-text-primary border border-white/10 hover:bg-white/10',
    outline: 'bg-transparent border-2 border-burkina-green text-burkina-green hover:bg-burkina-green/10'
  };

  const sizes = {
    sm: 'px-4 py-2 text-xs rounded-xl',
    md: 'px-6 py-3 text-sm rounded-2xl',
    lg: 'px-10 py-5 text-lg rounded-[24px]'
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      disabled={loading}
      className={cn(
        'relative font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading ? (
        <Loader2 className="animate-spin" size={size === 'lg' ? 24 : 18} />
      ) : (
        <>
          {Icon && <Icon className="group-hover:translate-x-0.5 transition-transform" size={size === 'lg' ? 24 : 18} />}
          {children}
        </>
      )}
      
      {/* Glow effect */}
      <div className={cn(
        "absolute inset-0 rounded-[inherit] opacity-0 group-hover:opacity-100 transition-opacity blur-xl -z-10",
        variant === 'primary' && "bg-burkina-green/30",
        variant === 'secondary' && "bg-burkina-yellow/30",
        variant === 'danger' && "bg-burkina-red/30"
      )} />
    </motion.button>
  );
}
