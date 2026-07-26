import { useQuery } from '@tanstack/react-query';
import { Coins, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { currencyApi } from '@/services/currencyApi';
import { formatRelativeTime } from '@/utils/formatRelativeTime';

export function CurrencyWatchCard({ currency }: { currency: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['currency-rates', currency],
    queryFn: () => currencyApi.getRates(currency),
    staleTime: 15 * 60 * 1000, // exchange rates don't need to refetch every render
    retry: false,
  });

  const isLive = !isLoading && data?.available && data.rates.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coins className="h-4 w-4 text-primary" />
          Currency watch
        </CardTitle>
        <CardDescription>Live exchange rates for {currency}</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        ) : isLive ? (
          <div className="space-y-2">
            {data!.rates.map((rate) => (
              <div key={rate.currency} className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
                <span className="text-sm font-medium">1 {rate.currency}</span>
                <span className="text-sm font-semibold">
                  {rate.rateToTarget.toLocaleString('en-US', { maximumFractionDigits: 2 })} {currency}
                </span>
              </div>
            ))}
            <div className="flex items-center justify-between pt-1">
              <Badge variant="success">Live</Badge>
              {data?.fetchedAt && (
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <RefreshCw className="h-3 w-3" /> Updated {formatRelativeTime(data.fetchedAt)}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border py-8 text-center">
            <Badge variant="secondary">Unavailable right now</Badge>
            <p className="max-w-xs text-sm text-muted-foreground">
              Couldn't reach the exchange rate service. This refreshes automatically — try again shortly.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
