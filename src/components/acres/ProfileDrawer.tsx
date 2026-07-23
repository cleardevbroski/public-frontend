"use client";

import { useState, useEffect } from "react";
import Link from "@/components/Link";
import { X, User, Phone, Mail, LogOut, ChevronRight, Settings, Heart, Building, BadgeCheck } from "lucide-react";
import { useAuth } from "./AuthContext";

export default function ProfileDrawer() {
  const { user, isProfileDrawerOpen, setIsProfileDrawerOpen, logout, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  if (!isProfileDrawerOpen || !user) return null;

  const handleSave = () => {
    updateProfile({ name, email });
    setIsEditing(false);
  };

  return (
    <>
      <div 
        className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm transition-opacity" 
        onClick={() => setIsProfileDrawerOpen(false)}
      />
      <div className="fixed right-0 top-0 bottom-0 z-[110] w-full max-w-[400px] bg-[#F8FAFC] shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="h-[180px] bg-gradient-to-br from-[#121B35] via-[#273559] to-[#DDAA42] p-6 flex flex-col justify-between relative overflow-hidden shrink-0">
          <div className="absolute -right-20 -top-20 w-60 h-60 bg-[#DDAA42]/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex justify-between items-start relative z-10">
            <div className="size-16 rounded-full bg-white/20 backdrop-blur-md border-2 border-white/40 flex items-center justify-center text-white text-2xl font-bold shadow-inner">
              {user.name ? user.name.charAt(0).toUpperCase() : <User />}
            </div>
            <button 
              onClick={() => setIsProfileDrawerOpen(false)}
              className="size-8 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center transition-colors"
            >
              <X className="size-4 text-white" />
            </button>
          </div>
          
          <div className="relative z-10 text-white">
            <h2 className="text-[22px] font-bold" style={{ fontFamily: "var(--font-outfit), Outfit, sans-serif" }}>
              {user.name}
            </h2>
            <p className="text-[13px] text-[#E4E0E7] flex items-center gap-1.5 mt-0.5">
              <Phone className="size-3.5" /> +91 {user.phone}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Profile Details Card */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#E4E0E7]/30 relative">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-[14px] font-bold text-[#121B35] uppercase tracking-wider">Account Details</h3>
              <button 
                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                className="text-[12px] font-bold text-[#DDAA42] hover:underline"
              >
                {isEditing ? "Save" : "Edit"}
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-[#68646F] mb-1">Full Name</label>
                {isEditing ? (
                  <input 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-[#E4E0E7] focus:border-[#DDAA42] outline-none text-[14px] text-[#121B35]"
                  />
                ) : (
                  <div className="flex items-center gap-2 text-[14px] text-[#121B35] font-medium">
                    <User className="size-4 text-[#68646F]" />
                    {user.name}
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-[11px] font-semibold text-[#68646F] mb-1">Email Address</label>
                {isEditing ? (
                  <input 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-[#E4E0E7] focus:border-[#DDAA42] outline-none text-[14px] text-[#121B35]"
                    placeholder="Add your email"
                  />
                ) : (
                  <div className="flex items-center gap-2 text-[14px] text-[#121B35] font-medium">
                    <Mail className="size-4 text-[#68646F]" />
                    {user.email || <span className="text-[#68646F]/60 italic text-[13px]">Not provided</span>}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Links Menu */}
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-[#E4E0E7]/30">
            <Link href="/account" onClick={() => setIsProfileDrawerOpen(false)} className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors border-b border-[#E4E0E7]/30 group">
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-full bg-[#FFF8E8] flex items-center justify-center text-[#DDAA42]">
                  <BadgeCheck className="size-4" />
                </div>
                <span className="text-[14px] font-semibold text-[#121B35]">Become a Dealer</span>
              </div>
              <ChevronRight className="size-4 text-[#68646F] group-hover:translate-x-1 transition-transform" />
            </Link>

            <button className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors border-b border-[#E4E0E7]/30 group">
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-full bg-[#F8F7FA] flex items-center justify-center text-[#DDAA42]">
                  <Heart className="size-4" />
                </div>
                <span className="text-[14px] font-semibold text-[#121B35]">Saved Properties</span>
              </div>
              <ChevronRight className="size-4 text-[#68646F] group-hover:translate-x-1 transition-transform" />
            </button>

            <Link href="/postproperty" onClick={() => setIsProfileDrawerOpen(false)} className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors border-b border-[#E4E0E7]/30 group">
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-full bg-[#F8F7FA] flex items-center justify-center text-[#DDAA42]">
                  <Building className="size-4" />
                </div>
                <span className="text-[14px] font-semibold text-[#121B35]">My Postings</span>
              </div>
              <ChevronRight className="size-4 text-[#68646F] group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link href="/account" onClick={() => setIsProfileDrawerOpen(false)} className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors group">
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-full bg-[#F8F7FA] flex items-center justify-center text-[#DDAA42]">
                  <Settings className="size-4" />
                </div>
                <span className="text-[14px] font-semibold text-[#121B35]">Account Settings</span>
              </div>
              <ChevronRight className="size-4 text-[#68646F] group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
        </div>

        {/* Footer */}
        <div className="p-6 bg-white border-t border-[#E4E0E7]/30 shrink-0">
          <button 
            onClick={logout}
            className="w-full h-12 flex items-center justify-center gap-2 rounded-xl border-2 border-[#EF4444] text-[#EF4444] font-bold hover:bg-[#EF4444] hover:text-white transition-colors"
          >
            <LogOut className="size-4" />
            Logout Securely
          </button>
        </div>
      </div>
    </>
  );
}
