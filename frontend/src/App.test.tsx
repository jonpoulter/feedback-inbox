import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import App from "./App";
import * as client from "./api/client";
import type { FeedbackItem } from "./api/client";

vi.mock("./api/client", () => ({
  listItems: vi.fn(),
  createItem: vi.fn(),
  reviewItem: vi.fn(),
}));

const listItemsMock = vi.mocked(client.listItems);

const item: FeedbackItem = {
  id: 1,
  title: "Slow export",
  body: "Too slow",
  category: "bug",
  status: "new",
  created_at: "2024-01-01T00:00:00Z",
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("App", () => {
  it("loads and renders feedback items on mount", async () => {
    listItemsMock.mockResolvedValue([item]);

    render(<App />);

    expect(await screen.findByRole("heading", { name: "Slow export" })).toBeInTheDocument();
    expect(listItemsMock).toHaveBeenCalledWith("all", "all");
  });

  it("reloads with the selected category when a category filter is chosen", async () => {
    listItemsMock.mockResolvedValue([item]);

    render(<App />);
    await screen.findByRole("heading", { name: "Slow export" });

    fireEvent.click(screen.getByRole("button", { name: "Bug" }));

    expect(listItemsMock).toHaveBeenLastCalledWith("all", "bug");
  });

  it("shows the filtered-empty message when an active filter matches nothing", async () => {
    listItemsMock.mockResolvedValueOnce([item]).mockResolvedValue([]);

    render(<App />);
    await screen.findByRole("heading", { name: "Slow export" });

    fireEvent.click(screen.getByRole("button", { name: "Process" }));

    expect(
      await screen.findByText("No feedback matches these filters."),
    ).toBeInTheDocument();
    expect(screen.queryByText("No feedback items yet.")).toBeNull();
  });

  it("shows an error message when loading fails", async () => {
    listItemsMock.mockRejectedValue(new Error("Network down"));

    render(<App />);

    expect(await screen.findByText("Network down")).toBeInTheDocument();
  });
});
