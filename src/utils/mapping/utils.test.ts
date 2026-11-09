/*
PROM Viewer: SMART on FHIR web application for visualizing patient-reported outcome measures (PROMs).
Copyright (C) 2026 Thomas Eisenhauer

This file is part of PROM Viewer.

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License v3.0 or later.
See the LICENSE file for details.
*/

import { afterEach, describe, expect, it } from "vitest";

import { convertFhirDateTimeToDateFormat } from "@utils/mapping/utils";
import {
  applyDateFormatConfig,
  DEFAULT_DATE_FORMAT_CONFIG,
} from "@utils/dateFormat";

describe("convertFhirDateTimeToDateFormat", () => {
  afterEach(() => {
    applyDateFormatConfig(DEFAULT_DATE_FORMAT_CONFIG);
  });

  it("formats a date using the default ISO pattern", () => {
    expect(convertFhirDateTimeToDateFormat("2024-03-07")).toBe("2024-03-07");
  });

  it("uses the configured date format", () => {
    applyDateFormatConfig({ date: { format: "DD.MM.YYYY" } });

    expect(convertFhirDateTimeToDateFormat("2024-03-07")).toBe("07.03.2024");
  });

  it("formats a date-time using its UTC date components", () => {
    expect(
      convertFhirDateTimeToDateFormat("2024-03-07T23:15:00Z"),
    ).toBe("2024-03-07");
  });

  it("normalizes a date-time with a timezone offset to UTC", () => {
    expect(
      convertFhirDateTimeToDateFormat("2024-03-07T23:30:00-02:00"),
    ).toBe("2024-03-08");
  });

  it("formats a date in the very distant past", () => {
    expect(convertFhirDateTimeToDateFormat("0001-01-02")).toBe("1-01-02");
  });

  it("formats a date in the very distant future", () => {
    expect(convertFhirDateTimeToDateFormat("9999-12-31")).toBe("9999-12-31");
  });

  it("returns an unparseable input unchanged", () => {
    expect(convertFhirDateTimeToDateFormat("not-a-date")).toBe("not-a-date");
  });
});
