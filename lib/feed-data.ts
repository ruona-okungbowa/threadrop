export type DropStatus = "LIVE" | "UPCOMING" | "SOLD_OUT";
export type Category =
  | "Outerwear"
  | "Tops"
  | "Knitwear"
  | "Trousers"
  | "Accessories";
export type Audience = "Men" | "Women" | "Unisex";
export type SizeKey = "XS" | "S" | "M" | "L" | "XL" | "OS";

export interface FeedDrop {
  slug: string;
  brand: string;
  brandSlug: string;
  title: string;
  category: Category;
  audience: Audience;
  pricePence: number;
  currency: string;
  total: number;
  /** remaining pieces — only meaningful for LIVE / SOLD_OUT */
  remaining: number;
  sizes: SizeKey[];
  /** ms since epoch */
  startsAt: number;
  endsAt: number;
  image: { src: string; tone: string };
}

export interface Brand {
  slug: string;
  name: string;
  descriptor: string;
}

const now = Date.now();
const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

// Deliberate spread: 3 LIVE (one ending very soon), 3 UPCOMING, 2 SOLD OUT.
export const drops: FeedDrop[] = [
  {
    slug: "northwind-shell",
    brand: "Atelier Nord",
    brandSlug: "atelier-nord",
    title: "Northwind Shell",
    category: "Outerwear",
    audience: "Unisex",
    pricePence: 18500,
    currency: "£",
    total: 50,
    remaining: 13,
    sizes: ["S", "M", "L"],
    startsAt: now - 12 * MIN,
    endsAt: now + 36 * MIN, // ends very soon
    image: { src: "/drop/hero.png", tone: "#7c766a" },
  },
  {
    slug: "boxy-heavyweight-tee",
    brand: "Mono Standard",
    brandSlug: "mono-standard",
    title: "Boxy Heavyweight Tee",
    category: "Tops",
    audience: "Unisex",
    pricePence: 6500,
    currency: "£",
    total: 120,
    remaining: 74,
    sizes: ["XS", "S", "M", "L", "XL"],
    startsAt: now - 2 * HOUR,
    endsAt: now + 5 * HOUR,
    image: { src: "/feed/boxy-tee.png", tone: "#7d7669" },
  },
  {
    slug: "ribbed-beanie",
    brand: "Cinder & Co.",
    brandSlug: "cinder-co",
    title: "Ribbed Wool Beanie",
    category: "Accessories",
    audience: "Unisex",
    pricePence: 4200,
    currency: "£",
    total: 80,
    remaining: 6, // low stock
    sizes: ["OS"],
    startsAt: now - 40 * MIN,
    endsAt: now + 2 * HOUR + 18 * MIN,
    image: { src: "/feed/ribbed-beanie.png", tone: "#6f6a61" },
  },
  {
    slug: "field-parka",
    brand: "Atelier Nord",
    brandSlug: "atelier-nord",
    title: "Field Parka",
    category: "Outerwear",
    audience: "Men",
    pricePence: 24500,
    currency: "£",
    total: 40,
    remaining: 40,
    sizes: ["S", "M", "L", "XL"],
    startsAt: now + 1 * DAY + 6 * HOUR, // Fri 18:00-ish
    endsAt: now + 3 * DAY,
    image: { src: "/feed/field-parka.png", tone: "#6e6b58" },
  },
  {
    slug: "lambswool-crew",
    brand: "Cinder & Co.",
    brandSlug: "cinder-co",
    title: "Lambswool Crew",
    category: "Knitwear",
    audience: "Women",
    pricePence: 14000,
    currency: "£",
    total: 60,
    remaining: 60,
    sizes: ["XS", "S", "M", "L"],
    startsAt: now + 18 * HOUR,
    endsAt: now + 2 * DAY,
    image: { src: "/feed/lambswool-crew.png", tone: "#837c6c" },
  },
  {
    slug: "pleated-trouser",
    brand: "Atlas Workshop",
    brandSlug: "atlas-workshop",
    title: "Pleated Trouser",
    category: "Trousers",
    audience: "Women",
    pricePence: 16500,
    currency: "£",
    total: 45,
    remaining: 45,
    sizes: ["XS", "S", "M", "L"],
    startsAt: now + 3 * DAY + 4 * HOUR,
    endsAt: now + 5 * DAY,
    image: { src: "/feed/pleated-trouser.png", tone: "#827b6a" },
  },
  {
    slug: "loopback-crew",
    brand: "Mono Standard",
    brandSlug: "mono-standard",
    title: "Loopback Crew",
    category: "Tops",
    audience: "Unisex",
    pricePence: 9500,
    currency: "£",
    total: 50,
    remaining: 0,
    sizes: ["S", "M", "L", "XL"],
    startsAt: now - 4 * DAY,
    endsAt: now - 2 * DAY,
    image: { src: "/feed/loopback-crew.png", tone: "#76726a" },
  },
  {
    slug: "canvas-overshirt",
    brand: "Atlas Workshop",
    brandSlug: "atlas-workshop",
    title: "Canvas Overshirt",
    category: "Outerwear",
    audience: "Men",
    pricePence: 13500,
    currency: "£",
    total: 50,
    remaining: 0,
    sizes: ["M", "L", "XL"],
    startsAt: now - 6 * DAY,
    endsAt: now - 3 * DAY,
    image: { src: "/feed/canvas-overshirt.png", tone: "#7c7461" },
  },
];

export const brands: Brand[] = [
  {
    slug: "atelier-nord",
    name: "Atelier Nord",
    descriptor: "Heavyweight outerwear, made in small numbered runs.",
  },
  {
    slug: "mono-standard",
    name: "Mono Standard",
    descriptor: "The essentials, reconsidered in boxy proportions.",
  },
  {
    slug: "cinder-co",
    name: "Cinder & Co.",
    descriptor: "Hand-finished knitwear from undyed natural fibres.",
  },
  {
    slug: "atlas-workshop",
    name: "Atlas Workshop",
    descriptor: "Tailored workwear cut for the long haul.",
  },
];

export function statusOf(d: FeedDrop): DropStatus {
  if (d.remaining <= 0) return "SOLD_OUT";
  if (Date.now() < d.startsAt) return "UPCOMING";
  return "LIVE";
}

export function formatPrice(pence: number, currency: string) {
  return `${currency}${(pence / 100).toFixed(2)}`;
}

export const CATEGORIES: ("All" | Category)[] = [
  "All",
  "Outerwear",
  "Tops",
  "Knitwear",
  "Trousers",
  "Accessories",
];

export const AUDIENCES: ("All" | Audience)[] = [
  "All",
  "Men",
  "Women",
  "Unisex",
];

export const SIZES: ("All" | SizeKey)[] = [
  "All",
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "OS",
];

export type SortKey = "ending" | "newest";
