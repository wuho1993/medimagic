import Image from 'next/image';

interface BrandLogoProps {
  className?: string;
  imageClassName?: string;
  priority?: boolean;
  width?: number;
  height?: number;
}

export default function BrandLogo({
  className,
  imageClassName,
  priority = false,
  width = 220,
  height = 72,
}: BrandLogoProps) {
  return (
    <div className={className}>
      <Image
        src="/medi-magic-logo.png"
        alt="Medi Magic"
        width={width}
        height={height}
        priority={priority}
        className={imageClassName ?? 'h-auto w-full object-contain'}
      />
    </div>
  );
}
