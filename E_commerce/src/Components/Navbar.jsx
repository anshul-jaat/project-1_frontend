import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import {
  ShoppingBag,
  User,
  LogOut,
  Search,
  Menu,
  X,
  Sparkles,
  Package,
  Layers,
  ChevronDown,
} from "lucide-react";

export default function Navbar({ onSearch, searchQuery }) {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchQuery || "");

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(localSearch);
    } else {
      navigate(`/?search=${encodeURIComponent(localSearch)}`);
    }
  };

  const navLinks = [
    { name: "Store", path: "/" },
    { name: "Electronics", path: "/?category=Electronics" },
    { name: "Fashion", path: "/?category=Fashion" },
    { name: "Footwear", path: "/?category=Footwear" },
    { name: "Home & Living", path: "/?category=Home%20%26%20Living" },
    { name: "Accessories", path: "/?category=Accessories" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/80 dark:bg-neutral-950/80 border-b border-neutral-200/80 dark:border-neutral-800/80 transition-all duration-300">
      {/* Top Banner Notice */}
      <div className="bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 text-white text-xs font-semibold py-1.5 px-4 text-center tracking-wide flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 animate-pulse" />
        <span>Grand Launch Special: Get 20% OFF using code <strong>SAVE20</strong> at checkout</span>
        <span className="hidden sm:inline">• Free Express Delivery over ₹999</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 gap-4">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-neutral-900 via-neutral-800 to-neutral-700 dark:from-neutral-100 dark:to-neutral-300 flex items-center justify-center shadow-lg shadow-black/10 group-hover:scale-105 transition-transform duration-300">
              <ShoppingBag className="w-5 h-5 text-white dark:text-neutral-950" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-neutral-950 via-neutral-800 to-neutral-600 dark:from-white dark:to-neutral-400 bg-clip-text text-transparent">
                LUMINA<span className="text-amber-500 font-serif italic text-base ml-0.5">luxe</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-400 -mt-1">
                E-Commerce
              </span>
            </div>
          </Link>

          {/* Search Bar - Desktop */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex flex-1 max-w-md items-center relative"
          >
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Search products, brands, luxury styles..."
              className="w-full pl-10 pr-10 py-2.5 rounded-full bg-neutral-100/90 dark:bg-neutral-900/90 text-sm border border-transparent focus:border-neutral-300 dark:focus:border-neutral-700 focus:bg-white dark:focus:bg-black focus:outline-none transition-all duration-200 placeholder:text-neutral-400"
            />
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 pointer-events-none" />
            {localSearch && (
              <button
                type="button"
                onClick={() => {
                  setLocalSearch("");
                  if (onSearch) onSearch("");
                }}
                className="absolute right-3 text-neutral-400 hover:text-neutral-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>

          {/* Right Navigation Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Admin Dashboard Link (Only visible if role === admin in DB) */}
            {isAdmin && (
              <Link
                to="/admin"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-950 text-xs font-bold shadow-md hover:bg-neutral-800 transition-all duration-200"
              >
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Admin Portal</span>
              </Link>
            )}

            {/* Cart Icon & Live Count */}
            <Link
              to="/cart"
              className="relative p-2.5 rounded-2xl bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200/80 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 transition-all duration-200"
              aria-label="View Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gradient-to-r from-rose-500 to-amber-500 text-white text-[11px] font-black flex items-center justify-center shadow-md animate-in zoom-in">
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              )}
            </Link>

            {/* User Profile / Auth State */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-2 p-1.5 pr-2.5 rounded-2xl hover:bg-neutral-100 dark:hover:bg-neutral-900 border border-transparent hover:border-neutral-200 dark:hover:border-neutral-800 transition-all duration-200"
                >
                  {user?.profilePic ? (
                    <img
                      src={user.profilePic}
                      alt={user.first_name || "Profile"}
                      className="w-8 h-8 rounded-xl object-cover ring-2 ring-amber-500/30"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 text-white font-bold text-xs flex items-center justify-center shadow-inner">
                      {user?.first_name ? user.first_name[0].toUpperCase() : "U"}
                    </div>
                  )}
                  <span className="hidden md:inline text-xs font-semibold max-w-[100px] truncate text-neutral-800 dark:text-neutral-200">
                    {user?.first_name || "Account"}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                </button>

                {/* Profile Dropdown Menu */}
                {profileDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setProfileDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-60 rounded-3xl bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl shadow-2xl border border-neutral-100 dark:border-neutral-800 p-2 z-50 animate-in fade-in slide-in-from-top-2">
                      <div className="px-3.5 py-3 border-b border-neutral-100 dark:border-neutral-800">
                        <p className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                          {user?.first_name} {user?.last_name}
                        </p>
                        <p className="text-[11px] text-neutral-500 truncate">{user?.email}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                          {user?.role === "admin" ? "⚡ Admin Access" : "Customer"}
                        </span>
                      </div>

                      <div className="py-1">
                        <Link
                          to="/profile"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-xl text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                        >
                          <User className="w-4 h-4 text-neutral-500" />
                          <span>My Profile & Settings</span>
                        </Link>
                        <Link
                          to="/profile?tab=orders"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-xl text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                        >
                          <Package className="w-4 h-4 text-neutral-500" />
                          <span>My Orders</span>
                        </Link>
                        {isAdmin && (
                          <Link
                            to="/admin"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-xl text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors"
                          >
                            <Layers className="w-4 h-4 text-amber-500" />
                            <span>Admin Dashboard</span>
                          </Link>
                        )}
                      </div>

                      <div className="pt-1 border-t border-neutral-100 dark:border-neutral-800">
                        <button
                          onClick={() => {
                            logout();
                            setProfileDropdownOpen(false);
                            navigate("/login");
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-2 rounded-2xl text-xs font-bold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-all duration-200"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-2xl bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 text-xs font-bold shadow-md hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-all duration-200"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="md:hidden p-2 rounded-2xl bg-neutral-100 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Secondary Category Navigation Bar */}
        <div className="hidden md:flex items-center justify-between py-2.5 border-t border-neutral-100 dark:border-neutral-900 overflow-x-auto scrollbar-none gap-6 text-xs font-semibold text-neutral-600 dark:text-neutral-400">
          <div className="flex items-center gap-6">
            {navLinks.map((link) => {
              const isActive = location.pathname + location.search === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`transition-colors whitespace-nowrap ${
                    isActive
                      ? "text-amber-600 dark:text-amber-400 font-bold"
                      : "hover:text-neutral-950 dark:hover:text-white"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>
          <div className="text-[11px] text-neutral-400 font-normal">
            ⚡ 100% Authentic Quality Guaranteed
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-neutral-100 dark:border-neutral-800 animate-in fade-in">
            {/* Search on mobile */}
            <form onSubmit={handleSearchSubmit} className="mb-4 relative">
              <input
                type="text"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-neutral-100 dark:bg-neutral-900 text-sm border-none focus:outline-none"
              />
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3 pointer-events-none" />
            </form>

            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-xl text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900"
                >
                  {link.name}
                </Link>
              ))}
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-xl text-sm font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/40"
                >
                  ⚡ Admin Dashboard
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
