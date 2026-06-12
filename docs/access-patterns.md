# Threadrop — Data Model & Access Patterns

**This document is the spec.** Every key, query, and transaction in the codebase must match what is written here. If a feature needs a new access pattern, this document changes first, then the code. Never improvise keys.

Design rule this whole document follows: **in DynamoDB you design the table from the queries, not the queries from the table.** Every pattern below was enumerated before the table was designed.

---

## 1. Table definition

| Setting | Value | Why |
|---|---|---|
| Table name | `threadrop` | Single table — all entities share it |
| Partition key | `PK` (string) | Generic; entity type encoded in the value |
| Sort key | `SK` (string) | Prefix-typed; enables item collections per drop |
| Billing | On-demand | No capacity planning; pennies at demo scale; absorbs the hype-test burst |
| TTL attribute | `expiresAt` (epoch seconds) | Hold cleanup — **hygiene, never correctness** (see §6) |
| Streams | `NEW_AND_OLD_IMAGES` | Restock on hold expiry needs the *old* image to know what to put back; also feeds waitlist promotion and the (stretch) Aurora analytics sink |
| Removal policy | `RETAIN` | App must stay live through July 24 (judging period) |
| GSI1 | `GSI1PK` / `GSI1SK` | Brand storefront: drops by launch date. **Sparse** — only Drop META items carry these attributes |
| GSI2 | `GSI2PK` / `GSI2SK` | Buyer order history. **Sparse** — only Order items carry these attributes |

Both GSIs project `ALL`. At demo scale the cost difference vs `INCLUDE` is nil; at real scale you'd trim GSI1 to the storefront-card attributes. (Known and deliberate — say this if asked.)

---

## 2. Item chart

| Entity | PK | SK | Attributes | GSI keys |
|---|---|---|---|---|
| **Brand** | `BRAND#<brandId>` | `PROFILE` | `name`, `handle`, `bio`, `theme`, `createdAt` | — |
| **Drop** | `DROP#<dropId>` | `PUB#META` | `brandId`, `title`, `description`, `status` (DRAFT\|SCHEDULED\|LIVE\|ENDED), `mode` (FCFS\|RAFFLE), `startsAt`, `endsAt`, `heroImg`, `gallery[]`, `raffleSeed?`, `entriesCount?`, `drawnAt?` | `GSI1PK=BRAND#<brandId>`, `GSI1SK=DROP#<startsAt>#<dropId>` |
| **Variant** | `DROP#<dropId>` | `PUB#VAR#<sku>` | `size`, `colour`, `price` (integer minor units), `stock`, `held`, `sold`, `initialStock` | — |
| **Hold** | `DROP#<dropId>` | `HOLD#<holdId>` | `userId`, `sku`, `status` (HELD\|CONFIRMED), `createdAt`, `expiresAt` (TTL) | — |
| **Order** | `DROP#<dropId>` | `ORDER#<createdAt>#<orderId>` | `userId`, `sku`, `amount`, `paidState` (SIMULATED), `holdId?`, `createdAt` | `GSI2PK=USER#<userId>`, `GSI2SK=ORDER#<createdAt>#<orderId>` |
| **Raffle entry** | `DROP#<dropId>` | `ENTRY#<userId>` | `sku`, `enteredAt`, `status` (PENDING\|WON\|LOST) | — |
| **Waitlist** | `DROP#<dropId>` | `WAIT#<userId>` | `sku`, `email`, `joinedAt`, `status` (WAITING\|PROMOTED) | — |

**ID conventions:** `dropId`, `holdId`, `orderId` are ULIDs (time-sortable, no coordination). `userId` is a guest identity — ULID issued in a cookie, with email captured at checkout. Timestamps in SKs are ISO-8601 (lexicographic sort = chronological sort). Prices are integers (pence) — never floats.

### Why `PUB#` exists (a deliberate key-design decision)

The public drop page needs drop meta + all variants in **one query** — and nothing else. Plain prefixes fail here: alphabetically `META` < `ORDER#` < `VAR#`, so any SK range covering meta and variants also drags in every order. Prefixing both public item types with `PUB#` makes `begins_with(SK, "PUB#")` fetch exactly the page payload and nothing private. The keys were shaped by the query — this is the single-table principle in one example.

### Why the GSIs are sparse

Only Drop META items have `GSI1PK`; only Order items have `GSI2PK`. DynamoDB indexes only items that carry the key attributes, so each GSI contains exactly one entity type — no filtering, no wasted storage, and a Query against the GSI can't accidentally return the wrong entity.

---

## 3. Access patterns (the complete enumeration)

