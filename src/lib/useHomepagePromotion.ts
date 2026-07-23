import { useEffect, useState } from "react";
import { getPropertyPromotion, type HeroSlide } from "./heroStore";

export function useHomepagePromotion(propertyId: string): HeroSlide | undefined {
  const [promotion, setPromotion] = useState<HeroSlide | undefined>(() => getPropertyPromotion(propertyId));

  useEffect(() => {
    const update = () => setPromotion(getPropertyPromotion(propertyId));
    update();
    window.addEventListener("cleartitle:hero-changed", update);
    return () => window.removeEventListener("cleartitle:hero-changed", update);
  }, [propertyId]);

  return promotion;
}
