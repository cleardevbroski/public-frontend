"use client";

import { useState } from "react";
import { Heart, Loader2 } from "lucide-react";
import { useOptionalFavorites } from "./FavoritesContext";
import { submitPropertyActivity } from "@/lib/clientActivity";

type FavoriteProperty = { id: string; title?: string; subtitle?: string; propertyType?: string; price?: string };

export default function FavoriteButton({ property, className = "size-8 rounded-full bg-white/90 hover:bg-white shadow-sm" }: { property: FavoriteProperty; className?: string }) {
  const favorites = useOptionalFavorites();
  const [failed, setFailed] = useState(false);
  const active = favorites?.favoriteIds.has(property.id) || false;
  const loading = favorites?.loadingIds.has(property.id) || false;
  const isPersistedProperty = /^[a-f\d]{24}$/i.test(property.id);

  const toggle = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (loading) return;
    if (!favorites) return;
    setFailed(false);
    try {
      const result = await favorites.toggleFavorite(property.id);
      if (result === "saved" || result === "removed") {
        submitPropertyActivity({ propertyId: property.id, propertyTitle: property.title || "", propertyType: property.propertyType || "", location: property.subtitle || "", priceLabel: property.price || "" }, 0, result === "saved" ? "favorite" : "unfavorite");
      }
    } catch {
      setFailed(true);
      window.setTimeout(() => setFailed(false), 3000);
    }
  };

  if (!isPersistedProperty) return null;

  return (
    <button type="button" onClick={toggle} disabled={loading} aria-pressed={active} aria-label={active ? "Remove from saved properties" : "Save property"} title={failed ? "Could not update saved properties. Please try again." : active ? "Remove from saved properties" : "Save property"} className={`inline-flex items-center justify-center transition-all disabled:cursor-wait ${className} ${failed ? "ring-2 ring-red-400" : ""}`}>
      {loading ? <Loader2 className="size-4 animate-spin text-[#DDAA42]" /> : <Heart className={`size-4 transition-colors ${active ? "fill-red-500 text-red-500" : "text-[#121B35] hover:text-red-500"}`} />}
      {failed && <span className="sr-only">Could not update saved properties. Please try again.</span>}
    </button>
  );
}
