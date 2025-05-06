'use client';

import { PieChart as RechartsChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface PieChartProps {
  data: {
    name: string;
    value: number;
  }[];
}

// צבעים המותאמים לערכת הצבעים החדשה
const COLORS = ['var(--primary)', 'var(--accent)', 'var(--accent-secondary)', 'var(--primary-light)', 'var(--accent-light)'];

export function PieChart({ data }: PieChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <p className="text-muted-foreground">אין מספיק נתונים להצגת הגרף</p>
      </div>
    );
  }

  // פונקציה מותאמת לטולטיפ בעברית
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip bg-card p-3 border border-border shadow-sm rounded-md text-right">
          <p className="font-medium text-sm">{payload[0].name}</p>
          <p className="text-sm text-muted-foreground">{`${payload[0].value} משחקים`}</p>
        </div>
      );
    }
    return null;
  };

  // פונקציה מותאמת לתוויות
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.65;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="var(--card-foreground)" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="text-xs font-medium"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          outerRadius={85}
          innerRadius={40}
          paddingAngle={2}
          dataKey="value"
          labelLine={false}
          label={renderCustomizedLabel}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend 
          layout="horizontal" 
          verticalAlign="bottom" 
          align="center" 
          formatter={(value) => <span className="text-sm text-foreground">{value}</span>} 
          iconType="circle"
          iconSize={8}
        />
      </RechartsChart>
    </ResponsiveContainer>
  );
} 