| # | Pattern | Screen | Operation | Keys / condition | Notes |
|---|---|---|---|---|---|
| 1 | Render drop page (meta + all variants + live stock) | Drop page | `Query` | `PK = DROP#<id> AND begins_with(SK, "PUB#")` | One round trip for the entire public page |
| 2 | Render brand storefront (drops newest-first) | Storefront | `Query` GSI1 | `GSI1PK = BRAND#<id> AND begins_with(GSI1SK, "DROP#")`, `ScanIndexForward=false` | Sparse index → only drops come back |
| 3 | **Place hold** (the money write) | Checkout drawer | `TransactWriteItems` | See §4.1 | Rejection = sold out → offer waitlist. **Never oversells by construction** |
| 4 | **Confirm hold → order** | Checkout drawer | `TransactWriteItems` | See §4.2 | Idempotent via `ClientRequestToken = holdId` |
| 5 | Expire hold → restock | (background) | Streams → Lambda | See §4.3 | Fires on TTL deletion of HELD holds |
| 6 | Join waitlist | Sold-out state | `PutItem` | `SK = WAIT#<userId>`, condition `attribute_not_exists(PK)` | One entry per user, enforced by the key itself |
| 7 | Promote waitlist on restock | (background) | Streams → Lambda | Query `begins_with(SK, "WAIT#")`, earliest `joinedAt` wins → place hold via #3 | The "drops never die" feature |
| 8 | Enter raffle | Drop page (raffle mode) | `PutItem` | `SK = ENTRY#<userId>`, condition `attribute_not_exists(PK)` | One entry per user — same key trick as #6 |
| 9 | **Run raffle draw** | Studio | Query + seeded shuffle + `TransactWriteItems` per winner | See §4.4 | Auditable: seed persisted, draw reproducible |
| 10 | Live order console | Studio | `Query` | `PK = DROP#<id> AND begins_with(SK, "ORDER#")`, `ScanIndexForward=false`, `Limit=50` | Poll every 2s; ISO timestamp in SK → newest first |
| 11 | Buyer's order history | Account | `Query` GSI2 | `GSI2PK = USER#<id>` | Sparse index → only orders |
| 12 | Create/edit drop, variants | Studio wizard | `PutItem` / `UpdateItem` | Direct keys | Status transitions: DRAFT → SCHEDULED → LIVE → ENDED |
| 13 | Hype-test metrics | Hype-test page | App-level counters | Tally of successes vs `ConditionalCheckFailedException` + latency timings | **The rejected writes ARE the proof** — see §5 |
| 14 | Under-the-hood x-ray | Drop page toggle | Reuses #1, #10, #13 | — | Zero extra modelling cost; renders key shapes, live counters, rejection tallies |

**Forbidden operation:** `Scan`. Every pattern above is a keyed `Query`, `GetItem`, or keyed write. If generated code contains a Scan, it is a bug.

---

## 4. The transactions (write paths in full)

### 4.1 Place hold (pattern #3)

```
TransactWriteItems:
  1. Update  DROP#<dropId> / PUB#VAR#<sku>
       UpdateExpression:    SET stock = stock - :one, held = held + :one
       ConditionExpression: stock >= :one
  2. Put     DROP#<dropId> / HOLD#<holdId>
       Item: { userId, sku, status: "HELD", createdAt, expiresAt: now + 600 }
       ConditionExpression: attribute_not_exists(PK)
```

- The condition on item 1 is the entire oversell-proof guarantee. There is **no application-level stock check** — correctness lives in the database.
- On `TransactionCanceledException` with `ConditionalCheckFailed`: surface "sold out", offer waitlist. This is a *feature outcome*, not an error.
- Hold window: 10 minutes (`expiresAt = now + 600`).

### 4.2 Confirm hold → order (pattern #4)

```
TransactWriteItems (ClientRequestToken = holdId):
  1. Update  DROP#<dropId> / HOLD#<holdId>
       UpdateExpression:    SET status = :confirmed
       ConditionExpression: status = :held AND expiresAt > :now
  2. Update  DROP#<dropId> / PUB#VAR#<sku>
       UpdateExpression:    SET held = held - :one, sold = sold + :one
       ConditionExpression: held >= :one
  3. Put     DROP#<dropId> / ORDER#<createdAt>#<orderId>
       Item: { userId, sku, amount, paidState: "SIMULATED", holdId, GSI2 keys }
       ConditionExpression: attribute_not_exists(PK)
```

- `expiresAt > :now` uses **server time** — an expired hold cannot confirm even if TTL hasn't deleted it yet (see §6).
- `ClientRequestToken = holdId` gives transaction-level idempotency for 10 minutes — exactly the hold window. A double-click or retried request cannot create two orders.
- The confirmed hold is left in place; when TTL eventually deletes it, the Streams handler sees `status = CONFIRMED` in the old image and does nothing (§4.3).

### 4.3 Expiry restock (pattern #5 — Streams consumer)

Lambda on the table's stream, filtered to `REMOVE` events where the old image is a Hold:

