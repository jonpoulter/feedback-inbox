import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

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
    expect(listItemsMock).toHaveBeenCalledWith("all");
  });

  it("shows an error message when loading fails", async () => {
    listItemsMock.mockRejectedValue(new Error("Network down"));

    render(<App />);

    expect(await screen.findByText("Network down")).toBeInTheDocument();
  });
});
