import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { WeeklyTrendPoint } from '@/types/dashboard';
import { formatCurrency, formatCompactNumber } from '@/utils/formatCurrency';

interface Props {
  data: WeeklyTrendPoint[];
  currency: string;
}

export function SalesTrendChart({ data, currency }: Props) {
  const chartData = data.map((d) => ({
    ...d,
    label: new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' }),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales trend</CardTitle>
        <CardDescription>Revenue and profit over the last 7 days</CardDescription>
      </CardHeader>
      <CardContent className="pl-0">
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} stroke="hsl(var(--muted-foreground))" />
            <YAxis
              tickLine={false}
              axisLine={false}
              fontSize={12}
              stroke="hsl(var(--muted-foreground))"
              tickFormatter={(v) => formatCompactNumber(v)}
              width={40}
            />
            <Tooltip
              contentStyle={{
                background: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: 8,
                fontSize: 12,
              }}
              formatter={(value: number, name: string) => [formatCurrency(value, currency), name]}
            />
            <Area type="monotone" dataKey="revenue" name="Revenue" stroke="hsl(var(--primary))" fill="url(#revenueGradient)" strokeWidth={2} />
            <Area type="monotone" dataKey="profit" name="Profit" stroke="hsl(var(--success))" fill="url(#profitGradient)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
