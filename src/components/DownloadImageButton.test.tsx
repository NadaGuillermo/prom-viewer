import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import DownloadImageButton from "@components/DownloadImageButton";

describe("DownloadImageButton", () => {
  it("renders with the default aria-label", () => {
    render(<DownloadImageButton onClick={vi.fn()} />);

    expect(
      screen.getByRole("button", { name: "Save as image" }),
    ).toBeInTheDocument();
  });

  it("renders with a custom label", () => {
    render(<DownloadImageButton onClick={vi.fn()} label="Export chart" />);

    expect(
      screen.getByRole("button", { name: "Export chart" }),
    ).toBeInTheDocument();
  });

  it("calls onClick when enabled and clicked", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<DownloadImageButton onClick={onClick} />);

    await user.click(screen.getByRole("button"));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("is disabled and does not call onClick when disabled is true", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<DownloadImageButton onClick={onClick} disabled />);

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();

    await user.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });
});
