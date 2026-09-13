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

import MappingTable from "@components/MappingTable";

describe("MappingTable", () => {
  it("renders the column headers", () => {
    render(
      <MappingTable
        data={{
          "Physical Function": [["Mobility", "PROMIS-29"]],
        }}
      />,
    );

    expect(screen.getByText("Domains")).toBeInTheDocument();
    expect(screen.getByText("Dimensions/Scores")).toBeInTheDocument();
    expect(screen.getByText("Legend")).toBeInTheDocument();
  });

  it("renders a pill per domain with its dimensions", () => {
    render(
      <MappingTable
        data={{
          "Physical Function": [["Mobility", "PROMIS-29"]],
        }}
      />,
    );

    expect(screen.getByText("Physical Function")).toBeInTheDocument();
    expect(screen.getByText(/Mobility/)).toBeInTheDocument();
  });

  it("skips domains with no dimensions", () => {
    render(
      <MappingTable
        data={{
          "Physical Function": [["Mobility", "PROMIS-29"]],
          "Empty Domain": [],
        }}
      />,
    );

    expect(screen.queryByText("Empty Domain")).not.toBeInTheDocument();
  });

  it("lists each questionnaire once in the legend", () => {
    render(
      <MappingTable
        data={{
          "Physical Function": [
            ["Mobility", "PROMIS-29"],
            ["Sleep", "PROMIS-29"],
          ],
        }}
      />,
    );

    expect(screen.getAllByText(/PROMIS-29/)).toHaveLength(1);
  });
});
