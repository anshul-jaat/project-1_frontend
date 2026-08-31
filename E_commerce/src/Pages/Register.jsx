import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { ShoppingBag, ArrowRight, Lock, Mail, User, ShieldCheck, Eye, EyeOff } from "lucide-react";

export default function Register() {
  const { register } = useAuth();
  const { error } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    gender: "male",
    email: "",
    password: "",
    confirm_password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirm_password) {
      error("Passwords do not match!");
      return;
    }

    if (formData.password.length < 6) {
      error("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);
    const result = await register({
      first_name: formData.first_name,
      last_name: formData.last_name,
      gender: formData.gender,
      email: formData.email,
      password: formData.password,
    });
    setLoading(false);

    if (result?.success) {
      navigate(`/verify-otp?email=${encodeURIComponent(formData.email)}`);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-neutral-50/50 dark:bg-neutral-950">
      <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-3xl p-8 sm:p-10 border border-neutral-200 dark:border-neutral-800 shadow-2xl relative overflow-hidden">
        {/* Decorative ambient gradient */}
        <div className="absolute -top-20 -right-20 w-44 h-44 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>

        {/* Brand Icon Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-neutral-950 to-neutral-800 dark:from-neutral-100 dark:to-neutral-300 flex items-center justify-center shadow-lg mb-3">
            <ShoppingBag className="w-6 h-6 text-white dark:text-neutral-950" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-neutral-950 dark:text-white">
            Create Your Account
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Join LUMINA for curated shopping, personalized perks, and VIP rewards.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                First Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="first_name"
                  required
                  value={formData.first_name}
                  onChange={handleChange}
                  placeholder="John"
                  className="w-full pl-9 pr-3 py-2.5 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-xs font-medium text-neutral-900 dark:text-white focus:outline-none focus:border-amber-500"
                />
                <User className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                Last Name
              </label>
              <input
                type="text"
                name="last_name"
                required
                value={formData.last_name}
                onChange={handleChange}
                placeholder="Doe"
                className="w-full px-3 py-2.5 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-xs font-medium text-neutral-900 dark:text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Gender selection */}
          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
              Gender
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full px-3 py-2.5 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-xs font-medium text-neutral-900 dark:text-white focus:outline-none focus:border-amber-500"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="others">Other / Prefer not to say</option>
            </select>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="john.doe@example.com"
                className="w-full pl-9 pr-3 py-2.5 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-xs font-medium text-neutral-900 dark:text-white focus:outline-none focus:border-amber-500"
              />
              <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full pl-9 pr-10 py-2.5 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-xs font-medium text-neutral-900 dark:text-white focus:outline-none focus:border-amber-500"
              />
              <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-neutral-400 hover:text-neutral-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="confirm_password"
                required
                value={formData.confirm_password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-xs font-medium text-neutral-900 dark:text-white focus:outline-none focus:border-amber-500"
              />
              <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-2xl bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 font-bold text-sm shadow-xl hover:bg-neutral-800 dark:hover:bg-neutral-100 flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-2"
          >
            <span>{loading ? "Creating Account..." : "Register & Send OTP"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center mt-6 text-xs text-neutral-500">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-bold text-neutral-950 dark:text-white underline hover:text-amber-500"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
