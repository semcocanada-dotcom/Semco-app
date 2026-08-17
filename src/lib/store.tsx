"use client";

import React, { createContext, useCallback, useContext, useMemo, useReducer } from "react";
import { CartItem, Product } from "./types";
import { lastOrder } from "./data";
import { effectivePrice, savings } from "./pricing";

interface CartState {
  items: CartItem[];
}

type CartAction =
  | { type: "ADD_ITEM"; product: Product }
  | { type: "ADD_MANY"; items: CartItem[] }
  | { type: "REMOVE_ITEM"; productId: number }
  | { type: "SET_QUANTITY"; productId: number; quantity: number }
  | { type: "CLEAR_CART" }
  | { type: "REORDER" };

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  total: number;
  savedTotal: number; // sum of deal savings across the cart
  addItem: (product: Product) => void;
  addMany: (items: CartItem[]) => void;
  removeItem: (productId: number) => void;
  setQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  reorder: () => void;
}

function mergeItems(existing: CartItem[], additions: CartItem[]): CartItem[] {
  const merged = [...existing];
  for (const add of additions) {
    const idx = merged.findIndex((i) => i.product.id === add.product.id);
    if (idx >= 0) merged[idx] = { ...merged[idx], quantity: merged[idx].quantity + add.quantity };
    else merged.push({ ...add });
  }
  return merged;
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM":
      return { items: mergeItems(state.items, [{ product: action.product, quantity: 1 }]) };
    case "ADD_MANY":
      return { items: mergeItems(state.items, action.items) };
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
  const addMany    = useCallback((items: CartItem[]) => dispatch({ type: "ADD_MANY", items }), []);
  const removeItem = useCallback((productId: number) => dispatch({ type: "REMOVE_ITEM", productId }), []);
  const setQuantity = useCallback((productId: number, quantity: number) => dispatch({ type: "SET_QUANTITY", productId, quantity }), []);
  const clearCart  = useCallback(() => dispatch({ type: "CLEAR_CART" }), []);
  const reorder    = useCallback(() => dispatch({ type: "REORDER" }), []);

  const itemCount  = state.items.reduce((sum, i) => sum + i.quantity, 0);
  const total      = state.items.reduce((sum, i) => sum + effectivePrice(i.product) * i.quantity, 0);
  const savedTotal = state.items.reduce((sum, i) => sum + savings(i.product) * i.quantity, 0);

  const value = useMemo<CartContextValue>(
    () => ({ items: state.items, itemCount, total, savedTotal, addItem, addMany, removeItem, setQuantity, clearCart, reorder }),
    [state.items, itemCount, total, savedTotal, addItem, addMany, removeItem, setQuantity, clearCart, reorder]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
