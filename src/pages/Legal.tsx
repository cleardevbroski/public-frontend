import Header from "@/components/acres/Header";
import Footer from "@/components/acres/Footer";
import Link from "@/components/Link";
import { FileText, LockKeyhole } from "lucide-react";

const content = {
  privacy: {
    eyebrow: "Your information",
    title: "Privacy policy",
    intro: "This page explains the main ways ClearTitle One handles information submitted through the website.",
    sections: [
      ["Information you provide", "We may receive your name, phone number, email address, property preferences, submitted property information and files you choose to upload."],
      ["Website activity", "The website may record page visits, property views and interaction summaries so we can operate saved-property, recommendation and enquiry features."],
      ["How information is used", "Information is used to provide requested services, maintain project records, respond to enquiries, improve the website and protect the platform from misuse."],
      ["Sharing and storage", "Information may be processed by service providers used to operate hosting, databases, media storage and communications. Access is limited to the purpose for which it was supplied."],
      ["Your choices", "You can contact ClearTitle One to ask about personal information associated with your account or enquiry."],
    ],
  },
  terms: {
    eyebrow: "Platform conditions",
    title: "Terms of use",
    intro: "These terms describe the basic conditions for using ClearTitle One property information and decision tools.",
    sections: [
      ["Property information", "Listings may contain information from developers, promoters, public records, administrators and other contributors. Availability, prices and project details can change."],
      ["Independent verification", "Users should independently verify ownership, approvals, RERA records, pricing, availability and legal suitability before making a property decision."],
      ["Calculators and recommendations", "Affordability figures, rankings, distances and other calculated outputs are estimates unless the interface clearly identifies an exact project value."],
      ["Uploaded content", "A person submitting a property or document must have authority to share it and must not submit misleading, unlawful or third-party confidential material."],
      ["Acceptable use", "Do not attempt to disrupt the platform, access another person’s private workspace or use information for unlawful activity."],
    ],
  },
} as const;

export default function Legal({ kind }: { kind: keyof typeof content }) {
  const page = content[kind];
  const Icon = kind === "privacy" ? LockKeyhole : FileText;
  return <><Header /><main className="public-page-shell"><section className="public-page-hero"><div className="public-container relative z-10 py-12 sm:py-16"><span className="grid size-11 place-items-center rounded-xl bg-white/10 text-[#F2C052]"><Icon className="size-5" /></span><p className="public-page-hero__eyebrow mt-5">{page.eyebrow}</p><h1 className="display-heading mt-2 max-w-3xl text-[40px] text-white sm:text-[54px]">{page.title}</h1><p className="mt-4 max-w-[62ch] text-[14px] leading-6 text-[#D9DDE8]">{page.intro}</p></div></section><div className="public-container py-10 sm:py-14"><div className="max-w-3xl space-y-8">{page.sections.map(([title, description]) => <section key={title}><h2 className="text-[19px] font-bold text-[#12172B]">{title}</h2><p className="mt-2 text-[13.5px] leading-7 text-[#3F3D46]">{description}</p></section>)}<aside className="rounded-[18px] bg-[#FFF8E8] p-5 text-[12.5px] leading-6 text-[#5D4A25]">Questions about these terms can be sent to <a className="font-bold text-[#805A0B] underline" href="mailto:feedback@cleartitleone.com">feedback@cleartitleone.com</a>. <Link href="/" className="ml-1 font-bold text-[#805A0B] underline">Return home</Link>.</aside></div></div></main><Footer /></>;
}
