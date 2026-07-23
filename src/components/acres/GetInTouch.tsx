"use client";
import { useState } from "react";
import { MapPin, Phone, Mail, Send, CheckCircle2 } from "lucide-react";
import { submitContactLead } from "@/lib/api";
import { trackAnalytics } from "@/lib/analytics";

export default function GetInTouch() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await submitContactLead({ name: form.name, email: form.email, phone: form.phone, message: form.message });
      trackAnalytics("contact_form_submitted", { source: "home_contact" });
      setSent(true);
      setForm({ name: "", email: "", phone: "", message: "" });
      setTimeout(() => setSent(false), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message");
    }
  };

  return (
    <section id="contact" className="relative bg-[#0B1328] py-20 overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-25">
        <img
          src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1600&q=80"
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B1328] via-[#0B1328]/90 to-[#0B1328]/70" />
      </div>

      <div className="relative z-10 max-w-[1100px] mx-auto px-5">
        <div className="text-center mb-12">
          <h2 className="text-[30px] md:text-[40px] font-bold text-white">
            Get in <span className="text-gold-gradient">Touch with Us</span>
          </h2>
          <div className="gold-divider mx-auto mt-4" />
          <p className="text-[15px] text-white/65 mt-4">
            Have questions or need assistance? Our team is here to help!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* Contact info */}
          <div className="flex flex-col justify-center gap-5">
            {[
              { icon: MapPin, label: "123, MG Road, Bangalore, Karnataka 560001" },
              { icon: Phone, label: "+91 98765 43210" },
              { icon: Mail, label: "info@cleartitleone.com" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-xl px-5 py-4">
                <div className="size-11 rounded-xl bg-[#DDAA42]/15 border border-[#DDAA42]/30 flex items-center justify-center shrink-0">
                  <Icon className="size-5 text-[#F2C052]" />
                </div>
                <span className="text-[14px] text-white/85">{label}</span>
              </div>
            ))}
            <div className="mt-2 rounded-2xl overflow-hidden border border-white/10 h-[160px]">
              <img
                src="https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=1000&q=80"
                alt="Office location"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Form */}
          <form onSubmit={submit} className="bg-white rounded-2xl p-7 shadow-2xl">
            <h3 className="text-[20px] font-bold text-[#121B35] mb-5">Send us a Message</h3>
            <div className="space-y-3.5">
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Name"
                className="w-full px-4 py-3 rounded-xl border border-[#E4E0E7] text-[14px] text-[#121B35] outline-none focus:border-[#DDAA42] focus:ring-2 focus:ring-[#DDAA42]/15 transition-all"
              />
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="Email"
                className="w-full px-4 py-3 rounded-xl border border-[#E4E0E7] text-[14px] text-[#121B35] outline-none focus:border-[#DDAA42] focus:ring-2 focus:ring-[#DDAA42]/15 transition-all"
              />
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="Phone Number"
                className="w-full px-4 py-3 rounded-xl border border-[#E4E0E7] text-[14px] text-[#121B35] outline-none focus:border-[#DDAA42] focus:ring-2 focus:ring-[#DDAA42]/15 transition-all"
              />
              <textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Message"
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-[#E4E0E7] text-[14px] text-[#121B35] outline-none focus:border-[#DDAA42] focus:ring-2 focus:ring-[#DDAA42]/15 transition-all resize-none"
              />
              <button
                type="submit"
                className="w-full btn-gold py-3.5 rounded-xl text-[14px] flex items-center justify-center gap-2"
              >
                {sent ? (
                  <>
                    <CheckCircle2 className="size-5" /> Message Sent!
                  </>
                ) : (
                  <>
                    <Send className="size-4.5" /> Send Message
                  </>
                )}
              </button>
              {error && <p className="text-[12px] text-red-300 mt-2">{error}</p>}
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
