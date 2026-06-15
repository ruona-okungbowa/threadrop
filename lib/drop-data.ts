export type SizeKey = "XS" | "S" | "M" | "L" | "XL";

export interface SizeVariant {
  size: SizeKey;
  stock: number;
}

export interface Drop {
  brand: string;
  title: string;
  edition: string;
  pricePence: number;
  currency: string;
  shippingPence: number;
  initialStock: number;
  /** ms since epoch — when the drop goes live */
  startsAt: number;
  /** ms since epoch — when the drop ends */
  endsAt: number;
  sizes: SizeVariant[];
  gallery: { label: string; src: string; tone: string }[];
  specs: { label: string; value: string }[];
}

const now = Date.now();

// Demo: drop is already LIVE and ends in ~38 minutes.
// To preview the pre-launch countdown, set startsAt to a future time.
export const drop: Drop = {
  brand: "Atelier Nord",
  title: "Northwind Shell",
  edition: "Heavyweight Hooded Overshirt — Bone",
  pricePence: 18500,
  currency: "£",
  shippingPence: 695,
  initialStock: 50,
  startsAt: now - 1000 * 60 * 12, // launched 12 min ago
  endsAt: now + 1000 * 60 * 38, // ends in 38 min
  sizes: [
    { size: "XS", stock: 0 },
    { size: "S", stock: 4 },
    { size: "M", stock: 6 },
    { size: "L", stock: 3 },
    { size: "XL", stock: 0 },
  ],
  gallery: [
    { label: "front", src: "/drop/hero.png", tone: "#7c766a" },
    { label: "fabric", src: "/drop/detail.png", tone: "#6f6a5e" },
    { label: "on body", src: "/drop/on-body.png", tone: "#736d61" },
    { label: "flat", src: "/drop/scale.png", tone: "#6a6458" },
  ],
  specs: [
    { label: "Fabric", value: "450gsm brushed-back loopback cotton" },
    { label: "Fit", value: "Boxy cropped — size up for drape" },
    { label: "Detail", value: "Numbered woven label, 1 of 50" },
    { label: "Dispatch", value: "Ships within 5 working days" },
  ],
};

export function formatPrice(pence: number, currency: string) {
  return `${currency}${(pence / 100).toFixed(2)}`;
}
