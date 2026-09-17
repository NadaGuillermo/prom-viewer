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

import DataLoadingScreen from "@components/DataLoadingScreen";

describe("DataLoadingScreen", () => {
  it("renders the default message and no sub-message", () => {
    const { container } = render(<DataLoadingScreen />);

    expect(screen.getByText("Loading")).toBeInTheDocument();
    expect(container.querySelector(".tw\\:loading-spinner")).toBeInTheDocument();
  });

  it("renders a custom message and sub-message", () => {
    render(
      <DataLoadingScreen
        message="Fetching data"
        subMessage="This may take a few moments..."
      />,
    );

    expect(screen.getByText("Fetching data")).toBeInTheDocument();
    expect(
      screen.getByText("This may take a few moments..."),
    ).toBeInTheDocument();
  });

  it.each(["spinner", "dots", "bars"] as const)(
    "renders the %s animation variant",
    (animation) => {
      const { container } = render(
        <DataLoadingScreen animation={animation} />,
      );

      expect(
        container.querySelector(`.tw\\:loading-${animation}`),
      ).toBeInTheDocument();
    },
  );
});
