import { describe, expect, it, afterEach } from "vitest";

import {
  convertFhirDateTimeToDateFormat,
  isQuestionnaireItem,
  isScoreItem,
  isDimensionScore,
  SCORE_HEALTH_CORRELATIONS,
  type Mapping,
} from "@utils/mapping";
import {
  applyDateFormatConfig,
  DEFAULT_DATE_FORMAT_CONFIG,
} from "@utils/dateFormat";

afterEach(() => {
  applyDateFormatConfig(DEFAULT_DATE_FORMAT_CONFIG);
});

describe("convertFhirDateTimeToDateFormat", () => {
  it("formats using the ISO pattern by default", () => {
    expect(convertFhirDateTimeToDateFormat("2024-03-15T10:00:00Z")).toBe(
      "2024-03-15",
    );
  });

  it("formats using the currently configured date pattern", () => {
    applyDateFormatConfig({ date: { format: "DD.MM.YYYY" } });

    expect(convertFhirDateTimeToDateFormat("2024-03-15T10:00:00Z")).toBe(
      "15.03.2024",
    );
  });
});

describe("isQuestionnaireItem", () => {
  it("returns true when the item has non-empty answerOptions", () => {
    const item = {
      linkId: "1",
      domain: "d",
      answerOptions: [{ value: 1, label: "one" }],
    } as Mapping.Item;

    expect(isQuestionnaireItem(item)).toBe(true);
  });

  it("returns false when answerOptions is undefined", () => {
    const item = { linkId: "1", domain: "d" } as Mapping.Item;

    expect(isQuestionnaireItem(item)).toBe(false);
  });

  it("returns false when answerOptions is empty", () => {
    const item = {
      linkId: "1",
      domain: "d",
      answerOptions: [],
    } as Mapping.Item;

    expect(isQuestionnaireItem(item)).toBe(false);
  });
});

describe("isScoreItem", () => {
  it("returns true when both range and scoreHealthCorrelation are set", () => {
    const item = {
      linkId: "1",
      domain: "d",
      range: [0, 10],
      scoreHealthCorrelation: SCORE_HEALTH_CORRELATIONS.increase,
    } as Mapping.Item;

    expect(isScoreItem(item)).toBe(true);
  });

  it("returns false when range is missing", () => {
    const item = {
      linkId: "1",
      domain: "d",
      scoreHealthCorrelation: SCORE_HEALTH_CORRELATIONS.increase,
    } as Mapping.Item;

    expect(isScoreItem(item)).toBe(false);
  });

  it("returns false when scoreHealthCorrelation is missing", () => {
    const item = {
      linkId: "1",
      domain: "d",
      range: [0, 10],
    } as Mapping.Item;

    expect(isScoreItem(item)).toBe(false);
  });
});

describe("isDimensionScore", () => {
  it("returns true when isDimensionScore is true", () => {
    const item = {
      linkId: "1",
      domain: "d",
      isDimensionScore: true,
    } as Mapping.Item;

    expect(isDimensionScore(item)).toBe(true);
  });

  it("returns false when isDimensionScore is undefined", () => {
    const item = { linkId: "1", domain: "d" } as Mapping.Item;

    expect(isDimensionScore(item)).toBe(false);
  });

  it("returns false when isDimensionScore is false", () => {
    const item = {
      linkId: "1",
      domain: "d",
      isDimensionScore: false,
    } as Mapping.Item;

    expect(isDimensionScore(item)).toBe(false);
  });
});
