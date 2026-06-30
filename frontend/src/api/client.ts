export type Category = "bug" | "idea" | "process" | "other";
export type Status = "new" | "reviewed";
export type StatusFilter = "new" | "reviewed" | "all";
export type CategoryFilter = Category | "all";

export interface FeedbackItem {
  id: number;
  title: string;
  body: string;
  category: Category;
  status: Status;
  created_at: string;
}

export interface FeedbackItemCreate {
  title: string;
  body: string;
  category: Category;
}

export interface FeedbackStats {
  total: number;
  reviewed: number;
  percent_reviewed: number;
}

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ?? "http://localhost:8000";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
    ...options,
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `Request failed: ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export function listItems(
  status: StatusFilter = "all",
  category: CategoryFilter = "all",
): Promise<FeedbackItem[]> {
  return request<FeedbackItem[]>(`/api/items?status=${status}&category=${category}`);
}

export function getStats(
  status: StatusFilter = "all",
  category: CategoryFilter = "all",
): Promise<FeedbackStats> {
  return request<FeedbackStats>(`/api/stats?status=${status}&category=${category}`);
}

export function createItem(payload: FeedbackItemCreate): Promise<FeedbackItem> {
  return request<FeedbackItem>("/api/items", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function reviewItem(id: number): Promise<FeedbackItem> {
  return request<FeedbackItem>(`/api/items/${id}/review`, {
    method: "POST",
  });
}
