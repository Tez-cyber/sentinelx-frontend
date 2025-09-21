import { ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis } from "recharts";

export function Gauge({ value = 72, label, colorFrom = "#22d3ee", colorTo = "#8b5cf6" }: { value?: number; label: string; colorFrom?: string; colorTo?: string }) {
  const data = [{ name: label, value: Math.max(0, Math.min(100, value)) }];
  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={220}>
        <RadialBarChart
          data={data}
          startAngle={220}
          endAngle={-40}
          innerRadius={80}
          outerRadius={100}
        >
          <defs>
            <linearGradient id={`g-${label}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={colorFrom} />
              <stop offset="100%" stopColor={colorTo} />
            </linearGradient>
          </defs>
          <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
          <RadialBar
            dataKey="value"
            cornerRadius={10}
            background={{ fill: "hsl(var(--muted))" }}
            fill={`url(#g-${label})`}
          />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl font-bold text-foreground">{data[0].value}</div>
          <div className="text-xs text-muted-foreground">{label}</div>
        </div>
      </div>
    </div>
  );
}
