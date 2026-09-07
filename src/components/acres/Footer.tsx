import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";
import Link from "@/components/Link";

const groups = [
  {
    title: "Find a home",
    links: [
      ["Properties in Bangalore", "/property-in-bangalore-ffid"],
      ["New projects", "/new-projects-in-bangalore-ffid"],
      ["Villas", "/independent-house-in-bangalore-ffid"],
      ["Plots", "/residential-land-in-bangalore-ffid"],
      ["Commercial", "/commercial-property-in-bangalore-ffid"],
    ],
  },
  {
    title: "Decision tools",
    links: [
      ["Find my home", "/find-my-home"],
      ["Saved properties", "/account/saved-properties"],
      ["Price trends", "/property-rates-and-price-trends-in-bangalore-prffid"],
      ["Property guides", "/Bangalore-Real-Estate.htm"],
      ["Your account", "/account"],
    ],
  },
  {
    title: "Work with us",
    links: [
      ["Post a property", "/postproperty"],
      ["Browse dealers", "/dealers"],
      ["Channel partners", "/channel-partner"],
      ["Partner registration", "/cp-registration"],
    ],
  },
] as const;

export default function Footer() {
  return (
    <footer className="site-footer relative overflow-hidden border-t border-[#DDAA42]/25 text-white">
      <div className="pointer-events-none absolute -right-20 -top-24 size-80 rounded-full border border-[#DDAA42]/10" />
      <div className="public-container relative">
        <div className="grid gap-10 border-b border-white/10 pb-10 lg:grid-cols-[1.35fr_2fr]">
          <section>
            <p className="font-serif-display text-[28px] font-semibold tracking-[-0.03em] text-white">Clear<span className="text-[#F2C052]">Title</span> One</p>
            <p className="mt-3 max-w-[42ch] text-[12.5px] leading-6 text-[#D9DDE8]">Compare Bangalore properties using the information available in project records, RERA phases, developer documents and verified location data.</p>
            <div className="mt-5 space-y-2 text-[12px] text-[#D9DDE8]">
              <a href="tel:18004199099" className="flex items-center gap-2 hover:text-[#F2C052]"><Phone className="size-3.5 text-[#DDAA42]" /> 1800 41 99099</a>
              <a href="mailto:feedback@cleartitleone.com" className="flex items-center gap-2 hover:text-[#F2C052]"><Mail className="size-3.5 text-[#DDAA42]" /> feedback@cleartitleone.com</a>
              <p className="flex items-center gap-2"><MapPin className="size-3.5 text-[#DDAA42]" /> Bangalore, Karnataka</p>
            </div>
          </section>

          <nav className="grid grid-cols-2 gap-8 sm:grid-cols-3" aria-label="Footer navigation">
            {groups.map((group) => <div key={group.title}><h2 className="text-[12px] font-bold text-[#F2C052]">{group.title}</h2><ul className="mt-4 space-y-2.5">{group.links.map(([label, href]) => <li key={label}><Link href={href} className="group inline-flex items-center gap-1 text-[11.5px] text-[#D9DDE8] transition hover:text-white">{label}<ArrowUpRight className="size-3 opacity-0 transition group-hover:opacity-100" /></Link></li>)}</ul></div>)}
          </nav>
        </div>

        <div className="grid gap-4 py-5 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <p className="max-w-[96ch] text-[10.5px] leading-5 text-[#BFC5D3]">ClearTitle One is an advertising and property-information platform. Project information may be supplied by developers, public records or administrators. Buyers should independently verify prices, availability, documents and legal status before making a decision.</p>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-[10.5px] font-semibold text-[#D9DDE8]"><Link href="/privacy-policy" className="hover:text-[#F2C052]">Privacy policy</Link><Link href="/terms" className="hover:text-[#F2C052]">Terms of use</Link></div>
          </div>
          <p className="whitespace-nowrap text-[10.5px] text-[#BFC5D3]">© {new Date().getFullYear()} ClearTitle One</p>
        </div>
      </div>
    </footer>
  );
}
