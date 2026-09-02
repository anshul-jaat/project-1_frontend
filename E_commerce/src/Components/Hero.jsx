import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Star, ShieldCheck, Truck, RefreshCcw } from "lucide-react";

export default function Hero({ onCategorySelect }) {
  const categories = [
    { name: "All", icon: "✨" },
    { name: "Electronics", icon: "🎧" },
    { name: "Fashion", icon: "🧥" },
    { name: "Footwear", icon: "👟" },
    { name: "Home & Living", icon: "☕" },
    { name: "Beauty", icon: "✨" },
    { name: "Accessories", icon: "⌚" },
  ];

  return (
    <div className="relative overflow-hidden bg-neutral-950 text-white rounded-3xl mx-2.5 sm:mx-6 lg:mx-8 my-4 sm:my-6 shadow-2xl border border-neutral-800 max-w-full">
      {/* Background Decorative Glow Orbs */}
      <div className="absolute top-0 right-1/4 w-72 sm:w-96 h-72 sm:h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none -mr-10 -mt-10"></div>
      <div className="absolute bottom-0 left-1/4 w-72 sm:w-96 h-72 sm:h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none -ml-10 -mb-10"></div>
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 lg:py-24 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Column: Hero Copy & Actions */}
        <div className="lg:col-span-7 flex flex-col items-start space-y-5 sm:space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-amber-300">
            <Sparkles className="w-3.5 h-3.5 animate-spin text-amber-400" />
            <span>Curated Luxe Collection 2026</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] sm:leading-[1.1]">
            Elevate Your Everyday with{" "}
            <span className="bg-gradient-to-r from-amber-200 via-rose-300 to-indigo-300 bg-clip-text text-transparent italic font-serif">
              Mastercrafted
            </span>{" "}
            Essentials.
          </h1>

          <p className="text-sm sm:text-lg text-neutral-300 max-w-xl leading-relaxed">
            Discover a handpicked synthesis of minimalist electronics, timeless fashion, bespoke home accessories, and natural beauty formulas.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1 w-full">
            <a
              href="#products-section"
              className="inline-flex items-center justify-center gap-2.5 px-6 sm:px-7 py-3 sm:py-3.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-neutral-950 font-bold text-xs sm:text-sm shadow-xl shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all duration-200"
            >
              <span>Explore Collection</span>
              <ArrowRight className="w-4 h-4" />
            </a>

            <Link
              to="/?category=Electronics"
              className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3 sm:py-3.5 rounded-full bg-white/10 hover:bg-white/15 text-white font-semibold text-xs sm:text-sm border border-white/20 backdrop-blur-md transition-all duration-200"
            >
              <span>Trending Audio & Tech</span>
            </Link>
          </div>

          {/* Quick Category Pills */}
          <div className="flex flex-wrap gap-1.5 sm:gap-2 pt-1 max-w-full">
            {categories.map((c) => (
              <button
                key={c.name}
                type="button"
                onClick={() => onCategorySelect && onCategorySelect(c.name)}
                className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-[11px] sm:text-xs font-semibold text-neutral-300 border border-white/10 transition-colors flex items-center gap-1 sm:gap-1.5"
              >
                <span>{c.icon}</span>
                <span>{c.name}</span>
              </button>
            ))}
          </div>

          {/* Social Proof & Metrics */}
          <div className="pt-4 sm:pt-6 border-t border-white/10 grid grid-cols-3 gap-3 sm:gap-8 w-full max-w-lg">
            <div>
              <div className="text-xl sm:text-2xl font-black text-white">40k+</div>
              <div className="text-[10px] sm:text-xs text-neutral-400">Happy Clients</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-white flex items-center gap-1">
                4.9 <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              </div>
              <div className="text-[10px] sm:text-xs text-neutral-400">Average Rating</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-white">100%</div>
              <div className="text-[10px] sm:text-xs text-neutral-400">Authentic Gear</div>
            </div>
          </div>
        </div>

        {/* Right Column: Hero Visual Grid */}
        <div className="lg:col-span-5 relative w-full">
          <div className="relative mx-auto max-w-sm lg:max-w-none w-full">
            {/* Hero Main Card */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/15 bg-neutral-900 group w-full">
              <img
                src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80"
                alt="Featured Product"
                className="w-full h-64 sm:h-80 object-cover object-center group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-4 sm:p-6">
                <span className="inline-block px-2.5 py-1 rounded-md bg-amber-500 text-black text-[10px] font-extrabold uppercase tracking-wider mb-2 w-max">
                  Trending #1
                </span>
                <h3 className="text-base sm:text-xl font-bold text-white leading-tight">
                  Aura Noise-Cancelling Headphones
                </h3>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg sm:text-xl font-black text-amber-400">₹1,999</span>
                    <span className="text-xs text-neutral-400 line-through">₹2,499</span>
                  </div>
                  <span className="text-[11px] sm:text-xs font-semibold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-500/30">
                    Save ₹500
                  </span>
                </div>
              </div>
            </div>

            {/* Floating Mini Badge */}
            <div className="hidden sm:flex absolute -bottom-6 -left-6 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl text-neutral-900 dark:text-white p-4 rounded-2xl border border-white/20 shadow-2xl items-center gap-3 animate-in slide-in-from-left duration-500">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-md">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold">2 Year Warranty</div>
                <div className="text-[11px] text-neutral-500 dark:text-neutral-400">Included on all tech</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Badges Bar */}
      <div className="border-t border-white/10 bg-white/5 backdrop-blur-md px-4 sm:px-6 py-3.5 sm:py-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center sm:text-left text-xs font-medium text-neutral-300">
        <div className="flex items-center gap-1.5 sm:gap-2 justify-center">
          <Truck className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="text-[11px] sm:text-xs">Free Delivery over ₹999</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 justify-center">
          <RefreshCcw className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="text-[11px] sm:text-xs">30 Days Easy Returns</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 justify-center">
          <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="text-[11px] sm:text-xs">Bank-Grade Encryption</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 justify-center">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="text-[11px] sm:text-xs">100% Genuine Craft</span>
        </div>
      </div>
    </div>
  );
}
