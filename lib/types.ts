// Single-table DynamoDB
// Every item shares a composite primary key: PK (partition) + SK (sort).
// FCFS is First Come First Serve

export type ItemType =
  | "BRAND"
  | "DROP"
  | "VARIANT"
  | "HOLD"
  | "ORDER"
  | "ENTRY"
  | "WAITLIST";

export type DropStatus = "DRAFT" | "SCHEDULED" | "LIVE" | "ENDED";
export type DropMode = "FCFS" | "RAFFLE";
export type HoldStatus = "HELD" | "CONFIRMED";
export type OrderStatus = "PENDING" | "PAID" | "CANCELLED";
export type EntryStatus = "PENDING" | "WON" | "LOST";
export type WaitlistStatus = "WAITING" | "PROMOTED";

export type DropCategory =
  | "Outerwear"
  | "Tops"
  | "Knitwear"
  | "Trousers"
  | "Accessories";
export type Audience = "Men" | "Women" | "Unisex";

/** A label/value row rendered on the drop page (e.g. Fabric / 450gsm cotton). */
export interface DropSpec {
  label: string;
  value: string;
}

export interface Item {
  PK: string;
  SK: string;
  type: ItemType;
}

// Brand → PK=BRAND#<brandId>, SK=PROFILE
export interface BrandItem extends Item {
  type: "BRAND";
  name: string;
  handle: string;
  descriptor: string; // short storefront tagline
  bio: string; // longer maison story
  heroImg: string;
  est: string; // e.g. "Est. 2019"
  location: string; // e.g. "Oslo, NO"
  theme: string;
  createdAt: string; // ISO-8601
}

// Drop → PK=DROP#<dropId>, SK=PUB#META
export interface DropItem extends Item {
  type: "DROP";
  brandId: string;
  title: string;
  description: string;
  category: DropCategory;
  audience: Audience;
  currency: string; // display symbol, e.g. "£"
  shippingPence: number; // integer pence
  specs: DropSpec[]; // drop-page label/value rows
  // denormalized card-summary fields (patterns #15/#16/#2) — render the feed
  // from META alone, no per-card variant read. Static except stockRemaining.
  brandName: string; // copy of the brand's display name
  initialStock: number; // Σ variant initialStock (static)
  priceFrom: number; // min variant price, integer pence (static)
  stockRemaining: number; // Σ variant stock — display projection, maintained by Streams (§4.3)
  sizes: string[]; // the variant size set, for in-memory feed filtering
  status: DropStatus;
  mode: DropMode;
  startsAt: string; // ISO-8601
  endsAt: string; // ISO-8601
  heroImg: string;
  gallery: string[];
  // sparse "brand-storefront" index — drops by launch date (pattern #2)
  brandPK: string; // BRAND#<brandId>
  brandSK: string; // DROP#<startsAt>#<dropId>
  // sparse "drop-feed" index — every drop by launch date (pattern #15)
  feedPK: string; // constant "DROP" — the whole feed in one partition
  feedSK: string; // <startsAt>#<dropId>
  // raffle audit — set only after the draw runs (pattern #9)
  raffleSeed?: string;
  entriesCount?: number;
  drawnAt?: string; // ISO-8601
}

// Variant → PK=DROP#<dropId>, SK=PUB#VAR#<sku>
export interface VariantItem extends Item {
  type: "VARIANT";
  size: string;
  colour: string;
  price: number; // integer pence — never a float
  stock: number;
  held: number;
  sold: number;
  initialStock: number; // invariant: stock + held + sold === initialStock
}

// Hold → PK=DROP#<dropId>, SK=HOLD#<holdId>
export interface HoldItem extends Item {
  type: "HOLD";
  userId: string;
  sku: string;
  status: HoldStatus;
  createdAt: string; // ISO-8601
  expiresAt: number; // TTL — epoch SECONDS (number, not ISO string)
}

// Order → PK=DROP#<dropId>, SK=ORDER#<createdAt>#<orderId>
export interface OrderItem extends Item {
  type: "ORDER";
  userId: string;
  sku: string;
  amount: number; // integer pence
  status: OrderStatus;
  holdId?: string;
  createdAt: string; // ISO-8601 (also embedded in the SK)
  // sparse "buyer-orders" index — buyer order history (pattern #11)
  userPK: string; // USER#<userId>
  orderSK: string; // ORDER#<createdAt>#<orderId>
}

// Raffle entry → PK=DROP#<dropId>, SK=ENTRY#<userId>
export interface EntryItem extends Item {
  type: "ENTRY";
  userId: string;
  sku: string;
  enteredAt: string; // ISO-8601
  status: EntryStatus;
}

// Waitlist → PK=DROP#<dropId>, SK=WAIT#<userId>
export interface WaitlistItem extends Item {
  type: "WAITLIST";
  userId: string;
  sku: string;
  email: string;
  joinedAt: string; // ISO-8601
  status: WaitlistStatus;
}

// Discriminated union — switch / narrow on `item.type`
export type ThreadropItem =
  | BrandItem
  | DropItem
  | VariantItem
  | HoldItem
  | OrderItem
  | EntryItem
  | WaitlistItem;

/** Constant partition for the global drop feed (drop-feed index, pattern #15). */
export const FEED_PK = "DROP";

export const keys = {
  drop: (dropId: string) => ({ PK: `DROP#${dropId}`, SK: "PUB#META" }),
  brand: (brandId: string) => ({ PK: `BRAND#${brandId}`, SK: "PROFILE" }),
  variant: (dropId: string, SKU: string) => ({
    PK: `DROP#${dropId}`,
    SK: `PUB#VAR#${SKU}`,
  }),
  hold: (dropId: string, holdId: string) => ({
    PK: `DROP#${dropId}`,
    SK: `HOLD#${holdId}`,
  }),
  order: (dropId: string, createdAt: string, orderId: string) => ({
    PK: `DROP#${dropId}`,
    SK: `ORDER#${createdAt}#${orderId}`,
  }),
  entry: (dropId: string, userId: string) => ({
    PK: `DROP#${dropId}`,
    SK: `ENTRY#${userId}`,
  }),
  waitlist: (dropId: string, userId: string) => ({
    PK: `DROP#${dropId}`,
    SK: `WAIT#${userId}`,
  }),
  brandGsi: (brandId: string, startsAt: string, dropId: string) => ({
    brandPK: `BRAND#${brandId}`,
    brandSK: `DROP#${startsAt}#${dropId}`,
  }),
  feedGsi: (startsAt: string, dropId: string) => ({
    feedPK: FEED_PK,
    feedSK: `${startsAt}#${dropId}`,
  }),
  userGsi: (userId: string, createdAt: string, orderId: string) => ({
    userPK: `USER#${userId}`,
    orderSK: `ORDER#${createdAt}#${orderId}`,
  }),
};