```
if oldImage.SK begins_with "HOLD#" and oldImage.status == "HELD":
    Update  DROP#<dropId> / PUB#VAR#<sku>
      UpdateExpression:    SET stock = stock + :one, held = held - :one
      ConditionExpression: held >= :one
    then → trigger waitlist promotion (pattern #7)
if oldImage.status == "CONFIRMED": do nothing  (order already exists)
```

- Restock is conditional (`held >= :one`) so a duplicate stream delivery can't double-restock — the handler is idempotent.
- TTL deletions are identifiable in the stream record (`userIdentity.principalId = "dynamodb.amazonaws.com"`), but the handler doesn't need to distinguish: *any* removal of a HELD hold means its unit goes back.

### 4.4 Raffle draw (pattern #9)

1. `Query` all `ENTRY#` items for the drop (paginated), **sorted by SK** — deterministic input order.
2. Generate a random seed; run a seeded Fisher–Yates shuffle; first *N* entries win (*N* = remaining stock).
3. Persist the audit record on the Drop META item: `raffleSeed`, `entriesCount`, `drawnAt`.
4. Per winner, one transaction: `Update VAR (condition stock >= :one) stock-1, sold+1` + `Update ENTRY → status WON` + `Put ORDER`.
5. Remaining entries batch-updated to `LOST` (no conditions needed — no inventory moves).

**The audit claim:** anyone with the seed and the entry list can re-run the shuffle and reproduce the winners. Fairness is *provable from data*, not asserted. The one-entry-per-user rule isn't application logic — it's `attribute_not_exists` on a key that contains the userId.

---

## 5. Invariants & how the hype test proves them

Per variant, at all times: **`stock + held + sold == initialStock`** — every transaction above moves a unit between exactly two of those buckets atomically. No code path mutates one counter without its counterpart.

The hype test (~200 concurrent purchase attempts vs 50 units) asserts, at completion:

| Assertion | Source |
|---|---|
| Successful holds == 50, exactly | App tally of transaction successes |
| Rejected attempts == attempts − 50 | Tally of `ConditionalCheckFailedException` |
| `stock == 0`, `held + sold == 50` | Read the variant item |
| Orders in table == confirms issued | Pattern #10 query |
| p50 / p99 transaction latency | Timed around each `TransactWriteItems` call |

The rejection counter is the star metric: each rejection is the database refusing to oversell. Corroborate server-side with CloudWatch (`SuccessfulRequestLatency`, throttle count — which should be zero on on-demand at this volume).

---

## 6. TTL semantics (the nuance that matters)

DynamoDB TTL deletion is **lazy** — items can persist past `expiresAt` (typically minutes; no hard SLA). Therefore:

- **TTL is cleanup, never correctness.** Every read that cares filters expired holds itself; the confirm transaction independently checks `expiresAt > :now`.
- Consequence accepted for MVP: a unit held by an expired-but-not-yet-deleted hold stays invisible to buyers until TTL fires (minutes). Waitlist promotion absorbs this; a lazy-reaper on read is the known enhancement if it ever matters.

One-line version for judges: *"I don't trust TTL for correctness — only for hygiene."*

---

## 7. Scaling notes (the ceiling and the escape hatch)

All of a drop's writes land in one partition (by design — that's what makes the transactions single-partition and the page a single query). A DynamoDB partition sustains ~1,000 WCU; a 200-buyer burst is comfortably inside it.

The escape hatch for genuine hype scale (say it, don't build it): **write-shard the variant counter** — split `PUB#VAR#<sku>` into `PUB#VAR#<sku>#<shard 0–9>`, each holding a slice of stock; route holds to a random shard, retry on a different shard if rejected; sum shards on read. Trades a little read complexity for 10× write headroom. Knowing the ceiling and the escape hatch is what distinguishes a deliberate design from a lucky one.

---

## 8. Screen → pattern map

| Screen | Patterns used |
|---|---|
| Drop page (public) | 1, 3 (hold), 6 (waitlist), 8 (raffle entry), 14 (x-ray) |
| Checkout drawer | 3, 4 |
| Brand storefront | 2 |
| Studio — create/edit drop | 12 |
| Studio — live console | 10, 13 |
| Studio — raffle draw | 9 |
| Account / order history | 11 |
| Hype-test page | 3 (×N concurrent), 13 |

---

## 9. Defense lines (what each decision says to a database judge)

- **"Every read is a keyed query; there is no Scan in this codebase."** — access patterns were enumerated first; the table §3 is the proof.
- **"Stock correctness is a ConditionExpression, not an if-statement."** — the guarantee survives any number of concurrent app instances because it lives in the database.
- **"Both GSIs are sparse and each exists for one named pattern."** — no index is decorative.
- **"Confirm is idempotent via ClientRequestToken scoped to the hold window."** — retries and double-clicks are handled by the database, not by application locking.
- **"TTL is hygiene, not correctness."** — §6.
- **"The raffle is reproducible from a persisted seed."** — fairness as data, not as promise.
- **"I know this design's write ceiling and the sharding move past it."** — §7.
