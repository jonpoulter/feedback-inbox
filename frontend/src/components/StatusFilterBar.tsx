import type { StatusFilter } from "../api/client";

const FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "new", label: "New" },
  { value: "reviewed", label: "Reviewed" },
];

interface StatusFilterBarProps {
  value: StatusFilter;
  onChange: (value: StatusFilter) => void;
}

export function StatusFilterBar({ value, onChange }: StatusFilterBarProps) {
  return (
    <div className="filter-bar" role="group" aria-label="Filter by status">
      {FILTERS.map((filter) => (
        <button
          key={filter.value}
          type="button"
          className={value === filter.value ? "active" : undefined}
          onClick={() => onChange(filter.value)}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}
