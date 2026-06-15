"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { drops, type FeedDrop, type SizeKey } from "@/lib/feed-data";

export interface CartLine {
  slug: string;
  size: SizeKey;
  qty: number;
}

/** A cart line joined with its live product record. */
export interface CartItem extends CartLine {
  drop: FeedDrop;
  lineId: string;
  linePence: number;
}

/** Items belonging to a single brand, with that brand's parcel subtotal. */
export interface BrandGroup {
  brandSlug: string;
  brand: string;
  items: CartItem[];
  subtotalPence: number;
}

/** Each brand ships its own parcel — reinforces the multi-brand model. */
export const SHIPPING_PER_BRAND_PENCE = 495;

interface CartValue {
  lines: CartLine[];
  items: CartItem[];
  groups: BrandGroup[];
  count: number;
  brandCount: number;
  subtotalPence: number;
  shippingPence: number;
  totalPence: number;
  currency: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  add: (slug: string, size: SizeKey, qty?: number) => void;
  setQty: (slug: string, size: SizeKey, qty: number) => void;
  remove: (slug: string, size: SizeKey) => void;
  clear: () => void;
}

const CartContext = createContext<CartValue | null>(null);

const dropBySlug = new Map(drops.map((d) => [d.slug, d]));

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [open, setOpen] = useState(false);

  const add = useCallback((slug: string, size: SizeKey, qty = 1) => {
    setLines((prev) => {
      const i = prev.findIndex((l) => l.slug === slug && l.size === size);
      if (i === -1) return [...prev, { slug, size, qty }];
      const next = [...prev];
      next[i] = { ...next[i], qty: next[i].qty + qty };
      return next;
    });
    setOpen(true);
  }, []);

  const setQty = useCallback((slug: string, size: SizeKey, qty: number) => {
    setLines((prev) =>
      qty <= 0
        ? prev.filter((l) => !(l.slug === slug && l.size === size))
        : prev.map((l) =>
            l.slug === slug && l.size === size ? { ...l, qty } : l,
          ),
    );
  }, []);

  const remove = useCallback((slug: string, size: SizeKey) => {
    setLines((prev) =>
      prev.filter((l) => !(l.slug === slug && l.size === size)),
    );
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const value = useMemo<CartValue>(() => {
    const items: CartItem[] = lines
      .map((l) => {
        const drop = dropBySlug.get(l.slug);
        if (!drop) return null;
        return {
          ...l,
          drop,
          lineId: `${l.slug}-${l.size}`,
          linePence: drop.pricePence * l.qty,
        } satisfies CartItem;
      })
      .filter((x): x is CartItem => x !== null);

    // group by brand, preserving first-seen order
    const order: string[] = [];
    const map = new Map<string, BrandGroup>();
    for (const it of items) {
      let g = map.get(it.drop.brandSlug);
      if (!g) {
        g = {
          brandSlug: it.drop.brandSlug,
          brand: it.drop.brand,
          items: [],
          subtotalPence: 0,
        };
        map.set(it.drop.brandSlug, g);
        order.push(it.drop.brandSlug);
      }
      g.items.push(it);
      g.subtotalPence += it.linePence;
    }
    const groups = order.map((s) => map.get(s)!);

    const count = items.reduce((n, it) => n + it.qty, 0);
    const subtotalPence = items.reduce((n, it) => n + it.linePence, 0);
    const shippingPence = groups.length * SHIPPING_PER_BRAND_PENCE;

    return {
      lines,
      items,
      groups,
      count,
      brandCount: groups.length,
      subtotalPence,
      shippingPence,
      totalPence: subtotalPence + shippingPence,
      currency: "£",
      open,
      setOpen,
      add,
      setQty,
      remove,
      clear,
    };
  }, [lines, open, add, setQty, remove, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
