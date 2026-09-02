import React, { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import api from "../GlobalUrl";
import Hero from "../Components/Hero";
import ProductCard from "../Components/ProductCard";
import ProductModal from "../Components/ProductModal";
import {
  Search,
  Sparkles,
  ArrowUpDown,
  Package,
} from "lucide-react";

export default function Home() {
  const location = useLocation();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [selectedProductForModal, setSelectedProductForModal] = useState(null);

  // Sync category & search from URL if present
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const cat = params.get("category");
    const q = params.get("search");

    if (cat) setSelectedCategory(cat);
    else setSelectedCategory("All");

    if (q) setSearchQuery(q);
    else setSearchQuery("");
  }, [location.search]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get("/products/categories");
        if (res.data?.success && res.data.categories) {
          setCategories(["All", ...res.data.categories]);
        }
      } catch (err) {
        console.warn("Could not fetch categories:", err.message);
        setCategories(["All", "Electronics", "Fashion", "Footwear", "Home & Living", "Beauty", "Accessories"]);
      }
    };
    fetchCategories();
  }, []);

  // Fetch products based on filters
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCategory && selectedCategory !== "All") params.append("category", selectedCategory);
      if (searchQuery) params.append("search", searchQuery);
      if (sortBy) params.append("sort", sortBy);

      const res = await api.get(`/products?${params.toString()}`);
      if (res.data?.success) {
        let prods = res.data.products || [];
        if (inStockOnly) {
          prods = prods.filter((p) => p.stock > 0);
        }
        setProducts(prods);
      }
    } catch (err) {
      console.error("Error fetching products:", err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, searchQuery, sortBy, inStockOnly]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <div className="min-h-screen bg-neutral-50/50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
      {/* Hero Banner Section */}
      <Hero
        onCategorySelect={(cat) => {
          setSelectedCategory(cat);
        }}
      />

      {/* Main Catalog Section */}
      <main id="products-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Section Header & Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest bg-amber-500/10 text-amber-600 dark:text-amber-400 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Explore The Catalog</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              {selectedCategory === "All" ? "Featured Products" : `${selectedCategory} Collection`}
            </h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              Showing {products.length} handpicked pieces with premier craftsmanship.
            </p>
          </div>

          {/* Quick Sort Dropdown */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white dark:bg-neutral-900 px-3.5 py-2.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm text-xs font-semibold">
              <ArrowUpDown className="w-3.5 h-3.5 text-neutral-400" />
              <span className="text-neutral-500">Sort By:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent border-none focus:outline-none font-bold text-neutral-900 dark:text-white cursor-pointer"
              >
                <option value="newest">Newest Arrivals</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>

            {/* In Stock Toggle */}
            <button
              onClick={() => setInStockOnly((prev) => !prev)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-2xl text-xs font-semibold border transition-all ${
                inStockOnly
                  ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700/60"
                  : "bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300"
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${inStockOnly ? "bg-emerald-500" : "bg-neutral-400"}`} />
              <span>In Stock Only</span>
            </button>
          </div>
        </div>

        {/* Category Pills Bar */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-4 mb-8 scrollbar-none">
          {(categories.length > 0
            ? categories
            : ["All", "Electronics", "Fashion", "Footwear", "Home & Living", "Beauty", "Accessories"]
          ).map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all duration-200 shrink-0 ${
                  isSelected
                    ? "bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 shadow-lg shadow-neutral-950/10 scale-102"
                    : "bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-800/80"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Search status notification if searching */}
        {searchQuery && (
          <div className="mb-6 flex items-center justify-between p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-800 dark:text-amber-200">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-amber-600" />
              <span>Search results for <strong>"{searchQuery}"</strong></span>
            </div>
            <button
              onClick={() => setSearchQuery("")}
              className="font-bold underline hover:no-underline"
            >
              Clear Search
            </button>
          </div>
        )}

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-4 space-y-4 animate-pulse"
              >
                <div className="aspect-square w-full rounded-2xl bg-neutral-200 dark:bg-neutral-800"></div>
                <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-1/3"></div>
                <div className="h-5 bg-neutral-200 dark:bg-neutral-800 rounded w-3/4"></div>
                <div className="h-6 bg-neutral-200 dark:bg-neutral-800 rounded w-1/2 pt-2"></div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onQuickView={(p) => setSelectedProductForModal(p)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 px-4 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
            <Package className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-neutral-800 dark:text-neutral-200 mb-2">
              No products found
            </h3>
            <p className="text-sm text-neutral-500 max-w-md mx-auto mb-6">
              We couldn't find any products matching your active filters. Try changing your search keywords or category.
            </p>
            <button
              onClick={() => {
                setSelectedCategory("All");
                setSearchQuery("");
                setInStockOnly(false);
              }}
              className="px-6 py-2.5 rounded-2xl bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 text-xs font-bold"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </main>

      {/* Quick View Modal */}
      {selectedProductForModal && (
        <ProductModal
          product={selectedProductForModal}
          onClose={() => setSelectedProductForModal(null)}
        />
      )}
    </div>
  );
}
