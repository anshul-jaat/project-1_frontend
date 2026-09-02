import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, ArrowRight, ShieldCheck, Mail } from "lucide-react";
import { useToast } from "../context/ToastContext";

export default function Footer() {
  const [email, setEmail] = useState("");
  const { success } = useToast();

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      success("Thank you for subscribing to LUMINA VIP perks!");
      setEmail("");
    }
  };

  return (
    <footer className="bg-neutral-950 text-white border-t border-neutral-800 mt-16 sm:mt-20 w-full overflow-hidden">
      {/* Newsletter VIP Banner */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-8 sm:py-12 border-b border-neutral-800/80">
        <div className="rounded-3xl bg-gradient-to-r from-neutral-900 via-neutral-900 to-neutral-800 p-5 sm:p-10 border border-neutral-700/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 sm:gap-8">
          <div className="space-y-2 max-w-lg">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-amber-400/10 text-amber-300 border border-amber-400/20">
              VIP Insiders Club
            </span>
            <h3 className="text-xl sm:text-3xl font-extrabold tracking-tight">
              Unlock 20% Off Your First Order
            </h3>
            <p className="text-xs sm:text-sm text-neutral-400">
              Receive private sales, early access to new designer collections, and curated style edits.
            </p>
          </div>

          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row w-full md:w-auto max-w-md gap-2.5">
            <div className="relative flex-1 w-full">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address..."
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-neutral-950/80 border border-neutral-700 text-xs sm:text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-amber-400 transition-colors"
              />
              <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto justify-center px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 text-neutral-950 font-bold text-xs sm:text-sm hover:from-amber-300 hover:to-amber-400 transition-all flex items-center gap-1.5 shrink-0"
            >
              <span>Join</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-10">
        {/* Brand Bio */}
        <div className="lg:col-span-2 space-y-4">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-neutral-100 to-neutral-300 flex items-center justify-center text-neutral-950 font-black shadow-md">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <span className="text-xl font-extrabold tracking-tight">
              LUMINA<span className="text-amber-500 font-serif italic text-base">luxe</span>
            </span>
          </Link>
          <p className="text-xs text-neutral-400 max-w-sm leading-relaxed">
            Engineered for perfection, defined by minimalism. Offering curated fashion, cutting-edge audio, artisan home essentials, and certified organic wellness formulas.
          </p>
          <div className="flex items-center gap-2 text-xs text-neutral-400 pt-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Authorized Global Retailer • SSL 256-Bit Encrypted</span>
          </div>
        </div>

        {/* Categories */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-200 mb-4">
            Collections
          </h4>
          <ul className="space-y-2.5 text-xs text-neutral-400">
            <li><Link to="/?category=Electronics" className="hover:text-amber-400 transition-colors">Electronics & Audio</Link></li>
            <li><Link to="/?category=Fashion" className="hover:text-amber-400 transition-colors">Designer Fashion</Link></li>
            <li><Link to="/?category=Footwear" className="hover:text-amber-400 transition-colors">Urban Footwear</Link></li>
            <li><Link to="/?category=Home%20%26%20Living" className="hover:text-amber-400 transition-colors">Home & Ceramic Living</Link></li>
            <li><Link to="/?category=Beauty" className="hover:text-amber-400 transition-colors">Botanical Beauty</Link></li>
            <li><Link to="/?category=Accessories" className="hover:text-amber-400 transition-colors">Luxury Accessories</Link></li>
          </ul>
        </div>

        {/* Customer Support */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-200 mb-4">
            Customer Care
          </h4>
          <ul className="space-y-2.5 text-xs text-neutral-400">
            <li><Link to="/profile?tab=orders" className="hover:text-amber-400 transition-colors">Order Tracking</Link></li>
            <li><Link to="/cart" className="hover:text-amber-400 transition-colors">Shopping Cart</Link></li>
            <li><Link to="/profile" className="hover:text-amber-400 transition-colors">Account Settings</Link></li>
            <li><span className="hover:text-amber-400 transition-colors cursor-pointer">Shipping & Returns</span></li>
            <li><span className="hover:text-amber-400 transition-colors cursor-pointer">Contact Concierge</span></li>
          </ul>
        </div>

        {/* Legal & Guarantee */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-200 mb-4">
            Security & Trust
          </h4>
          <ul className="space-y-2.5 text-xs text-neutral-400">
            <li><span className="hover:text-amber-400 transition-colors cursor-pointer">Privacy Policy</span></li>
            <li><span className="hover:text-amber-400 transition-colors cursor-pointer">Terms of Service</span></li>
            <li><span className="hover:text-amber-400 transition-colors cursor-pointer">Authenticity Guarantee</span></li>
            <li><span className="hover:text-amber-400 transition-colors cursor-pointer">Global Compliance</span></li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-neutral-900 py-6 px-4 sm:px-6 lg:px-8 text-center text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 LUMINA Luxe E-Commerce Inc. All rights reserved.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Crafted with passion & aesthetic precision</span>
            <span>•</span>
            <span className="text-amber-400 font-semibold">Fast Global Delivery</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
