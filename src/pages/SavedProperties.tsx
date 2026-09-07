"use client";

import { useEffect, useMemo, useState } from "react";
import { Heart } from "lucide-react";
import Header from "@/components/acres/Header";
import Footer from "@/components/acres/Footer";
import PropertyCard from "@/components/acres/PropertyCard";
import Link from "@/components/Link";
import { useAuth } from "@/components/acres/AuthContext";
import { useFavorites } from "@/components/acres/FavoritesContext";
import { fetchFavoriteProperties } from "@/lib/api";
import type { Property } from "@/components/acres/mock-data";
import { PublicEmptyState, PublicErrorState } from "@/components/acres/PublicPageState";

export default function SavedProperties() {
  const { user, setIsAuthModalOpen } = useAuth();
  const canUseFavorites = Boolean(user && user.role !== "guest" && user.isVerified !== false);
  const { favoriteIds, isLoading: favoritesLoading, error: favoritesError } = useFavorites();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!canUseFavorites) {
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
  }, [canUseFavorites]);

  const visibleProperties = useMemo(() => properties.filter((property) => favoriteIds.has(property.id)), [favoriteIds, properties]);
  const busy = loading || favoritesLoading;

  return <>
    <Header />
    <main className="public-page-shell">
      <section className="public-page-hero px-5 py-11 text-white">
        <div className="public-container relative z-10"><p className="public-page-hero__eyebrow">Your shortlist</p><div className="mt-3 flex items-center gap-4"><span className="flex size-12 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-[#F2C052]"><Heart className="size-6 fill-current" /></span><div><h1 className="display-heading text-[34px] text-white md:text-[44px]">Saved properties</h1><p className="mt-1 text-sm text-white/70">Keep promising projects together and return when you are ready to compare.</p></div></div></div>
      </section>
      <section className="public-container py-9">
        {!canUseFavorites ? <div className="public-surface rounded-[22px] p-8 text-center"><Heart className="mx-auto size-10 text-[#DDAA42]" /><h2 className="mt-3 text-xl font-bold text-[#121B35]">Sign in to use your watchlist</h2><p className="mt-2 text-sm text-[#68646F]">Saved properties are attached to your verified customer account.</p><button onClick={() => setIsAuthModalOpen(true)} className="btn-gold mt-5 h-11 rounded-xl px-6 text-sm font-bold">Sign in securely</button></div> : busy ? <div aria-label="Loading saved properties" className="grid animate-pulse gap-5 sm:grid-cols-2 lg:grid-cols-3">{[0, 1, 2].map((item) => <div key={item} className="h-80 rounded-[20px] bg-white shadow-[0_12px_35px_rgba(18,27,53,.06)]" />)}</div> : error || favoritesError ? <PublicErrorState title="We couldn't load your saved properties" description={error || favoritesError} actionHref="/property-in-bangalore-ffid" actionLabel="Browse projects" /> : visibleProperties.length === 0 ? <PublicEmptyState title="Your watchlist is empty" description="Use the heart on any published project to keep it here." actionHref="/property-in-bangalore-ffid" actionLabel="Explore properties" /> : <><div className="mb-6 flex items-center justify-between"><div><p className="public-page-hero__eyebrow">Watchlist</p><h2 className="mt-1 text-2xl font-bold text-[#121B35]">Projects you saved</h2></div><span className="rounded-full bg-[#FFF2D2] px-3 py-1 text-xs font-bold text-[#805A0B]">{visibleProperties.length} saved</span></div><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{visibleProperties.map((property) => <PropertyCard key={property.id} p={property} />)}</div></>}
      </section>
    </main>
    <Footer />
  </>;
}
