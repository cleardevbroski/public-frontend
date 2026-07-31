"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { Property } from "./mock-data";
import { projectFaqs } from "@/lib/projectEnhancements";

export default function ProjectFaqs({ property }: { property: Property }) {
  const rows = projectFaqs(property);
  const [open, setOpen] = useState(0);
  if (!rows.length) return null;
  const structuredData = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: rows.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  }).replace(/</g, "\\u003c");
  return <section className="rounded-2xl border border-[#DDE2EA] bg-white p-5 shadow-sm md:p-7" aria-labelledby="faq-heading">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredData }} />
    <h2 id="faq-heading" className="text-[22px] font-extrabold text-[#172039]">Frequently Asked Questions About {property.title}</h2>
    <div className="mt-4 divide-y divide-[#E5E8EE] border-y border-[#E5E8EE]">{rows.map((faq, index) => <div key={faq.question}><button type="button" aria-expanded={open === index} onClick={() => setOpen(open === index ? -1 : index)} className="flex w-full items-center justify-between gap-4 py-4 text-left"><span className="text-[13px] font-extrabold text-[#172039]">Q: {faq.question}</span><ChevronDown className={`size-4 shrink-0 transition ${open === index ? "rotate-180" : ""}`} /></button>{open === index && <p className="pb-4 text-[13px] leading-6 text-[#596277]">{faq.answer}</p>}</div>)}</div>
  </section>;
}
