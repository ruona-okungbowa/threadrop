"use client";

import {
  CATEGORIES,
  AUDIENCES,
  SIZES,
  type Category,
  type Audience,
  type SizeKey,
  type SortKey,
} from "@/lib/feed-data";

export interface Filters {
  category: "All" | Category;
  audience: "All" | Audience;
  size: "All" | SizeKey;
  sort: SortKey;
}

function Toggle({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`font-mono text-[11px] uppercase tracking-[0.16em] transition-colors duration-200 ${
        active
          ? "text-foreground underline decoration-accent decoration-2 underline-offset-[6px]"
          : "text-faint hover:text-subtle"
      }`}
    >
      {label}
    </button>
  );
}

function Group<T extends string>({
  legend,
  options,
  value,
  onChange,
}: {
  legend: string;
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-faint">
        {legend}
      </span>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        {options.map((opt) => (
          <Toggle
            key={opt}
            label={opt}
            active={value === opt}
            onClick={() => onChange(opt)}
          />
        ))}
      </div>
    </div>
  );
}

export function FilterBar({
  filters,
  onChange,
  count,
}: {
  filters: Filters;
  onChange: (next: Filters) => void;
  count: number;
}) {
  return (
    <div className="flex flex-col gap-6 border-y border-border py-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:flex-wrap lg:items-start lg:gap-x-12">
        <Group
          legend="Category"
          options={CATEGORIES}
          value={filters.category}
          onChange={(category) => onChange({ ...filters, category })}
        />
        <Group
          legend="Audience"
          options={AUDIENCES}
          value={filters.audience}
          onChange={(audience) => onChange({ ...filters, audience })}
        />
        <Group
          legend="Size"
          options={SIZES}
          value={filters.size}
          onChange={(size) => onChange({ ...filters, size })}
        />
      </div>

      <div className="flex items-center justify-between border-t border-border/60 pt-4">
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-subtle">
          {count} {count === 1 ? "drop" : "drops"}
        </span>
        <div className="flex items-center gap-4">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-faint">
            Sort
          </span>
          <Toggle
            label="Ending soon"
            active={filters.sort === "ending"}
            onClick={() => onChange({ ...filters, sort: "ending" })}
          />
          <Toggle
            label="Newest"
            active={filters.sort === "newest"}
            onClick={() => onChange({ ...filters, sort: "newest" })}
          />
        </div>
      </div>
    </div>
  );
}
