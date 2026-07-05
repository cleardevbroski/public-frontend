import { Link as RouterLink } from "react-router-dom";
import type { ComponentProps, ReactNode } from "react";

/**
 * Drop-in shim for `next/link`. Maps Next's `href` prop to React Router's `to`
 * and swallows Next-only props so call sites only need their import path changed.
 */
type NextLinkProps = Omit<ComponentProps<typeof RouterLink>, "to"> & {
  href: string;
  children?: ReactNode;
  // Next-only props — accepted and ignored.
  prefetch?: boolean;
  scroll?: boolean;
  replace?: boolean;
  passHref?: boolean;
  legacyBehavior?: boolean;
};

export default function Link({
  href,
  children,
  prefetch: _prefetch,
  scroll: _scroll,
  replace,
  passHref: _passHref,
  legacyBehavior: _legacyBehavior,
  ...rest
}: NextLinkProps) {
  return (
    <RouterLink to={href} replace={replace} {...rest}>
      {children}
    </RouterLink>
  );
}
