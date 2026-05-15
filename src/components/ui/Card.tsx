import React from 'react';
import Tilt from 'react-parallax-tilt';
import { motion } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Card({ 
  children, 
  className = '', 
  hoverEffect = true,
  glare = true,
  onClick
}: {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
  glare?: boolean;
  onClick?: () => void;
}) {
  const content = (
    <div 
      onClick={onClick}
      className={cn(
        "glass-card p-8 h-full relative overflow-hidden group",
        onClick ? "cursor-pointer" : "",
        className
      )}
    >
      {/* Background patterns */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-burkina-green/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-burkina-green/10 transition-colors" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-burkina-red/5 blur-3xl rounded-full translate-y-1/2 -translate-x-1/2 group-hover:bg-burkina-red/10 transition-colors" />
      
      {/* Scanline effect */}
      <div className="absolute inset-0 scanline opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="relative z-10 h-full flex flex-col">
        {children}
      </div>
    </div>
  );

  if (!hoverEffect) return content;

  return (
    <Tilt
      tiltMaxAngleX={5}
      tiltMaxAngleY={5}
      perspective={1000}
      glareEnable={glare}
      glareMaxOpacity={0.1}
      glareColor="#ffffff"
      glarePosition="all"
      className="h-full"
    >
      {content}
    </Tilt>
  );
}
