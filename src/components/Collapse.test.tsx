/*
PROM Viewer: SMART on FHIR web application for visualizing patient-reported outcome measures (PROMs).
Copyright (C) 2026 Thomas Eisenhauer

This file is part of PROM Viewer.

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License v3.0 or later.
See the LICENSE file for details.
*/

import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import Collapse from "@components/Collapse";

describe("Collapse", () => {
  it("renders the title and children", () => {
    render(
      <Collapse title="Section title">
        <p>Section content</p>
      </Collapse>,
    );

    expect(screen.getByText("Section title")).toBeInTheDocument();
    expect(screen.getByText("Section content")).toBeInTheDocument();
  });

  it("uses the title as the details name when name is not provided", () => {
    const { container } = render(
      <Collapse title="Section title">content</Collapse>,
    );

    expect(container.querySelector("details")).toHaveAttribute(
      "name",
      "Section title",
    );
  });

  it("uses the provided name over the title", () => {
    const { container } = render(
      <Collapse title="Section title" name="custom-group">
        content
      </Collapse>,
    );

    expect(container.querySelector("details")).toHaveAttribute(
      "name",
      "custom-group",
    );
  });
});
