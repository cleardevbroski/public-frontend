"use client";

import { useEffect, useState } from "react";
import { fetchAdvertisements } from "@/lib/api";

type Props = { side: "left" | "right" };
type Advertisement = { id: string; image: string; alt: string; link: string; placement: "left" | "right" };

export default function AdRail({ side }: Props) {
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);

  useEffect(() => {
    fetchAdvertisements()
      .then((data) => setAdvertisements((data.advertisements || []).filter((ad: Advertisement) => ad.placement === side)))
      .catch(() => setAdvertisements([]));
  }, [side]);

  return (
    <aside className="hidden min-[1500px]:block" aria-label={`${side} advertisement space`}>
      <div className="sticky top-32 space-y-5">
        {[0, 1].map((slot) => {
          const ad = advertisements[slot];
          if (!ad) return <div key={slot} className="min-h-60 rounded-xl bg-white" aria-hidden="true" />;
          const image = <img src={ad.image} alt={ad.alt || "Advertisement"} className="h-60 w-full rounded-xl object-cover" />;
          return ad.link ? <a key={ad.id} href={ad.link} target="_blank" rel="noreferrer" className="block">{image}</a> : <div key={ad.id}>{image}</div>;
        })}
      </div>
    </aside>
  );
}
