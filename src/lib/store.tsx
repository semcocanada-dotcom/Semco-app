"use client";

import React, { createContext, useCallback, useContext, useMemo, useReducer } from "react";
import { CartItem, Product } from "./types";
import { lastOrder } from "./data";

interface CartState {
  items: CartItem[];
}

type CartAction =
  | { type: "ADD_ITEM"; product: Product }
  | { type: "REMOVE_ITEM"; productId: number }
  | { type: "SET_QUANTITY"; productId: number; quantity: number }
  | { type: "CLEAR_CART" }
  | { type: "REORDER" };

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  total: number;
  addItem: (product: Product) => void;
  removeItem: (productId: number) => void;
  setQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  reorder: () => void;
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const existing = state.items.find((i) => i.product.id === action.product.id);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.product.id === action.product.id ? { ...i, quantity: i.quantity + 1 } : i
          ),
        };
      }
      return { items: [...state.items, { product: action.product, quantity: 1 }] };
    }
    case "REMOVE_ITEM":
      return { items: state.items.filter((i) => i.product.id !== action.productId) };
    case "SET_QUANTITY": {
      if (action.quantity <= 0)
        return { items: state.items.filter((i) => i.product.id !== action.productId) };
      return {
        items: state.items.map((i) =>
          i.product.id === action.productId ? { ...i, quantity: action.quantity } : i
        ),
      };
    }
    case "CLEAR_CART":
      return { items: [] };
    case "REORDER":
      return { items: lastOrder.map((i) => ({ ...i })) };
    default:
      return state;
  }
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });

  const addItem    = useCallback((product: Product) => dispatch({ type: "ADD_ITEM", product }), []);
  const removeItem = useCallback((productId: number) => dispatch({ type: "REMOVE_ITEM", productId }), []);
  const setQuantity = useCallback((productId: number, quantity: number) => dispatch({ type: "SET_QUANTITY", productId, quantity }), []);
  const clearCart  = useCallback(() => dispatch({ type: "CLEAR_CART" }), []);
  const reorder    = useCallback(() => dispatch({ type: "REORDER" }), []);

  const itemCount = state.items.reduce((sum, i) => sum + i.quantity, 0);
  const total     = state.items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  const value = useMemo<CartContextValue>(
    () => ({ items: state.items, itemCount, total, addItem, removeItem, setQuantity, clearCart, reorder }),
    [state.items, itemCount, total, addItem, removeItem, setQuantity, clearCart, reorder]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
