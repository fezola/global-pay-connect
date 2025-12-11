import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { cn } from "@/lib/utils";

const data = [
  { date: "Jan 1", balance: 1200 },
  { date: "Jan 5", balance: 1450 },
  { date: "Jan 10", balance: 1380 },
  { date: "Jan 15", balance: 1890 },
  { date: "Jan 20", balance: 2100 },
  { date: "Jan 25", balance: 1950 },
  { date: "Jan 30", balance: 2450 },
];

interface BalanceChartProps {
  className?: string;
}

export function BalanceChart({ className }: BalanceChartProps) {
  return (
    <div className={cn("h-[200px] w-full", className)}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <defs>
            <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false}
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
            dy={10}
          />
          <YAxis 
            hide 
            domain={['dataMin - 200', 'dataMax + 200']}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-lg">
                    <p className="text-xs text-muted-foreground">{payload[0].payload.date}</p>
                    <p className="text-sm font-semibold">${payload[0].value?.toLocaleString()}</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Area
            type="monotone"
            dataKey="balance"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            fill="url(#balanceGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
