import { ExternalLink, BadgeCheck } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { SourceAvatar } from './SourceAvatar';
import { NewsArticle } from '@/types/news';
import { formatRelativeTime } from '@/utils/formatRelativeTime';

interface Props {
  article: NewsArticle | null;
  onOpenChange: (open: boolean) => void;
}

export function NewsArticleDialog({ article, onOpenChange }: Props) {
  if (!article) return null;

  const publishedDate = new Date(article.publishedAt);
  const fullDate = Number.isNaN(publishedDate.getTime())
    ? ''
    : publishedDate.toLocaleString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' });

  return (
    <Dialog open={!!article} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto p-0">
        {article.image && (
          <div className="h-48 w-full overflow-hidden rounded-t-2xl sm:h-56">
            <img src={article.image} alt={article.title} className="h-full w-full object-cover" />
          </div>
        )}

        <div className="space-y-4 p-6">
          <div className="flex items-center gap-2">
            <SourceAvatar source={article.source} />
            <div className="flex items-center gap-1 text-sm font-medium">
              {article.source}
              <BadgeCheck className="h-3.5 w-3.5 text-primary" />
            </div>
            <span className="text-sm text-muted-foreground">· {formatRelativeTime(article.publishedAt)}</span>
          </div>

          <h2 className="font-display text-xl font-bold leading-snug tracking-tight">{article.title}</h2>

          {fullDate && <p className="text-xs text-muted-foreground">{fullDate}</p>}

          <p className="text-sm leading-relaxed text-foreground/90">{article.description}</p>

          {article.content && article.content !== article.description && (
            <p className="text-sm leading-relaxed text-muted-foreground">{article.content}</p>
          )}

          <p className="text-xs text-muted-foreground">
            This preview is provided by {article.source} via a news aggregator — the full story lives on their
            site.
          </p>

          <a href={article.url} target="_blank" rel="noreferrer">
            <Button className="w-full">
              Read full story on {article.source}
              <ExternalLink className="h-4 w-4" />
            </Button>
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
}
