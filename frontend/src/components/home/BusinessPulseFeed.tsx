import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Newspaper, TrendingUp, Lightbulb, ShieldCheck, BadgeCheck, MoreHorizontal } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { SourceAvatar } from './SourceAvatar';
import { NewsArticleDialog } from './NewsArticleDialog';
import { newsApi } from '@/services/newsApi';
import { NewsArticle } from '@/types/news';
import { formatRelativeTime } from '@/utils/formatRelativeTime';

interface PulseItem {
  icon: typeof Newspaper;
  title: string;
  snippet: string;
}

// Fallback content shown when no NEWS_API_KEY is configured, or the live
// request fails/returns nothing — evergreen small-business tips, not dated
// "news," and not attributed to a fake source. See
// backend/src/services/news.service.ts for the live GNews.io integration.
const PULSE_ITEMS: PulseItem[] = [
  {
    icon: TrendingUp,
    title: 'Small businesses are leaning harder on digital receipts',
    snippet: 'Tamper-proof digital records are becoming table stakes for supplier trust and dispute resolution.',
  },
  {
    icon: Lightbulb,
    title: 'Restock timing matters more than restock size',
    snippet: 'Businesses that reorder little-and-often report fewer stockouts than those that bulk-restock monthly.',
  },
  {
    icon: ShieldCheck,
    title: 'Outstanding customer debt adds up faster than it feels',
    snippet: 'Reviewing unpaid balances weekly, not monthly, catches payment issues before they compound.',
  },
];

export function BusinessPulseFeed() {
  const [openArticle, setOpenArticle] = useState<NewsArticle | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['business-news'],
    queryFn: newsApi.getBusinessHeadlines,
    staleTime: 30 * 60 * 1000, // free-tier news APIs are rate-limited; no need to refetch often
    retry: false,
  });

  const isLive = !isLoading && data?.configured && data.articles.length > 0;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Newspaper className="h-4 w-4 text-primary" />
            Business pulse
          </CardTitle>
          <CardDescription>
            {isLive ? 'Latest business headlines — tap any story to read more' : 'General tips for running a healthier business'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-52 w-full rounded-2xl" />)
          ) : isLive ? (
            data!.articles.map((article) => (
              <button
                key={article.url}
                onClick={() => setOpenArticle(article)}
                className="w-full overflow-hidden rounded-2xl border border-border text-left transition-shadow hover:shadow-md"
              >
                <div className="flex items-center justify-between px-4 pt-3">
                  <div className="flex items-center gap-2">
                    <SourceAvatar source={article.source} size="sm" />
                    <span className="text-sm font-semibold">{article.source}</span>
                    <BadgeCheck className="h-3.5 w-3.5 text-primary" />
                    <span className="text-xs text-muted-foreground">{formatRelativeTime(article.publishedAt)}</span>
                  </div>
                  <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                </div>

                <p className="px-4 pb-3 pt-2 text-base font-bold leading-snug">{article.title}</p>

                {article.image && (
                  <div className="h-40 w-full overflow-hidden sm:h-48">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.parentElement?.classList.add('hidden');
                      }}
                    />
                  </div>
                )}
              </button>
            ))
          ) : (
            PULSE_ITEMS.map((item) => (
              <div key={item.title} className="flex gap-3 rounded-lg border border-border p-3">
                <item.icon className="h-4 w-4 shrink-0 text-primary" />
                <div className="min-w-0">
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.snippet}</p>
                </div>
              </div>
            ))
          )}

          <div className="flex items-center justify-between pt-1">
            <Badge variant={isLive ? 'success' : 'secondary'}>{isLive ? 'Live' : 'Sample content'}</Badge>
            {!isLive && (
              <p className="text-xs text-muted-foreground">Connect a news API key to make this real-time.</p>
            )}
          </div>
        </CardContent>
      </Card>

      <NewsArticleDialog article={openArticle} onOpenChange={(open) => !open && setOpenArticle(null)} />
    </>
  );
}
