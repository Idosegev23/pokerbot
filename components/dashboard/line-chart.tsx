'use client';

import { LineChart as RechartsLine, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

interface LineChartProps {
  data: {
    date: string;
    profit: number;
  }[];
}

export function LineChart({ data }: LineChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <p className="text-muted-foreground">אין מספיק נתונים להצגת הגרף</p>
      </div>
    );
  }

  // פונקציה מותאמת לטולטיפ בעברית
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip bg-card p-3 border border-border shadow-sm rounded-md">
          <p className="font-semibold text-sm">{label}</p>
          <p className={`text-sm font-medium ${payload[0].value >= 0 ? 'text-success' : 'text-destructive'}`}>
            {`רווח: ${payload[0].value >= 0 ? '+' : ''}${payload[0].value} ₪`}
          </p>
        </div>
      );
    }
    return null;
  };

  // מוצאים את הערך המינימלי והמקסימלי לדומיין של ציר ה-Y
  const profits = data.map(item => item.profit);
  const minProfit = Math.min(...profits);
  const maxProfit = Math.max(...profits);
  // מוסיפים מרווח של 20% בכל צד
  const yDomainMin = minProfit < 0 ? minProfit * 1.2 : minProfit * 0.8;
  const yDomainMax = maxProfit > 0 ? maxProfit * 1.2 : maxProfit * 0.8;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsLine
        data={data}
        margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
        <XAxis 
          dataKey="date"
          tick={{ fill: 'var(--foreground)', fontSize: 12 }}
          tickMargin={10}
          axisLine={{ stroke: 'var(--border)' }}
        />
        <YAxis 
          width={60}
          tickFormatter={(value) => `${value} ₪`}
          domain={[yDomainMin, yDomainMax]}
          tick={{ fill: 'var(--foreground)', fontSize: 12 }}
          tickMargin={10}
          axisLine={{ stroke: 'var(--border)' }}
        />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine y={0} stroke="var(--border)" strokeDasharray="2 2" />
        <Line
          type="monotone"
          dataKey="profit"
          stroke="var(--accent)"
          strokeWidth={3}
          activeDot={{ r: 6, fill: 'var(--accent)' }}
          dot={{ r: 4, strokeWidth: 2, stroke: 'var(--accent)', fill: 'var(--background)' }}
        />
      </RechartsLine>
    </ResponsiveContainer>
  );
} 