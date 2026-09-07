import { AlertTriangle, ArrowLeft, Inbox, LoaderCircle, RefreshCw } from "lucide-react";
import Link from "@/components/Link";

type StateProps = {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
  onRetry?: () => void;
};

export function PublicPageSkeleton({ label = "Loading content" }: { label?: string }) {
  return (
    <main className="public-page-shell" aria-busy="true" aria-label={label}>
      <div className="public-page-hero h-48 sm:h-56" />
      <div className="public-container -mt-8 grid gap-4 pb-16 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((item) => <div key={item} className="h-48 animate-pulse rounded-[20px] bg-white shadow-[0_12px_35px_rgba(18,27,53,.06)]" />)}
      </div>
      <span className="sr-only"><LoaderCircle className="animate-spin" /> {label}</span>
    </main>
  );
}

export function PublicEmptyState({ title, description, actionHref = "/", actionLabel = "Back to home" }: StateProps) {
  return <PublicState icon={Inbox} title={title} description={description} actionHref={actionHref} actionLabel={actionLabel} />;
}

export function PublicErrorState({ title, description, actionHref = "/", actionLabel = "Back to home", onRetry }: StateProps) {
  return <PublicState icon={AlertTriangle} title={title} description={description} actionHref={actionHref} actionLabel={actionLabel} onRetry={onRetry} danger />;
}

function PublicState({ icon: Icon, title, description, actionHref, actionLabel, onRetry, danger = false }: StateProps & { icon: typeof Inbox; danger?: boolean }) {
  return (
    <section className="public-page-shell grid min-h-[64vh] place-items-center px-5 py-16 text-center">
      <div className="max-w-md">
        <span className={`mx-auto grid size-14 place-items-center rounded-2xl ${danger ? "bg-[#FFF1EF] text-[#B53A33]" : "bg-[#FFF8E8] text-[#805A0B]"}`}><Icon className="size-6" /></span>
        <h1 className="mt-5 text-[26px] font-bold tracking-[-0.03em] text-[#12172B]">{title}</h1>
        <p className="mx-auto mt-2 max-w-[46ch] text-[13px] leading-6 text-[#68646F]">{description}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {onRetry && <button type="button" onClick={onRetry} className="public-interactive inline-flex h-11 items-center gap-2 rounded-xl bg-[#121B35] px-5 text-[13px] font-bold text-white"><RefreshCw className="size-4" /> Try again</button>}
          {actionHref && <Link href={actionHref} className="public-interactive inline-flex h-11 items-center gap-2 rounded-xl border border-[#D9D5DC] bg-white px-5 text-[13px] font-bold text-[#121B35]"><ArrowLeft className="size-4" /> {actionLabel}</Link>}
        </div>
      </div>
    </section>
  );
}
