import { describe, expect, it } from "vitest";

import { normalizeValue } from "@utils/visualization/helpers";

describe("normalizeValue", () => {
  it("normalizes a value within range to a 0-1 fraction", () => {
    expect(normalizeValue(5, 0, 10)).toBe(0.5);
  });

  it("clamps values below the minimum to 0", () => {
    expect(normalizeValue(-5, 0, 10)).toBe(0);
  });

  it("clamps values above the maximum to 1", () => {
    expect(normalizeValue(15, 0, 10)).toBe(1);
  });

  it("returns the raw value when min equals max", () => {
    expect(normalizeValue(7, 5, 5)).toBe(7);
  });

  it("swaps min and max when min is greater than max", () => {
    expect(normalizeValue(5, 10, 0)).toBe(0.5);
  });

  it("clamps a negative minimum to 0 before normalizing", () => {
    expect(normalizeValue(5, -10, 10)).toBe(0.5);
    expect(normalizeValue(-5, -10, 10)).toBe(0);
  });
});
