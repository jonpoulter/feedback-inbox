import type { Category, FeedbackItem } from "../api/client";

const CATEGORY_LABELS: Record<Category, string> = {
  bug: "Bug",
  idea: "Idea",
  process: "Process",
  other: "Other",
};

interface FeedbackListProps {
  items: FeedbackItem[];
  onReview: (id: number) => void;
  loading?: boolean;
}

export function FeedbackList({ items, onReview, loading }: FeedbackListProps) {
  if (loading) {
    return <p className="muted">Loading feedback…</p>;
  }

  if (items.length === 0) {
    return <p className="muted">No feedback items yet.</p>;
  }

  return (
    <ul className="item-list">
      {items.map((item) => (
        <li key={item.id} className="item-card">
          <div className="item-header">
            <h3>{item.title}</h3>
            <div className="badges">
              <span className={`badge badge-${item.category}`}>
                {CATEGORY_LABELS[item.category]}
              </span>
              <span className={`badge badge-${item.status}`}>{item.status}</span>
            </div>
          </div>
          <p>{item.body}</p>
          <div className="item-footer">
            <time dateTime={item.created_at}>
              {new Date(item.created_at).toLocaleString()}
            </time>
            {item.status === "new" && (
              <button type="button" onClick={() => onReview(item.id)}>
                Mark reviewed
              </button>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
