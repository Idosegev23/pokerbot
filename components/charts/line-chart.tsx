"use client";

import { useEffect, useState } from 'react';
import { LineChart as Chart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ProfitChartData } from '@/lib/data/game-service';
import { useSupabase } from '@/components/providers/supabase-provider';
import { Skeleton } from '../ui/skeleton';

// רכיב טולטיפ מותאם אישית
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border rounded-md shadow-md p-2 text-sm">
        <p className="font-medium">{label}</p>
        <p className="text-blue-500">
          {payload[0].value >= 0 ? '+' : ''}
          {payload[0].value.toLocaleString()} ₪
        </p>
      </div>
    );
  }
  return null;
};

export default function LineChart() {
  const [data, setData] = useState<ProfitChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [animationActive, setAnimationActive] = useState(true);
  const { supabase } = useSupabase();

  useEffect(() => {
    async function fetchChartData() {
      try {
        setLoading(true);
        
        // קריאה לפונקציה שיצרנו בסופאבייס
        const { data: chartData, error } = await supabase
          .rpc('get_profit_chart_data');
          
        if (error) {
          console.error('שגיאה בקבלת נתוני גרף:', error);
          return;
        }
        
        if (chartData) {
          setData(chartData);
        }
      } catch (error) {
        console.error('שגיאה בקבלת נתוני גרף:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchChartData();
  }, [supabase]);

  // ביטול האנימציה אחרי הרנדור הראשוני
  useEffect(() => {
    if (!loading && data.length > 0) {
      const timer = setTimeout(() => {
        setAnimationActive(false);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [loading, data]);

  return (
    loading ? (
      <div className="w-full h-[300px] flex items-center justify-center">
        <Skeleton className="w-full h-full" />
      </div>
    ) : (
      <ResponsiveContainer width="100%" height="100%">
        <Chart
          data={data}
          margin={{
            top: 5,
            right: 20,
            left: 0,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip formatter={(value) => `₪${value}`} />
          <Line
            type="monotone"
            dataKey="profit"
            stroke="#C7A869"
            strokeWidth={2}
            dot={{ strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6 }}
            isAnimationActive={animationActive}
          />
        </Chart>
      </ResponsiveContainer>
    )
  );
} 