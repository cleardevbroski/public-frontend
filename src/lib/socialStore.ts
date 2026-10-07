import { createHydratedCache } from "./hydratedCache";
import { fetchAdminSocialAccounts, fetchSocialAccounts, saveSocialAccounts, type SocialAccount, type SocialAccountKey, type SocialAccounts } from "./api";

export const SOCIAL_KEYS: SocialAccountKey[] = ["instagram", "facebook", "youtube", "linkedin", "twitter", "whatsapp"];
export const SOCIAL_LABELS: Record<SocialAccountKey, string> = {
  instagram: "Instagram", facebook: "Facebook", youtube: "YouTube", linkedin: "LinkedIn", twitter: "X / Twitter", whatsapp: "WhatsApp",
};
const empty = (): SocialAccounts => Object.fromEntries(SOCIAL_KEYS.map((key) => [key, { url: "", enabled: false }])) as SocialAccounts;
const PUBLIC_EVENT = "cleartitle:social-changed";
const publicCache = createHydratedCache<SocialAccounts>(async () => {
  const data = await fetchSocialAccounts();
  return [{ ...empty(), ...(data.accounts || {}) }];
}, PUBLIC_EVENT);
const adminCache = createHydratedCache<SocialAccounts>(async () => {
  const data = await fetchAdminSocialAccounts();
  return [{ ...empty(), ...(data.accounts || {}) }];
}, PUBLIC_EVENT);

export function getSocialAccounts(): SocialAccounts { return publicCache.get()[0] || empty(); }
export function getAdminSocialAccounts(): SocialAccounts { return adminCache.get()[0] || empty(); }
export async function saveAdminSocialAccounts(accounts: SocialAccounts): Promise<SocialAccounts> {
  const data = await saveSocialAccounts(accounts);
  await Promise.all([publicCache.refresh(), adminCache.refresh()]);
  return { ...empty(), ...(data.accounts || {}) };
}

export function activeSocialAccounts(accounts: SocialAccounts): Array<{ key: SocialAccountKey; account: SocialAccount }> {
  return SOCIAL_KEYS.map((key) => ({ key, account: accounts[key] })).filter(({ account }) => account.enabled && account.url);
}
