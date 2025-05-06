import React, { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface InfoCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string | number;
  className?: string;
  iconClassName?: string;
  footer?: ReactNode;
  index?: number;
}

export function InfoCard({
  title,
  value,
  description,
  icon,
  trend,
  trendValue,
  className,
  iconClassName,
  footer,
  index = 0,
}: InfoCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.3, 
        delay: index * 0.08,
        ease: 'easeOut' 
      }}
    >
      <Card className={cn("hero-kpi-card", className)}>
        <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-lg font-semibold text-text">{title}</CardTitle>
          {icon && <div className={cn("hero-kpi-icon", iconClassName)}>{icon}</div>}
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <div className={cn(
              "text-2xl font-bold",
              {
                "text-success": trend === 'up',
                "text-error": trend === 'down',
                "text-text": trend === 'neutral' || !trend,
              }
            )}>
              {value}
            </div>
            
            {trend && trendValue && (
              <div className={cn(
                "text-xs rounded-md px-1 py-0.5 flex items-center",
                {
                  "text-success bg-success/10": trend === 'up',
                  "text-error bg-error/10": trend === 'down',
                  "text-muted-foreground": trend === 'neutral',
                }
              )}>
                {trend === 'up' && <span className="ml-0.5 rtl:mr-0.5 rtl:ml-0">↑</span>}
                {trend === 'down' && <span className="ml-0.5 rtl:mr-0.5 rtl:ml-0">↓</span>}
                {trendValue}
              </div>
            )}
          </div>
          
          {description && (
            <p className="text-xs text-muted-foreground mt-2">
              {description}
            </p>
          )}
        </CardContent>
        
        {footer && (
          <CardFooter className="pt-0 px-6 pb-3">
            {footer}
          </CardFooter>
        )}
      </Card>
    </motion.div>
  );
} 