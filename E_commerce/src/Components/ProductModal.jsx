import React, { useState } from "react";
import { X, Star, ShoppingBag, Truck, ShieldCheck, ArrowRight, Check, Minus, Plus } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";

export default function ProductModal({ product, onClose }) {
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  if (!product) return null;

  const images = product.images && product.images.length > 0
    ? product.images
    : ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80"];

  const currentImage = images[selectedImageIndex] || images[0];

  const hasDiscount = product.discountPrice > 0 && product.discountPrice < product.price;
  const effectivePrice = hasDiscount ? product.discountPrice : product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  const isOutOfStock = product.stock <= 0;

  const handleAddToCart = async () => {
    if (isOutOfStock) return;
    setIsAdding(true);
    await addToCart(product, quantity);
    setIsAdding(false);
  };

  const handleBuyNow = async () => {
    if (isOutOfStock) return;
    await addToCart(product, quantity);
    onClose();
    navigate("/cart");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-4xl rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden my-auto animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 sm:p-8">
          {/* Left Column: Image Gallery */}
          <div className="flex flex-col gap-4">
            {/* Main Featured Image */}
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-neutral-100 dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-800">
              <img
                src={currentImage}
                alt={product.title}
                className="w-full h-full object-cover object-center"
              />
              {hasDiscount && (
                <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-extrabold bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-md">
                  -{discountPercent}% OFF
                </span>
              )}
            </div>

            {/* Thumbnail Selectors */}
            {images.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                      selectedImageIndex === idx
                        ? "border-amber-500 scale-95 shadow-md"
                        : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Details & Actions */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-1">
              <span>{product.category}</span>
              <span>•</span>
              <span className="text-neutral-400">{product.brand}</span>
            </div>

            <h2 className="text-2xl font-black text-neutral-900 dark:text-white leading-tight">
              {product.title}
            </h2>

            {/* Rating Stars & Stock */}
            <div className="flex items-center justify-between mt-3 pb-4 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <div className="flex items-center text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(product.rating || 5)
                          ? "fill-amber-400"
                          : "text-neutral-300 dark:text-neutral-700"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-bold text-neutral-900 dark:text-white">
                  {product.rating || 4.8}
                </span>
                <span className="text-xs text-neutral-400">
                  ({product.numReviews || 24} reviews)
                </span>
              </div>

              <div>
                {isOutOfStock ? (
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
                    Out of Stock
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    {product.stock} Units In Stock
                  </span>
                )}
              </div>
            </div>

            {/* Price section */}
            <div className="flex items-baseline gap-3 my-4">
              <span className="text-3xl font-black text-neutral-950 dark:text-white">
                ${effectivePrice}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-base text-neutral-400 line-through">
                    ${product.price}
                  </span>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    Save \${product.price - product.discountPrice}
                  </span>
                </>
              )}
            </div>

            {/* Description */}
            <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed mb-4">
              {product.description}
            </p>

            {/* Specs Highlights */}
            {product.specs && product.specs.length > 0 && (
              <div className="grid grid-cols-2 gap-2 mb-6 p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-950/60 border border-neutral-100 dark:border-neutral-800 text-xs">
                {product.specs.map((spec, i) => (
                  <div key={i} className="flex flex-col">
                    <span className="text-neutral-400 font-medium">{spec.key}</span>
                    <span className="font-bold text-neutral-800 dark:text-neutral-200">{spec.value}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Quantity Selector & Action Buttons */}
            <div className="mt-auto space-y-3 pt-2">
              <div className="flex items-center gap-3">
                <div className="flex items-center rounded-2xl bg-neutral-100 dark:bg-neutral-800 p-1">
                  <button
                    disabled={quantity <= 1 || isOutOfStock}
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="p-2 rounded-xl text-neutral-600 dark:text-neutral-300 hover:bg-white dark:hover:bg-neutral-700 disabled:opacity-40 transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-10 text-center text-sm font-bold text-neutral-900 dark:text-white">
                    {quantity}
                  </span>
                  <button
                    disabled={quantity >= product.stock || isOutOfStock}
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    className="p-2 rounded-xl text-neutral-600 dark:text-neutral-300 hover:bg-white dark:hover:bg-neutral-700 disabled:opacity-40 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  disabled={isOutOfStock || isAdding}
                  onClick={handleAddToCart}
                  className="flex-1 py-3.5 px-5 rounded-2xl bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 font-bold text-sm shadow-xl hover:bg-neutral-800 dark:hover:bg-neutral-100 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{isAdding ? "Adding..." : "Add to Cart"}</span>
                </button>
              </div>

              <button
                disabled={isOutOfStock}
                onClick={handleBuyNow}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-extrabold text-sm shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                <span>Buy Now with 1-Click</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Guarantees */}
              <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-2">
                <div className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-amber-500" />
                  <span>Free Express Shipping</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>2 Year Official Warranty</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
