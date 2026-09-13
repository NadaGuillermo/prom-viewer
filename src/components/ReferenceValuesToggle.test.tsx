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

import ReferenceValuesToggle from "@components/ReferenceValuesToggle";

describe("ReferenceValuesToggle", () => {
  it("renders the default label", () => {
    render(<ReferenceValuesToggle checked={false} onChange={vi.fn()} />);

    expect(screen.getByText("Show reference values")).toBeInTheDocument();
  });

  it("renders a custom label", () => {
    render(
      <ReferenceValuesToggle
        checked={false}
        onChange={vi.fn()}
        label="Toggle ranges"
      />,
    );

    expect(screen.getByText("Toggle ranges")).toBeInTheDocument();
  });

  it("reflects the checked prop", () => {
    render(<ReferenceValuesToggle checked={true} onChange={vi.fn()} />);

    expect(screen.getByRole("checkbox")).toBeChecked();
  });

  it("calls onChange with the new checked state when toggled", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ReferenceValuesToggle checked={false} onChange={onChange} />);

    await user.click(screen.getByRole("checkbox"));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(true);
  });
});
