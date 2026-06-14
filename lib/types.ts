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
  bio: string;
  theme: string;
  createdAt: string; // ISO-8601
}

// Drop → PK=DROP#<dropId>, SK=PUB#META
export interface DropItem extends Item {
  type: "DROP";
  brandId: string;
  title: string;
  description: string;
  status: DropStatus;
  mode: DropMode;
  startsAt: string; // ISO-8601
  endsAt: string; // ISO-8601
  heroImg: string;
  gallery: string[];
  // sparse GSI1 — brand storefront, drops by launch date (pattern #2)
  GSI1PK: string; // BRAND#<brandId>
  GSI1SK: string; // DROP#<startsAt>#<dropId>
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
  // sparse GSI2 — buyer order history (pattern #11)
  GSI2PK: string; // USER#<userId>
  GSI2SK: string; // ORDER#<createdAt>#<orderId>
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
    GSI1PK: `BRAND#${brandId}`,
    GSI1SK: `DROP#${startsAt}#${dropId}`,
  }),
  userGsi: (userId: string, createdAt: string, orderId: string) => ({
    GSI2PK: `USER#${userId}`,
    GSI2SK: `ORDER#${createdAt}#${orderId}`,
  }),
};
