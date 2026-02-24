import { backgrounds, overlayOpacity } from '@/src/config/backgrounds';

interface PageBackgroundProps {
  page: 'home' | 'quiz' | 'readingList' | 'readingDetail';
}

export function PageBackground({ page }: PageBackgroundProps) {
  const bgImage = backgrounds[page];
  const opacity = overlayOpacity[page];

  return (
    <>
      {/* 背景图片 */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />
      {/* 半透明遮罩层 */}
      <div
        className="absolute inset-0 bg-slate-900 z-10"
        style={{ opacity }}
      />
    </>
  );
}
