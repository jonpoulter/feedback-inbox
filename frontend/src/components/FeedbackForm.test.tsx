import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { FeedbackForm } from "./FeedbackForm";

function fillForm() {
  fireEvent.change(screen.getByLabelText("Title"), {
    target: { value: "Broken export" },
  });
  fireEvent.change(screen.getByLabelText("Details"), {
    target: { value: "CSV export crashes" },
  });
  fireEvent.change(screen.getByLabelText("Category"), {
    target: { value: "bug" },
  });
}

describe("FeedbackForm", () => {
  it("submits the entered values and resets the form on success", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<FeedbackForm onSubmit={onSubmit} />);

    fillForm();
    fireEvent.click(screen.getByRole("button", { name: "Submit" }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        title: "Broken export",
        body: "CSV export crashes",
        category: "bug",
      }),
    );

    await waitFor(() => expect(screen.getByLabelText("Title")).toHaveValue(""));
    expect(screen.getByLabelText("Details")).toHaveValue("");
    expect(screen.getByLabelText("Category")).toHaveValue("idea");
  });

  it("shows an error and preserves input when submission fails", async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error("Server exploded"));
    render(<FeedbackForm onSubmit={onSubmit} />);

    fillForm();
    fireEvent.click(screen.getByRole("button", { name: "Submit" }));

    expect(await screen.findByText("Server exploded")).toBeInTheDocument();
    expect(screen.getByLabelText("Title")).toHaveValue("Broken export");
  });
});
