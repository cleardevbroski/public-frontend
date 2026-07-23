import { PROMOTION_RANK, type PromotionSlot } from "./heroStore";

const styles: Record<PromotionSlot, { frame: string; badge: string }> = {
  diamond: {
    frame: "border-[3px] border-[#C8F1FF] shadow-[0_0_0_1px_rgba(255,255,255,0.95),0_0_24px_rgba(113,211,240,0.38)]",
    badge: "border border-white/90 bg-gradient-to-br from-white via-[#DDF7FF] to-[#91D9EC] text-[#123746]",
  },
  gold: {
    frame: "border-[3px] border-[#DDAA42] shadow-[0_0_0_1px_rgba(242,192,82,0.45),0_0_22px_rgba(221,170,66,0.3)]",
    badge: "border border-[#FFF1B8] bg-gradient-to-br from-[#FFF4C7] via-[#F2C052] to-[#B98428] text-[#342100]",
  },
  silver: {
    frame: "border-[3px] border-[#C8CCD4] shadow-[0_0_0_1px_rgba(255,255,255,0.65),0_0_20px_rgba(157,163,175,0.3)]",
    badge: "border border-white/80 bg-gradient-to-br from-white via-[#D9DCE2] to-[#9CA3AF] text-[#252A34]",
  },
};

export function promotionFrameClass(slot?: PromotionSlot | null): string {
  return slot ? styles[slot].frame : "";
}

export function promotionBadgeClass(slot?: PromotionSlot | null): string {
  return slot ? styles[slot].badge : "";
}

export function promotionRankLabel(slot?: PromotionSlot | null): string {
  return slot ? `No. ${PROMOTION_RANK[slot]}` : "";
}
