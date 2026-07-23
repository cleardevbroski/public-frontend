import { Mail, Phone } from "lucide-react";
import { footerColumns } from "./mock-data";

const SocialIcon = ({ d }: { d: string }) => (
  <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden>
    <path d={d} />
  </svg>
);
const socials: { name: string; d: string }[] = [
  { name: "Facebook", d: "M13 22v-8h3l1-4h-4V7.5C13 6.4 13.4 5.5 15 5.5h2V2c-.3 0-1.5-.2-2.7-.2C11.6 1.8 10 3.6 10 6.8V10H7v4h3v8h3z" },
  { name: "Twitter", d: "M22 5.8c-.7.3-1.5.5-2.4.6.9-.5 1.5-1.3 1.8-2.3-.8.5-1.7.8-2.6 1-1.5-1.6-4-1.7-5.6-.2-1 1-1.4 2.4-1 3.8C8.7 8.5 5.6 6.9 3.5 4.3c-1.1 2-.5 4.4 1.4 5.6-.7 0-1.3-.2-1.9-.5 0 2 1.4 3.8 3.4 4.2-.6.2-1.3.2-2 .1.5 1.7 2.1 2.9 4 3-1.5 1.2-3.5 1.9-5.6 1.7C5 19.7 7.3 20.5 9.6 20.5c8.4 0 13-7 13-13v-.6c.9-.6 1.7-1.4 2.4-2.3l-3 1.2z" },
  { name: "Instagram", d: "M12 2.2c3.2 0 3.6 0 4.8.1 1.2.1 1.8.2 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.4 1 .4 2.2.1 1.2.1 1.6.1 4.8s0 3.6-.1 4.8c-.1 1.2-.2 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1 .4-2.2.4-1.2.1-1.6.1-4.8.1s-3.6 0-4.8-.1c-1.2-.1-1.8-.2-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.4-1-.4-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.8c.1-1.2.2-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1-.4 2.2-.4C8.4 2.2 8.8 2.2 12 2.2zm0 1.8c-3.1 0-3.5 0-4.7.1-1.1 0-1.7.2-2 .3-.5.2-.9.4-1.3.8-.4.4-.6.8-.8 1.3-.1.4-.3 1-.3 2-.1 1.2-.1 1.6-.1 4.7s0 3.5.1 4.7c0 1.1.2 1.7.3 2 .2.5.4.9.8 1.3.4.4.8.6 1.3.8.4.1 1 .3 2 .3 1.2.1 1.6.1 4.7.1s3.5 0 4.7-.1c1.1 0 1.7-.2 2-.3.5-.2.9-.4 1.3-.8.4-.4.6-.8.8-1.3.1-.4.3-1 .3-2 .1-1.2.1-1.6.1-4.7s0-3.5-.1-4.7c0-1.1-.2-1.7-.3-2-.2-.5-.4-.9-.8-1.3-.4-.4-.8-.6-1.3-.8-.4-.1-1-.3-2-.3-1.2-.1-1.6-.1-4.7-.1zm0 3a5 5 0 110 10 5 5 0 010-10zm0 1.8a3.2 3.2 0 100 6.4 3.2 3.2 0 000-6.4zm5.4-1a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" },
  { name: "YouTube", d: "M21.6 7.2c-.2-.9-.9-1.6-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4c-.9.2-1.6.9-1.8 1.8C2 8.8 2 12 2 12s0 3.2.4 4.8c.2.9.9 1.6 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4c.9-.2 1.6-.9 1.8-1.8.4-1.6.4-4.8.4-4.8s0-3.2-.4-4.8zM10 15V9l5.2 3-5.2 3z" },
  { name: "LinkedIn", d: "M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zM8.3 18.3H5.7V10h2.6v8.3zM7 8.8a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm11.3 9.5h-2.6v-4c0-1 0-2.3-1.4-2.3-1.4 0-1.6 1.1-1.6 2.2v4.1H10V10h2.5v1.1h.04c.35-.67 1.2-1.36 2.46-1.36 2.6 0 3.1 1.7 3.1 4v4.55z" },
];

