import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import { StatusFilterBar } from "./StatusFilterBar";

describe("StatusFilterBar", () => {
  it("renders all filter options", () => {
    render(<StatusFilterBar value="all" onChange={() => {}} />);

    expect(screen.getByRole("button", { name: "All" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "New" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reviewed" })).toBeInTheDocument();
  });

  it("marks only the active filter", () => {
    render(<StatusFilterBar value="new" onChange={() => {}} />);

    expect(screen.getByRole("button", { name: "New" })).toHaveClass("active");
    expect(screen.getByRole("button", { name: "All" })).not.toHaveClass("active");
  });

  it("calls onChange with the selected filter value", () => {
    const onChange = vi.fn();
    render(<StatusFilterBar value="all" onChange={onChange} />);

    fireEvent.click(screen.getByRole("button", { name: "Reviewed" }));

    expect(onChange).toHaveBeenCalledWith("reviewed");
  });
});
