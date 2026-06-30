import { useCallback, useEffect, useState } from "react";

import {
  createItem,
  getStats,
  listItems,
  reviewItem,
  type CategoryFilter,
  type FeedbackItem,
  type FeedbackStats,
  type StatusFilter,
} from "./api/client";
import { CategoryFilterBar } from "./components/CategoryFilterBar";
import { FeedbackForm } from "./components/FeedbackForm";
import { FeedbackList } from "./components/FeedbackList";
import { StatusFilterBar } from "./components/StatusFilterBar";

export default function App() {
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [stats, setStats] = useState<FeedbackStats | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadItems = useCallback(
    async (status: StatusFilter, category: CategoryFilter) => {
      setLoading(true);
      setError(null);
      try {
        const [nextItems, nextStats] = await Promise.all([
          listItems(status, category),
          getStats(status, category),
        ]);
        setItems(nextItems);
        setStats(nextStats);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load feedback.");
        setStats(null);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    void loadItems(statusFilter, categoryFilter);
  }, [loadItems, statusFilter, categoryFilter]);

  async function handleCreate(payload: {
    title: string;
    body: string;
    category: FeedbackItem["category"];
  }) {
    await createItem(payload);
    await loadItems(statusFilter, categoryFilter);
  }

  async function handleReview(id: number) {
    setError(null);
    try {
      await reviewItem(id);
      await loadItems(statusFilter, categoryFilter);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to mark item reviewed.");
    }
  }

  return (
    <div className="app">
      <header>
        <h1>Feedback Inbox</h1>
        <p className="muted">Submit, filter, and review team feedback.</p>
      </header>

      <main>
        <FeedbackForm onSubmit={handleCreate} />

        <section className="inbox-panel">
          <div className="panel-header">
            <div className="panel-title-row">
              <h2>Inbox</h2>
              {stats && (
                <p className="muted stats-summary">{stats.percent_reviewed}% reviewed</p>
              )}
            </div>
            <div className="filters">
              <StatusFilterBar value={statusFilter} onChange={setStatusFilter} />
              <CategoryFilterBar value={categoryFilter} onChange={setCategoryFilter} />
            </div>
          </div>
          {error && <p className="error">{error}</p>}
          <FeedbackList
            items={items}
            onReview={handleReview}
            loading={loading}
            filtersActive={statusFilter !== "all" || categoryFilter !== "all"}
          />
        </section>
      </main>
    </div>
  );
}
