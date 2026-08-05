import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { reportApplicationError } from "@/lib/api";

type Props = { children: ReactNode; resetKey: string; source?: string };
type State = { error: Error | null };

export default class SectionErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    void reportApplicationError({
      message: error.message || "Unknown rendering error",
      path: window.location.pathname,
      componentStack: info.componentStack || "",
      source: this.props.source || "section_boundary",
    }).catch(() => undefined);
  }

  componentDidUpdate(previousProps: Props) {
    if (this.state.error && previousProps.resetKey !== this.props.resetKey) {
      this.setState({ error: null });
    }
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <section role="alert" className="m-4 flex min-h-[280px] items-center justify-center rounded-2xl border border-[#F0D7D2] bg-white p-6 text-center shadow-sm md:m-6">
        <div className="max-w-lg">
          <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-[#FFF1EF] text-[#B33A2E]"><AlertTriangle className="size-6" /></div>
          <h2 className="mt-4 text-xl font-bold text-[#121B35]">Sorry, this section couldn&apos;t be displayed.</h2>
          <p className="mt-2 text-sm leading-6 text-[#68646F]">The rest of the website is still available. Our admin team has automatically been notified about this problem.</p>
          <button onClick={() => this.setState({ error: null })} className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-[#121B35] px-4 text-sm font-bold text-white hover:bg-[#273559]"><RefreshCw className="size-4" /> Retry section</button>
        </div>
      </section>
    );
  }
}
