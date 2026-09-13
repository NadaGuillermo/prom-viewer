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

import ErrorPage from "@components/ErrorPage";

describe("ErrorPage", () => {
  it("renders the provided error message", () => {
    render(<ErrorPage error="Network request failed" />);

    expect(screen.getByText("Network request failed")).toBeInTheDocument();
  });

  it("falls back to a generic message when error is not a string", () => {
    render(<ErrorPage error={null} />);

    expect(screen.getByText("Unknown error occurred")).toBeInTheDocument();
  });

  it("uses the default heading when none is provided", () => {
    render(<ErrorPage error="oops" />);

    expect(
      screen.getByRole("heading", { name: "Error" }),
    ).toBeInTheDocument();
  });

  it("uses a custom heading when provided", () => {
    render(<ErrorPage error="oops" heading="Connection lost" />);

    expect(
      screen.getByRole("heading", { name: "Connection lost" }),
    ).toBeInTheDocument();
  });

  it("does not render a retry button when onRetry is not provided", () => {
    render(<ErrorPage error="oops" />);

    expect(
      screen.queryByRole("button", { name: "Retry" }),
    ).not.toBeInTheDocument();
  });

  it("calls onRetry when the retry button is clicked", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(<ErrorPage error="oops" onRetry={onRetry} />);

    await user.click(screen.getByRole("button", { name: "Retry" }));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
