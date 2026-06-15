"use client";

import { useEffect } from "react";
import { useXray } from "@/lib/xray-context";
import type { DropDataLayer } from "@/lib/data-layer";

export function XrayPanel() {
  const { on, setOn, dataLayer } = useXray();

  // close on Escape
  useEffect(() => {
    if (!on) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOn(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [on, setOn]);

  if (!on || !dataLayer) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* faint scrim — the product stays visible behind, like a display caseback */}
      <button
        type="button"
        aria-label="Close data layer view"
        onClick={() => setOn(false)}
        className="backdrop-in absolute inset-0 bg-foreground/15"
      />
      <aside
        role="dialog"
        aria-label="Under the hood — the data layer"
        className="drawer-panel absolute inset-x-0 bottom-0 max-h-[88vh] overflow-y-auto border-t border-border bg-background sm:inset-y-0 sm:right-0 sm:left-auto sm:max-h-none sm:w-[440px] sm:border-l sm:border-t-0"
      >
        <PanelBody data={dataLayer} onClose={() => setOn(false)} />
      </aside>
    </div>
  );
}

function PanelBody({
  data,
  onClose,
}: {
  data: DropDataLayer;
  onClose: () => void;
}) {
  return (
    <div className="flex flex-col px-6 py-7 md:px-8">
      {/* masthead */}
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-accent">
            Under the hood
          </span>
          <h2 className="font-serif text-3xl font-light leading-[0.95] tracking-tight">
            The data layer
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="font-mono text-[11px] uppercase tracking-[0.18em] text-faint transition-colors duration-200 hover:text-foreground"
        >
          Close
        </button>
      </div>

      <p className="mt-3 max-w-[34ch] font-mono text-[11px] leading-relaxed text-subtle">
        The same drop, seen from the database. One partition, modelled as a
        single-table item collection — no joins, no scans.
      </p>

      {data.streamsEnabled && (
        <div className="mt-4 inline-flex w-fit items-center gap-2 rounded-full border border-border px-3 py-1.5">
          <span className="live-dot h-1.5 w-1.5 rounded-full bg-accent" />
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-subtle">
            Stock backed by DynamoDB Streams
          </span>
        </div>
      )}

      {/* ── ITEM COLLECTION ── */}
      <Section label="Item collection">
        <Meta label="table" value={data.table} />
        <Meta label="region" value={data.region} />

        <div className="mt-4 flex flex-col gap-px">
          <KeyRow prefixLabel="PK" token={data.pk} note="the partition" strong />
          {/* SK items share the partition — a left rule signals the collection */}
          <div className="mt-2 flex flex-col gap-px border-l border-border pl-4">
            <KeyRow
              prefixLabel="SK"
              token={data.metaSk}
              note="the drop"
            />
            {data.variants.map((v) => (
              <KeyRow
                key={v.sk}
                prefixLabel="SK"
                token={v.sk}
                note={v.size === data.activeSize ? "selected" : undefined}
                active={v.size === data.activeSize}
              />
            ))}
          </div>
        </div>
      </Section>

      {/* ── READ PROFILE ── */}
      <Section label="Read profile">
        <div className="flex items-baseline gap-3">
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-faint">
            read
          </span>
          <span className="font-mono text-3xl tabular-nums tracking-tight text-foreground">
            {data.read.ms}
            <span className="text-lg text-subtle">ms</span>
          </span>
        </div>
        <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.16em] text-subtle">
          single {data.read.operation} · {data.read.partitions} partition ·{" "}
          {data.read.scans} scans
        </p>
      </Section>

      {/* ── INVENTORY (selected variant) ── */}
      <Section label={`Inventory · VAR#${data.activeStat.size}`}>
        <div className="grid grid-cols-3 gap-3">
          <Stat label="stock" value={data.activeStat.stock} accent />
          <Stat label="held" value={data.activeStat.held} />
          <Stat label="sold" value={data.activeStat.sold} />
        </div>
        <p className="mt-4 max-w-[40ch] font-mono text-[11px] leading-relaxed text-subtle">
          Claiming a piece is a conditional write{" "}
          <span className="text-foreground">(stock &gt; 0)</span> inside a
          transaction — it can never oversell.
        </p>
      </Section>

      {/* ── HOLD TTL ── */}
      <Section label="Hold" last>
        <div className="flex items-baseline justify-between">
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-faint">
            expiresAt
          </span>
          <span className="font-mono text-lg tabular-nums text-foreground">
            {data.holdTtlLabel}
          </span>
        </div>
        <p className="mt-2 max-w-[40ch] font-mono text-[11px] leading-relaxed text-subtle">
          Auto-expires via TTL; stock returns to the pool.
        </p>
      </Section>
    </div>
  );
}

function Section({
  label,
  children,
  last,
}: {
  label: string;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <section
      className={`mt-8 border-t border-border pt-6 ${last ? "pb-2" : ""}`}
    >
      <h3 className="mb-4 font-mono text-[10px] uppercase tracking-[0.24em] text-faint">
        {label}
      </h3>
      {children}
    </section>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between py-1.5">
      <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-faint">
        {label}
      </span>
      <span className="font-mono text-[12px] tabular-nums text-subtle">
        {value}
      </span>
    </div>
  );
}

/** Renders a DynamoDB key, subtly highlighting the `PREFIX#` so the
 *  single-table structure reads at a glance. */
function KeyRow({
  prefixLabel,
  token,
  note,
  strong,
  active,
}: {
  prefixLabel: string;
  token: string;
  note?: string;
  strong?: boolean;
  active?: boolean;
}) {
  const hashIdx = token.indexOf("#");
  const prefix = hashIdx >= 0 ? token.slice(0, hashIdx + 1) : null;
  const rest = hashIdx >= 0 ? token.slice(hashIdx + 1) : token;

  return (
    <div className="flex items-baseline gap-3 py-1.5">
      <span className="w-6 shrink-0 font-mono text-[10px] uppercase tracking-[0.18em] text-faint">
        {prefixLabel}
      </span>
      <span
        className={`font-mono tabular-nums ${
          strong ? "text-[13px]" : "text-[12px]"
        }`}
      >
        {prefix && (
          <span className="text-accent">{prefix}</span>
        )}
        <span className={active ? "text-foreground" : "text-subtle"}>
          {rest}
        </span>
      </span>
      {note && (
        <span
          className={`ml-auto font-mono text-[10px] uppercase tracking-[0.16em] ${
            active ? "text-accent" : "text-faint"
          }`}
        >
          {note}
        </span>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5 rounded-[var(--radius)] border border-border px-3 py-3">
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-faint">
        {label}
      </span>
      <span
        className={`font-mono text-2xl tabular-nums ${
          accent ? "text-accent" : "text-foreground"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
