"use client";

import { useRef, useState } from "react";
import { Building2, Check, FileCheck2, FileText, Loader2, Upload, UserRound, X } from "lucide-react";
import { uploadPropertyVerificationDocument, type PropertyVerificationPurpose } from "@/lib/api";

type ExistingDocument = { id: string; fileName: string; mimeType: string; purpose?: string; bytes?: number };

export type PropertySubmissionProfileInput = {
  posterType: "company" | "individual";
  consentAccepted: boolean;
  company?: {
    companyName: string;
    builderName: string;
    contactPersonName: string;
    designation: string;
    phone: string;
    panNumber: string;
    panDocument?: ExistingDocument;
    reraApplicable: boolean;
    reraNumber: string;
    reraDocument?: ExistingDocument;
    registrationDocument?: ExistingDocument;
  };
  individual?: {
    ownerName: string;
    phone: string;
    panNumber: string;
    panDocument?: ExistingDocument;
    aadhaarLast4: string;
    aadhaarDocument?: ExistingDocument;
    ownershipDocument?: ExistingDocument;
  };
};

export type ExistingPropertySubmissionProfile = {
  posterType?: "company" | "individual";
  verifiedEmail?: string;
  consentAcceptedAt?: string;
  consentAccepted?: boolean;
  company?: {
    companyName?: string; builderName?: string; contactPersonName?: string; designation?: string; phone?: string;
    panNumber?: string; panLast4?: string; panDocument?: ExistingDocument; reraApplicable?: boolean; reraNumber?: string;
    reraDocument?: ExistingDocument; registrationDocument?: ExistingDocument;
  };
  individual?: {
    ownerName?: string; phone?: string; panNumber?: string; panLast4?: string; aadhaarLast4?: string;
    panDocument?: ExistingDocument; aadhaarDocument?: ExistingDocument; ownershipDocument?: ExistingDocument;
  };
};

