import React from 'react';
import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function Logo({ size = 'md', className }: LogoProps) {
  const sizeClasses = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-3xl"
  };

  return (
    <div className={cn("font-bold", sizeClasses[size], className)}>
      <span className="text-accent">Chip</span>
      <span className="text-card-foreground">z</span>
    </div>
  );
} 