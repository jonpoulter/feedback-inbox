import type { CategoryFilter } from "../api/client";

const FILTERS: { value: CategoryFilter; label: string }[] = [
  { value: "all", label: "All categories" },
  { value: "bug", label: "Bug" },
  { value: "idea", label: "Idea" },
  { value: "process", label: "Process" },
  { value: "other", label: "Other" },
];

interface CategoryFilterBarProps {
  value: CategoryFilter;
  onChange: (value: CategoryFilter) => void;
}

export function CategoryFilterBar({ value, onChange }: CategoryFilterBarProps) {
  return (
    <div className="filter-bar" role="group" aria-label="Filter by category">
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
