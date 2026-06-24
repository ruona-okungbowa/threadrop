import { type AttributeValue, DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  QueryCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";

// Minimal stream-record shapes. The full item schema lives in lib/types.ts on
// the app side; the handler only needs PK / SK / status / sku off the old image.
interface StreamRecord {
  eventName?: "INSERT" | "MODIFY" | "REMOVE";
  dynamodb?: { OldImage?: Record<string, AttributeValue> };
}
interface StreamEvent {
  Records: StreamRecord[];
}

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME as string;

const doc = DynamoDBDocumentClient.from(
  new DynamoDBClient({ region: process.env.AWS_REGION }),
  { marshallOptions: { removeUndefinedValues: true } },
);

/**
 * Pattern #5 (docs/access-patterns.md §4.3). On the table stream: when a HELD
 * hold is removed — TTL expiry or manual release — return its unit to the
 * variant. Confirmed holds are skipped: their unit became an order at confirm
 * (§4.2), so restocking one would oversell.
 */
export const restockHandler = async (event: StreamEvent): Promise<void> => {
  for (const record of event.Records) {
    if (record.eventName !== "REMOVE" || !record.dynamodb?.OldImage) continue;

    const hold = unmarshall(record.dynamodb.OldImage) as {
      PK?: string;
      SK?: string;
      status?: string;
      sku?: string;
    };

    if (!hold.SK?.startsWith("HOLD#")) continue; // not a hold
    if (hold.status !== "HELD") continue; // CONFIRMED → already an order
    if (!hold.PK || !hold.sku) continue;

    // The variant shares the hold's partition (DROP#<dropId>) and is keyed by the
    // hold's `sku` attribute — NOT its SK (HOLD#<holdId>). `held >= :one` makes
    // this idempotent: a duplicate stream delivery fails the condition (no-op).
    try {
      await doc.send(
        new UpdateCommand({
          TableName: TABLE_NAME,
          Key: { PK: hold.PK, SK: `PUB#VAR#${hold.sku}` },
          UpdateExpression: "SET stock = stock + :one, held = held - :one",
          ConditionExpression: "held >= :one",
          ExpressionAttributeValues: { ":one": 1 },
        }),
      );
    } catch (err) {
      if ((err as Error).name === "ConditionalCheckFailedException") continue;
      throw err; // real failure → let the batch retry, then hit the DLQ
    }

    await refreshStockRemaining(hold.PK);
    await promoteNext(hold.PK);
  }
};

/**
 * Display projection (§4.3): set the Drop META's `stockRemaining` to the live
 * sum of its variants' `stock`. An idempotent recompute (not a delta), so
 * duplicate deliveries can't drift it. Feeds the feed/storefront cards
 * (#15/#16/#2); never read for correctness — the oversell guarantee lives only
 * on the variant condition above.
 */
const refreshStockRemaining = async (pk: string): Promise<void> => {
  const res = await doc.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: "PK = :pk AND begins_with(SK, :v)",
      ExpressionAttributeValues: { ":pk": pk, ":v": "PUB#VAR#" },
      ProjectionExpression: "stock",
    }),
  );
  const total = (res.Items ?? []).reduce(
    (sum, v) => sum + (Number(v.stock) || 0),
    0,
  );
  await doc.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { PK: pk, SK: "PUB#META" },
      UpdateExpression: "SET stockRemaining = :n",
      ExpressionAttributeValues: { ":n": total },
    }),
  );
};

/**
 * Pattern #7 (waitlist promotion) — partial. Per §4.3 → §4.1 the full behaviour
 * is: take the earliest-joined WAITING entry for this drop and *place a hold*
 * for them (the same TransactWriteItems as #3), reserving the freed unit. That
 * transaction is part of the write path (place-hold), which isn't built yet — so
 * for now we just flip the next waiter to PROMOTED so the app can offer them a
 * window. Keys/attributes match lib/types.ts WaitlistItem.
 *
 * TODO(write-path): replace the mark below with the §4.1 place-hold transaction.
 */
const promoteNext = async (pk: string): Promise<void> => {
  const res = await doc.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: "PK = :pk AND begins_with(SK, :w)",
      FilterExpression: "#s = :waiting",
      ExpressionAttributeNames: { "#s": "status" }, // `status` is reserved
      ExpressionAttributeValues: {
        ":pk": pk,
        ":w": "WAIT#",
        ":waiting": "WAITING",
      },
    }),
  );
  const items = (res.Items ?? []) as {
    PK: string;
    SK: string;
    joinedAt?: string;
  }[];
  if (items.length === 0) return;

  // Earliest joinedAt wins (SK is WAIT#<userId>, so order by the attribute).
  const next = items.sort((a, b) =>
    (a.joinedAt ?? "").localeCompare(b.joinedAt ?? ""),
  )[0];

  await doc.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { PK: next.PK, SK: next.SK },
      UpdateExpression: "SET #s = :promoted",
      ConditionExpression: "#s = :waiting", // don't double-promote
      ExpressionAttributeNames: { "#s": "status" },
      ExpressionAttributeValues: {
        ":promoted": "PROMOTED",
        ":waiting": "WAITING",
      },
    }),
  );
};
