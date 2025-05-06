"use client";

import { useEffect, useState } from 'react';
import { PieChart as Chart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { GameTypeChartData, gameColors } from '@/lib/data/game-service';
import { useSupabase } from '@/components/providers/supabase-provider';
import { Skeleton } from '../ui/skeleton';

// רכיב טולטיפ מותאם אישית
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border rounded-md shadow-md p-2 text-sm">
        <p className="font-medium">{payload[0].name}</p>
        <p>{payload[0].value}%</p>
      </div>
    );
  }
  return null;
};

// רכיב לג'נד מותאם אישית
const CustomLegend = (props: any) => {
  const { payload } = props;
  
  return (
    <ul className="flex flex-wrap gap-4 justify-center mt-2">
      {payload.map((entry: any, index: number) => (
        <li key={`item-${index}`} className="flex items-center gap-1.5">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-xs">{entry.value}</span>
        </li>
      ))}
    </ul>
  );
};

export default function PieChart() {
  const [data, setData] = useState<GameTypeChartData[]>([
    { name: 'טורניר', value: 25, type: 'tournament' },
    { name: 'קאש', value: 25, type: 'cash' },
    { name: 'אפליקציה', value: 25, type: 'online' },
    { name: 'לייב', value: 25, type: 'live' },
  ]);
  const [loading, setLoading] = useState(true);
  const { supabase } = useSupabase();

  useEffect(() => {
    async function fetchChartData() {
      try {
        setLoading(true);
        
        // קריאה לפונקציה שיצרנו בסופאבייס
        const { data: chartData, error } = await supabase
          .rpc('get_game_type_distribution');
          
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

  return (
    loading ? (
      <div className="w-full h-[300px] flex items-center justify-center">
        <Skeleton className="w-[150px] h-[150px] rounded-full" />
      </div>
    ) : (
      <ResponsiveContainer width="100%" height="100%">
        <Chart width={400} height={300}>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            innerRadius={40}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={gameColors[entry.type]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `${value}%`} />
        </Chart>
      </ResponsiveContainer>
    )
  );
} 