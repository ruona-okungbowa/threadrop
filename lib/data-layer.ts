import type { Drop, SizeKey } from "@/lib/drop-data";

/**
 * A structured, presentation-ready view of the DynamoDB single-table item
 * collection that backs a drop. Every field here is a prop/variable so the
 * x-ray panel can later be wired to real item keys, measured latency, and
 * live stock attributes — nothing is hardcoded in the view layer.
 */
export interface VariantItem {
  /** sort key, e.g. "VAR#M" */
  sk: string;
  size: SizeKey;
}

export interface VariantStat {
  size: SizeKey;
  /** units still claimable — the live `stock` attribute */
  stock: number;
  /** units currently reserved by un-expired holds */
  held: number;
  /** units already claimed */
  sold: number;
}

export interface ReadProfile {
  /** measured round-trip in ms */
  ms: number;
  /** the operation used, e.g. "Query" */
  operation: string;
  /** partitions touched — 1 for a keyed read */
  partitions: number;
  /** table/index scans — 0 by design */
  scans: number;
}

export interface DropDataLayer {
  table: string;
  region: string;
  /** partition key, e.g. "DROP#northwind-shell" */
  pk: string;
  /** the META item's sort key */
  metaSk: string;
  /** every variant item in the collection */
  variants: VariantItem[];
  read: ReadProfile;
  /** the size currently in focus (driven by the buy box) */
  activeSize: SizeKey;
  activeStat: VariantStat;
  /** hold time-to-live in seconds (DynamoDB TTL attribute) */
  holdTtlSeconds: number;
  /** human label for the TTL, e.g. "+10:00" */
  holdTtlLabel: string;
  /** whether a Streams consumer is keeping reads warm */
  streamsEnabled: boolean;
}

function fmtTtl(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `+${m}:${String(s).padStart(2, "0")}`;
}

/**
 * Build the data-layer view for a drop. `stock` is read straight from the
 * drop (so it always matches the buy box); `held`/`sold` are realistic
 * placeholders derived from a per-variant allocation until wired to live data.
 */
export function buildDataLayer(
  drop: Drop,
  slug: string,
  activeSize: SizeKey,
  overrides?: Partial<Pick<DropDataLayer, "read" | "table" | "region" | "holdTtlSeconds" | "streamsEnabled">>,
): DropDataLayer {
  const allocation = Math.round(drop.initialStock / drop.sizes.length);

  const statFor = (size: SizeKey): VariantStat => {
    const variant = drop.sizes.find((s) => s.size === size);
    const stock = variant?.stock ?? 0;
    // placeholder mechanics — swap for live `held`/`sold` attributes later
    const held = stock > 0 ? Math.min(stock, 2) : 0;
    const sold = Math.max(0, allocation - stock - held);
    return { size, stock, held, sold };
  };

  const holdTtlSeconds = overrides?.holdTtlSeconds ?? 600;

  return {
    table: overrides?.table ?? "threadrop-drops",
    region: overrides?.region ?? "eu-west-1",
    pk: `DROP#${slug}`,
    metaSk: "META",
    variants: drop.sizes.map((s) => ({ sk: `VAR#${s.size}`, size: s.size })),
    read: overrides?.read ?? {
      ms: 8,
      operation: "Query",
      partitions: 1,
      scans: 0,
    },
    activeSize,
    activeStat: statFor(activeSize),
    holdTtlSeconds,
    holdTtlLabel: fmtTtl(holdTtlSeconds),
    streamsEnabled: overrides?.streamsEnabled ?? true,
  };
}
