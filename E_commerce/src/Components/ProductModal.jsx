import React, { useState } from "react";
import {
  X,
  Star,
  ShoppingBag,
  Truck,
  ShieldCheck,
  ArrowRight,
  Minus,
  Plus,
  MessageSquare,
  Sparkles,
  Send,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useNavigate, Link } from "react-router-dom";
import api from "../GlobalUrl";

export default function ProductModal({ product: initialProduct, onClose }) {
  const { addToCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [product, setProduct] = useState(initialProduct);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [activeTab, setActiveTab] = useState("overview"); // "overview" | "reviews"

  // Review submission state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewHoverRating, setReviewHoverRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  if (!product) return null;

  const images =
    product.images && product.images.length > 0
      ? product.images
      : ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80"];

  const currentImage = images[selectedImageIndex] || images[0];

  const hasDiscount = product.discountPrice > 0 && product.discountPrice < product.price;
  const effectivePrice = hasDiscount ? product.discountPrice : product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  const isOutOfStock = product.stock <= 0;
  const reviews = product.reviews || [];

  const handleAddToCart = async () => {
    if (isOutOfStock) return;
    setIsAdding(true);
    await addToCart(product, quantity);
    setIsAdding(false);
  };

  const handleBuyNow = async () => {
    if (isOutOfStock) return;
    const ok = await addToCart(product, quantity);
    if (ok) {
      onClose();
      navigate("/cart");
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      error("Please sign in to write a review");
      return;
    }
    if (!reviewComment.trim()) {
      error("Please enter a review comment");
      return;
    }

    try {
      setIsSubmittingReview(true);
      const res = await api.post(`/products/${product._id}/reviews`, {
        rating: reviewRating,
        comment: reviewComment.trim(),
      });
      if (res.data?.success && res.data.product) {
        setProduct(res.data.product);
        setReviewComment("");
        setReviewRating(5);
        success(res.data.message || "Review submitted successfully!");
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to submit review";
      error(msg);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-4xl rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden my-auto animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-neutral-100/90 dark:bg-neutral-800/90 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors shadow-sm"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="overflow-y-auto p-6 sm:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column: Image Gallery */}
            <div className="flex flex-col gap-4">
              {/* Main Featured Image */}
              <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-neutral-100 dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-800 shadow-inner">
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

            {/* Right Column: Details, Reviews, & Actions */}
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
              <div className="flex items-center justify-between mt-3 pb-3 border-b border-neutral-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setActiveTab("reviews")}
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity text-left"
                >
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
                    {product.rating || 5.0}
                  </span>
                  <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold underline">
                    ({product.numReviews || reviews.length} customer {reviews.length === 1 ? "review" : "reviews"})
                  </span>
                </button>

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

              {/* Modal Tabs Navigation */}
              <div className="flex items-center gap-2 mt-3 border-b border-neutral-100 dark:border-neutral-800 pb-2">
                <button
                  onClick={() => setActiveTab("overview")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === "overview"
                      ? "bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 shadow-sm"
                      : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                  }`}
                >
                  Overview & Specs
                </button>
                <button
                  onClick={() => setActiveTab("reviews")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeTab === "reviews"
                      ? "bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 shadow-sm"
                      : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Customer Reviews ({reviews.length})</span>
                </button>
              </div>

              {/* TAB 1: OVERVIEW & SPECS */}
              {activeTab === "overview" && (
                <div className="flex-1 flex flex-col justify-between pt-3 space-y-4">
                  {/* Price section */}
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-black text-neutral-950 dark:text-white">
                      ₹{Number(effectivePrice).toLocaleString("en-IN")}
                    </span>
                    {hasDiscount && (
                      <>
                        <span className="text-base text-neutral-400 line-through">
                          ₹{Number(product.price).toLocaleString("en-IN")}
                        </span>
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          Save ₹{Number(product.price - product.discountPrice).toLocaleString("en-IN")}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                    {product.description}
                  </p>

                  {/* Specs Highlights */}
                  {product.specs && product.specs.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-950/60 border border-neutral-100 dark:border-neutral-800 text-xs">
                      {product.specs.map((spec, i) => (
                        <div key={i} className="flex flex-col">
                          <span className="text-neutral-400 font-medium">{spec.key}</span>
                          <span className="font-bold text-neutral-800 dark:text-neutral-200">
                            {spec.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Quantity Selector & Action Buttons */}
                  <div className="space-y-3 pt-2">
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
                    <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-1">
                      <div className="flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-amber-500" />
                        <span>Free Express Shipping over ₹999</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                        <span>2 Year Official Warranty</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: REAL CUSTOMER REVIEWS */}
              {activeTab === "reviews" && (
                <div className="flex-1 flex flex-col pt-3 space-y-4 max-h-[400px] overflow-y-auto pr-1">
                  {/* Write a Review Section */}
                  <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>Write a Customer Review</span>
                      </h4>
                      {isAuthenticated && (
                        <span className="text-[11px] text-neutral-400">
                          as <strong>{user?.first_name} {user?.last_name}</strong>
                        </span>
                      )}
                    </div>

                    {isAuthenticated ? (
                      <form onSubmit={handleSubmitReview} className="space-y-3">
                        {/* Interactive Star Rating Selector */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-neutral-600 dark:text-neutral-400">
                            Your Rating:
                          </span>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setReviewRating(star)}
                                onMouseEnter={() => setReviewHoverRating(star)}
                                onMouseLeave={() => setReviewHoverRating(0)}
                                className="p-1 hover:scale-110 transition-transform text-amber-400"
                              >
                                <Star
                                  className={`w-5 h-5 ${
                                    star <= (reviewHoverRating || reviewRating)
                                      ? "fill-amber-400 text-amber-400"
                                      : "text-neutral-300 dark:text-neutral-700"
                                  }`}
                                />
                              </button>
                            ))}
                          </div>
                          <span className="text-xs font-black text-amber-500">
                            {reviewRating} / 5 Stars
                          </span>
                        </div>

                        {/* Review Comment Textarea */}
                        <textarea
                          rows={2}
                          required
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          placeholder="Share your genuine feedback on quality, comfort, design..."
                          className="w-full px-3 py-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs font-medium focus:outline-none focus:border-amber-500"
                        />

                        <button
                          type="submit"
                          disabled={isSubmittingReview}
                          className="w-full py-2.5 rounded-xl bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 text-xs font-bold shadow-md hover:bg-neutral-800 dark:hover:bg-neutral-100 flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>{isSubmittingReview ? "Submitting Review..." : "Post Verified Review"}</span>
                        </button>
                      </form>
                    ) : (
                      <div className="text-center py-3">
                        <p className="text-xs text-neutral-500 mb-2">
                          Sign in to leave a verified rating and review for this product.
                        </p>
                        <Link
                          to="/login"
                          onClick={onClose}
                          className="inline-block px-4 py-1.5 rounded-xl bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 text-xs font-bold shadow-sm"
                        >
                          Sign In to Review
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* Reviews List */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                      Verified Customer Feedback ({reviews.length})
                    </h4>

                    {reviews.length > 0 ? (
                      reviews.map((rev, idx) => (
                        <div
                          key={rev._id || idx}
                          className="p-3.5 rounded-2xl bg-neutral-50/60 dark:bg-neutral-950/40 border border-neutral-100 dark:border-neutral-800/80 space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-500 to-rose-500 text-white font-bold text-[10px] flex items-center justify-center">
                                {rev.name ? rev.name[0].toUpperCase() : "U"}
                              </div>
                              <span className="text-xs font-bold text-neutral-900 dark:text-white">
                                {rev.name}
                              </span>
                            </div>

                            <div className="flex items-center gap-1 text-amber-400">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3 h-3 ${
                                    i < rev.rating
                                      ? "fill-amber-400 text-amber-400"
                                      : "text-neutral-300 dark:text-neutral-700"
                                  }`}
                                />
                              ))}
                              <span className="text-[10px] text-neutral-400 ml-1">
                                {rev.createdAt
                                  ? new Date(rev.createdAt).toLocaleDateString("en-IN", {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                    })
                                  : "Recently"}
                              </span>
                            </div>
                          </div>

                          <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed pl-8">
                            "{rev.comment}"
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl">
                        <MessageSquare className="w-6 h-6 text-neutral-400 mx-auto mb-1" />
                        <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                          No customer reviews yet.
                        </p>
                        <p className="text-[11px] text-neutral-400">
                          Be the first to review this handcrafted piece!
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
