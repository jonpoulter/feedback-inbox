import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import { CategoryFilterBar } from "./CategoryFilterBar";

describe("CategoryFilterBar", () => {
  it("renders all category options", () => {
    render(<CategoryFilterBar value="all" onChange={() => {}} />);

    expect(screen.getByRole("button", { name: "All categories" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Bug" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Idea" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Process" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Other" })).toBeInTheDocument();
  });

  it("marks only the active filter", () => {
    render(<CategoryFilterBar value="bug" onChange={() => {}} />);

    expect(screen.getByRole("button", { name: "Bug" })).toHaveClass("active");
    expect(screen.getByRole("button", { name: "All categories" })).not.toHaveClass("active");
  });

  it("calls onChange with the selected category value", () => {
    const onChange = vi.fn();
    render(<CategoryFilterBar value="all" onChange={onChange} />);

    fireEvent.click(screen.getByRole("button", { name: "Idea" }));

    expect(onChange).toHaveBeenCalledWith("idea");
  });

  it("clears the filter via 'All categories' (onChange with 'all')", () => {
    const onChange = vi.fn();
    render(<CategoryFilterBar value="bug" onChange={onChange} />);

    fireEvent.click(screen.getByRole("button", { name: "All categories" }));

    expect(onChange).toHaveBeenCalledWith("all");
  });
});
