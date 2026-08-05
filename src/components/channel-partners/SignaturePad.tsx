import { useEffect, useRef, useState } from "react";
import { Eraser, Loader2, PenLine } from "lucide-react";
import { uploadChannelPartnerDocument } from "@/lib/api";
import type { PartnerDocument } from "@/lib/channelPartnerTypes";

export default function SignaturePad({ onChange }: { onChange: (document?: PartnerDocument) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [hasInk, setHasInk] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const ratio = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.round(rect.width * ratio));
      canvas.height = Math.round(150 * ratio);
      const ctx = canvas.getContext("2d");
      if (ctx) { ctx.scale(ratio, ratio); ctx.lineWidth = 2.2; ctx.lineCap = "round"; ctx.strokeStyle = "#121B35"; }
      setHasInk(false); onChange(undefined);
    };
    resize();
  }, [onChange]);

  const point = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };
  const start = (event: React.PointerEvent<HTMLCanvasElement>) => {
    drawing.current = true; event.currentTarget.setPointerCapture(event.pointerId);
    const ctx = event.currentTarget.getContext("2d"); const p = point(event); ctx?.beginPath(); ctx?.moveTo(p.x, p.y);
  };
  const move = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return; const p = point(event); const ctx = event.currentTarget.getContext("2d"); ctx?.lineTo(p.x, p.y); ctx?.stroke(); setHasInk(true);
  };
  const clear = () => {
    const canvas = canvasRef.current; if (!canvas) return; canvas.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height); setHasInk(false); onChange(undefined); setError("");
  };
  const save = async () => {
    const canvas = canvasRef.current; if (!canvas || !hasInk) return;
    setBusy(true); setError("");
    try {
      const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((value) => value ? resolve(value) : reject(new Error("Could not prepare signature")), "image/png"));
      const file = new File([blob], "drawn-signature.png", { type: "image/png" });
      onChange(await uploadChannelPartnerDocument(file, "signature"));
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Signature upload failed"); }
    finally { setBusy(false); }
  };

  return <div>
    <p className="text-[12px] font-bold text-[#3F3D46] mb-1.5">Draw signature <span className="text-red-600">*</span></p>
    <canvas ref={canvasRef} className="w-full h-[150px] bg-white border border-[#C9C5CC] rounded-xl touch-none cursor-crosshair" aria-label="Signature drawing area" onPointerDown={start} onPointerMove={move} onPointerUp={() => { drawing.current = false; }} onPointerCancel={() => { drawing.current = false; }} />
    <div className="flex gap-2 mt-2">
      <button type="button" onClick={clear} className="h-9 px-3 rounded-lg border border-[#E4E0E7] text-[12px] font-bold inline-flex items-center gap-1.5"><Eraser className="size-3.5" /> Clear</button>
      <button type="button" disabled={!hasInk || busy} onClick={() => void save()} className="h-9 px-3 rounded-lg bg-[#121B35] text-white text-[12px] font-bold inline-flex items-center gap-1.5 disabled:opacity-50">{busy ? <Loader2 className="size-3.5 animate-spin" /> : <PenLine className="size-3.5" />} Use signature</button>
    </div>
    <p className="text-[10.5px] text-[#8A8690] mt-1">This is an applicant acknowledgement, not a verified electronic signature.</p>
    {error && <p role="alert" className="text-[11px] text-red-700 mt-1">{error}</p>}
  </div>;
}
