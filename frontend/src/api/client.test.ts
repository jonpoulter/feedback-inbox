import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createItem, listItems, reviewItem, type FeedbackItem } from "./client";

const BASE = "http://localhost:8000";

function makeResponse(
  body: unknown,
  init?: { ok?: boolean; status?: number; text?: string },
): Response {
  return {
    ok: init?.ok ?? true,
    status: init?.status ?? 200,
    json: async () => body,
    text: async () => init?.text ?? JSON.stringify(body),
  } as unknown as Response;
}

const item: FeedbackItem = {
  id: 1,
  title: "Slow export",
  body: "CSV export is slow",
  category: "bug",
  status: "new",
  created_at: "2024-01-01T00:00:00Z",
};

const fetchMock = vi.fn();

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("listItems", () => {
  it("requests the status-filtered endpoint and returns the parsed list", async () => {
    fetchMock.mockResolvedValue(makeResponse([item]));

    const result = await listItems("new");

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/api/items?status=new&category=all`,
      expect.objectContaining({
        headers: expect.objectContaining({ "Content-Type": "application/json" }),
      }),
    );
    expect(result).toEqual([item]);
  });

  it("defaults to the 'all' filter for both status and category", async () => {
    fetchMock.mockResolvedValue(makeResponse([]));

    await listItems();

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/api/items?status=all&category=all`,
      expect.anything(),
    );
  });

  it("includes the category param when provided", async () => {
    fetchMock.mockResolvedValue(makeResponse([item]));

    await listItems("all", "bug");

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/api/items?status=all&category=bug`,
      expect.anything(),
    );
  });
});

describe("createItem", () => {
  it("POSTs the payload as JSON", async () => {
    fetchMock.mockResolvedValue(makeResponse(item));
    const payload = { title: "x", body: "y", category: "idea" as const };

    const result = await createItem(payload);

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/api/items`,
      expect.objectContaining({ method: "POST", body: JSON.stringify(payload) }),
    );
    expect(result).toEqual(item);
  });
});

describe("reviewItem", () => {
  it("POSTs to the per-item review endpoint", async () => {
    fetchMock.mockResolvedValue(makeResponse({ ...item, status: "reviewed" }));

    await reviewItem(42);

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/api/items/42/review`,
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("returns undefined for 204 No Content without parsing a body", async () => {
    fetchMock.mockResolvedValue(
      makeResponse(null, { status: 204, text: "" }),
    );

    await expect(reviewItem(1)).resolves.toBeUndefined();
  });
});

describe("request error handling", () => {
  it("throws the server-provided detail when the response is not ok", async () => {
    fetchMock.mockResolvedValue(
      makeResponse(null, { ok: false, status: 404, text: "Item not found" }),
    );

    await expect(reviewItem(99)).rejects.toThrow("Item not found");
  });

  it("falls back to a status message when the error body is empty", async () => {
    fetchMock.mockResolvedValue(
      makeResponse(null, { ok: false, status: 500, text: "" }),
    );

    await expect(listItems()).rejects.toThrow("Request failed: 500");
  });
});