export default function PropertyPosterProfileForm({
  email,
  initialProfile,
  onContinue,
}: {
  email: string;
  initialProfile?: ExistingPropertySubmissionProfile;
  onContinue: (profile: PropertySubmissionProfileInput) => void;
}) {
  const [posterType, setPosterType] = useState<"company" | "individual" | "">(initialProfile?.posterType || "");
  const [company, setCompany] = useState({
    companyName: initialProfile?.company?.companyName || "",
    builderName: initialProfile?.company?.builderName || "",
    contactPersonName: initialProfile?.company?.contactPersonName || "",
    designation: initialProfile?.company?.designation || "",
    phone: initialProfile?.company?.phone || "",
    panNumber: initialProfile?.company?.panNumber || "",
    panDocument: initialProfile?.company?.panDocument,
    reraApplicable: initialProfile?.company?.reraApplicable || false,
    reraNumber: initialProfile?.company?.reraNumber || "",
    reraDocument: initialProfile?.company?.reraDocument,
    registrationDocument: initialProfile?.company?.registrationDocument,
  });
  const [individual, setIndividual] = useState({
    ownerName: initialProfile?.individual?.ownerName || "",
    phone: initialProfile?.individual?.phone || "",
    panNumber: initialProfile?.individual?.panNumber || "",
    panDocument: initialProfile?.individual?.panDocument,
    aadhaarLast4: initialProfile?.individual?.aadhaarLast4 || "",
    aadhaarDocument: initialProfile?.individual?.aadhaarDocument,
    ownershipDocument: initialProfile?.individual?.ownershipDocument,
  });
  const [consentAccepted, setConsentAccepted] = useState(Boolean(initialProfile?.consentAcceptedAt || initialProfile?.consentAccepted));
  const [error, setError] = useState("");

  const continueToProperty = () => {
    setError("");
    const phonePattern = /^[6-9]\d{9}$/;
    const panPattern = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
    if (!posterType) return setError("Choose Company Project or Individual Property.");
    if (!consentAccepted) return setError("Accept the declaration before continuing.");
    if (posterType === "company") {
      if (!company.companyName.trim() || !company.contactPersonName.trim()) return setError("Enter the company name and authorized contact person.");
      if (!phonePattern.test(company.phone)) return setError("Enter a valid 10-digit Indian contact number.");
      if (!initialProfile?.company?.panLast4 && !panPattern.test(company.panNumber.trim().toUpperCase())) return setError("Enter a valid company PAN, for example ABCDE1234F.");
      if (!company.panDocument) return setError("Upload the company PAN document.");
      if (company.reraApplicable && (!company.reraNumber.trim() || !company.reraDocument)) return setError("Enter the RERA number and upload the RERA certificate.");
      onContinue({ posterType, consentAccepted, company: { ...company, panNumber: company.panNumber.trim().toUpperCase() } });
      return;
    }
    if (!individual.ownerName.trim()) return setError("Enter the property owner's name.");
    if (!phonePattern.test(individual.phone)) return setError("Enter a valid 10-digit Indian contact number.");
    if (!initialProfile?.individual?.panLast4 && !panPattern.test(individual.panNumber.trim().toUpperCase())) return setError("Enter a valid PAN, for example ABCDE1234F.");
    if (!/^\d{4}$/.test(individual.aadhaarLast4)) return setError("Enter only the last four digits of Aadhaar.");
    if (!individual.panDocument || !individual.aadhaarDocument || !individual.ownershipDocument) return setError("Upload the PAN, masked Aadhaar and ownership documents.");
    onContinue({ posterType, consentAccepted, individual: { ...individual, panNumber: individual.panNumber.trim().toUpperCase() } });
  };

  const inputClass = "mt-2 h-11 w-full rounded-xl border border-[#CFCBD3] bg-white px-3.5 text-[14px] text-[#121B35] outline-none placeholder:text-[#77717D] focus:border-[#B98428] focus:ring-2 focus:ring-[#DDAA42]/20";
  const labelClass = "block text-[13px] font-bold text-[#35323A]";

  return (
    <section className="mx-auto max-w-4xl rounded-2xl border border-[#E4E0E7] bg-white p-5 shadow-sm md:p-8" aria-labelledby="poster-profile-title">
      <div className="max-w-2xl">
        <p className="text-xs font-bold text-[#9A7620]">Property owner verification</p>
        <h2 id="poster-profile-title" className="mt-1 text-[24px] font-bold text-[#121B35]">Who is posting this property?</h2>
        <p className="mt-2 text-[13.5px] leading-6 text-[#595560]">Choose the correct ownership type. These details are reviewed privately and are not shown on the public listing.</p>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        <TypeButton active={posterType === "company"} icon={Building2} title="Company Project" description="Builder, developer or authorized company representative" onClick={() => { setPosterType("company"); setError(""); }} />
        <TypeButton active={posterType === "individual"} icon={UserRound} title="Individual Property" description="Property owner submitting an individual listing" onClick={() => { setPosterType("individual"); setError(""); }} />
      </div>

      {posterType && <div className="mt-7 border-t border-[#ECE9EF] pt-7">
        <div className="grid gap-5 md:grid-cols-2">
          <label className={labelClass}>Verified email
            <input value={email} readOnly className={`${inputClass} bg-[#F5F4F7] text-[#4D4952]`} />
          </label>

          {posterType === "company" ? <>
            <TextField label="Company name" value={company.companyName} onChange={(value) => setCompany((state) => ({ ...state, companyName: value }))} inputClass={inputClass} labelClass={labelClass} required />
            <TextField label="Builder or developer name" value={company.builderName} onChange={(value) => setCompany((state) => ({ ...state, builderName: value }))} inputClass={inputClass} labelClass={labelClass} placeholder="Optional" />
            <TextField label="Authorized contact person" value={company.contactPersonName} onChange={(value) => setCompany((state) => ({ ...state, contactPersonName: value }))} inputClass={inputClass} labelClass={labelClass} required autoComplete="name" />
            <TextField label="Designation" value={company.designation} onChange={(value) => setCompany((state) => ({ ...state, designation: value }))} inputClass={inputClass} labelClass={labelClass} placeholder="Optional" />
            <TextField label="Contact number" value={company.phone} onChange={(value) => setCompany((state) => ({ ...state, phone: value.replace(/\D/g, "").slice(0, 10) }))} inputClass={inputClass} labelClass={labelClass} required inputMode="numeric" autoComplete="tel" />
            <TextField label="Company PAN" value={company.panNumber} onChange={(value) => setCompany((state) => ({ ...state, panNumber: value.toUpperCase().slice(0, 10) }))} inputClass={inputClass} labelClass={labelClass} placeholder={initialProfile?.company?.panLast4 ? `Saved PAN ending ${initialProfile.company.panLast4}` : "ABCDE1234F"} required={!initialProfile?.company?.panLast4} />
            <DocumentField label="Company PAN document" purpose="company-pan" value={company.panDocument} onChange={(value) => setCompany((state) => ({ ...state, panDocument: value }))} required />
            <DocumentField label="Company registration document" purpose="company-registration" value={company.registrationDocument} onChange={(value) => setCompany((state) => ({ ...state, registrationDocument: value }))} />
            <label className="md:col-span-2 flex items-start gap-3 rounded-xl border border-[#E4E0E7] bg-[#F8F7FA] p-4 text-[13px] text-[#35323A]">
              <input type="checkbox" checked={company.reraApplicable} onChange={(event) => setCompany((state) => ({ ...state, reraApplicable: event.target.checked }))} className="mt-0.5 size-4 accent-[#B98428]" />
              This company project is registered under RERA
            </label>
            {company.reraApplicable && <>
              <TextField label="Company RERA number" value={company.reraNumber} onChange={(value) => setCompany((state) => ({ ...state, reraNumber: value }))} inputClass={inputClass} labelClass={labelClass} required />
              <DocumentField label="RERA certificate" purpose="company-rera" value={company.reraDocument} onChange={(value) => setCompany((state) => ({ ...state, reraDocument: value }))} required />
            </>}
          </> : <>
            <TextField label="Property owner name" value={individual.ownerName} onChange={(value) => setIndividual((state) => ({ ...state, ownerName: value }))} inputClass={inputClass} labelClass={labelClass} required autoComplete="name" />
            <TextField label="Contact number" value={individual.phone} onChange={(value) => setIndividual((state) => ({ ...state, phone: value.replace(/\D/g, "").slice(0, 10) }))} inputClass={inputClass} labelClass={labelClass} required inputMode="numeric" autoComplete="tel" />
            <TextField label="PAN" value={individual.panNumber} onChange={(value) => setIndividual((state) => ({ ...state, panNumber: value.toUpperCase().slice(0, 10) }))} inputClass={inputClass} labelClass={labelClass} placeholder={initialProfile?.individual?.panLast4 ? `Saved PAN ending ${initialProfile.individual.panLast4}` : "ABCDE1234F"} required={!initialProfile?.individual?.panLast4} />
            <TextField label="Aadhaar last four digits" value={individual.aadhaarLast4} onChange={(value) => setIndividual((state) => ({ ...state, aadhaarLast4: value.replace(/\D/g, "").slice(0, 4) }))} inputClass={inputClass} labelClass={labelClass} placeholder="1234" required inputMode="numeric" />
            <DocumentField label="PAN document" purpose="individual-pan" value={individual.panDocument} onChange={(value) => setIndividual((state) => ({ ...state, panDocument: value }))} required />
            <DocumentField label="Masked Aadhaar document" purpose="individual-aadhaar" value={individual.aadhaarDocument} onChange={(value) => setIndividual((state) => ({ ...state, aadhaarDocument: value }))} required helper="Upload a masked copy. Do not upload an unmasked Aadhaar image." />
            <DocumentField label="Property ownership document" purpose="individual-ownership" value={individual.ownershipDocument} onChange={(value) => setIndividual((state) => ({ ...state, ownershipDocument: value }))} required />
          </>}
        </div>

        <label className="mt-6 flex items-start gap-3 rounded-xl border border-[#E2D7B8] bg-[#FFF9EC] p-4 text-[12.5px] leading-5 text-[#58491F]">
          <input type="checkbox" checked={consentAccepted} onChange={(event) => setConsentAccepted(event.target.checked)} className="mt-0.5 size-4 shrink-0 accent-[#B98428]" />
          I confirm that I am authorized to submit this property and consent to private document verification by ClearTitle One.
        </label>
      </div>}

      {error && <p role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">{error}</p>}
      <div className="mt-6 flex justify-end">
        <button type="button" onClick={continueToProperty} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#121B35] px-6 text-[14px] font-bold text-white hover:bg-[#273559] active:scale-[0.98] md:w-auto">
          <Check className="size-4" /> Continue to property details
        </button>
      </div>
    </section>
  );
}

function TypeButton({ active, icon: Icon, title, description, onClick }: { active: boolean; icon: typeof Building2; title: string; description: string; onClick: () => void }) {
  return <button type="button" onClick={onClick} aria-pressed={active} className={`flex min-h-24 items-start gap-4 rounded-xl border p-4 text-left active:scale-[0.99] ${active ? "border-[#B98428] bg-[#FFF9EC] ring-2 ring-[#DDAA42]/15" : "border-[#E4E0E7] bg-white hover:border-[#C9B679]"}`}><span className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${active ? "bg-[#DDAA42] text-[#0B1328]" : "bg-[#F3F1F5] text-[#4D4952]"}`}><Icon className="size-5" /></span><span><strong className="block text-[14px] text-[#121B35]">{title}</strong><small className="mt-1 block text-[12px] leading-5 text-[#68646F]">{description}</small></span></button>;
}

function TextField({ label, value, onChange, inputClass, labelClass, required, ...inputProps }: { label: string; value: string; onChange: (value: string) => void; inputClass: string; labelClass: string; required?: boolean } & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "required">) {
  return <label className={labelClass}>{label}{required && <span className="text-red-600"> *</span>}<input {...inputProps} value={value} onChange={(event) => onChange(event.target.value)} required={required} className={inputClass} /></label>;
}

function DocumentField({ label, purpose, value, onChange, required, helper }: { label: string; purpose: PropertyVerificationPurpose; value?: ExistingDocument; onChange: (value?: ExistingDocument) => void; required?: boolean; helper?: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const upload = async (file?: File) => {
    if (!file) return;
    if (!["application/pdf", "image/jpeg", "image/png"].includes(file.type)) return setError("Use a PDF, JPG or PNG file.");
    if (file.size > 10 * 1024 * 1024) return setError("Maximum file size is 10 MB.");
    setUploading(true); setError("");
    try { onChange(await uploadPropertyVerificationDocument(file, purpose)); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Upload failed."); }
    finally { setUploading(false); if (inputRef.current) inputRef.current.value = ""; }
  };
  return <div className="rounded-xl border border-[#E4E0E7] bg-[#FAF9FB] p-4">
    <div className="flex items-start justify-between gap-3"><div><p className="text-[13px] font-bold text-[#35323A]">{label}{required && <span className="text-red-600"> *</span>}</p><p className="mt-1 text-[11px] leading-4 text-[#68646F]">{helper || "PDF, JPG or PNG. Maximum 10 MB."}</p></div>{value && <button type="button" aria-label={`Remove ${label}`} onClick={() => onChange(undefined)} className="flex size-7 shrink-0 items-center justify-center rounded-lg text-red-600 hover:bg-red-50"><X className="size-4" /></button>}</div>
    {value ? <div className="mt-3 flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-[12px] text-[#35323A]"><FileCheck2 className="size-4 shrink-0 text-green-700" /><span className="min-w-0 flex-1 truncate">{value.fileName}</span></div> : <button type="button" disabled={uploading} onClick={() => inputRef.current?.click()} className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-[#CFCBD3] bg-white px-3 text-[12px] font-bold text-[#121B35] hover:border-[#B98428] disabled:opacity-60">{uploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}{uploading ? "Uploading" : "Choose document"}</button>}
    <input ref={inputRef} type="file" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" className="hidden" onChange={(event) => void upload(event.target.files?.[0])} />
    {error && <p role="alert" className="mt-2 flex items-start gap-1 text-[11px] text-red-700"><FileText className="mt-0.5 size-3 shrink-0" />{error}</p>}
  </div>;
}
