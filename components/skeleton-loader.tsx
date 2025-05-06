"use client";

import { motion } from 'framer-motion';

interface SkeletonProps {
  className?: string;
}

export function SkeletonLoader({ className = "h-[180px]" }: SkeletonProps) {
  return (
    <div className={`w-full ${className} overflow-hidden rounded-md bg-[#F4F1ED] p-4`}>
      <div className="h-full w-full animate-pulse overflow-hidden rounded-md bg-[#E9E5DF]">
        <motion.div
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="h-full w-1/3 bg-gradient-to-r from-transparent via-[#F4F1ED]/40 to-transparent"
        />
      </div>
    </div>
  );
} 