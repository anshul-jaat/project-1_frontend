import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../GlobalUrl";
import { useToast } from "./ToastContext";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("ecom_user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem("ecom_token") || null);
  const [pendingEmail, setPendingEmail] = useState(() => localStorage.getItem("ecom_pending_email") || "");
  const [loading, setLoading] = useState(true);
  const { success, error, info } = useToast();

  // Logout handler
  const logout = useCallback((showToast = true) => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("ecom_token");
    localStorage.removeItem("ecom_user");
    localStorage.removeItem("ecom_pending_email");
    if (showToast) {
      info("Logged out successfully");
    }
  }, [info]);

  // Load user profile on mount if token exists
  const fetchProfile = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await api.get("/users/profile");
      if (res.data?.success && res.data.user) {
        setUser(res.data.user);
        localStorage.setItem("ecom_user", JSON.stringify(res.data.user));
      }
    } catch (err) {
      console.warn("Could not fetch user profile:", err.response?.data?.message || err.message);
      if (err.response?.status === 401) {
        // Token invalid or expired
        logout(false);
      }
    } finally {
      setLoading(false);
    }
  }, [token, logout]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Login handler
  const login = async (email, password) => {
    try {
      const res = await api.post("/users/login", { email, password });
      if (res.data?.success) {
        const receivedToken = res.data.token;
        const receivedUser = res.data.user;

        setToken(receivedToken);
        setUser(receivedUser);
        localStorage.setItem("ecom_token", receivedToken);
        localStorage.setItem("ecom_user", JSON.stringify(receivedUser));
        localStorage.removeItem("ecom_pending_email");
        setPendingEmail("");

        success(`Welcome back, ${receivedUser.name || receivedUser.first_name}!`);
        return { success: true, user: receivedUser };
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Login failed. Please check your credentials.";
      error(msg);
      // If email not verified, redirect to verify OTP
      if (err.response?.status === 403 && msg.includes("not verified")) {
        setPendingEmail(email);
        localStorage.setItem("ecom_pending_email", email);
        return { success: false, requireVerification: true, email };
      }
      return { success: false, message: msg };
    }
  };

  // Register handler
  const register = async (formData) => {
    try {
      const res = await api.post("/users/register", formData);
      if (res.data?.success) {
        setPendingEmail(formData.email);
        localStorage.setItem("ecom_pending_email", formData.email);
        success("Registration successful! Please verify the 6-digit OTP sent to your email.");
        return {
          success: true,
          email: formData.email,
        };
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Registration failed. Please try again.";
      error(msg);
      return { success: false, message: msg };
    }
  };

  // Verify OTP handler
  const verifyOtp = async (email, otp) => {
    try {
      const res = await api.post("/users/verify-otp", { email, otp });
      if (res.data?.success) {
        if (res.data.token && res.data.user) {
          setToken(res.data.token);
          setUser(res.data.user);
          localStorage.setItem("ecom_token", res.data.token);
          localStorage.setItem("ecom_user", JSON.stringify(res.data.user));
        }
        localStorage.removeItem("ecom_pending_email");
        setPendingEmail("");
        success("Account verified successfully! Welcome aboard.");
        return { success: true, user: res.data.user };
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Invalid or expired OTP";
      error(msg);
      return { success: false, message: msg };
    }
  };

  // Resend OTP handler
  const resendOtp = async (email) => {
    try {
      const res = await api.post("/users/resend-otp", { email });
      if (res.data?.success) {
        info("A new OTP has been sent to your email.");
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to resend OTP";
      error(msg);
      return { success: false, message: msg };
    }
  };

  // Update Profile handler
  const updateProfile = async (formDataOrObject) => {
    try {
      const isFormData = formDataOrObject instanceof FormData;
      const res = await api.put("/users/profile", formDataOrObject, {
        headers: isFormData ? { "Content-Type": "multipart/form-data" } : undefined,
      });

      if (res.data?.success && res.data.user) {
        setUser(res.data.user);
        localStorage.setItem("ecom_user", JSON.stringify(res.data.user));
        success("Profile updated successfully!");
        return { success: true, user: res.data.user };
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to update profile";
      error(msg);
      return { success: false, message: msg };
    }
  };

  // Request password change OTP
  const requestPasswordOtp = async () => {
    try {
      const res = await api.post("/users/password/request-otp");
      if (res.data?.success) {
        info("Password change OTP sent to your email.");
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to send password OTP";
      error(msg);
      return { success: false, message: msg };
    }
  };

  // Change password
  const changePassword = async (otp, newPassword) => {
    try {
      const res = await api.post("/users/password/change", { otp, newPassword });
      if (res.data?.success) {
        success("Password changed successfully!");
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to change password";
      error(msg);
      return { success: false, message: msg };
    }
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    isAdmin: user?.role === "admin",
    pendingEmail,
    setPendingEmail,
    login,
    register,
    verifyOtp,
    resendOtp,
    updateProfile,
    requestPasswordOtp,
    changePassword,
    fetchProfile,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
