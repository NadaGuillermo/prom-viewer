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

import Portal from "@components/Portal";

describe("Portal", () => {
  it("renders children into #portal-root", () => {
    render(<Portal>Portal content</Portal>);

    const portalRoot = document.getElementById("portal-root");
    expect(portalRoot).not.toBeNull();
    expect(screen.getByText("Portal content").closest("#portal-root")).toBe(
      portalRoot,
    );
  });

  it("renders nothing when #portal-root does not exist", () => {
    document.getElementById("portal-root")?.remove();
    const { container } = render(<Portal>Portal content</Portal>);

    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByText("Portal content")).not.toBeInTheDocument();
  });

  it("removes its mounted node from #portal-root on unmount", () => {
    const { unmount } = render(<Portal>Portal content</Portal>);
    const portalRoot = document.getElementById("portal-root")!;

    expect(portalRoot).not.toBeEmptyDOMElement();

    unmount();

    expect(portalRoot).toBeEmptyDOMElement();
  });
});
