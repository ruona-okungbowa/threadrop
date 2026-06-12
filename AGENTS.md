<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Threadrop — project rules

Limited-drop commerce platform for indie fashion brands. H0 hackathon entry (Track 1, internal deadline Jun 27 2026). Solo builder. Judged hardest on DynamoDB data-model craft + design polish.

## Stack
Next.js App Router on Vercel (UI generated via v0, adapted to this Next version) · DynamoDB single-table · TypeScript CDK in `/infra` · auth: email-only guest flow · payments simulated.

## Hard rules
- **`docs/access-patterns.md` is the data-model spec.** Every key, query, and transaction must match it. If a feature needs a new pattern, the spec changes first, then the code.
- **NEVER use Scan.** Every read is a keyed Query/GetItem per the spec. A generated Scan is a bug.
- **All stock changes go through `TransactWriteItems` with `ConditionExpression`s.** Stock correctness lives in the database, never in application checks.
- **TTL is cleanup, not correctness.** Every read/confirm checks `expiresAt` itself.
- AWS calls only in server actions / route handlers. No client-side SDK, no credentials in browser-shipped env vars.
- Don't modify anything under `/infra` or any IAM policy without showing the diff and explaining it line-by-line first. Never generate wildcard IAM.
- Design tokens live in `app/globals.css`: near-black bg, one acid accent (#D4F23C), display serif for titles, mono for data. No purple gradients, no glassmorphism, no emoji in UI, no Inter.
- Plan before building any feature that touches the table. Small commits, conventional messages, commit after each working step.
