import { describe, expect, it } from "vitest";

import { createChartData } from "@utils/visualization/dataTransformation";
import { SCORE_HEALTH_CORRELATIONS, type Mapping } from "@utils/mapping";

const q1: Mapping.Questionnaire = {
  id: "q1",
  name: "Q1",
  url: "https://example.org/q1",
  description: "",
  items: {
    plain: {
      linkId: "plain",
      domain: "d",
      text: "Plain Item",
      shortText: "PLN",
      answerOptions: [
        { value: 0, label: "none" },
        { value: 1, label: "mild" },
        { value: 2, label: "severe" },
      ],
    },
    ranged: {
      linkId: "ranged",
      domain: "d",
      text: "Ranged Item",
      range: [0, 4],
      answerOptions: [
        { value: 0, label: "low" },
        { value: 4, label: "high" },
      ],
    },
    "score-inc": {
      linkId: "score-inc",
      domain: "d",
      text: "Increasing Score",
      range: [0, 10],
      scoreHealthCorrelation: SCORE_HEALTH_CORRELATIONS.increase,
      isGlobalScore: true,
    },
    "score-dec": {
      linkId: "score-dec",
      domain: "d",
      text: "Decreasing Score",
      range: [0, 27],
      scoreHealthCorrelation: SCORE_HEALTH_CORRELATIONS.decrease,
      referenceRange: [
        { range: [0, 4], name: "minimal" },
        { range: 10, name: "cutoff" },
      ],
    },
    dimscore: {
      linkId: "dimscore",
      domain: "d",
      isDimensionScore: true,
      answerOptions: [
        { value: 0, label: "a" },
        { value: 2, label: "b" },
      ],
    },
  },
};

const q2: Mapping.Questionnaire = {
  id: "q2",
  name: "Q2",
  url: "https://example.org/q2",
  description: "",
  items: {
    y: {
      linkId: "y",
      domain: "d",
      text: "Q2 Item",
      answerOptions: [
        { value: 0, label: "a" },
        { value: 1, label: "b" },
      ],
    },
  },
};

const questionnaireResponses: Record<string, Mapping.QuestionnaireResponse> = {
  r1: {
    id: "r1",
    questionnaire: q1,
    authored: "2024-01-01",
    items: {
      plain: { linkId: "plain", answer: 1 },
      ranged: { linkId: "ranged", answer: 4 },
      "score-inc": { linkId: "score-inc", answer: 5 },
      "score-dec": { linkId: "score-dec", answer: 27 },
      dimscore: { linkId: "dimscore", answer: 2 },
    },
  },
  r2: {
    id: "r2",
    questionnaire: q2,
    authored: "2024-02-01",
    items: { y: { linkId: "y", answer: 1 } },
  },
};

describe("createChartData", () => {
  const chartData = createChartData(questionnaireResponses);
  const seriesById = (id: string) =>
    chartData.yData.find((s) => s.id === id)!;

  it("builds a common, sorted time axis across all questionnaires", () => {
    expect(chartData.xData).toEqual(["2024-01-01", "2024-02-01"]);
  });

  it("builds one series per item across all questionnaires", () => {
    expect(chartData.yData).toHaveLength(6);
  });

  it("normalizes a plain item using its answer-option min/max and sets the matching label", () => {
    const plain = seriesById("plain");

    expect(plain.data[0]).toBe(0.5);
    expect(plain.dataLabels[0]).toBe("mild");
  });

  it("normalizes an item with an explicit range using that range", () => {
    const ranged = seriesById("ranged");

    expect(ranged.data[0]).toBe(1);
    expect(ranged.dataLabels[0]).toBe("high");
  });

  it("normalizes an increasing-correlation score item without inversion", () => {
    const scoreInc = seriesById("score-inc");

    expect(scoreInc.data[0]).toBe(0.5);
    expect(scoreInc.dataLabels[0]).toBe("");
    expect(scoreInc.seriesType).toBe("score");
  });

  it("normalizes and inverts a decreasing-correlation score item", () => {
    const scoreDec = seriesById("score-dec");

    // 27 is the max of [0, 27] -> normalized to 1, then inverted to 0
    expect(scoreDec.data[0]).toBe(0);
  });

  it("normalizes and inverts reference ranges for a decreasing-correlation score item", () => {
    const scoreDec = seriesById("score-dec");

    expect(scoreDec.referenceValues).toEqual([
      { value: [0, 4], normalizedValue: [1, 0.852], name: "minimal", description: undefined },
      { value: 10, normalizedValue: 0.63, name: "cutoff", description: undefined },
    ]);
  });

  it("marks isDimensionScore items with the dimensionScore series type", () => {
    const dimscore = seriesById("dimscore");

    expect(dimscore.seriesType).toBe("dimensionScore");
    expect(dimscore.data[0]).toBe(1);
  });

  it("fills a null answer, null original value and empty label for dates with no response", () => {
    const plain = seriesById("plain");

    expect(plain.data[1]).toBeNull();
    expect(plain.originalData[1]).toBeNull();
    expect(plain.dataLabels[1]).toBe("");
  });

  it("falls back to the linkId for name and shortName when text/shortText are absent", () => {
    const dimscore = seriesById("dimscore");

    expect(dimscore.name).toBe("dimscore");
    expect(dimscore.shortName).toBe("dimscore");
  });

  it("falls back to a 25-character-sliced linkId for shortName when shortText is absent", () => {
    const ranged = seriesById("ranged");

    expect(ranged.shortName).toBe("ranged");
  });

  it("does not attach referenceValues to items without a referenceRange", () => {
    const plain = seriesById("plain");

    expect(plain.referenceValues).toBeUndefined();
  });
});
