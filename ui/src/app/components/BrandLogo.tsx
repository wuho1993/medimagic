"use client";

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
  const logoPath = typeof window !== 'undefined' && window.location.hostname.endsWith('github.io')
    ? '/medimagic/medi-magic-logo.png'
    : '/medi-magic-logo.png';

  return (
    <div className={className}>
      <Image
        src={logoPath}
        alt="Medi Magic"
        width={width}
        height={height}
        priority={priority}
        className={imageClassName ?? 'h-auto w-full object-contain'}
      />
    </div>
  );
}
