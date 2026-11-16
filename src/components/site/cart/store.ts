"use client";

import { useSyncExternalStore } from "react";

/**
 * FASE 2 – Carrello salvato nel browser (localStorage).
 * I prezzi qui servono solo per la visualizzazione: il totale reale viene
 * sempre ricalcolato dal server leggendo il database.
 */

export interface CartItem {
  id: string;
  slug: string;
  name: string;
  price_cents: number;
  image?: string;
  qty: number;
}

const KEY = "3dcrit-cart";
const EMPTY: CartItem[] = [];
const listeners = new Set<() => void>();
let cache: CartItem[] | null = null;

function read(): CartItem[] {
  if (cache) return cache;
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    cache = Array.isArray(parsed) ? parsed : [];
  } catch {
    cache = [];
  }
  return cache!;
}

function write(items: CartItem[]) {
  cache = items;
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    // spazio esaurito o modalità privata: il carrello resta in memoria
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      cache = null;
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function useCart(): CartItem[] {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}

export const cart = {
  add(item: Omit<CartItem, "qty">, qty = 1) {
    const items = read();
    const existing = items.find((i) => i.id === item.id);
    write(
      existing
        ? items.map((i) => (i.id === item.id ? { ...i, qty: Math.min(i.qty + qty, 20) } : i))
        : [...items, { ...item, qty }],
    );
  },
  setQty(id: string, qty: number) {
    write(read().map((i) => (i.id === id ? { ...i, qty: Math.max(1, Math.min(qty, 20)) } : i)));
  },
  remove(id: string) {
    write(read().filter((i) => i.id !== id));
  },
  clear() {
    write([]);
  },
};
