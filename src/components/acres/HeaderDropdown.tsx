"use client";

import Link from "@/components/Link";
import Image from "@/components/Image";
import { Check, ArrowUpRight, Lightbulb } from "lucide-react";
import { headerDropdowns, type DropdownMenu } from "./mock-data";

interface HeaderDropdownProps {
  menuKey: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function HeaderDropdown({ menuKey, isOpen, onClose }: HeaderDropdownProps) {
  const menu = headerDropdowns[menuKey];
  if (!menu || !isOpen) return null;

  const isOwnerOrDealer = menuKey === "For Owners" || menuKey === "For Dealers / Builders";
  const isInsights = menuKey === "Insights";

  return (
    <div className="absolute top-0 left-0 w-full bg-[#121B35]/95 backdrop-blur-lg shadow-2xl z-50 border-t border-[#DDAA42]/20 animate-in fade-in slide-in-from-top-2 duration-200 text-white">
      <div className="max-w-[1200px] mx-auto px-6 py-6">
        <div className={`grid ${isOwnerOrDealer ? "grid-cols-[280px_1fr_320px]" : isInsights ? "grid-cols-[180px_180px_1fr_300px]" : "grid-cols-[180px_180px_1fr_300px]"} gap-8`}>
          {/* Left Column */}
          <div className="space-y-6">
            {menu.leftSections.map((section) => (
              <div key={section.title}>
                <h3 className="text-[11px] font-bold text-[#F2C052] tracking-wider uppercase mb-3">
                  {section.title}
                </h3>
                <ul className="space-y-2">
                  {section.items.map((item) => (
                    <li key={item.label}>
                      <Link
                        href={item.href}
                        className="text-[13px] text-white/85 hover:text-[#F2C052] transition-colors duration-200 flex items-center gap-2 font-medium"
                        onClick={onClose}
                      >
                        {item.label}
                        {item.badge && (
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                            item.badge === "FREE" 
                              ? "bg-[#DDAA42] text-[#0B1328]"
                              : "bg-[#DDAA42] text-[#0B1328]"
                          }`}>
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Contact Info */}
            {menu.contactInfo && !isOwnerOrDealer && (
              <div className="pt-4 border-t border-[#DDAA42]/25 mt-4">
                <p className="text-[11px] text-white/50 mb-1">contact us toll free on</p>
                <p className="text-[14px] font-bold text-[#F2C052]">{menu.contactInfo.tollFree}</p>
                {menu.contactInfo.timing && (
                  <p className="text-[10px] text-white/50">({menu.contactInfo.timing})</p>
                )}
              </div>
            )}
          </div>

          {/* Center Column(s) */}
          {!isOwnerOrDealer && menu.centerSections && (
            <div className="space-y-6">
              {menu.centerSections.map((section) => (
                <div key={section.title}>
                  <h3 className="text-[11px] font-bold text-[#F2C052] tracking-wider uppercase mb-3">
                    {section.title}
                  </h3>
                  <ul className="space-y-2">
                    {section.items.map((item) => (
                      <li key={item.label}>
                        <Link
                          href={item.href}
                          className="text-[13px] text-white/85 hover:text-[#F2C052] transition-colors duration-200 font-medium"
                          onClick={onClose}
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {/* Center for Insights */}
          {isInsights && menu.centerSections && (
            <div className="space-y-6">
              {menu.centerSections.map((section) => (
                <div key={section.title}>
                  <h3 className="text-[11px] font-bold text-[#F2C052] tracking-wider uppercase mb-3">
                    {section.title}
                  </h3>
                  <ul className="space-y-2">
                    {section.items.map((item) => (
                      <li key={item.label}>
                        <Link
                          href={item.href}
                          className="text-[13px] text-white/85 hover:text-[#F2C052] transition-colors duration-200 font-medium"
                          onClick={onClose}
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {/* Center for Dealers */}
          {menuKey === "For Dealers / Builders" && menu.centerSections && (
            <div className="space-y-6">
              {menu.centerSections.map((section) => (
                <div key={section.title}>
                  <h3 className="text-[11px] font-bold text-[#F2C052] tracking-wider uppercase mb-3">
                    {section.title}
                  </h3>
                  <ul className="space-y-2">
                    {section.items.map((item) => (
                      <li key={item.label}>
                        <Link
                          href={item.href}
                          className="text-[13px] text-white/85 hover:text-[#F2C052] transition-colors duration-200 font-medium"
                          onClick={onClose}
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {/* Right Card */}
          {menu.rightCard && (
            <div className="flex flex-col">
              {isOwnerOrDealer ? (
                <div className="bg-gradient-to-br from-[#DDAA42]/15 to-[#273559]/5 rounded-xl p-5 flex flex-col h-full border border-[#DDAA42]/25">
                  <div className="flex-1">
                    <h3 className="text-[16px] font-semibold text-white mb-1">
                      {menu.rightCard.title}
                    </h3>
                    <p className="text-[13px] text-white/75 mb-4">
                      {menu.rightCard.subtitle}
                    </p>
                  </div>
                  <div className="flex items-end justify-between gap-2">
                    <Link
                      href={menu.rightCard.ctaHref || "#"}
                      className="bg-gradient-to-r from-[#DDAA42] to-[#F2C052] hover:from-[#B98428] hover:to-[#DDAA42] text-[#121B35] font-bold text-[13px] px-5 py-2.5 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                      onClick={onClose}
                    >
                      {menu.rightCard.ctaText}
                    </Link>
                    {menu.rightCard.image && (
                      <div className="relative w-[80px] h-[80px]">
                        <Image
                          src={menu.rightCard.image}
                          alt="Post Property"
                          fill
                          className="object-contain opacity-80"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-br from-[#DDAA42]/15 to-[#273559]/5 rounded-xl p-5 border border-[#DDAA42]/25">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-[10px] text-white/50 tracking-wide uppercase">{menu.rightCard.title}</p>
                      <h3 className="text-[18px] font-bold text-[#F2C052]">{menu.rightCard.subtitle}</h3>
                    </div>
                    <div className="w-10 h-10 bg-[#F2C052]/10 rounded-lg flex items-center justify-center">
                      <Lightbulb className="w-5 h-5 text-[#F2C052]" />
                    </div>
                  </div>
                  {menu.rightCard.items && (
                    <ul className="space-y-2 mb-4">
                      {menu.rightCard.items.map((item, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-[12px] text-white/80">
                          <Check className="w-3.5 h-3.5 text-[#F2C052]" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                  {menu.rightCard.ctaText && (
                    <Link
                      href={menu.rightCard.ctaHref || "#"}
                      className="inline-flex items-center gap-1 text-[13px] font-semibold text-[#F2C052] hover:text-[#DDAA42] hover:underline transition-colors duration-200"
                      onClick={onClose}
                    >
                      {menu.rightCard.ctaText}
                      <ArrowUpRight className="w-4 h-4" />
                    </Link>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Contact for Owner/Dealer */}
        {isOwnerOrDealer && menu.contactInfo && (
          <div className="mt-6 pt-4 border-t border-[#DDAA42]/25 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-white/50">contact us toll free on</p>
              <p className="text-[14px] font-bold text-[#F2C052]">{menu.contactInfo.tollFree} <span className="text-[10px] text-white/50 font-normal">({menu.contactInfo.timing})</span></p>
            </div>
            <div className="text-[12px] text-white/60">
              Email us at <span className="text-[#DDAA42] font-semibold">{menu.contactInfo.email}</span> or call us at {menu.contactInfo.tollFree} (IND Toll-Free)
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
