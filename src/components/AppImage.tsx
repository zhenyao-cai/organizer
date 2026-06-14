interface AppImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
}

/** Native img — works reliably with /api/images/ on Netlify. */
export function AppImage({ src, alt, className = "", width, height }: AppImageProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      loading="lazy"
      decoding="async"
    />
  );
}
