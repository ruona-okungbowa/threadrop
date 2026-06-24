/**
 * One-off seed: writes the hardcoded site data (lib/feed-data.ts + lib/drop-data.ts)
 * into the single-table `threadrop` DynamoDB table, shaped per docs/access-patterns.md.
 *
 * Run:
 *   npm i -D tsx                       # one-time
 *   DYNAMODB_TABLE_NAME=threadrop AWS_REGION=eu-west-1 npm run seed
 *   ...add --force to overwrite existing items: npm run seed -- --force
 *
 * Auth: uses the default AWS credential chain (SSO / profile / env vars) — NOT the
 * Vercel OIDC client in lib/db/db.ts, which only resolves inside a Vercel function.
 *
 * Scope: catalog only (Brand, Drop META, Variant). Holds / orders / entries /
 * waitlist are runtime items and are never seeded.
 *
 * Idempotent: each item is a conditional Put (attribute_not_exists(PK)); items that
 * already exist are skipped, so a re-run can never stomp live stock. --force drops
 * the condition and overwrites.
 */
import {
  DynamoDBClient,
  ConditionalCheckFailedException,
} from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  type NativeAttributeValue,
} from "@aws-sdk/lib-dynamodb";

import { drops, brands, statusOf } from "../lib/feed-data";
import type { FeedDrop, Brand } from "../lib/feed-data";
import { drop as northwind } from "../lib/drop-data";
import {
  keys,
  type BrandItem,
  type DropItem,
  type VariantItem,
  type DropStatus,
} from "../lib/types";

const TABLE = process.env.DYNAMODB_TABLE_NAME;
const REGION = process.env.AWS_REGION ?? process.env.CDK_DEFAULT_REGION;
const FORCE = process.argv.includes("--force");

if (!TABLE) throw new Error("DYNAMODB_TABLE_NAME is required");
if (!REGION) throw new Error("AWS_REGION (or CDK_DEFAULT_REGION) is required");

const doc = DynamoDBDocumentClient.from(new DynamoDBClient({ region: REGION }), {
  marshallOptions: { removeUndefinedValues: true },
});

// The one drop with full-fidelity detail data (per-size stock, gallery, specs).
const NORTHWIND_SLUG = "northwind-shell";
const DEFAULT_COLOUR = "Standard";
const DEFAULT_SHIPPING_PENCE = 695;

const brandNameBySlug = new Map(brands.map((b) => [b.slug, b.name]));

const iso = (ms: number) => new Date(ms).toISOString();

/** UI status (LIVE | UPCOMING | SOLD_OUT) -> spec status (LIVE | SCHEDULED | ENDED). */
function specStatus(d: FeedDrop): DropStatus {
  switch (statusOf(d)) {
    case "UPCOMING":
      return "SCHEDULED";
    case "SOLD_OUT":
      return "ENDED";
    default:
      return "LIVE";
  }
}

/** "Est. 2019" -> "2019-01-01T00:00:00.000Z" (fallback: now). */
function estToIso(est: string): string {
  const year = /\d{4}/.exec(est)?.[0];
  return new Date(year ? `${year}-01-01T00:00:00.000Z` : Date.now()).toISOString();
}

interface Allocation {
  size: string;
  stock: number;
  initialStock: number;
}

/**
 * Split a drop's aggregate `total` / `remaining` across its sizes.
 *
 * Northwind has real per-size stock (lib/drop-data.ts) over 5 sizes — use it.
 * The feed-only drops carry only aggregates, so initialStock is an even split of
 * `total` (remainder onto leading sizes) and stock an even split of `remaining`.
 * stock is clamped to initialStock; sold = initialStock - stock; held = 0 — so the
 * §5 invariant (stock + held + sold === initialStock) holds per variant, and the
 * per-drop sums reproduce the feed's `total` / `remaining` exactly.
 */
