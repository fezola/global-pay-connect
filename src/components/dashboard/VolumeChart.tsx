import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { cn } from "@/lib/utils";

const data = [
  { day: "Mon", deposits: 420, payouts: 180 },
  { day: "Tue", deposits: 580, payouts: 220 },
  { day: "Wed", deposits: 350, payouts: 150 },
  { day: "Thu", deposits: 720, payouts: 380 },
  { day: "Fri", deposits: 890, payouts: 420 },
  { day: "Sat", deposits: 450, payouts: 200 },
  { day: "Sun", deposits: 380, payouts: 160 },
];

interface VolumeChartProps {
  className?: string;
}

export function VolumeChart({ className }: VolumeChartProps) {
  return (
    <div className={cn("h-[200px] w-full", className)}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <XAxis 
            dataKey="day" 
            axisLine={false} 
            tickLine={false}
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
            dy={10}
          />
          <YAxis hide />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-lg">
                    <p className="text-xs font-medium text-muted-foreground mb-1">{label}</p>
                    <div className="space-y-0.5">
                      <p className="text-xs">
                        <span className="inline-block w-2 h-2 rounded-full bg-primary mr-1.5" />
                        Deposits: ${payload[0].value}
                      </p>
                      <p className="text-xs">
                        <span className="inline-block w-2 h-2 rounded-full bg-muted-foreground mr-1.5" />
                        Payouts: ${payload[1].value}
                      </p>
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar 
            dataKey="deposits" 
            fill="hsl(var(--primary))" 
            radius={[4, 4, 0, 0]}
            maxBarSize={32}
          />
          <Bar 
            dataKey="payouts" 
            fill="hsl(var(--muted-foreground))" 
            radius={[4, 4, 0, 0]}
            maxBarSize={32}
            opacity={0.5}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
