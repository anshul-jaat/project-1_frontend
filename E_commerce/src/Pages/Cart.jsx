import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import api from "../GlobalUrl";
import confetti from "canvas-confetti";
import {
  ShoppingBag,
  Trash2,
  Minus,
  Plus,
  ArrowRight,
  ShieldCheck,
  Truck,
  Tag,
  CheckCircle2,
  CreditCard,
  Building,
  Check,
} from "lucide-react";

export default function Cart() {
  const { cartItems, subtotal, itemCount, updateQuantity, removeFromCart, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { success, error, info } = useToast();
  const navigate = useNavigate();

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);

  // Checkout modal & address state
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);

  // Manual address if user has no saved addresses
  const [customAddress, setCustomAddress] = useState({
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
  });

  const shippingFee = subtotal >= 999 || subtotal === 0 ? 0 : 99;
  const discountAmount = Math.round((subtotal * discountPercent) / 100);
  const grandTotal = Math.max(0, subtotal - discountAmount + shippingFee);

  // Apply Promo Coupon
  const handleApplyCoupon = (e) => {
    e.preventDefault();
    const code = couponCode.trim().toUpperCase();
    if (code === "SAVE20") {
      setDiscountPercent(20);
      setCouponApplied(true);
      success("Coupon SAVE20 applied! 20% discount added.");
    } else if (code === "LUMINA10") {
      setDiscountPercent(10);
      setCouponApplied(true);
      success("Coupon LUMINA10 applied! 10% discount added.");
    } else {
      error("Invalid promo coupon code. Try SAVE20 for 20% off!");
    }
  };

  // Trigger Checkout
  const handleProceedToCheckout = () => {
    if (!isAuthenticated) {
      info("Please sign in or create an account to complete checkout.");
      navigate("/login", { state: { from: { pathname: "/cart" } } });
      return;
    }
    setCheckoutModalOpen(true);
  };

  // Place Order on Backend
  const handlePlaceOrder = async () => {
    let finalShippingAddress = user?.address_list?.[selectedAddressIndex];
    if (!finalShippingAddress) {
      if (!customAddress.street || !customAddress.city || !customAddress.state || !customAddress.postalCode) {
        error("Please enter a complete delivery address");
        return;
      }
      finalShippingAddress = customAddress;
    }

    const orderPayload = {
      orderItems: cartItems.map((item) => {
        const p = item.product;
        const price = p?.discountPrice > 0 ? p.discountPrice : p?.price || item.price;
        return {
          product: p?._id || item.product,
          title: p?.title || "Product",
          quantity: item.quantity,
          image: p?.images?.[0] || "",
          price,
        };
      }),
      shippingAddress: finalShippingAddress,
      paymentMethod,
      discountAmount,
      shippingFee,
    };

    try {
      setIsPlacingOrder(true);
      const res = await api.post("/orders/create", orderPayload);
      if (res.data?.success && res.data.order) {
        setPlacedOrder(res.data.order);
        clearCart();

        // Trigger celebratory confetti!
        try {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch {}

        success("Order placed successfully! 🎉");
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to place order";
      error(msg);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (cartItems.length === 0 && !placedOrder) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center px-4 py-16 text-center">
        <div className="w-20 h-20 rounded-3xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center mb-6 shadow-lg">
          <ShoppingBag className="w-8 h-8 text-neutral-400" />
        </div>
        <h2 className="text-2xl font-black text-neutral-900 dark:text-white mb-2">
          Your Shopping Cart is Empty
        </h2>
        <p className="text-sm text-neutral-500 max-w-sm mb-8 leading-relaxed">
          Looks like you haven't added any luxury pieces to your cart yet. Discover our latest collection.
        </p>
        <Link
          to="/"
          className="px-8 py-3.5 rounded-full bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 font-bold text-xs shadow-xl hover:scale-105 transition-transform flex items-center gap-2"
        >
          <span>Explore Storefront</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50/50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Heading */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Shopping Bag</h1>
            <p className="text-xs text-neutral-500 mt-1">
              You have {itemCount} {itemCount === 1 ? "item" : "items"} in your cart.
            </p>
          </div>

          <button
            onClick={clearCart}
            className="text-xs font-bold text-neutral-400 hover:text-rose-500 transition-colors"
          >
            Clear Entire Bag
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Items List */}
          <div className="lg:col-span-8 space-y-4">
            {cartItems.map((item) => {
              const p = item.product;
              const hasDiscount = p?.discountPrice > 0 && p?.discountPrice < p?.price;
              const effectivePrice = hasDiscount ? p.discountPrice : p?.price || item.price;
              const img = p?.images?.[0] || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200";

              return (
                <div
                  key={item._id || p?._id}
                  className="rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-4 sm:p-6 shadow-sm flex flex-col sm:flex-row items-center gap-4 sm:gap-6 transition-all"
                >
                  {/* Thumbnail */}
                  <img
                    src={img}
                    alt={p?.title || "Item"}
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover bg-neutral-100 dark:bg-neutral-950 shrink-0"
                  />

                  {/* Title & Brand */}
                  <div className="flex-1 min-w-0 text-center sm:text-left">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block mb-0.5">
                      {p?.category || "Luxury"}
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-neutral-900 dark:text-white line-clamp-2">
                      {p?.title || "Product"}
                    </h3>
                    <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
                      <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                        ₹{Number(effectivePrice).toLocaleString("en-IN")} each
                      </span>
                      {hasDiscount && (
                        <span className="text-[11px] text-neutral-400 line-through">
                          ₹{Number(p.price).toLocaleString("en-IN")}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center rounded-2xl bg-neutral-100 dark:bg-neutral-800 p-1 shrink-0">
                    <button
                      onClick={() => updateQuantity(p?._id || item.product, item.quantity - 1)}
                      className="p-1.5 rounded-xl text-neutral-600 dark:text-neutral-300 hover:bg-white dark:hover:bg-neutral-700 transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center text-xs font-bold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(p?._id || item.product, item.quantity + 1)}
                      className="p-1.5 rounded-xl text-neutral-600 dark:text-neutral-300 hover:bg-white dark:hover:bg-neutral-700 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Item Total & Remove */}
                  <div className="flex sm:flex-col items-center justify-between sm:items-end gap-3 w-full sm:w-auto shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-neutral-100 dark:border-neutral-800">
                    <div className="text-base font-black text-neutral-950 dark:text-white">
                      ₹{Number(effectivePrice * item.quantity).toLocaleString("en-IN")}
                    </div>
                    <button
                      onClick={() => removeFromCart(p?._id || item.product)}
                      className="p-2 rounded-xl text-neutral-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Order Summary & Checkout */}
          <div className="lg:col-span-4 space-y-6">
            <div className="rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 sm:p-8 shadow-sm space-y-6">
              <h3 className="text-lg font-black tracking-tight">Order Summary</h3>

              {/* Coupon Code input */}
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Coupon (e.g. SAVE20)"
                    className="w-full pl-8 pr-3 py-2.5 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-xs font-bold uppercase placeholder:normal-case focus:outline-none"
                  />
                  <Tag className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-3" />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-2xl bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 text-xs font-bold shrink-0 hover:bg-neutral-800"
                >
                  Apply
                </button>
              </form>

              {couponApplied && (
                <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700/60 text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center justify-between">
                  <span>✨ {discountPercent}% Special Discount Applied!</span>
                  <button
                    onClick={() => {
                      setCouponApplied(false);
                      setDiscountPercent(0);
                      setCouponCode("");
                    }}
                    className="text-neutral-400 hover:text-neutral-600 text-[10px]"
                  >
                    Remove
                  </button>
                </div>
              )}

              {/* Price Calculations */}
              <div className="space-y-3 text-xs border-t border-neutral-100 dark:border-neutral-800 pt-4">
                <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                  <span>Subtotal</span>
                  <span className="font-bold text-neutral-900 dark:text-white">
                    ₹{Number(subtotal).toLocaleString("en-IN")}
                  </span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                    <span>Coupon Discount</span>
                    <span>-₹{Number(discountAmount).toLocaleString("en-IN")}</span>
                  </div>
                )}

                <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                  <span>Estimated Shipping</span>
                  <span className="font-bold text-neutral-900 dark:text-white">
                    {shippingFee === 0 ? (
                      <span className="text-emerald-500 font-bold uppercase text-[10px]">Free (Over ₹999)</span>
                    ) : (
                      `₹${shippingFee}`
                    )}
                  </span>
                </div>

                <div className="flex justify-between items-baseline text-base font-black border-t border-neutral-100 dark:border-neutral-800 pt-4 text-neutral-950 dark:text-white">
                  <span>Total Amount</span>
                  <span className="text-2xl">₹{Number(grandTotal).toLocaleString("en-IN")}</span>
                </div>
              </div>

              {/* Checkout Action Button */}
              <button
                onClick={handleProceedToCheckout}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-neutral-950 font-black text-sm shadow-xl shadow-amber-500/20 hover:scale-102 active:scale-98 transition-all flex items-center justify-center gap-2"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-4 text-[11px] text-neutral-400 pt-2">
                <div className="flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-amber-500" />
                  <span>Free Delivery over ₹999</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Secure SSL Checkout</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CHECKOUT MODAL */}
      {checkoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-black">Complete Your Order</h3>

            {/* 1. Shipping Destination */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
                1. Select Shipping Address
              </label>

              {user?.address_list && user.address_list.length > 0 ? (
                <div className="space-y-2">
                  {user.address_list.map((addr, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedAddressIndex(idx)}
                      className={`p-3.5 rounded-2xl border cursor-pointer text-xs transition-all ${
                        selectedAddressIndex === idx
                          ? "border-amber-500 bg-amber-50/40 dark:bg-amber-950/20 shadow-sm"
                          : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300"
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold">
                        <span>{addr.street}</span>
                        {selectedAddressIndex === idx && <Check className="w-4 h-4 text-amber-500" />}
                      </div>
                      <p className="text-neutral-500 mt-0.5">
                        {addr.city}, {addr.state} - {addr.postalCode} ({addr.country || "India"})
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2 text-xs">
                  <input
                    type="text"
                    placeholder="Street Address *"
                    value={customAddress.street}
                    onChange={(e) => setCustomAddress({ ...customAddress, street: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="City *"
                      value={customAddress.city}
                      onChange={(e) => setCustomAddress({ ...customAddress, city: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800"
                    />
                    <input
                      type="text"
                      placeholder="State *"
                      value={customAddress.state}
                      onChange={(e) => setCustomAddress({ ...customAddress, state: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Postal / Pincode *"
                    value={customAddress.postalCode}
                    onChange={(e) => setCustomAddress({ ...customAddress, postalCode: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800"
                  />
                </div>
              )}
            </div>

            {/* 2. Payment Method */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
                2. Select Payment Method
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { id: "COD", label: "Cash on Delivery", icon: Truck },
                  { id: "Card", label: "Credit/Debit Card", icon: CreditCard },
                  { id: "UPI", label: "UPI / NetBanking", icon: Building },
                ].map((m) => {
                  const Icon = m.icon;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id)}
                      className={`p-3 rounded-2xl border text-left flex flex-col justify-between h-20 transition-all ${
                        paymentMethod === m.id
                          ? "border-amber-500 bg-amber-50/40 dark:bg-amber-950/20 shadow-sm"
                          : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300"
                      }`}
                    >
                      <Icon className="w-5 h-5 text-amber-500" />
                      <span className="text-[11px] font-bold">{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Total breakdown */}
            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-xs">
              <div>
                <span className="text-neutral-400">Grand Total:</span>
                <div className="text-lg font-black text-neutral-950 dark:text-white">
                  ₹{Number(grandTotal).toLocaleString("en-IN")}
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-emerald-700 bg-emerald-100 dark:bg-emerald-950/50 font-bold">
                {shippingFee === 0 ? "Free Shipping" : "+₹99 Shipping"}
              </span>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setCheckoutModalOpen(false)}
                className="flex-1 py-3 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-xs font-bold"
              >
                Back to Cart
              </button>
              <button
                type="button"
                disabled={isPlacingOrder}
                onClick={handlePlaceOrder}
                className="flex-1 py-3 rounded-2xl bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 text-xs font-bold shadow-xl hover:bg-neutral-800 flex items-center justify-center gap-1.5"
              >
                <span>{isPlacingOrder ? "Processing..." : "Place Order Now"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ORDER SUCCESS MODAL */}
      {placedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in zoom-in-95">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-8 shadow-2xl text-center space-y-6">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white mx-auto shadow-xl shadow-emerald-500/20">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-2xl font-black tracking-tight">Order Confirmed!</h3>
              <p className="text-xs text-neutral-500 mt-1">
                Thank you for your purchase! We are preparing your items for express shipment.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-xs space-y-2 text-left">
              <div className="flex justify-between">
                <span className="text-neutral-400">Order Reference:</span>
                <span className="font-mono font-bold">#{placedOrder._id.substring(placedOrder._id.length - 8).toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Total Paid:</span>
                <span className="font-bold text-neutral-900 dark:text-white">
                  ₹{Number(placedOrder.totalAmount).toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Payment:</span>
                <span className="font-semibold">{placedOrder.paymentMethod}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Link
                to="/profile?tab=orders"
                className="w-full py-3.5 rounded-2xl bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 text-xs font-bold shadow-lg"
              >
                Track My Order
              </Link>
              <Link
                to="/"
                className="w-full py-3 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-xs font-bold"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