function allocate(d: FeedDrop): Allocation[] {
  if (d.slug === NORTHWIND_SLUG) {
    const n = northwind.sizes.length;
    const baseInit = Math.floor(d.total / n);
    const initRem = d.total - baseInit * n;
    return northwind.sizes.map((s, i) => {
      const initialStock = baseInit + (i < initRem ? 1 : 0);
      return { size: s.size, stock: Math.min(s.stock, initialStock), initialStock };
    });
  }

  const n = d.sizes.length;
  const baseInit = Math.floor(d.total / n);
  const initRem = d.total - baseInit * n;
  const baseStock = Math.floor(d.remaining / n);
  const stockRem = d.remaining - baseStock * n;
  return d.sizes.map((size, i) => {
    const initialStock = baseInit + (i < initRem ? 1 : 0);
    const stock = Math.min(baseStock + (i < stockRem ? 1 : 0), initialStock);
    return { size, stock, initialStock };
  });
}

function brandItem(b: Brand): BrandItem {
  return {
    ...keys.brand(b.slug),
    type: "BRAND",
    name: b.name,
    handle: b.slug,
    descriptor: b.descriptor,
    bio: b.story,
    heroImg: b.heroImage,
    est: b.est,
    location: b.location,
    theme: "", // single global accent — no per-brand theming yet
    createdAt: estToIso(b.est),
  };
}

function dropItem(d: FeedDrop): DropItem {
  const isNorthwind = d.slug === NORTHWIND_SLUG;
  const alloc = allocate(d);
  return {
    ...keys.drop(d.slug),
    type: "DROP",
    brandId: d.brandSlug,
    title: d.title,
    description: isNorthwind ? northwind.edition : "",
    category: d.category,
    audience: d.audience,
    currency: d.currency,
    shippingPence: isNorthwind ? northwind.shippingPence : DEFAULT_SHIPPING_PENCE,
    specs: isNorthwind ? northwind.specs : [],
    brandName: brandNameBySlug.get(d.brandSlug) ?? d.brandSlug,
    initialStock: alloc.reduce((s, a) => s + a.initialStock, 0),
    priceFrom: d.pricePence,
    stockRemaining: alloc.reduce((s, a) => s + a.stock, 0),
    sizes: alloc.map((a) => a.size),
    status: specStatus(d),
    mode: "FCFS",
    startsAt: iso(d.startsAt),
    endsAt: iso(d.endsAt),
    heroImg: d.image.src,
    gallery: isNorthwind ? northwind.gallery.map((g) => g.src) : [d.image.src],
    ...keys.brandGsi(d.brandSlug, iso(d.startsAt), d.slug),
    ...keys.feedGsi(iso(d.startsAt), d.slug),
  };
}

function variantItems(d: FeedDrop): VariantItem[] {
  const colour = d.slug === NORTHWIND_SLUG ? "Bone" : DEFAULT_COLOUR;
  return allocate(d).map(({ size, stock, initialStock }) => ({
    ...keys.variant(d.slug, size),
    type: "VARIANT",
    size,
    colour,
    price: d.pricePence,
    stock,
    held: 0,
    sold: initialStock - stock,
    initialStock,
  }));
}

async function put(
  item: Record<string, NativeAttributeValue>,
): Promise<"written" | "skipped"> {
  try {
    await doc.send(
      new PutCommand({
        TableName: TABLE,
        Item: item,
        ...(FORCE ? {} : { ConditionExpression: "attribute_not_exists(PK)" }),
      }),
    );
    return "written";
  } catch (err) {
    if (err instanceof ConditionalCheckFailedException) return "skipped";
    throw err;
  }
}

async function main() {
  const items = [
    ...brands.map(brandItem),
    ...drops.flatMap((d) => [dropItem(d), ...variantItems(d)]),
  ] as unknown as Record<string, NativeAttributeValue>[];

  console.log(
    `Seeding ${items.length} items into ${TABLE} (${REGION})${FORCE ? " [--force]" : ""}`,
  );

  let written = 0;
  let skipped = 0;
  for (const item of items) {
    const result = await put(item);
    if (result === "written") written += 1;
    else skipped += 1;
    console.log(`  ${result}  ${String(item.PK)} / ${String(item.SK)}`);
  }

  console.log(`Done. ${written} written, ${skipped} skipped.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
