import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../GlobalUrl";
import { useAuth } from "./AuthContext";
import { useToast } from "./ToastContext";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { isAuthenticated, token } = useAuth();
  const { success, error } = useToast();

  const [cartItems, setCartItems] = useState(() => {
    try {
      const local = localStorage.getItem("ecom_local_cart");
      return local ? JSON.parse(local) : [];
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(false);

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => {
    const p = item.product;
    const price = p?.discountPrice > 0 ? p.discountPrice : p?.price || item.price || 0;
    return sum + price * (item.quantity || 1);
  }, 0);

  const itemCount = cartItems.reduce((cnt, item) => cnt + (item.quantity || 0), 0);

  // Fetch cart from backend if authenticated
  const fetchBackendCart = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await api.get("/cart");
      if (res.data?.success && res.data.cart) {
        setCartItems(res.data.cart.items || []);
      }
    } catch (err) {
      console.warn("Error fetching backend cart:", err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Sync when auth changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchBackendCart();
    } else {
      try {
        const local = localStorage.getItem("ecom_local_cart");
        if (local) setCartItems(JSON.parse(local));
      } catch {}
    }
  }, [isAuthenticated, fetchBackendCart]);

  // Save guest cart locally
  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem("ecom_local_cart", JSON.stringify(cartItems));
    }
  }, [cartItems, isAuthenticated]);

  // Add Item to Cart
  const addToCart = async (product, quantity = 1) => {
    if (!product || !product._id) return;

    if (isAuthenticated) {
      try {
        const res = await api.post("/cart/add", {
          productId: product._id,
          quantity,
        });
        if (res.data?.success && res.data.cart) {
          setCartItems(res.data.cart.items || []);
          success(`Added "${product.title}" to cart!`);
          return true;
        }
      } catch (err) {
        const msg = err.response?.data?.message || "Failed to add to cart";
        error(msg);
        return false;
      }
    } else {
      // Guest cart
      setCartItems((prev) => {
        const existingIndex = prev.findIndex((item) => item.product?._id === product._id || item.product === product._id);
        const effectivePrice = product.discountPrice > 0 ? product.discountPrice : product.price;

        if (existingIndex > -1) {
          const updated = [...prev];
          const newQty = updated[existingIndex].quantity + quantity;
          if (newQty > product.stock) {
            error(`Only ${product.stock} units available in stock`);
            return prev;
          }
          updated[existingIndex].quantity = newQty;
          success(`Updated "${product.title}" quantity in cart!`);
          return updated;
        } else {
          if (quantity > product.stock) {
            error(`Only ${product.stock} units available in stock`);
            return prev;
          }
          success(`Added "${product.title}" to cart!`);
          return [...prev, { product, quantity, price: effectivePrice, _id: Date.now().toString() }];
        }
      });
      return true;
    }
  };

  // Update Item Quantity
  const updateQuantity = async (productId, quantity) => {
    if (isAuthenticated) {
      try {
        const res = await api.put("/cart/update", { productId, quantity });
        if (res.data?.success && res.data.cart) {
          setCartItems(res.data.cart.items || []);
        }
      } catch (err) {
        const msg = err.response?.data?.message || "Failed to update quantity";
        error(msg);
      }
    } else {
      setCartItems((prev) => {
        if (quantity <= 0) {
          return prev.filter((item) => (item.product?._id || item.product) !== productId);
        }
        return prev.map((item) => {
          if ((item.product?._id || item.product) === productId) {
            return { ...item, quantity };
          }
          return item;
        });
      });
    }
  };

  // Remove Item from Cart
  const removeFromCart = async (productId) => {
    if (isAuthenticated) {
      try {
        const res = await api.delete(`/cart/remove/${productId}`);
        if (res.data?.success && res.data.cart) {
          setCartItems(res.data.cart.items || []);
          success("Item removed from cart");
        }
      } catch (err) {
        const msg = err.response?.data?.message || "Failed to remove item";
        error(msg);
      }
    } else {
      setCartItems((prev) => prev.filter((item) => (item.product?._id || item.product) !== productId));
      success("Item removed from cart");
    }
  };

  // Clear Cart
  const clearCart = async () => {
    if (isAuthenticated) {
      try {
        await api.delete("/cart/clear");
        setCartItems([]);
      } catch (err) {
        console.warn("Failed to clear cart on server:", err.message);
      }
    }
    setCartItems([]);
    localStorage.removeItem("ecom_local_cart");
  };

  const value = {
    cartItems,
    subtotal,
    itemCount,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    refreshCart: fetchBackendCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
