import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ReportTrendPoint } from '@/types/report';
import { formatCurrency, formatCompactNumber } from '@/utils/formatCurrency';

export function ReportTrendChart({ data, currency }: { data: ReportTrendPoint[]; currency: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue, profit & expenses</CardTitle>
        <CardDescription>Broken down by day for this period</CardDescription>
      </CardHeader>
      <CardContent className="pl-0">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
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
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="revenue" name="Revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            <Bar dataKey="profit" name="Profit" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expenses" name="Expenses" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
