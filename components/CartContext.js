'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const CartContext = createContext(null);

const STORAGE_KEY = 'jasdor-cart-v1';

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [store, setStore] = useState(null);
  const [pickup, setPickup] = useState({ type: 'now', time: '' }); // type: 'now' | 'later'
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setItems(parsed.items || []);
        setStore(parsed.store || null);
        if (parsed.pickup) setPickup(parsed.pickup);
      }
    } catch (_) {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ items, store, pickup }));
  }, [items, store, pickup, hydrated]);

  function addItem(product, storeInfo) {
    setStore((prev) => prev || storeInfo || null);
    setItems((prev) => {
      const existing = prev.find((p) => p.id === product.id);
      if (existing) {
        return prev.map((p) =>
          p.id === product.id ? { ...p, qty: p.qty + 1 } : p
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: Number(product.price) || 0,
          orig_price: Number(product.orig_price) || Number(product.price) || 0,
          image: product.image,
          product_code: product.product_code,
          variant: product.variant || '',
          addons: product.addons || [],
          notes: product.notes || [],
          qty: 1,
        },
      ];
    });
  }

  function removeItem(id) {
    setItems((prev) => prev.filter((p) => p.id !== id));
  }

  function updateQty(id, qty) {
    setItems((prev) =>
      prev
        .map((p) => (p.id === id ? { ...p, qty: Math.max(0, qty) } : p))
        .filter((p) => p.qty > 0)
    );
  }

  function clear() {
    setItems([]);
    setStore(null);
    setPickup({ type: 'now', time: '' });
  }

  const subtotal = useMemo(
    () => items.reduce((acc, p) => acc + p.price * p.qty, 0),
    [items]
  );

  // Diskon 50% maksimal Rp 35.000
  const DISCOUNT_RATE = 0.5;
  const DISCOUNT_MAX = 35000;
  const SERVICE_FEE = 5000;

  const discount = Math.min(Math.floor(subtotal * DISCOUNT_RATE), DISCOUNT_MAX);
  const serviceFee = items.length > 0 ? SERVICE_FEE : 0;
  const total = Math.max(0, subtotal - discount) + serviceFee;
  const totalQty = items.reduce((a, b) => a + b.qty, 0);

  const value = {
    items,
    store,
    setStore,
    pickup,
    setPickup,
    addItem,
    removeItem,
    updateQty,
    clear,
    subtotal,
    discount,
    serviceFee,
    total,
    totalQty,
    DISCOUNT_RATE,
    DISCOUNT_MAX,
    SERVICE_FEE,
    hydrated,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}

export function rupiah(n) {
  if (n == null || isNaN(n)) return 'Rp 0';
  return 'Rp ' + Number(n).toLocaleString('id-ID');
}
