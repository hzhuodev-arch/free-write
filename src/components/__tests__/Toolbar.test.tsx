import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import Toolbar from "@/components/Toolbar";

describe("Toolbar", () => {
  it("fires onModeChange with the new mode when toggling", async () => {
    const onModeChange = vi.fn();
    render(
      <Toolbar mode="format" onModeChange={onModeChange} loading={false} />,
    );
    await userEvent.click(screen.getByRole("button", { name: /restructure/i }));
    expect(onModeChange).toHaveBeenCalledWith("restructure");
  });

  it("shows spinner when loading=true, hides when false", () => {
    const { rerender } = render(
      <Toolbar mode="format" onModeChange={() => {}} loading={true} />,
    );
    expect(screen.getByTestId("spinner")).toBeInTheDocument();

    rerender(<Toolbar mode="format" onModeChange={() => {}} loading={false} />);
    expect(screen.queryByTestId("spinner")).not.toBeInTheDocument();
  });
});
