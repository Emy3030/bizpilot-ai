const COLORS = [
  'bg-red-500', 'bg-blue-500', 'bg-emerald-500', 'bg-amber-500',
  'bg-violet-500', 'bg-pink-500', 'bg-cyan-600', 'bg-orange-500',
];

function colorForSource(source: string): string {
  let hash = 0;
  for (let i = 0; i < source.length; i++) {
    hash = source.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLORS[Math.abs(hash) % COLORS.length];
}

export function SourceAvatar({ source, size = 'md' }: { source: string; size?: 'sm' | 'md' }) {
  const initial = source.trim().charAt(0).toUpperCase() || '?';
  const sizeClasses = size === 'sm' ? 'h-6 w-6 text-[10px]' : 'h-8 w-8 text-xs';

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full font-bold text-white ${colorForSource(source)} ${sizeClasses}`}
    >
      {initial}
    </div>
  );
}
