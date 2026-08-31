import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import api from "../GlobalUrl";
import {
  User,
  MapPin,
  Lock,
  Package,
  Camera,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  Truck,
  ShieldCheck,
  Check,
  AlertCircle,
} from "lucide-react";

export default function Profile() {
  const { user, updateProfile, requestPasswordOtp, changePassword } = useAuth();
  const { success, error, info } = useToast();

  const [activeTab, setActiveTab] = useState("profile");

  // Profile form state
  const [firstName, setFirstName] = useState(user?.first_name || "");
  const [lastName, setLastName] = useState(user?.last_name || "");
  const [gender, setGender] = useState(user?.gender || "male");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(user?.profilePic || null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Address state
  const [addresses, setAddresses] = useState(user?.address_list || []);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [newAddress, setNewAddress] = useState({
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
    isDefault: false,
  });

  // Password change state
  const [passwordOtp, setPasswordOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [isChangingPass, setIsChangingPass] = useState(false);

  // Orders state
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    if (user) {
      setFirstName(user.first_name || "");
      setLastName(user.last_name || "");
      setGender(user.gender || "male");
      setPreviewUrl(user.profilePic || null);
      setAddresses(user.address_list || []);
    }
  }, [user]);

  // Fetch user orders when orders tab is active
  const fetchMyOrders = useCallback(async () => {
    try {
      setLoadingOrders(true);
      const res = await api.get("/orders/my-orders");
      if (res.data?.success) {
        setOrders(res.data.orders || []);
      }
    } catch (err) {
      console.warn("Could not fetch orders:", err.message);
    } finally {
      setLoadingOrders(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "orders") {
      fetchMyOrders();
    }
  }, [activeTab, fetchMyOrders]);

  // Handle Profile Picture selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // Save Profile details
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSavingProfile(true);

    const formData = new FormData();
    formData.append("first_name", firstName);
    formData.append("last_name", lastName);
    formData.append("gender", gender);

    if (selectedFile) {
      formData.append("profilePic", selectedFile);
    }

    const res = await updateProfile(formData);
    setIsSavingProfile(false);
    if (res?.success) {
      setSelectedFile(null);
    }
  };

  // Add new Address
  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!newAddress.street || !newAddress.city || !newAddress.state || !newAddress.postalCode) {
      error("Please fill in all address fields");
      return;
    }

    let updatedAddresses = [...addresses];
    if (newAddress.isDefault) {
      updatedAddresses = updatedAddresses.map((a) => ({ ...a, isDefault: false }));
    }
    updatedAddresses.push({ ...newAddress, _id: Date.now().toString() });

    const res = await updateProfile({ address_list: updatedAddresses });
    if (res?.success) {
      setAddresses(updatedAddresses);
      setShowAddressModal(false);
      setNewAddress({
        street: "",
        city: "",
        state: "",
        postalCode: "",
        country: "India",
        isDefault: false,
      });
      success("Address saved successfully!");
    }
  };

  // Delete Address
  const handleDeleteAddress = async (index) => {
    const updated = addresses.filter((_, i) => i !== index);
    const res = await updateProfile({ address_list: updated });
    if (res?.success) {
      setAddresses(updated);
      success("Address removed");
    }
  };

  // Set Default Address
  const handleSetDefaultAddress = async (index) => {
    const updated = addresses.map((addr, i) => ({
      ...addr,
      isDefault: i === index,
    }));
    const res = await updateProfile({ address_list: updated });
    if (res?.success) {
      setAddresses(updated);
      success("Default address updated");
    }
  };

  // Request password change OTP
  const handleRequestPasswordOtp = async () => {
    const res = await requestPasswordOtp();
    if (res?.success) {
      setOtpSent(true);
    }
  };

  // Submit Password Change
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      error("Passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      error("Password must be at least 6 characters");
      return;
    }
    if (!passwordOtp) {
      error("Please enter the OTP sent to your email");
      return;
    }

    setIsChangingPass(true);
    const res = await changePassword(passwordOtp, newPassword);
    setIsChangingPass(false);
    if (res?.success) {
      setPasswordOtp("");
      setNewPassword("");
      setConfirmPassword("");
      setOtpSent(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50/50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black tracking-tight">My Account & Settings</h1>
          <p className="text-xs text-neutral-500 mt-1">
            Manage your personal profile, addresses, security, and track your active orders.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* Left Sidebar Navigation */}
          <div className="lg:col-span-1 bg-white dark:bg-neutral-900 rounded-3xl p-3 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-1">
            {/* User Mini Card */}
            <div className="p-4 flex items-center gap-3 border-b border-neutral-100 dark:border-neutral-800 mb-2">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt={user?.first_name}
                  className="w-12 h-12 rounded-2xl object-cover ring-2 ring-amber-500/30"
                />
              ) : (
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 text-white font-black text-base flex items-center justify-center shadow-inner">
                  {user?.first_name ? user.first_name[0].toUpperCase() : "U"}
                </div>
              )}
              <div className="overflow-hidden">
                <div className="text-sm font-bold truncate">
                  {user?.first_name} {user?.last_name}
                </div>
                <div className="text-[11px] text-neutral-400 truncate">{user?.email}</div>
                <span className="inline-block mt-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  {user?.role === "admin" ? "⚡ Administrator" : "Customer"}
                </span>
              </div>
            </div>

            <button
              onClick={() => setActiveTab("profile")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all text-left ${
                activeTab === "profile"
                  ? "bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 shadow-md"
                  : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              }`}
            >
              <User className="w-4 h-4" />
              <span>Personal Details</span>
            </button>

            <button
              onClick={() => setActiveTab("addresses")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all text-left ${
                activeTab === "addresses"
                  ? "bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 shadow-md"
                  : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>Saved Addresses ({addresses.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("orders")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all text-left ${
                activeTab === "orders"
                  ? "bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 shadow-md"
                  : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Order History</span>
            </button>

            <button
              onClick={() => setActiveTab("security")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all text-left ${
                activeTab === "security"
                  ? "bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 shadow-md"
                  : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>Security & Password</span>
            </button>
          </div>

          {/* Right Main Content Area */}
          <div className="lg:col-span-3">
            {/* TAB 1: PERSONAL DETAILS */}
            {activeTab === "profile" && (
              <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-8 border border-neutral-200 dark:border-neutral-800 shadow-sm animate-in fade-in">
                <h3 className="text-xl font-bold mb-6">Personal Profile</h3>

                <form onSubmit={handleSaveProfile} className="space-y-6">
                  {/* Avatar Upload */}
                  <div className="flex items-center gap-6 pb-6 border-b border-neutral-100 dark:border-neutral-800">
                    <div className="relative">
                      {previewUrl ? (
                        <img
                          src={previewUrl}
                          alt="Avatar"
                          className="w-20 h-20 rounded-3xl object-cover ring-4 ring-neutral-100 dark:ring-neutral-800"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-neutral-800 to-neutral-700 text-white font-black text-2xl flex items-center justify-center">
                          {firstName ? firstName[0].toUpperCase() : "U"}
                        </div>
                      )}
                      <label className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 shadow-md cursor-pointer hover:scale-105 transition-transform">
                        <Camera className="w-4 h-4" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold">Profile Photo</h4>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        PNG, JPG, WEBP up to 5MB. Photo will be processed and saved automatically.
                      </p>
                      {selectedFile && (
                        <span className="inline-block mt-2 text-xs font-semibold text-amber-500">
                          Selected: {selectedFile.name}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Name Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold mb-1.5">First Name</label>
                      <input
                        type="text"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-xs font-semibold focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold mb-1.5">Last Name</label>
                      <input
                        type="text"
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-xs font-semibold focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  {/* Email & Gender */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold mb-1.5">Email Address (Verified)</label>
                      <input
                        type="email"
                        disabled
                        value={user?.email || ""}
                        className="w-full px-4 py-2.5 rounded-2xl bg-neutral-100 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-800 text-xs font-semibold text-neutral-500 cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold mb-1.5">Gender</label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-xs font-semibold focus:outline-none focus:border-amber-500"
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="others">Other / Prefer not to say</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSavingProfile}
                      className="px-6 py-3 rounded-2xl bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 text-xs font-bold shadow-lg hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-all disabled:opacity-50"
                    >
                      {isSavingProfile ? "Saving Changes..." : "Save Profile Details"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB 2: ADDRESSES */}
            {activeTab === "addresses" && (
              <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-8 border border-neutral-200 dark:border-neutral-800 shadow-sm animate-in fade-in">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold">Saved Addresses</h3>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      Manage delivery destinations for rapid 1-click checkout.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAddressModal(true)}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 text-xs font-bold shadow-md hover:bg-neutral-800"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Address</span>
                  </button>
                </div>

                {addresses.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addresses.map((addr, idx) => (
                      <div
                        key={idx}
                        className={`p-5 rounded-2xl border transition-all ${
                          addr.isDefault
                            ? "border-amber-500 bg-amber-50/40 dark:bg-amber-950/20 shadow-sm"
                            : "border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-950/40"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                            Address #{idx + 1}
                          </span>
                          {addr.isDefault && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-amber-500 text-black">
                              DEFAULT
                            </span>
                          )}
                        </div>

                        <p className="text-sm font-semibold text-neutral-900 dark:text-white leading-relaxed">
                          {addr.street}
                        </p>
                        <p className="text-xs text-neutral-500 mt-1">
                          {addr.city}, {addr.state} - {addr.postalCode}
                        </p>
                        <p className="text-xs text-neutral-400">{addr.country || "India"}</p>

                        <div className="flex items-center gap-3 mt-4 pt-3 border-t border-neutral-200/60 dark:border-neutral-800/60 text-xs">
                          {!addr.isDefault && (
                            <button
                              onClick={() => handleSetDefaultAddress(idx)}
                              className="font-bold text-amber-600 dark:text-amber-400 hover:underline"
                            >
                              Set as Default
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteAddress(idx)}
                            className="font-bold text-rose-500 hover:underline ml-auto flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-3xl">
                    <MapPin className="w-10 h-10 text-neutral-400 mx-auto mb-2" />
                    <p className="text-sm font-bold text-neutral-700 dark:text-neutral-300">No saved addresses yet</p>
                    <p className="text-xs text-neutral-400 mt-1 mb-4">Add your shipping destination for effortless ordering.</p>
                    <button
                      onClick={() => setShowAddressModal(true)}
                      className="px-4 py-2 rounded-2xl bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 text-xs font-bold"
                    >
                      Add First Address
                    </button>
                  </div>
                )}

                {/* Add Address Modal */}
                {showAddressModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
                    <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-8 border border-neutral-200 dark:border-neutral-800 shadow-2xl">
                      <h4 className="text-lg font-bold mb-4">Add Delivery Address</h4>

                      <form onSubmit={handleAddAddress} className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold mb-1">Street / House No / Area</label>
                          <input
                            type="text"
                            required
                            value={newAddress.street}
                            onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                            placeholder="123 Luxury Boulevard, Penthouse 4B"
                            className="w-full px-3 py-2.5 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-xs font-medium focus:outline-none"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold mb-1">City</label>
                            <input
                              type="text"
                              required
                              value={newAddress.city}
                              onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                              placeholder="Mumbai"
                              className="w-full px-3 py-2.5 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-xs font-medium focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold mb-1">State</label>
                            <input
                              type="text"
                              required
                              value={newAddress.state}
                              onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                              placeholder="Maharashtra"
                              className="w-full px-3 py-2.5 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-xs font-medium focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold mb-1">Postal / Pincode</label>
                            <input
                              type="text"
                              required
                              value={newAddress.postalCode}
                              onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                              placeholder="400001"
                              className="w-full px-3 py-2.5 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-xs font-medium focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold mb-1">Country</label>
                            <input
                              type="text"
                              value={newAddress.country}
                              onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })}
                              placeholder="India"
                              className="w-full px-3 py-2.5 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-xs font-medium focus:outline-none"
                            />
                          </div>
                        </div>

                        <label className="flex items-center gap-2 text-xs font-bold cursor-pointer pt-1">
                          <input
                            type="checkbox"
                            checked={newAddress.isDefault}
                            onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
                            className="rounded accent-amber-500 w-4 h-4"
                          />
                          <span>Set as Default Delivery Address</span>
                        </label>

                        <div className="flex gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() => setShowAddressModal(false)}
                            className="flex-1 py-2.5 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-xs font-bold"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="flex-1 py-2.5 rounded-2xl bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 text-xs font-bold shadow-md"
                          >
                            Save Address
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: ORDER HISTORY */}
            {activeTab === "orders" && (
              <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-8 border border-neutral-200 dark:border-neutral-800 shadow-sm animate-in fade-in">
                <h3 className="text-xl font-bold mb-6">Order History</h3>

                {loadingOrders ? (
                  <div className="space-y-4">
                    {[1, 2].map((i) => (
                      <div key={i} className="h-36 rounded-2xl bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
                    ))}
                  </div>
                ) : orders.length > 0 ? (
                  <div className="space-y-6">
                    {orders.map((order) => {
                      let statusBadgeColor = "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300";
                      if (order.status === "Delivered") statusBadgeColor = "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300";
                      else if (order.status === "Shipped") statusBadgeColor = "bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300";
                      else if (order.status === "Cancelled") statusBadgeColor = "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300";

                      return (
                        <div
                          key={order._id}
                          className="rounded-3xl border border-neutral-200 dark:border-neutral-800 p-5 sm:p-6 bg-neutral-50/40 dark:bg-neutral-950/40 space-y-4"
                        >
                          {/* Order Top Bar */}
                          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-neutral-200/80 dark:border-neutral-800/80 text-xs">
                            <div>
                              <span className="font-bold text-neutral-400 text-[10px] uppercase block">Order ID</span>
                              <span className="font-mono font-bold text-neutral-800 dark:text-neutral-200">
                                #{order._id.substring(order._id.length - 8).toUpperCase()}
                              </span>
                            </div>

                            <div>
                              <span className="font-bold text-neutral-400 text-[10px] uppercase block">Placed On</span>
                              <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                                {new Date(order.createdAt).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </span>
                            </div>

                            <div>
                              <span className="font-bold text-neutral-400 text-[10px] uppercase block">Total Amount</span>
                              <span className="text-base font-black text-neutral-950 dark:text-white">
                                ${order.totalAmount}
                              </span>
                            </div>

                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusBadgeColor}`}>
                              {order.status}
                            </span>
                          </div>

                          {/* Order Items */}
                          <div className="space-y-3">
                            {order.orderItems?.map((item, idx) => (
                              <div key={idx} className="flex items-center gap-3.5">
                                <img
                                  src={item.image || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200"}
                                  alt={item.title}
                                  className="w-14 h-14 rounded-xl object-cover bg-neutral-100 shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                  <h5 className="text-xs font-bold truncate text-neutral-900 dark:text-white">
                                    {item.title}
                                  </h5>
                                  <p className="text-[11px] text-neutral-400">
                                    Qty: {item.quantity} × ${item.price}
                                  </p>
                                </div>
                                <div className="text-xs font-bold">
                                  ${item.price * item.quantity}
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Shipping Destination */}
                          <div className="pt-3 border-t border-neutral-200/60 dark:border-neutral-800/60 flex flex-wrap items-center justify-between text-xs text-neutral-500">
                            <div>
                              <span className="font-bold">Shipping Address: </span>
                              <span>
                                {order.shippingAddress?.street}, {order.shippingAddress?.city},{" "}
                                {order.shippingAddress?.state} - {order.shippingAddress?.postalCode}
                              </span>
                            </div>
                            <div className="font-medium text-neutral-400">
                              Payment: {order.paymentMethod} ({order.paymentStatus})
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-16 border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-3xl">
                    <Package className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
                    <h4 className="text-base font-bold text-neutral-700 dark:text-neutral-300">No orders placed yet</h4>
                    <p className="text-xs text-neutral-400 mt-1">Explore our collection and treat yourself to luxury items.</p>
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: SECURITY & PASSWORD */}
            {activeTab === "security" && (
              <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-8 border border-neutral-200 dark:border-neutral-800 shadow-sm animate-in fade-in">
                <h3 className="text-xl font-bold mb-2">Security & Password</h3>
                <p className="text-xs text-neutral-400 mb-6">
                  Protect your account with OTP-verified password modifications.
                </p>

                <div className="max-w-md space-y-6">
                  {!otpSent ? (
                    <div className="p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-3">
                      <div className="flex items-center gap-2.5 text-xs font-bold">
                        <ShieldCheck className="w-5 h-5 text-amber-500" />
                        <span>Step 1: Request Security Verification OTP</span>
                      </div>
                      <p className="text-xs text-neutral-500">
                        Click below to receive a one-time passcode at{" "}
                        <strong className="text-neutral-800 dark:text-neutral-200">{user?.email}</strong>.
                      </p>
                      <button
                        type="button"
                        onClick={handleRequestPasswordOtp}
                        className="px-5 py-2.5 rounded-2xl bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 text-xs font-bold shadow-md hover:bg-neutral-800"
                      >
                        Send Security OTP
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleChangePassword} className="space-y-4">
                      <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>OTP sent to your email! Enter it below along with your new password.</span>
                      </div>

                      <div>
                        <label className="block text-xs font-bold mb-1">6-Digit Security OTP</label>
                        <input
                          type="text"
                          required
                          value={passwordOtp}
                          onChange={(e) => setPasswordOtp(e.target.value)}
                          placeholder="123456"
                          className="w-full px-3 py-2.5 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-xs font-bold font-mono focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold mb-1">New Password (Min 6 chars)</label>
                        <input
                          type="password"
                          required
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full px-3 py-2.5 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-xs font-medium focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold mb-1">Confirm New Password</label>
                        <input
                          type="password"
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full px-3 py-2.5 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-xs font-medium focus:outline-none"
                        />
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setOtpSent(false)}
                          className="px-4 py-2.5 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-xs font-bold"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isChangingPass}
                          className="flex-1 py-2.5 rounded-2xl bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 text-xs font-bold shadow-md"
                        >
                          {isChangingPass ? "Updating..." : "Confirm Password Update"}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
