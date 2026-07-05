"use client";
import Image from "@/components/Image";
import Link from "@/components/Link";
import { useState, useRef, useEffect } from "react";
import { ChevronDown, Headset, Menu, MapPin, ChevronRightCircle, X, ChevronUp, ShieldCheck, Phone, Mail, Clock, User } from "lucide-react";
import { navItems, headerDropdowns } from "./mock-data";
import HeaderDropdown from "./HeaderDropdown";
import { useAuth } from "./AuthContext";
import AuthModal from "./AuthModal";
import ProfileDrawer from "./ProfileDrawer";

export default function Header() {
  const { user, setIsAuthModalOpen, setIsProfileDrawerOpen } = useAuth();
  const [city, setCity] = useState("Bangalore");
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = (label: string) => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
    setActiveDropdown(label);
  };

  const handleMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 150);
  };

  const handleDropdownMouseEnter = () => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
  };

  useEffect(() => {
    return () => {
      if (dropdownTimeoutRef.current) {
        clearTimeout(dropdownTimeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      <header className="sticky top-0 z-50 bg-[#1E3A8A]/90 backdrop-blur-md border-b border-[#C9A24E]/25 acres-shadow-header text-white transition-all duration-300">
        {/* Main Header Bar */}
        <div className="h-[64px] md:h-[72px] w-full flex items-center px-4 md:px-[50px] gap-3 md:gap-6">
          {/* Logo — gold coin */}
          <a href="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-[#D4AF37]/60 group-hover:ring-[#E8C66A] transition-all duration-300 group-hover:scale-[1.05] shadow-lg">
              <Image
                src="/cleartitleone/logo.png"
                alt="ClearTitle One"
                width={40}
                height={40}
                priority
                className="object-cover"
                style={{ width: "auto", height: "auto" }}
              />
            </div>
            <span className="text-[18px] font-bold tracking-tight" style={{ fontFamily: "var(--font-outfit), Outfit, sans-serif" }}>
              Clear<span className="text-[#E8C66A]">Title</span><span className="text-[#D4AF37]">One</span>
            </span>
          </a>

          {/* City selector */}
          <button className="hidden sm:flex items-center gap-1.5 pl-3 pr-2 h-9 rounded-full hover:bg-white/15 transition-all duration-200 shrink-0 border border-white/10">
            <MapPin className="size-4" strokeWidth={2.4} />
            <span className="text-[14px] font-semibold">{city}</span>
            <ChevronDown className="size-4" strokeWidth={2.4} />
          </button>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Top nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => handleMouseEnter(item.label)}
                onMouseLeave={handleMouseLeave}
              >
                <Link
                  href={item.href}
                  className={`relative px-3 h-9 flex items-center gap-1 text-[13px] font-semibold rounded-lg transition-all duration-200 ${
                    activeDropdown === item.label
                      ? "text-white bg-white/20 shadow-sm"
                      : "text-white/90 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="absolute -top-1 -right-1 bg-[#E8C66A] text-[8px] font-bold text-[#1E3A8A] px-1 py-px rounded-sm leading-none animate-pulse">
                      {item.badge}
                    </span>
                  )}
                  <ChevronDown
                    className={`size-3.5 opacity-70 transition-transform duration-200 ${
                      activeDropdown === item.label ? "rotate-180" : ""
                    }`}
                    strokeWidth={2.4}
                  />
                </Link>
              </div>
            ))}
            <Link
              href="/dealers"
              className="relative px-3 h-9 flex items-center gap-1 text-[13px] font-semibold rounded-lg text-white/90 hover:text-white hover:bg-white/10 transition-all duration-200"
            >
              Dealers
            </Link>
          </nav>

          {/* Post property pill */}
          <Link href="/postproperty" className="ml-2 hidden md:flex items-center gap-2 bg-white text-[#1E3A8A] h-9 pl-4 pr-1.5 rounded-full font-semibold text-[13px] shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-200 shrink-0">
            <span>Post property</span>
            <span className="bg-gradient-to-r from-[#C9A24E] to-[#E3C25A] text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
              FREE
            </span>
          </Link>

          {/* Support headset */}
          <button className="hidden md:flex size-9 items-center justify-center rounded-full hover:bg-white/15 transition-all duration-200 border border-white/10">
            <Headset className="size-5" strokeWidth={2} />
          </button>

          {/* Login avatar */}
          {user ? (
            <button 
              onClick={() => setIsProfileDrawerOpen(true)}
              className="size-9 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-all duration-200 border border-white/40 text-white font-bold text-[14px]"
            >
              {user.name ? user.name.charAt(0).toUpperCase() : <User className="size-4" />}
            </button>
          ) : (
            <button 
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center justify-center h-9 px-4 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-200 border border-white/20 text-[13px] font-semibold text-white shrink-0"
            >
              Login
            </button>
          )}

          {/* Menu */}
          <button
            onClick={() => setIsMenuOpen(true)}
            className="size-9 flex items-center justify-center rounded-full hover:bg-white/15 transition-all duration-200 border border-white/10 cursor-pointer"
            aria-label="Open menu"
          >
            <Menu className="size-5" strokeWidth={2} />
          </button>
        </div>

        {/* Full-width Dropdown Container */}
        <div
          className="relative"
          onMouseEnter={handleDropdownMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {navItems.map((item) =>
            item.hasDropdown ? (
              <HeaderDropdown
                key={`dropdown-${item.label}`}
                menuKey={item.label}
                isOpen={activeDropdown === item.label}
                onClose={() => setActiveDropdown(null)}
              />
            ) : null
          )}
        </div>
      </header>

      {/* Side Hamburger Menu Drawer (outside <header> to bypass backdrop-blur container positioning bugs) */}
      {isMenuOpen && (
        <>
          {/* Dark Glass Backdrop */}
          <div
            onClick={() => setIsMenuOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] transition-opacity duration-300 animate-in fade-in"
          />

          {/* Drawer Panel */}
          <div className="fixed top-0 right-0 h-full w-full max-w-[420px] bg-[#1E3A8A]/95 backdrop-blur-xl border-l border-[#C9A24E]/20 z-[101] shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 text-white">
            
            {/* Drawer Header */}
            <div className="p-5 border-b border-[#C9A24E]/25 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="relative w-8 h-8 rounded-full overflow-hidden ring-2 ring-[#D4AF37]/60">
                  <Image
                    src="/cleartitleone/logo.png"
                    alt="ClearTitle One"
                    width={32}
                    height={32}
                    priority
                    className="object-cover"
                    style={{ width: "auto", height: "auto" }}
                  />
                </div>
                <span className="text-[16px] font-bold tracking-tight" style={{ fontFamily: "var(--font-outfit), Outfit, sans-serif" }}>
                  Clear<span className="text-[#E8C66A]">Title</span>One
                </span>
              </div>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="size-9 rounded-full bg-white/10 hover:bg-white/20 transition-all flex items-center justify-center border border-white/10 cursor-pointer"
                aria-label="Close menu"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Scrollable Categories List */}
            <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-4">
              <h2 className="text-[11px] font-bold tracking-[0.2em] text-[#E8C66A] uppercase mb-2">Features & Portals</h2>
              
              <div className="space-y-3">
                {navItems.map((item) => {
                  const hasDropdownMenu = item.hasDropdown && headerDropdowns[item.label];
                  const isExpanded = expandedCategory === item.label;

                  return (
                    <div key={item.label} className="border border-[#C9A24E]/20 rounded-xl overflow-hidden bg-[#0B1B43]/40">
                      {hasDropdownMenu ? (
                        <button
                          onClick={() => setExpandedCategory(isExpanded ? null : item.label)}
                          className="w-full flex items-center justify-between p-4 text-left font-semibold text-[14px] hover:bg-white/5 transition-all cursor-pointer"
                        >
                          <span className="flex items-center gap-2.5">
                            {item.label}
                            {item.badge && (
                              <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded leading-none ${
                                item.badge === "UNIQUE" ? "bg-gradient-to-r from-[#D4AF37] to-[#E8C66A] text-[#1E3A8A]" : "bg-[#E8C66A] text-white"
                              }`}>
                                {item.badge}
                              </span>
                            )}
                          </span>
                          {isExpanded ? <ChevronUp className="size-4 text-white/60" /> : <ChevronDown className="size-4 text-white/60" />}
                        </button>
                      ) : (
                        <Link
                          href={item.href}
                          onClick={() => setIsMenuOpen(false)}
                          className="w-full flex items-center justify-between p-4 font-semibold text-[14px] hover:bg-white/5 transition-all"
                        >
                          <span className="flex items-center gap-2.5 text-[#E8C66A]">
                            {item.label === "Legal Shield" && <ShieldCheck className="size-4.5 text-[#E8C66A]" />}
                            {item.label}
                            {item.badge && (
                              <span className="text-[8px] font-bold px-1.5 py-0.5 rounded leading-none bg-gradient-to-r from-[#D4AF37] to-[#E8C66A] text-[#1E3A8A]">
                                {item.badge}
                              </span>
                            )}
                          </span>
                        </Link>
                      )}

                      {/* Accordion dropdown contents */}
                      {hasDropdownMenu && isExpanded && (
                        <div className="bg-[#081640]/60 border-t border-[#C9A24E]/15 p-4 space-y-4">
                          {/* Left Sections */}
                          {headerDropdowns[item.label].leftSections.map((section) => (
                            <div key={section.title} className="space-y-1.5">
                              <h4 className="text-[10px] font-bold text-[#E8C66A]/70 uppercase tracking-wider">{section.title}</h4>
                              <div className="grid grid-cols-1 gap-1 pl-1">
                                {section.items.map((subitem) => (
                                  <Link
                                    key={subitem.label}
                                    href={subitem.href}
                                    onClick={() => setIsMenuOpen(false)}
                                    className="text-[12.5px] text-white/80 hover:text-white hover:underline py-1 flex items-center gap-2"
                                  >
                                    <span className="size-1 rounded-full bg-[#C9A24E] shrink-0" />
                                    {subitem.label}
                                    {subitem.badge && (
                                      <span className="text-[8px] font-bold px-1 py-0.2 bg-[#C9A24E] text-white rounded">
                                        {subitem.badge}
                                      </span>
                                    )}
                                  </Link>
                                ))}
                              </div>
                            </div>
                          ))}

                          {/* Center Sections if present */}
                          {headerDropdowns[item.label].centerSections?.map((section) => (
                            <div key={section.title} className="space-y-1.5 pt-2 border-t border-[#C9A24E]/10">
                              <h4 className="text-[10px] font-bold text-[#E8C66A]/70 uppercase tracking-wider">{section.title}</h4>
                              <div className="grid grid-cols-1 gap-1 pl-1">
                                {section.items.map((subitem) => (
                                  <Link
                                    key={subitem.label}
                                    href={subitem.href}
                                    onClick={() => setIsMenuOpen(false)}
                                    className="text-[12.5px] text-white/80 hover:text-white hover:underline py-1 flex items-center gap-2"
                                  >
                                    <span className="size-1 rounded-full bg-[#C9A24E] shrink-0" />
                                    {subitem.label}
                                    {subitem.badge && (
                                      <span className="text-[8px] font-bold px-1 py-0.2 bg-[#C9A24E] text-white rounded">
                                        {subitem.badge}
                                      </span>
                                    )}
                                  </Link>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Extra features inside menu */}
              <div className="pt-4 border-t border-[#C9A24E]/25 mt-6 space-y-3">
                <Link
                  href="/postproperty"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center justify-between w-full bg-white text-[#1E3A8A] h-10 px-4 rounded-xl font-bold text-[13px] shadow-md hover:scale-[1.02] transition-all"
                >
                  <span>Post Free Property Listing</span>
                  <span className="bg-gradient-to-r from-[#C9A24E] to-[#E3C25A] text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                    FREE
                  </span>
                </Link>

                <div className="grid grid-cols-2 gap-3">
                  <Link
                    href="/dealers"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center justify-center w-full bg-white/5 border border-white/15 text-white hover:bg-white/10 h-10 px-3 rounded-xl font-bold text-[12.5px] transition-all"
                  >
                    Browse Dealers
                  </Link>
                  <Link
                    href="/account"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center justify-center w-full bg-white/5 border border-white/15 text-[#E8C66A] hover:bg-white/10 h-10 px-3 rounded-xl font-bold text-[12.5px] transition-all"
                  >
                    Become a Dealer
                  </Link>
                </div>

                <Link
                  href="/admin"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center justify-center w-full bg-transparent border border-[#E8C66A]/30 text-[#E8C66A] hover:bg-[#E8C66A]/10 h-10 px-4 rounded-xl font-bold text-[13px] transition-all"
                >
                  Go to Attorney Admin Panel
                </Link>
              </div>
            </div>

            {/* Drawer Footer Contact details */}
            <div className="p-5 border-t border-[#C9A24E]/25 bg-[#081640]">
              <p className="text-[10px] text-white/50 uppercase font-bold tracking-wider mb-2">Need Assistance?</p>
              <div className="space-y-2 text-[12.5px] text-white/80">
                <div className="flex items-center gap-2">
                  <Phone className="size-4 text-[#E8C66A]" />
                  <span className="font-semibold">1800 41 99099</span>
                  <span className="text-[10px] text-white/40 font-normal">(Toll Free)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="size-4 text-white/50" />
                  <span>9AM - 11PM IST</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="size-4 text-white/50" />
                  <span className="text-white/60 hover:text-white font-medium">support@cleartitleone.com</span>
                </div>
              </div>
            </div>

          </div>
        </>
      )}
      <AuthModal />
      <ProfileDrawer />
    </>
  );
}
