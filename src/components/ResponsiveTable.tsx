import { useLayoutEffect, useRef, type ReactNode } from "react";

/** Keep table actions intact; simple record tables become labelled rows on phones. */
export default function ResponsiveTable({ children, label = "Records", mobile = "cards" }: { children: ReactNode; label?: string; mobile?: "cards" | "scroll" }) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const table = ref.current?.querySelector("table");
    if (!table) return;
    const headers = Array.from(table.tHead?.rows[0]?.cells || []);
    const complex = table.tHead?.rows.length !== 1 || headers.some((cell) => cell.colSpan > 1 || cell.rowSpan > 1);
    const rows = Array.from(table.tBodies).flatMap((body) => Array.from(body.rows));
    const canStack = mobile === "cards" && !complex && headers.length > 0 && rows.every((row) => row.cells.length === headers.length || row.cells.length === 1);
    ref.current!.dataset.mobile = canStack ? "cards" : "scroll";
    rows.forEach((row) => Array.from(row.cells).forEach((cell, index) => {
      cell.dataset.label = row.cells.length === 1 ? "" : headers[index]?.textContent?.trim() || (cell.querySelector('input[type="checkbox"]') ? "Select" : "Actions");
    }));
  }, [children, mobile]);
  return <div ref={ref} className="responsive-table" role="region" aria-label={label} tabIndex={0}>{children}</div>;
}
