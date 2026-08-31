import React, { useState } from "react";
import { Star, ShoppingBag, Eye, Heart, Check } from "lucide-react";
import { useCart } from "../context/CartContext";

export default function ProductCard({ product, onQuickView }) {
  const { addToCart } = useCart();
  const [isHovered, setIsHovered] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const images = product.images && product.images.length > 0
    ? product.images
    : ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80"];

  const mainImage = images[0];
  const secondaryImage = images.length > 1 ? images[1] : images[0];

  const hasDiscount = product.discountPrice > 0 && product.discountPrice < product.price;
  const effectivePrice = hasDiscount ? product.discountPrice : product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  const isOutOfStock = product.stock <= 0;

  const handleAdd = async (e) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    const ok = await addToCart(product, 1);
    if (ok) {
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1500);
    }
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative flex flex-col rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-sm hover:shadow-2xl hover:border-neutral-300 dark:hover:border-neutral-700 transition-all duration-300 overflow-hidden"
    >
      {/* Image Container with Badges */}
      <div className="relative aspect-square w-full overflow-hidden bg-neutral-100 dark:bg-neutral-950">
        <img
          src={isHovered ? secondaryImage : mainImage}
          alt={product.title}
          className="h-full w-full object-cover object-center transition-all duration-700 ease-out group-hover:scale-108"
          loading="lazy"
        />

        {/* Floating Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {hasDiscount && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-md">
              -{discountPercent}% OFF
            </span>
          )}
          {product.isFeatured && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-neutral-900/90 dark:bg-white/90 text-white dark:text-black backdrop-blur-md shadow-md">
              Featured
            </span>
          )}
        </div>

        {/* Wishlist Toggle Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsWishlisted(!isWishlisted);
          }}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all duration-200 z-10 shadow-md ${
            isWishlisted
              ? "bg-rose-500 text-white scale-110"
              : "bg-white/80 dark:bg-black/60 text-neutral-600 dark:text-neutral-300 hover:scale-110 hover:text-rose-500"
          }`}
          aria-label="Wishlist"
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? "fill-white" : ""}`} />
        </button>

        {/* Quick View Button - overlay on hover */}
        <div className="absolute inset-x-3 bottom-3 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
          <button
            onClick={() => onQuickView(product)}
            className="w-full py-2.5 rounded-2xl bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md text-neutral-900 dark:text-white text-xs font-bold shadow-xl border border-neutral-200 dark:border-neutral-700 flex items-center justify-center gap-2 hover:bg-neutral-950 hover:text-white dark:hover:bg-white dark:hover:text-black transition-all"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Quick View</span>
          </button>
        </div>
      </div>

      {/* Product Content Details */}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between gap-2 text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
          <span>{product.category || "General"}</span>
          <span className="text-neutral-500 font-medium lowercase tracking-normal">{product.brand}</span>
        </div>

        <h3
          onClick={() => onQuickView(product)}
          className="text-sm font-bold text-neutral-900 dark:text-white line-clamp-2 hover:text-amber-600 dark:hover:text-amber-400 cursor-pointer transition-colors leading-snug"
        >
          {product.title}
        </h3>

        {/* Rating & Reviews */}
        <div className="flex items-center gap-1.5 mt-2">
          <div className="flex items-center text-amber-400">
            <Star className="w-3.5 h-3.5 fill-amber-400" />
          </div>
          <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
            {product.rating || 4.8}
          </span>
          <span className="text-[11px] text-neutral-400">
            ({product.numReviews || 18})
          </span>
        </div>

        {/* Price & Action Row */}
        <div className="mt-auto pt-4 flex items-center justify-between border-t border-neutral-100 dark:border-neutral-800/80">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-black text-neutral-950 dark:text-white">
                ${effectivePrice}
              </span>
              {hasDiscount && (
                <span className="text-xs text-neutral-400 line-through">
                  ${product.price}
                </span>
              )}
            </div>
            <div className="text-[10px] flex items-center gap-1 font-medium">
              {isOutOfStock ? (
                <span className="text-rose-500 font-bold">Out of stock</span>
              ) : product.stock <= 5 ? (
                <span className="text-amber-500 font-semibold">Only {product.stock} left</span>
              ) : (
                <span className="text-emerald-500 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  In Stock
                </span>
              )}
            </div>
          </div>

          <button
            disabled={isOutOfStock}
            onClick={handleAdd}
            className={`p-2.5 rounded-2xl flex items-center justify-center transition-all duration-200 shadow-md ${
              isOutOfStock
                ? "bg-neutral-200 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed"
                : justAdded
                ? "bg-emerald-500 text-white scale-105"
                : "bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 hover:bg-amber-500 dark:hover:bg-amber-400 hover:text-black hover:scale-105 active:scale-95"
            }`}
            aria-label="Add to cart"
          >
            {justAdded ? (
              <Check className="w-4 h-4 stroke-[3]" />
            ) : (
              <ShoppingBag className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
