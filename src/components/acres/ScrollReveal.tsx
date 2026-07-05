"use client";

import { useEffect, useRef, type ReactNode } from "react";

interface ScrollRevealProps {
  children: ReactNode;
  direction?: "up" | "left" | "right" | "scale" | "fade";
  delay?: number;
  threshold?: number;
  className?: string;
  once?: boolean;
}

export default function ScrollReveal({
  children,
  direction = "up",
  delay = 0,
  threshold = 0.15,
  className = "",
  once = true,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("revealed", `reveal-${direction}`);
          if (once) observer.unobserve(el);
        } else if (!once) {
          el.classList.remove("revealed", `reveal-${direction}`);
        }
      },
      { threshold, rootMargin: "0px 0px -40px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [direction, threshold, once]);

  return (
    <div
      ref={ref}
      className={`scroll-reveal ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
