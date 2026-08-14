import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { ArrowDownRight, ArrowUpRight, Wallet } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CashFlow } from '@/types/dashboard';
import { formatCurrency, formatCompactNumber } from '@/utils/formatCurrency';
import { cn } from '@/utils/cn';

export function CashFlowCard({ cashFlow, currency }: { cashFlow: CashFlow; currency: string }) {
  const chartData = cashFlow.trend.map((d) => ({
    ...d,
    label: new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' }),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cash flow</CardTitle>
        <CardDescription>Money in vs. out over the last 7 days</CardDescription>
      </CardHeader>
      <CardContent className="pl-0">
        <div className="mb-4 grid grid-cols-3 gap-3 px-6">
          <div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <ArrowUpRight className="h-3 w-3 text-success" /> Inflow
            </div>
            <p className="font-display mt-0.5 text-sm font-semibold">{formatCurrency(cashFlow.inflow, currency)}</p>
          </div>
          <div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <ArrowDownRight className="h-3 w-3 text-destructive" /> Outflow
            </div>
            <p className="font-display mt-0.5 text-sm font-semibold">{formatCurrency(cashFlow.outflow, currency)}</p>
          </div>
          <div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Wallet className="h-3 w-3 text-primary" /> Net
            </div>
            <p className={cn('font-display mt-0.5 text-sm font-semibold', cashFlow.net >= 0 ? 'text-success' : 'text-destructive')}>
              {cashFlow.net >= 0 ? '+' : ''}
              {formatCurrency(cashFlow.net, currency)}
            </p>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
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
            <Bar dataKey="inflow" name="Inflow" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
            <Bar dataKey="outflow" name="Outflow" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
