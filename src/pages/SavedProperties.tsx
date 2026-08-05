"use client";

import { useEffect, useMemo, useState } from "react";
import { Heart, Loader2, Search } from "lucide-react";
import Header from "@/components/acres/Header";
import Footer from "@/components/acres/Footer";
import PropertyCard from "@/components/acres/PropertyCard";
import Link from "@/components/Link";
import { useAuth } from "@/components/acres/AuthContext";
import { useFavorites } from "@/components/acres/FavoritesContext";
import { fetchFavoriteProperties } from "@/lib/api";
import type { Property } from "@/components/acres/mock-data";

export default function SavedProperties() {
  const { user, setIsAuthModalOpen } = useAuth();
  const { favoriteIds, isLoading: favoritesLoading, error: favoritesError } = useFavorites();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      setProperties([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError("");
    void fetchFavoriteProperties()
      .then((data) => { if (!cancelled) setProperties(Array.isArray(data.properties) ? data.properties : []); })
      .catch((cause) => { if (!cancelled) setError(cause instanceof Error ? cause.message : "Unable to load saved properties"); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [user]);

  const visibleProperties = useMemo(() => properties.filter((property) => favoriteIds.has(property.id)), [favoriteIds, properties]);
  const busy = loading || favoritesLoading;

  return <>
    <Header />
    <main className="public-main min-h-[70vh] bg-[#F8F7FA]">
      <section className="bg-gradient-to-br from-[#0B1328] via-[#121B35] to-[#273559] px-5 py-10 text-white">
        <div className="mx-auto max-w-[1200px]"><div className="flex items-center gap-3"><span className="flex size-12 items-center justify-center rounded-2xl bg-white/10 text-[#F2C052]"><Heart className="size-6 fill-current" /></span><div><h1 className="text-[28px] font-bold md:text-[34px]">Saved Properties</h1><p className="mt-1 text-sm text-white/70">Your personal project watchlist, available whenever you sign in.</p></div></div></div>
      </section>
      <section className="mx-auto max-w-[1200px] px-5 py-8">
        {!user ? <div className="rounded-2xl border border-[#E4E0E7] bg-white p-8 text-center shadow-sm"><Heart className="mx-auto size-10 text-[#DDAA42]" /><h2 className="mt-3 text-xl font-bold text-[#121B35]">Log in to view your watchlist</h2><p className="mt-2 text-sm text-[#68646F]">Saved properties are securely connected to your customer account.</p><button onClick={() => setIsAuthModalOpen(true)} className="btn-gold mt-5 h-11 rounded-xl px-6 text-sm font-bold">Login / Register</button></div> : busy ? <div className="flex h-52 items-center justify-center text-sm text-[#68646F]"><Loader2 className="mr-2 size-5 animate-spin text-[#DDAA42]" /> Loading saved properties…</div> : error || favoritesError ? <div role="alert" className="rounded-2xl border border-red-200 bg-white p-6 text-center text-sm text-red-700"><p className="font-bold">We couldn&apos;t load your saved properties.</p><p className="mt-1">{error || favoritesError}</p></div> : visibleProperties.length === 0 ? <div className="rounded-2xl border border-[#E4E0E7] bg-white p-8 text-center shadow-sm"><Search className="mx-auto size-10 text-[#DDAA42]" /><h2 className="mt-3 text-xl font-bold text-[#121B35]">Your watchlist is empty</h2><p className="mt-2 text-sm text-[#68646F]">Tap the heart on any available project to save it here.</p><Link href="/property-in-bangalore-ffid" className="btn-gold mt-5 inline-flex h-11 items-center rounded-xl px-6 text-sm font-bold">Explore properties</Link></div> : <><div className="mb-5 flex items-center justify-between"><h2 className="text-xl font-bold text-[#121B35]">Your shortlist</h2><span className="rounded-full bg-[#FFF2D2] px-3 py-1 text-xs font-bold text-[#815700]">{visibleProperties.length} saved</span></div><div className="flex flex-wrap gap-5">{visibleProperties.map((property) => <PropertyCard key={property.id} p={property} />)}</div></>}
      </section>
    </main>
    <Footer />
  </>;
}
