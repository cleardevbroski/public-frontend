import { useEffect, useState } from "react";
import { Loader2, Pencil, RotateCcw, Save, Smartphone } from "lucide-react";

type Props = {
  primaryNumber: string;
  whatsappNumber: string;
  updatedAt?: string | null;
  busy: boolean;
  onSave: (number: string) => Promise<void>;
};

export default function WhatsAppNumberEditor({ primaryNumber, whatsappNumber, updatedAt, busy, onSave }: Props) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(whatsappNumber);

  useEffect(() => setValue(whatsappNumber), [whatsappNumber]);

  const save = async () => {
    try { await onSave(value); setEditing(false); } catch { /* Parent displays the API error. */ }
  };

  const reset = async () => {
    try { await onSave(""); setValue(""); setEditing(false); } catch { /* Parent displays the API error. */ }
  };

  return <div className="mt-3 border-y border-[#E5E2E7] bg-[#F8F7FA] px-3 py-3">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-[#68646F]"><Smartphone className="size-3.5" />WhatsApp number</span>
        <strong className="mt-1 block break-all text-xs text-[#121B35]">{whatsappNumber || primaryNumber}</strong>
        <span className="mt-0.5 block text-[9px] text-[#77727C]">{whatsappNumber ? `Different from call number${updatedAt ? ` · updated ${new Date(updatedAt).toLocaleDateString("en-IN")}` : ""}` : "Using primary call number"}</span>
      </div>
      <button type="button" onClick={() => { setValue(whatsappNumber); setEditing((current) => !current); }} className="grid size-9 shrink-0 place-items-center rounded-md border border-[#D8D3DA] bg-white text-[#121B35]" title={editing ? "Close WhatsApp number editor" : "Use another WhatsApp number"} aria-label={editing ? "Close WhatsApp number editor" : "Use another WhatsApp number"}><Pencil className="size-4" /></button>
    </div>
    {editing && <div className="mt-3">
      <label><span className="text-[10px] font-bold uppercase text-[#68646F]">Different WhatsApp number</span><input inputMode="tel" autoComplete="tel" value={value} onChange={(event) => setValue(event.target.value.replace(/[^+\d\s()-]/g, ""))} placeholder="Enter 10-digit mobile number" className="mt-1 h-11 w-full rounded-md border border-[#D8D3DA] bg-white px-3 text-base sm:text-xs" /></label>
      <div className="mt-2 flex flex-wrap gap-2"><button type="button" onClick={() => void save()} disabled={busy || !value.trim()} className="inline-flex h-10 items-center gap-2 rounded-md bg-[#168B52] px-3 text-[11px] font-bold text-white disabled:opacity-40">{busy ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}Save number</button>{whatsappNumber && <button type="button" onClick={() => void reset()} disabled={busy} className="inline-flex h-10 items-center gap-2 rounded-md border border-[#D8D3DA] bg-white px-3 text-[11px] font-bold text-[#121B35] disabled:opacity-40"><RotateCcw className="size-4" />Use primary number</button>}</div>
    </div>}
  </div>;
}
