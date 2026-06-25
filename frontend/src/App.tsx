import { useCallback, useEffect, useState } from "react";

import {
  createItem,
  listItems,
  reviewItem,
  type FeedbackItem,
  type StatusFilter,
} from "./api/client";
import { FeedbackForm } from "./components/FeedbackForm";
import { FeedbackList } from "./components/FeedbackList";
import { StatusFilterBar } from "./components/StatusFilterBar";

export default function App() {
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadItems = useCallback(async (filter: StatusFilter) => {
    setLoading(true);
    setError(null);
    try {
      setItems(await listItems(filter));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load feedback.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadItems(statusFilter);
  }, [loadItems, statusFilter]);

  async function handleCreate(payload: {
    title: string;
    body: string;
    category: FeedbackItem["category"];
  }) {
    await createItem(payload);
    await loadItems(statusFilter);
  }

  async function handleReview(id: number) {
    setError(null);
    try {
      await reviewItem(id);
      await loadItems(statusFilter);
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
            <h2>Inbox</h2>
            <StatusFilterBar value={statusFilter} onChange={setStatusFilter} />
          </div>
          {error && <p className="error">{error}</p>}
          <FeedbackList items={items} onReview={handleReview} loading={loading} />
        </section>
      </main>
    </div>
  );
}