const footerHref = (label: string) =>
  ({
    "Mobile Apps": "/Bangalore-Real-Estate.htm",
    "Our Services": "/property-in-bangalore-ffid",
    "Price Trends": "/property-rates-and-price-trends-in-bangalore-prffid",
    "Post your property": "/postproperty",
    "Real Estate Investments": "/new-projects-in-bangalore-ffid",
    "Builders in India": "/new-projects-in-bangalore-ffid",
    "Area Converter": "/area-converter-utyp",
    Articles: "/Bangalore-Real-Estate.htm",
    "Rent Receipt": "/online-rent-receipt",
    "Customer Service": "/Bangalore-Real-Estate.htm",
    Sitemap: "/Bangalore-Real-Estate.htm",
    Testimonials: "/Bangalore-Real-Estate.htm",
  }[label] ?? "/Bangalore-Real-Estate.htm");

export default function Footer() {
  return (
    <footer className="bg-[#121B35] text-white pt-16 pb-8 border-t border-[#DDAA42]/25 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-gradient-to-bl from-[#DDAA42]/5 to-transparent rounded-full blur-3xl" />
      
      <div className="max-w-[1200px] mx-auto px-3 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 relative z-10">
        {Object.entries(footerColumns).map(([col, links]) => (
          <div key={col}>
            <h4 className="text-[15px] font-bold text-[#DDAA42] mb-4">{col}</h4>
            <ul className="space-y-2">
              {links.map((l) => (
                <li key={l}>
                  <a
                    href={footerHref(l)}
                    className="text-[12px] text-white/60 hover:text-[#273559] hover:underline transition-colors duration-200"
                  >
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <h4 className="text-[15px] font-bold text-[#DDAA42] mb-4">Contact Us</h4>
          <p className="text-[12px] text-white/60 mb-2 flex items-center gap-2">
            <Phone className="size-3.5 text-[#DDAA42]" /> Toll Free: 1800 41 99099
          </p>
          <p className="text-[12px] text-white/60 mb-4 flex items-center gap-2">
            <Mail className="size-3.5 text-[#DDAA42]" /> feedback@cleartitleone.com
          </p>

          <h4 className="text-[15px] font-bold text-[#DDAA42] mb-3 mt-6">Connect with us</h4>
          <div className="flex items-center gap-2">
            {socials.map((s) => (
              <a
                key={s.name}
                href="/Bangalore-Real-Estate.htm"
                className="size-8 rounded-full bg-white/10 hover:bg-[#DDAA42]/30 hover:text-[#273559] flex items-center justify-center transition-all duration-200"
                aria-label={s.name}
              >
                <SocialIcon d={s.d} />
              </a>
            ))}
          </div>

          <h4 className="text-[15px] font-bold text-[#DDAA42] mt-6 mb-3">Download the App</h4>
          <div className="flex gap-2">
            <a href="/Bangalore-Real-Estate.htm" className="block">
              <div className="h-9 px-3 bg-black/40 border border-white/15 rounded-lg flex items-center gap-2 text-[11px] hover:border-[#DDAA42]/50 transition-colors duration-200">
                <span className="text-white/50">Get it on</span>
                <span className="font-semibold">Google Play</span>
              </div>
            </a>
            <a href="/Bangalore-Real-Estate.htm" className="block">
              <div className="h-9 px-3 bg-black/40 border border-white/15 rounded-lg flex items-center gap-2 text-[11px] hover:border-[#DDAA42]/50 transition-colors duration-200">
                <span className="text-white/50">App Store</span>
              </div>
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 mt-10 pt-6 relative z-10">
        <div className="max-w-[1200px] mx-auto px-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <p className="text-[11px] text-white/40 max-w-3xl leading-relaxed">
            Disclaimer: ClearTitle One is only an advertising platform to enable interaction between
            sellers and customers/buyers/users and is neither an agent of nor advising
            sellers/customers/buyers/users. ClearTitle One cannot and does not warrant or guarantee
            that any listing is accurate, complete or current.
          </p>
          <p className="text-[11px] text-white/40 whitespace-nowrap">
            © {new Date().getFullYear()} ClearTitle One — Premium Real Estate Platform
          </p>
        </div>
      </div>
    </footer>
  );
}
