"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/acres/Header";
import Footer from "@/components/acres/Footer";
import PropertyForm from "@/components/admin/PropertyForm";
import EmailPropertyAuth from "@/components/property/EmailPropertyAuth";
import PropertyPosterProfileForm, { type PropertySubmissionProfileInput } from "@/components/property/PropertyPosterProfileForm";
import MyProperties from "@/components/property/MyProperties";
import { useAuth } from "@/components/acres/AuthContext";
import { fetchMyProperty } from "@/lib/api";
import type { Property } from "@/components/acres/mock-data";
import { ShieldCheck, BadgeCheck, Clock, Gift, Loader2, PlusCircle, ListChecks, PencilLine } from "lucide-react";

export default function PostPropertyPage() {
  const { user, isLoading } = useAuth();
  const [params, setParams] = useSearchParams();
  const editId = params.get("edit");
  const [editing, setEditing] = useState<Property | null>(null);
  const [submissionProfile, setSubmissionProfile] = useState<PropertySubmissionProfileInput | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editError, setEditError] = useState("");
  const view = params.get("view") === "my" ? "my" : "form";
  const canManageProperties = Boolean(user && user.role !== "guest" && user.isVerified !== false);
  const requiresPosterProfile = user?.role === "property_submitter";

  useEffect(() => {
    if (!canManageProperties || !editId) { setEditing(null); if (!editId) { setSubmissionProfile(null); setIsEditingProfile(false); } return; }
    setEditError("");
    fetchMyProperty(editId).then((data) => {
      setEditing(data.property);
      setIsEditingProfile(false);
      const profile = data.property.submissionProfile;
      if (profile?.posterType === "company") {
        setSubmissionProfile({ posterType: "company", consentAccepted: true, company: {
          companyName: profile.company?.companyName || "", builderName: profile.company?.builderName || "",
          contactPersonName: profile.company?.contactPersonName || "", designation: profile.company?.designation || "",
          phone: profile.company?.phone || "", panNumber: "", panDocument: profile.company?.panDocument,
          reraApplicable: Boolean(profile.company?.reraApplicable), reraNumber: profile.company?.reraNumber || "",
          reraDocument: profile.company?.reraDocument, registrationDocument: profile.company?.registrationDocument,
        } });
      } else if (profile?.posterType === "individual") {
        setSubmissionProfile({ posterType: "individual", consentAccepted: true, individual: {
          ownerName: profile.individual?.ownerName || "", phone: profile.individual?.phone || "", panNumber: "",
          panDocument: profile.individual?.panDocument, aadhaarLast4: profile.individual?.aadhaarLast4 || "",
          aadhaarDocument: profile.individual?.aadhaarDocument, ownershipDocument: profile.individual?.ownershipDocument,
        } });
      }
    }).catch((cause) => setEditError(cause.message));
  }, [canManageProperties, editId]);

  const setView = (next: "form" | "my") => {
    if (next === "form") { setSubmissionProfile(null); setIsEditingProfile(false); setEditing(null); }
    setParams(next === "my" ? { view: "my" } : {});
  };

  return (
    <>
      <Header />

      {/* Hero */}
      <section className="relative bg-[#0B1328] overflow-hidden">
        <div className="absolute inset-0 opacity-25">
          <img
            src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1600&q=80"
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B1328] via-[#0B1328]/90 to-[#0B1328]/70" />
        </div>
        <div className="relative z-10 max-w-[1100px] mx-auto px-5 py-11 md:py-14">
          <span className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-md border border-[#DDAA42]/30 rounded-full px-4 py-1.5 text-[#F2C052] text-[11px] font-semibold tracking-[0.2em] uppercase">
            <Gift className="size-3.5" /> List Your Property - Free
          </span>
          <h1 className="text-[34px] md:text-[48px] font-bold text-white leading-tight mt-5 max-w-2xl">
            Post Your Property on <span className="text-gold-gradient">ClearTitle One</span>
          </h1>
          <p className="text-[15px] text-white/70 mt-4 max-w-xl">
            Fill in your property details below. Our team verifies every listing for a clear title before it goes
            live, so buyers reach you with confidence.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            {[
              { icon: ShieldCheck, label: "Title Verification" },
              { icon: BadgeCheck, label: "Free Listing" },
              { icon: Clock, label: "Quick Approval" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5">
                <Icon className="size-4.5 text-[#F2C052]" />
                <span className="text-[13px] font-bold text-white">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <main className="public-main py-8 md:py-10">
        <div className="max-w-[1100px] mx-auto px-4">
          <div className="mb-5 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4">
            <Clock className="size-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-[13.5px] text-amber-800">
              <span className="font-bold">Listings are reviewed before going live.</span> After you submit, your
              property enters our verification queue. Our team checks the details and publishes it once approved.
            </p>
          </div>
          {isLoading ? (
            <div className="py-16 flex justify-center"><Loader2 className="size-8 animate-spin text-[#DDAA42]" /></div>
          ) : !canManageProperties ? (
            <EmailPropertyAuth />
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <div><p className="text-[13px] text-[#68646F]">Signed in with verified email</p><p className="font-bold text-[#121B35]">{user?.email || user?.name}</p></div>
                <div className="flex gap-2">
                  <button onClick={() => setView("form")} className={`h-10 px-4 rounded-xl text-[13px] font-bold inline-flex items-center gap-2 ${view === "form" ? "bg-[#121B35] text-white" : "bg-white text-[#121B35] border border-[#E4E0E7]"}`}><PlusCircle className="size-4" /> Post Property</button>
                  <button onClick={() => setView("my")} className={`h-10 px-4 rounded-xl text-[13px] font-bold inline-flex items-center gap-2 ${view === "my" ? "bg-[#121B35] text-white" : "bg-white text-[#121B35] border border-[#E4E0E7]"}`}><ListChecks className="size-4" /> My Properties</button>
                </div>
              </div>
              {view === "my" ? <MyProperties /> : editError ? <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-red-700">{editError}</div> : editId && !editing ? <div className="py-16 flex justify-center"><Loader2 className="size-8 animate-spin text-[#DDAA42]" /></div> : requiresPosterProfile && (!submissionProfile || isEditingProfile) ? (
                <PropertyPosterProfileForm key={`${editId || "new-profile"}-${isEditingProfile ? "edit" : "start"}`} email={user?.email || ""} initialProfile={submissionProfile || editing?.submissionProfile} onContinue={(profile) => { setSubmissionProfile(profile); setIsEditingProfile(false); }} />
              ) : (
                <>
                  {requiresPosterProfile && submissionProfile && <div className="mx-auto mb-4 flex max-w-4xl flex-wrap items-center justify-between gap-3 rounded-xl border border-[#E2D7B8] bg-[#FFF9EC] px-4 py-3"><div><p className="text-[11px] font-bold text-[#80631C]">Posting as</p><p className="text-[13px] font-bold text-[#121B35]">{submissionProfile.posterType === "company" ? submissionProfile.company?.companyName : submissionProfile.individual?.ownerName}</p></div><button type="button" onClick={() => setIsEditingProfile(true)} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#D7C58F] bg-white px-3 text-[12px] font-bold text-[#4D3A0D]"><PencilLine className="size-3.5" /> Edit owner details</button></div>}
                  <PropertyForm key={editId || "new"} mode="public" initialData={editing || undefined} submissionId={editId || undefined} submissionProfile={submissionProfile || undefined} />
                </>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
