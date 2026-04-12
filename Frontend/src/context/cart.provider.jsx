import { useState, useCallback, useEffect } from "react";
import { CartContext } from "./cart.context";

export const CartProvider = ({ children }) => {
  // Initialize from localStorage or empty array
  const [cartItems, setCartItems] = useState(() => {
    try {
      const savedCart = localStorage.getItem("digi_merchant_cart");
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.error("Error loading cart from localStorage:", error);
      return [];
    }
  });

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem("digi_merchant_cart", JSON.stringify(cartItems));
    } catch (error) {
      console.error("Error saving cart to localStorage:", error);
    }
  }, [cartItems]);

  // Add item to cart with stock validation
  const addToCart = useCallback((product) => {
    const availableStock = product.stock || 0;
    const quantityToAdd = product.quantity || 1;

    // Check if product has sufficient stock
    if (availableStock === 0) {
      return { success: false, message: `${product.name} is out of stock!` };
    }

    if (quantityToAdd > availableStock) {
      return {
        success: false,
        message: `Only ${availableStock} unit(s) available in stock!`
      };
    }

    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id);

      if (existingItem) {
        const newQuantity = existingItem.quantity + quantityToAdd;

        // Check if adding more would exceed stock
        if (newQuantity > availableStock) {
          return prevItems; // Don't add, return unchanged
        }

        return prevItems.map((item) =>
          item.id === product.id ? { ...item, quantity: newQuantity } : item
        );
      }

      return [...prevItems, { ...product, quantity: quantityToAdd }];
    });

    return {
      success: true,
      message: `${product.name} added to cart successfully!`
    };
  }, []);

  // Remove item from cart
  const removeFromCart = useCallback((productId) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => item.id !== productId)
    );
  }, []);

  // Update cart item quantity with stock validation
  const updateCart = useCallback((productId, quantity, stock) => {
    // Check if quantity exceeds available stock
    if (quantity > stock) {
      return {
        success: false,
        message: `Only ${stock} unit(s) available in stock!`
      };
    }

    if (quantity <= 0) {
      removeFromCart(productId);
      return { success: true, message: "Item removed from cart" };
    }

    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      )
    );

    return { success: true, message: "Quantity updated successfully" };
  }, [removeFromCart]);

  // Check if item has sufficient stock
  const checkStock = useCallback((productId, requiredQuantity) => {
    const item = cartItems.find((item) => item.id === productId);
    if (!item) return { success: false, message: "Item not found in cart" };

    if (requiredQuantity > item.stock) {
      return {
        success: false,
        message: `Only ${item.stock} unit(s) available. You're requesting ${requiredQuantity}.`
      };
    }

    return { success: true, message: "Stock available" };
  }, [cartItems]);

  // Calculate total amount
  const calculateTotalAmount = useCallback(() => {
    return cartItems.reduce((total, item) => {
      const price = item.price || 0;
      const quantity = item.quantity || 0;
      return total + price * quantity;
    }, 0);
  }, [cartItems]);

  // Clear entire cart
  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateCart,
    calculateTotalAmount,
    checkStock,
    clearCart,
    cartCount: cartItems.length,
  };

  return (
    <CartContext.Provider value={value}>{children}</CartContext.Provider>
  );
};
