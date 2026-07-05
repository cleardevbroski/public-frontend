import type { CSSProperties, ImgHTMLAttributes } from "react";

/**
 * Drop-in shim for `next/image`. Renders a plain `<img>` and translates Next's
 * `fill` layout (absolutely fill the positioned parent) into inline styles.
 * Next-only props (`priority`, `sizes`, `quality`, `loader`, `placeholder`,
 * `blurDataURL`, `unoptimized`) are accepted and ignored so call sites only need
 * their import path changed.
 */
type NextImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & {
  src: string;
  fill?: boolean;
  priority?: boolean;
  sizes?: string;
  quality?: number;
  loader?: unknown;
  placeholder?: string;
  blurDataURL?: string;
  unoptimized?: boolean;
};

export default function Image({
  src,
  alt = "",
  fill,
  priority: _priority,
  sizes: _sizes,
  quality: _quality,
  loader: _loader,
  placeholder: _placeholder,
  blurDataURL: _blurDataURL,
  unoptimized: _unoptimized,
  style,
  ...rest
}: NextImageProps) {
  const fillStyle: CSSProperties | undefined = fill
    ? { position: "absolute", inset: 0, width: "100%", height: "100%", ...style }
    : style;

  return <img src={src} alt={alt} style={fillStyle} {...rest} />;
}
