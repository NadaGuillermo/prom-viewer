/*
PROM Viewer: SMART on FHIR web application for visualizing patient-reported outcome measures (PROMs).
Copyright (C) 2026 Thomas Eisenhauer

This file is part of PROM Viewer.

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License v3.0 or later.
See the LICENSE file for details.
*/

import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import DownloadImageButton from "@components/DownloadImageButton";

describe("DownloadImageButton", () => {
  it("renders with the default aria-label", () => {
    render(<DownloadImageButton id="b-1" onClick={vi.fn()} />);

    expect(
      screen.getByRole("button", { name: "Save as image" }),
    ).toBeInTheDocument();
  });

  it("renders with a custom label", () => {
    render(<DownloadImageButton id="b-2" onClick={vi.fn()} label="Export chart" />);

    expect(
      screen.getByRole("button", { name: "Export chart" }),
    ).toBeInTheDocument();
  });

  it("calls onClick when enabled and clicked", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<DownloadImageButton id="b-3" onClick={onClick} />);

    await user.click(screen.getByRole("button"));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("is disabled and does not call onClick when disabled is true", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<DownloadImageButton id="b-4" onClick={onClick} disabled />);

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();

    await user.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });
});
