import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import { FeedbackList } from "./FeedbackList";
import type { FeedbackItem } from "../api/client";

const newItem: FeedbackItem = {
  id: 1,
  title: "Slow export",
  body: "It is slow",
  category: "bug",
  status: "new",
  created_at: "2024-01-01T00:00:00Z",
};

const reviewedItem: FeedbackItem = {
  id: 2,
  title: "Dark mode",
  body: "Please add it",
  category: "idea",
  status: "reviewed",
  created_at: "2024-01-02T00:00:00Z",
};

describe("FeedbackList", () => {
  it("shows a loading message while loading", () => {
    render(<FeedbackList items={[]} onReview={() => {}} loading />);

    expect(screen.getByText("Loading feedback…")).toBeInTheDocument();
  });

  it("shows an empty state when there are no items", () => {
    render(<FeedbackList items={[]} onReview={() => {}} />);

    expect(screen.getByText("No feedback items yet.")).toBeInTheDocument();
  });

  it("renders item details with category and status badges", () => {
    render(<FeedbackList items={[newItem]} onReview={() => {}} />);

    expect(screen.getByRole("heading", { name: "Slow export" })).toBeInTheDocument();
    expect(screen.getByText("It is slow")).toBeInTheDocument();
    expect(screen.getByText("Bug")).toBeInTheDocument();
    expect(screen.getByText("new")).toBeInTheDocument();
  });

  it("offers 'Mark reviewed' for new items and calls onReview with the id", () => {
    const onReview = vi.fn();
    render(<FeedbackList items={[newItem]} onReview={onReview} />);

    fireEvent.click(screen.getByRole("button", { name: "Mark reviewed" }));

    expect(onReview).toHaveBeenCalledWith(1);
  });

  it("does not render a review button for already-reviewed items", () => {
    render(<FeedbackList items={[reviewedItem]} onReview={() => {}} />);

    expect(screen.queryByRole("button", { name: "Mark reviewed" })).toBeNull();
  });
});
