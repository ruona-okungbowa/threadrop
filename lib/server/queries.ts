/**
 * Server-only data access. Every function is a keyed Query / GetItem / BatchGetItem
 * per docs/access-patterns.md — never a Scan. Adapters map the single-table items
 * back to the view shapes the components already consume (FeedDrop, Drop, Brand),
 * so the read swap is source-only: components keep their props, the data now comes
 * from DynamoDB. Wrapped in React `cache()` so repeated calls in one render dedupe.
 */
import { cache } from "react";
import {
  BatchGetCommand,
  GetCommand,
  QueryCommand,
  type NativeAttributeValue,
} from "@aws-sdk/lib-dynamodb";
import { docClient, TABLE_NAME } from "@/lib/db/db";
import {
  FEED_PK,
  keys,
  type BrandItem,
  type DropItem,
  type VariantItem,
} from "@/lib/types";
import type { Brand, FeedDrop, SizeKey } from "@/lib/feed-data";
import type { Drop, SizeKey as DropSizeKey } from "@/lib/drop-data";

const BRAND_INDEX = process.env.BRAND_INDEX ?? "brand-storefront";
const FEED_INDEX = process.env.FEED_INDEX ?? "drop-feed";

const slugFromKey = (pk: string) => pk.slice(pk.indexOf("#") + 1);

// Presentational backdrop tones — kept out of the data model (access-patterns §2),
// derived deterministically from the slug so a drop always renders the same one.
const TONES = [
  "#7c766a", "#6f6a5e", "#736d61", "#6a6458",
  "#7d7669", "#827b6a", "#76726a", "#6e6b58",
];
function toneFor(seed: string): string {
  let h = 0;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return TONES[h % TONES.length];
}

const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "OS"];
const GALLERY_LABELS = ["front", "detail", "on body", "flat"];

function metaToFeedDrop(m: DropItem): FeedDrop {
  const slug = slugFromKey(m.PK);
  return {
    slug,
    brand: m.brandName,
    brandSlug: m.brandId,
    title: m.title,
    category: m.category,
    audience: m.audience,
    pricePence: m.priceFrom,
    currency: m.currency,
    total: m.initialStock,
    remaining: m.stockRemaining,
    sizes: m.sizes as SizeKey[],
    startsAt: Date.parse(m.startsAt),
    endsAt: Date.parse(m.endsAt),
    image: { src: m.heroImg, tone: toneFor(slug) },
  };
}

function brandItemToBrand(b: BrandItem): Brand {
  return {
    slug: slugFromKey(b.PK),
    name: b.name,
    descriptor: b.descriptor,
    story: b.bio,
    heroImage: b.heroImg,
    est: b.est,
    location: b.location,
  };
}

function assembleDrop(m: DropItem, variants: VariantItem[]): Drop {
  const slug = slugFromKey(m.PK);
  const sized = [...variants].sort(
    (a, b) => SIZE_ORDER.indexOf(a.size) - SIZE_ORDER.indexOf(b.size),
  );
  return {
    brand: m.brandName,
    title: m.title,
    edition: m.description,
    pricePence: m.priceFrom,
    currency: m.currency,
    shippingPence: m.shippingPence,
    initialStock: m.initialStock,
    startsAt: Date.parse(m.startsAt),
    endsAt: Date.parse(m.endsAt),
    sizes: sized.map((v) => ({ size: v.size as DropSizeKey, stock: v.stock })),
    gallery: m.gallery.map((src, i) => ({
      label: GALLERY_LABELS[i] ?? `view ${i + 1}`,
      src,
      tone: toneFor(`${slug}#${i}`),
    })),
    specs: m.specs,
  };
}

/** Pattern #15 — global feed: every drop, newest-first, one drop-feed query. */
export const getFeed = cache(async (): Promise<FeedDrop[]> => {
  const items: DropItem[] = [];
  let cursor: Record<string, NativeAttributeValue> | undefined;
  do {
    const res = await docClient.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: FEED_INDEX,
        KeyConditionExpression: "feedPK = :pk",
        ExpressionAttributeValues: { ":pk": FEED_PK },
        ScanIndexForward: false,
        ExclusiveStartKey: cursor,
      }),
    );
    items.push(...((res.Items ?? []) as unknown as DropItem[]));
    cursor = res.LastEvaluatedKey;
  } while (cursor);
  return items.map(metaToFeedDrop);
});

/** Pattern #1 — drop page: META + all variants in one query. */
export const getDropPage = cache(async (slug: string): Promise<Drop | null> => {
  const res = await docClient.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: "PK = :pk AND begins_with(SK, :pub)",
      ExpressionAttributeValues: { ":pk": `DROP#${slug}`, ":pub": "PUB#" },
    }),
  );
  const items = (res.Items ?? []) as unknown as (DropItem | VariantItem)[];
  const meta = items.find((i): i is DropItem => i.type === "DROP");
  if (!meta) return null;
  const variants = items.filter((i): i is VariantItem => i.type === "VARIANT");
  return assembleDrop(meta, variants);
});

/** Brand profile by slug. */
export const getBrand = cache(async (slug: string): Promise<Brand | null> => {
  const res = await docClient.send(
    new GetCommand({ TableName: TABLE_NAME, Key: keys.brand(slug) }),
  );
  return res.Item ? brandItemToBrand(res.Item as unknown as BrandItem) : null;
});

/** Pattern #2 — one brand's drops, newest-first (brand-storefront). */
export const listBrandDrops = cache(
  async (brandSlug: string): Promise<FeedDrop[]> => {
    const res = await docClient.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: BRAND_INDEX,
        KeyConditionExpression: "brandPK = :pk AND begins_with(brandSK, :d)",
        ExpressionAttributeValues: {
          ":pk": `BRAND#${brandSlug}`,
          ":d": "DROP#",
        },
        ScanIndexForward: false,
      }),
    );
    return ((res.Items ?? []) as unknown as DropItem[]).map(metaToFeedDrop);
  },
);

export interface BrandWithDrops {
  brand: Brand;
  drops: FeedDrop[];
}

/**
 * Pattern #16 — all brands that have drops: distinct brands from the feed (#15),
 * then BatchGetItem their profiles. No Scan, no extra index. A brand with zero
 * drops won't appear — by design (a label exists to drop).
 */
export const getBrandsWithDrops = cache(async (): Promise<BrandWithDrops[]> => {
  const feed = await getFeed();
  const dropsBySlug = new Map<string, FeedDrop[]>();
  for (const d of feed) {
    const arr = dropsBySlug.get(d.brandSlug);
    if (arr) arr.push(d);
    else dropsBySlug.set(d.brandSlug, [d]);
  }
  const slugs = [...dropsBySlug.keys()];
  if (slugs.length === 0) return [];

  const res = await docClient.send(
    new BatchGetCommand({
      RequestItems: {
        [TABLE_NAME]: { Keys: slugs.map((s) => keys.brand(s)) },
      },
    }),
  );
  const brands = (
    (res.Responses?.[TABLE_NAME] ?? []) as unknown as BrandItem[]
  ).map(brandItemToBrand);
  brands.sort((a, b) => a.name.localeCompare(b.name));
  return brands.map((brand) => ({
    brand,
    drops: dropsBySlug.get(brand.slug) ?? [],
  }));
});
