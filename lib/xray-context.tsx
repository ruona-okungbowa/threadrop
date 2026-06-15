"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Drop, SizeKey } from "@/lib/drop-data";
import { buildDataLayer, type DropDataLayer } from "@/lib/data-layer";

interface XrayValue {
  on: boolean;
  setOn: (v: boolean) => void;
  activeSize: SizeKey;
  setActiveSize: (s: SizeKey) => void;
  dataLayer: DropDataLayer | null;
}

// Safe no-op default so consumers (e.g. the buy box) never throw when rendered
// outside a provider.
const XrayContext = createContext<XrayValue>({
  on: false,
  setOn: () => {},
  activeSize: "M",
  setActiveSize: () => {},
  dataLayer: null,
});

export function useXray() {
  return useContext(XrayContext);
}

function firstInStock(drop: Drop): SizeKey {
  return drop.sizes.find((s) => s.stock > 0)?.size ?? drop.sizes[0].size;
}

export function XrayProvider({
  drop,
  slug,
  children,
}: {
  drop: Drop;
  slug: string;
  children: ReactNode;
}) {
  const [on, setOn] = useState(false);
  const [activeSize, setActiveSize] = useState<SizeKey>(() =>
    firstInStock(drop),
  );

  const dataLayer = useMemo(
    () => buildDataLayer(drop, slug, activeSize),
    [drop, slug, activeSize],
  );

  const value = useMemo(
    () => ({ on, setOn, activeSize, setActiveSize, dataLayer }),
    [on, activeSize, dataLayer],
  );

  return <XrayContext.Provider value={value}>{children}</XrayContext.Provider>;
}
