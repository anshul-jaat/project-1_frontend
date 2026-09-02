import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import api from "../GlobalUrl";
import {
  Layers,
  Plus,
  Trash2,
  Edit,
  IndianRupee,
  Package,
  Users,
  ShoppingBag,
  TrendingUp,
  X,
  Upload,
  AlertTriangle,
  RefreshCw,
  Search,
} from "lucide-react";

export default function AdminDashboard() {
  const { isAdmin } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("overview"); // overview, products, orders, users
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Products state
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [selectedProductCategory, setSelectedProductCategory] = useState("All");

  // Add / Edit Product Modal state
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [productForm, setProductForm] = useState({
    title: "",
    description: "",
    price: "",
    discountPrice: "",
    category: "Electronics",
    brand: "",
    stock: "",
    isFeatured: false,
    isTrending: false,
  });

  // Photo management state
  const [existingImages, setExistingImages] = useState([]);
  const [imagesToRemove, setImagesToRemove] = useState([]);
  const [newUploadedFiles, setNewUploadedFiles] = useState([]);
  const [newUploadedPreviews, setNewUploadedPreviews] = useState([]);
  const [newImageUrlInput, setNewImageUrlInput] = useState("");
  const [isSubmittingProduct, setIsSubmittingProduct] = useState(false);

  // Orders state
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Users state
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Delete confirm modal state
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Fetch Dashboard Stats
  const fetchStats = useCallback(async () => {
    try {
      setLoadingStats(true);
      const res = await api.get("/admin/stats");
      if (res.data?.success) {
        setStats(res.data.stats);
      }
    } catch (err) {
      console.warn("Could not fetch admin stats:", err.message);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  // Fetch Products
  const fetchProducts = useCallback(async () => {
    try {
      setLoadingProducts(true);
      const res = await api.get("/products?limit=100");
      if (res.data?.success) {
        setProducts(res.data.products || []);
      }
    } catch (err) {
      console.error("Could not fetch products:", err.message);
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  // Fetch Orders
  const fetchOrders = useCallback(async () => {
    try {
      setLoadingOrders(true);
      const res = await api.get("/orders/all");
      if (res.data?.success) {
        setOrders(res.data.orders || []);
      }
    } catch (err) {
      console.error("Could not fetch orders:", err.message);
    } finally {
      setLoadingOrders(false);
    }
  }, []);

  // Fetch Users
  const fetchUsers = useCallback(async () => {
    try {
      setLoadingUsers(true);
      const res = await api.get("/admin/users");
      if (res.data?.success) {
        setUsers(res.data.users || []);
      }
    } catch (err) {
      console.error("Could not fetch users:", err.message);
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) {
      fetchStats();
      if (activeTab === "products") fetchProducts();
      if (activeTab === "orders") fetchOrders();
      if (activeTab === "users") fetchUsers();
    }
  }, [isAdmin, activeTab, fetchStats, fetchProducts, fetchOrders, fetchUsers]);

  // Open modal for Creating new Product
  const handleOpenAddProduct = () => {
    setEditingProductId(null);
    setProductForm({
      title: "",
      description: "",
      price: "",
      discountPrice: "",
      category: "Electronics",
      brand: "Generic",
      stock: "20",
      isFeatured: false,
      isTrending: false,
    });
    setExistingImages([]);
    setImagesToRemove([]);
    setNewUploadedFiles([]);
    setNewUploadedPreviews([]);
    setNewImageUrlInput("");
    setProductModalOpen(true);
  };

  // Open modal for Editing Product
  const handleOpenEditProduct = (prod) => {
    setEditingProductId(prod._id);
    setProductForm({
      title: prod.title || "",
      description: prod.description || "",
      price: prod.price || "",
      discountPrice: prod.discountPrice || "",
      category: prod.category || "Electronics",
      brand: prod.brand || "Generic",
      stock: prod.stock !== undefined ? prod.stock : "10",
      isFeatured: !!prod.isFeatured,
      isTrending: !!prod.isTrending,
    });
    setExistingImages(prod.images || []);
    setImagesToRemove([]);
    setNewUploadedFiles([]);
    setNewUploadedPreviews([]);
    setNewImageUrlInput("");
    setProductModalOpen(true);
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setNewUploadedFiles((prev) => [...prev, ...files]);
    const previews = files.map((file) => URL.createObjectURL(file));
    setNewUploadedPreviews((prev) => [...prev, ...previews]);
  };

  // Remove a newly selected uploaded file before saving
  const handleRemoveNewUploadedFile = (index) => {
    setNewUploadedFiles((prev) => prev.filter((_, i) => i !== index));
    setNewUploadedPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Add photo via direct URL
  const handleAddImageUrl = () => {
    if (!newImageUrlInput.trim()) return;
    setExistingImages((prev) => [...prev, newImageUrlInput.trim()]);
    setNewImageUrlInput("");
  };

  // Remove an existing photo
  const handleRemoveExistingImage = (imageUrl) => {
    setExistingImages((prev) => prev.filter((img) => img !== imageUrl));
    setImagesToRemove((prev) => [...prev, imageUrl]);
  };

  // Submit Add / Edit Product
  const handleProductFormSubmit = async (e) => {
    e.preventDefault();

    if (!productForm.title || !productForm.description || !productForm.price || !productForm.category) {
      error("Please fill in all required product fields");
      return;
    }

    try {
      setIsSubmittingProduct(true);

      const formData = new FormData();
      formData.append("title", productForm.title);
      formData.append("description", productForm.description);
      formData.append("price", productForm.price);
      formData.append("discountPrice", productForm.discountPrice || 0);
      formData.append("category", productForm.category);
      formData.append("brand", productForm.brand || "Generic");
      formData.append("stock", productForm.stock || 0);
      formData.append("isFeatured", productForm.isFeatured);
      formData.append("isTrending", productForm.isTrending);

      // Remaining existing images
      formData.append("images", JSON.stringify(existingImages));

      // Removed images
      if (imagesToRemove.length > 0) {
        formData.append("removeImages", JSON.stringify(imagesToRemove));
      }

      // Append newly selected files
      for (const file of newUploadedFiles) {
        formData.append("images", file);
      }

      let res;
      if (editingProductId) {
        res = await api.put(`/products/${editingProductId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        res = await api.post("/products", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      if (res.data?.success) {
        success(editingProductId ? "Product updated successfully!" : "Product created successfully!");
        setProductModalOpen(false);
        fetchProducts();
        fetchStats();
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to save product";
      error(msg);
    } finally {
      setIsSubmittingProduct(false);
    }
  };

  // Delete product
  const handleDeleteProduct = async (id) => {
    try {
      const res = await api.delete(`/products/${id}`);
      if (res.data?.success) {
        success("Product removed from store");
        setDeleteConfirmId(null);
        fetchProducts();
        fetchStats();
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to delete product";
      error(msg);
    }
  };

  // Seed sample products
  const handleSeedProducts = async () => {
    try {
      const res = await api.post("/products/seed");
      if (res.data?.success) {
        success(`Catalog replenished with ${res.data.count} aesthetic luxury products!`);
        fetchProducts();
        fetchStats();
      }
    } catch (err) {
      error("Failed to seed products");
    }
  };

  // Update order status
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await api.put(`/orders/${orderId}/status`, { status: newStatus });
      if (res.data?.success) {
        success(`Order status updated to "${newStatus}"`);
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
        );
        fetchStats();
      }
    } catch (err) {
      error("Failed to update status");
    }
  };

  // Toggle user role
  const handleToggleUserRole = async (userId, currentRole) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    try {
      const res = await api.patch(`/admin/users/${userId}/role`, { role: newRole });
      if (res.data?.success) {
        success(`User role updated to ${newRole.toUpperCase()}`);
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
        );
      }
    } catch (err) {
      error("Failed to update user role");
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-3xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center mb-4">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black mb-2">Administrator Access Required</h2>
        <p className="text-sm text-neutral-500 max-w-md mb-6">
          This portal requires administrator privileges. You can switch your active role to Admin in the top navigation bar with 1 click.
        </p>
        <button
          onClick={() => navigate("/")}
          className="px-6 py-2.5 rounded-2xl bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 font-bold text-xs"
        >
          Return to Storefront
        </button>
      </div>
    );
  }

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.category.toLowerCase().includes(productSearch.toLowerCase()) ||
      (p.brand && p.brand.toLowerCase().includes(productSearch.toLowerCase()));
    const matchesCategory =
      selectedProductCategory === "All" || p.category === selectedProductCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-neutral-50/50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-amber-500/10 text-amber-600 dark:text-amber-400 mb-2">
              <Layers className="w-3.5 h-3.5" />
              <span>Control Center</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight">Admin Portal & Management</h1>
            <p className="text-xs text-neutral-500 mt-1">
              Add and manage store products, photos, customer orders, and access permissions.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleSeedProducts}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-bold shadow-sm hover:border-amber-500 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5 text-amber-500" />
              <span>Replenish Demo Items</span>
            </button>

            <button
              onClick={handleOpenAddProduct}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-2xl bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 text-xs font-black shadow-xl hover:bg-neutral-800 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Product</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-neutral-200 dark:border-neutral-800 pb-2 overflow-x-auto scrollbar-none">
          {[
            { id: "overview", label: "Dashboard Overview", icon: TrendingUp },
            { id: "products", label: `Product Catalog (${products.length})`, icon: ShoppingBag },
            { id: "orders", label: `Customer Orders (${orders.length})`, icon: Package },
            { id: "users", label: `User Management (${users.length})`, icon: Users },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 shadow-md"
                    : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: OVERVIEW METRICS */}
        {activeTab === "overview" && (
          <div className="space-y-8 animate-in fade-in">
            {/* Stat Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  label: "Total Store Revenue",
                  value: `₹${Number(stats?.totalRevenue || 0).toLocaleString("en-IN")}`,
                  sub: "From delivered & active orders",
                  icon: IndianRupee,
                  color: "from-amber-500 to-rose-500",
                },
                {
                  label: "Total Units Sold",
                  value: `${Number(stats?.totalItemsSold || 0).toLocaleString("en-IN")} pcs`,
                  sub: `${stats?.totalOrders || 0} customer orders placed`,
                  icon: ShoppingBag,
                  color: "from-indigo-500 to-blue-500",
                },
                {
                  label: "Average Order Value",
                  value: `₹${Number(stats?.averageOrderValue || 0).toLocaleString("en-IN")}`,
                  sub: "Across active customer checkouts",
                  icon: TrendingUp,
                  color: "from-emerald-500 to-teal-500",
                },
                {
                  label: "Active Products Catalog",
                  value: stats?.totalProducts || products.length || 0,
                  sub: `${stats?.lowStockCount || 0} low on stock (<=5 units)`,
                  icon: Package,
                  color: "from-purple-500 to-pink-500",
                },
              ].map((card, idx) => {
                const Icon = card.icon;
                return (
                  <div
                    key={idx}
                    className="rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm relative overflow-hidden"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                        {card.label}
                      </span>
                      <div className={`w-10 h-10 rounded-2xl bg-gradient-to-tr ${card.color} flex items-center justify-center text-white shadow-md`}>
                        <Icon className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="text-3xl font-black text-neutral-950 dark:text-white">
                      {card.value}
                    </div>
                    <div className="text-xs text-neutral-400 mt-1">{card.sub}</div>
                  </div>
                );
              })}
            </div>

            {/* Orders Fulfillment Summary Banner */}
            <div className="rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                  Live Order Fulfillment Pipeline
                </h4>
                <button
                  onClick={() => setActiveTab("orders")}
                  className="text-xs font-bold text-amber-500 hover:underline"
                >
                  View All Orders →
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
                <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40">
                  <div className="text-xl font-black text-amber-600 dark:text-amber-400">
                    {stats?.pendingOrdersCount || 0}
                  </div>
                  <div className="text-[11px] font-bold text-neutral-500 mt-0.5">Pending</div>
                </div>

                <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40">
                  <div className="text-xl font-black text-blue-600 dark:text-blue-400">
                    {stats?.processingOrdersCount || 0}
                  </div>
                  <div className="text-[11px] font-bold text-neutral-500 mt-0.5">Processing</div>
                </div>

                <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/40">
                  <div className="text-xl font-black text-indigo-600 dark:text-indigo-400">
                    {stats?.shippedOrdersCount || 0}
                  </div>
                  <div className="text-[11px] font-bold text-neutral-500 mt-0.5">In Transit</div>
                </div>

                <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40">
                  <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                    {stats?.deliveredOrdersCount || 0}
                  </div>
                  <div className="text-[11px] font-bold text-neutral-500 mt-0.5">Delivered</div>
                </div>

                <div className="p-3 rounded-2xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
                  <div className="text-xl font-black text-neutral-500">
                    {stats?.cancelledOrdersCount || 0}
                  </div>
                  <div className="text-[11px] font-bold text-neutral-500 mt-0.5">Cancelled</div>
                </div>
              </div>
            </div>

            {/* Quick Management Shortcuts */}
            <div className="rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 sm:p-8 space-y-4">
              <h3 className="text-lg font-bold">Quick Administrative Shortcuts</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-bold">
                <button
                  onClick={() => {
                    setActiveTab("products");
                    handleOpenAddProduct();
                  }}
                  className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 hover:border-amber-500 flex items-center gap-3 text-left transition-all"
                >
                  <Plus className="w-5 h-5 text-amber-500" />
                  <div>
                    <div>Add New Product</div>
                    <span className="text-[11px] text-neutral-400 font-normal">Upload photos & define specs</span>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab("orders")}
                  className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 hover:border-amber-500 flex items-center gap-3 text-left transition-all"
                >
                  <Package className="w-5 h-5 text-indigo-500" />
                  <div>
                    <div>Review Customer Orders</div>
                    <span className="text-[11px] text-neutral-400 font-normal">Update shipment & delivery statuses</span>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab("users")}
                  className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 hover:border-amber-500 flex items-center gap-3 text-left transition-all"
                >
                  <Users className="w-5 h-5 text-emerald-500" />
                  <div>
                    <div>Manage User Roles</div>
                    <span className="text-[11px] text-neutral-400 font-normal">Assign admin privileges</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PRODUCTS MANAGER */}
        {activeTab === "products" && (
          <div className="space-y-6 animate-in fade-in">
            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:w-80">
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Filter products..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs font-medium focus:outline-none"
                />
                <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
              </div>

              <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
                {["All", "Electronics", "Fashion", "Footwear", "Home & Living", "Beauty", "Accessories"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedProductCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                      selectedProductCategory === cat
                        ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 font-bold"
                        : "bg-white dark:bg-neutral-900 text-neutral-500 border border-neutral-200 dark:border-neutral-800"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Products Table */}
            <div className="rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-50 dark:bg-neutral-950 text-neutral-400 uppercase tracking-wider font-bold border-b border-neutral-200 dark:border-neutral-800">
                    <tr>
                      <th className="py-4 px-6">Product</th>
                      <th className="py-4 px-6">Category</th>
                      <th className="py-4 px-6">Price</th>
                      <th className="py-4 px-6">Stock</th>
                      <th className="py-4 px-6">Photos</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 font-medium">
                    {filteredProducts.map((prod) => {
                      const img = prod.images?.[0] || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100";
                      return (
                        <tr key={prod._id} className="hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40 transition-colors">
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <img
                                src={img}
                                alt={prod.title}
                                className="w-12 h-12 rounded-xl object-cover bg-neutral-100 shrink-0"
                              />
                              <div className="min-w-0 max-w-xs">
                                <div className="font-bold text-neutral-900 dark:text-white truncate">
                                  {prod.title}
                                </div>
                                <div className="text-[11px] text-neutral-400">{prod.brand}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6 font-bold text-neutral-600 dark:text-neutral-300">
                            {prod.category}
                          </td>
                          <td className="py-4 px-6">
                            <span className="font-black text-neutral-900 dark:text-white">
                              ₹{Number(prod.discountPrice > 0 ? prod.discountPrice : prod.price).toLocaleString("en-IN")}
                            </span>
                            {prod.discountPrice > 0 && (
                              <span className="text-[10px] text-neutral-400 line-through ml-1.5">
                                ₹{Number(prod.price).toLocaleString("en-IN")}
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-6">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                prod.stock <= 0
                                  ? "bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400"
                                  : prod.stock <= 5
                                  ? "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400"
                                  : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
                              }`}
                            >
                              {prod.stock} units
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <span className="text-neutral-500 font-bold">
                              {prod.images?.length || 0} photos
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleOpenEditProduct(prod)}
                                className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 transition-colors"
                                title="Edit Product & Photos"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(prod._id)}
                                className="p-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-500 transition-colors"
                                title="Delete Product"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ORDERS MANAGER */}
        {activeTab === "orders" && (
          <div className="space-y-6 animate-in fade-in">
            <h3 className="text-lg font-bold">Customer Orders Management</h3>

            <div className="rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-50 dark:bg-neutral-950 text-neutral-400 uppercase tracking-wider font-bold border-b border-neutral-200 dark:border-neutral-800">
                    <tr>
                      <th className="py-4 px-6">Order ID</th>
                      <th className="py-4 px-6">Customer</th>
                      <th className="py-4 px-6">Items Ordered</th>
                      <th className="py-4 px-6">Amount</th>
                      <th className="py-4 px-6">Payment</th>
                      <th className="py-4 px-6">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 font-medium">
                    {orders.map((ord) => (
                      <tr key={ord._id} className="hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40 transition-colors">
                        <td className="py-4 px-6 font-mono font-bold">
                          #{ord._id.substring(ord._id.length - 6).toUpperCase()}
                        </td>
                        <td className="py-4 px-6">
                          <div className="font-bold text-neutral-900 dark:text-white">
                            {ord.user?.first_name} {ord.user?.last_name}
                          </div>
                          <div className="text-[11px] text-neutral-400">{ord.user?.email}</div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="space-y-1">
                            {ord.orderItems?.map((item, i) => (
                              <div key={i} className="text-neutral-700 dark:text-neutral-300">
                                {item.quantity}× {item.title}
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="py-4 px-6 font-black text-neutral-900 dark:text-white text-sm">
                          ₹{Number(ord.totalAmount).toLocaleString("en-IN")}
                        </td>
                        <td className="py-4 px-6">
                          <span className="font-bold text-neutral-700 dark:text-neutral-300">
                            {ord.paymentMethod}
                          </span>
                          <div className="text-[10px] text-neutral-400 font-semibold">{ord.paymentStatus}</div>
                        </td>
                        <td className="py-4 px-6">
                          <select
                            value={ord.status}
                            onChange={(e) => handleUpdateOrderStatus(ord._id, e.target.value)}
                            className="px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 font-bold text-xs border-none focus:outline-none cursor-pointer"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: USERS MANAGER */}
        {activeTab === "users" && (
          <div className="space-y-6 animate-in fade-in">
            <h3 className="text-lg font-bold">User Access & Role Management</h3>

            <div className="rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-50 dark:bg-neutral-950 text-neutral-400 uppercase tracking-wider font-bold border-b border-neutral-200 dark:border-neutral-800">
                    <tr>
                      <th className="py-4 px-6">User</th>
                      <th className="py-4 px-6">Email</th>
                      <th className="py-4 px-6">Role</th>
                      <th className="py-4 px-6">Member Since</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 font-medium">
                    {users.map((u) => (
                      <tr key={u._id} className="hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40 transition-colors">
                        <td className="py-4 px-6 font-bold text-neutral-900 dark:text-white">
                          {u.first_name} {u.last_name}
                        </td>
                        <td className="py-4 px-6 text-neutral-500">{u.email}</td>
                        <td className="py-4 px-6">
                          <span
                            className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${
                              u.role === "admin"
                                ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                                : "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                            }`}
                          >
                            {u.role || "user"}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-neutral-400">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => handleToggleUserRole(u._id, u.role)}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-neutral-100 dark:bg-neutral-800 hover:bg-amber-500 hover:text-black transition-all"
                          >
                            {u.role === "admin" ? "Demote to User" : "Promote to Admin"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ADD / EDIT PRODUCT MODAL */}
      {productModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in overflow-y-auto">
          <div className="w-full max-w-3xl rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 sm:p-8 shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800">
              <h3 className="text-xl font-black">
                {editingProductId ? "Edit Product & Photos" : "Add New Product"}
              </h3>
              <button
                onClick={() => setProductModalOpen(false)}
                className="p-2 rounded-full bg-neutral-100 dark:bg-neutral-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleProductFormSubmit} className="space-y-6">
              {/* Basic Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold mb-1">Product Title *</label>
                  <input
                    type="text"
                    required
                    value={productForm.title}
                    onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                    placeholder="e.g. Wireless Noise Cancelling Headphones"
                    className="w-full px-4 py-2.5 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-xs font-medium focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">Description *</label>
                  <textarea
                    rows={3}
                    required
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    placeholder="Describe key luxury craftsmanship, materials, specs..."
                    className="w-full px-4 py-2.5 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-xs font-medium focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-bold mb-1">Price (₹) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                      placeholder="2499"
                      className="w-full px-3 py-2.5 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1">Discount Price (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={productForm.discountPrice}
                      onChange={(e) => setProductForm({ ...productForm, discountPrice: e.target.value })}
                      placeholder="1999"
                      className="w-full px-3 py-2.5 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1">Stock Units *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={productForm.stock}
                      onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                      placeholder="25"
                      className="w-full px-3 py-2.5 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1">Brand</label>
                    <input
                      type="text"
                      value={productForm.brand}
                      onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                      placeholder="LuminaCraft"
                      className="w-full px-3 py-2.5 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-xs font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold mb-1">Category *</label>
                    <select
                      value={productForm.category}
                      onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-xs font-bold"
                    >
                      <option value="Electronics">Electronics</option>
                      <option value="Fashion">Fashion</option>
                      <option value="Footwear">Footwear</option>
                      <option value="Home & Living">Home & Living</option>
                      <option value="Beauty">Beauty</option>
                      <option value="Accessories">Accessories</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-6 pt-5">
                    <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={productForm.isFeatured}
                        onChange={(e) => setProductForm({ ...productForm, isFeatured: e.target.checked })}
                        className="rounded accent-amber-500 w-4 h-4"
                      />
                      <span>Featured Product</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={productForm.isTrending}
                        onChange={(e) => setProductForm({ ...productForm, isTrending: e.target.checked })}
                        className="rounded accent-amber-500 w-4 h-4"
                      />
                      <span>Trending Item</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* PHOTO MANAGER SECTION */}
              <div className="p-5 rounded-3xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-200">
                      Product Photos & Gallery Manager
                    </h4>
                    <p className="text-[11px] text-neutral-400">
                      Add, view, and remove individual photos dynamically.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-amber-500">
                    Total: {existingImages.length + newUploadedPreviews.length} photos
                  </span>
                </div>

                {/* Existing Images */}
                {existingImages.length > 0 && (
                  <div>
                    <span className="text-[11px] font-bold text-neutral-400 block mb-2">
                      Active Stored Photos (Click 'X' to Remove):
                    </span>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                      {existingImages.map((imgUrl, i) => (
                        <div key={i} className="relative aspect-square rounded-2xl overflow-hidden group border border-neutral-300 dark:border-neutral-700">
                          <img src={imgUrl} alt={`Prod ${i}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemoveExistingImage(imgUrl)}
                            className="absolute top-1 right-1 p-1 rounded-lg bg-rose-600 text-white shadow-md hover:scale-110 transition-transform"
                            title="Remove Photo"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* New Upload Previews */}
                {newUploadedPreviews.length > 0 && (
                  <div>
                    <span className="text-[11px] font-bold text-emerald-500 block mb-2">
                      Newly Selected Uploads (Pending Save):
                    </span>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                      {newUploadedPreviews.map((preview, i) => (
                        <div key={i} className="relative aspect-square rounded-2xl overflow-hidden group border-2 border-emerald-500">
                          <img src={preview} alt={`Upload ${i}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemoveNewUploadedFile(i)}
                            className="absolute top-1 right-1 p-1 rounded-lg bg-rose-600 text-white shadow-md hover:scale-110 transition-transform"
                            title="Remove Photo"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add Photo Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {/* File Upload Trigger */}
                  <label className="flex items-center justify-center gap-2 p-3 rounded-2xl border-2 border-dashed border-neutral-300 dark:border-neutral-700 hover:border-amber-500 cursor-pointer text-xs font-bold text-neutral-600 dark:text-neutral-300 transition-colors">
                    <Upload className="w-4 h-4 text-amber-500" />
                    <span>Upload Photos From Device</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>

                  {/* Add URL Input */}
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={newImageUrlInput}
                      onChange={(e) => setNewImageUrlInput(e.target.value)}
                      placeholder="Paste Image URL..."
                      className="flex-1 px-3 py-2 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs font-medium focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddImageUrl}
                      className="px-3.5 py-2 rounded-2xl bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 text-xs font-bold shrink-0"
                    >
                      Add URL
                    </button>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setProductModalOpen(false)}
                  className="flex-1 py-3 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingProduct}
                  className="flex-1 py-3 rounded-2xl bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 text-xs font-bold shadow-xl hover:bg-neutral-800 disabled:opacity-50"
                >
                  {isSubmittingProduct ? "Saving Product & Photos..." : editingProductId ? "Update Product" : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 mx-auto flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold">Delete Product?</h4>
            <p className="text-xs text-neutral-500">
              This action cannot be undone. The product and its photos will be permanently removed from the storefront.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2.5 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteProduct(deleteConfirmId)}
                className="flex-1 py-2.5 rounded-2xl bg-rose-600 text-white text-xs font-bold shadow-md hover:bg-rose-700"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
