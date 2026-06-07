import { BannerInfo } from '../types';

interface BannerProps {
  banner: BannerInfo | null;
}

export default function Banner({ banner }: BannerProps) {
  if (!banner) return null;

  const colorMap: Record<string, string> = {
    success: 'bg-emerald-500',
    error: 'bg-red-500',
    warning: 'bg-amber-500',
    info: 'bg-blue-500',
  };

  return (
    <div className={`fixed top-16 left-0 right-0 px-4 py-3 flex items-center justify-center gap-2 z-50 animate-fade-in text-white text-sm ${colorMap[banner.type] || 'bg-blue-500'}`}>
      <span>{banner.message}</span>
    </div>
  );
}