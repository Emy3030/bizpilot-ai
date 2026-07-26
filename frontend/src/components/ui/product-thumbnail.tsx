import { ImageOff } from 'lucide-react';
import { getAssetUrl } from '@/utils/getAssetUrl';
import { cn } from '@/utils/cn';

interface ProductThumbnailProps {
  imageUrl?: string | null;
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'h-8 w-8 rounded-md',
  md: 'h-10 w-10 rounded-lg',
  lg: 'h-20 w-20 rounded-xl',
};

const iconSizeClasses = {
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
  lg: 'h-6 w-6',
};

/**
 * The single place product images are rendered from. Used by ProductTable,
 * BestSellingProducts, LowStockList, SaleDetailDialog line items, and the
 * ProductFormDialog preview — so a product with a broken/missing image shows
 * the same graceful fallback everywhere instead of each place inventing its
 * own placeholder.
 */
export function ProductThumbnail({ imageUrl, name, size = 'md', className }: ProductThumbnailProps) {
  const resolvedUrl = getAssetUrl(imageUrl);

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center overflow-hidden bg-secondary',
        sizeClasses[size],
        className
      )}
    >
      {resolvedUrl ? (
        <img
          src={resolvedUrl}
          alt={name}
          className="h-full w-full object-cover"
          onError={(e) => {
            // If the file 404s (e.g. lost on redeploy — see README limitations),
            // fall back to the placeholder instead of showing a broken image icon.
            e.currentTarget.style.display = 'none';
            e.currentTarget.nextElementSibling?.classList.remove('hidden');
          }}
        />
      ) : null}
      <ImageOff className={cn('text-muted-foreground', iconSizeClasses[size], resolvedUrl && 'hidden')} />
    </div>
  );
}
