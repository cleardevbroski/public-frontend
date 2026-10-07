import { useLiveData } from "@/lib/useLiveProperties";
import { activeSocialAccounts, getSocialAccounts } from "@/lib/socialStore";
import type { SocialAccountKey } from "@/lib/api";

function BrandMark({ name }: { name: SocialAccountKey }) {
  const iconName = name === "twitter" ? "x" : name;
  const colors: Record<SocialAccountKey, string> = { instagram: "E4405F", facebook: "1877F2", youtube: "FF0000", linkedin: "0A66C2", twitter: "000000", whatsapp: "25D366" };
  return <img src={`https://cdn.simpleicons.org/${iconName}/${colors[name]}`} alt="" className={`social-mark social-mark--${name}`} />;
}

export default function SocialLinks({ compact = false }: { compact?: boolean }) {
  const accounts = useLiveData(() => getSocialAccounts(), getSocialAccounts(), ["cleartitle:social-changed"]);
  const active = activeSocialAccounts(accounts);
  if (!active.length) return null;
  return <div className={`social-links flex flex-wrap items-center ${compact ? "gap-2" : "gap-2.5"}`}>
    {active.map(({ key, account }) => <a key={key} href={account.url} target="_blank" rel="noopener noreferrer" className="social-link" data-social={key}><BrandMark name={key} /></a>)}
  </div>;
}
