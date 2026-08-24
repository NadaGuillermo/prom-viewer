import { describe, expect, it } from "vitest";

import {
  truncateAtWord,
  getLabelFromValueAndDataSeriesName,
  getOriginalValueFromNormalizedValueAndDataSeriesName,
  getDataSeriesNameFromShortName,
  sortDates,
  getDatesWithinRange,
  createCommonTimeAxis,
  groupQuestionnaireResponsesByQuestionnaireId,
  addNullQuestionnaireResponsesForCommonTimeAxisAndSortByDate,
  extractDatesOfQuestionnaireResponses,
  filterQuestionnaireResponsesThatAreWithinDates,
  filterQuestionnaireResponsesThatAreOnSingleDates,
  filterQuestionnaireResponsesByQuestionnaireIds,
  createPseudoDataSeries,
  filterDataSeriesDataAndDatesForCommonNullValues,
  sortDomains,
  getMinAndMaxAnswerOptionValueForItem,
} from "@utils/visualization/utils";
import { ITEM_TYPES, type Mapping } from "@utils/mapping";
import type { Visualization } from "@utils/visualization";

describe("truncateAtWord", () => {
  it("returns the string unchanged when within maxLength", () => {
    expect(truncateAtWord("short text", 80)).toBe("short text");
  });

  it("truncates at the last word boundary and appends an ellipsis", () => {
    const text = "one two three four five six seven eight nine ten eleven twelve";
    const result = truncateAtWord(text, 30);

    expect(result.endsWith("...")).toBe(true);
    expect(result.length).toBeLessThanOrEqual(33);
    expect(result).not.toContain(" ...");
  });

  it("slices without trimming to a word boundary when there is no space", () => {
    const text = "a".repeat(100);

    expect(truncateAtWord(text, 10)).toBe(`${"a".repeat(10)}...`);
  });
});

const series = (
  overrides: Partial<Visualization.DataSeries>,
): Visualization.DataSeries => ({
  id: "row-1",
  name: "Full Name",
  shortName: "SHORT",
  data: [0.5, null],
  originalData: [10, null],
  dataLabels: ["ten", ""],
  seriesType: ITEM_TYPES.item as Visualization.ItemType,
  questionnaireId: "q1",
  questionnaireName: "PHQ-9",
  ...overrides,
});

describe("getLabelFromValueAndDataSeriesName", () => {
  it("returns the label matching the value in the named series", () => {
    expect(
      getLabelFromValueAndDataSeriesName([series({})], 0.5, "SHORT"),
    ).toBe("ten");
  });

  it("returns an empty string when the series is not found", () => {
    expect(
      getLabelFromValueAndDataSeriesName([series({})], 0.5, "OTHER"),
    ).toBe("");
  });

  it("returns an empty string when the value is not present in the series", () => {
    expect(
      getLabelFromValueAndDataSeriesName([series({})], 0.9, "SHORT"),
    ).toBe("");
  });
});

describe("getOriginalValueFromNormalizedValueAndDataSeriesName", () => {
  it("returns the original value at the matching normalized value's index", () => {
    expect(
      getOriginalValueFromNormalizedValueAndDataSeriesName(
        [series({})],
        0.5,
        "SHORT",
      ),
    ).toBe(10);
  });

  it("returns null when the series is not found", () => {
    expect(
      getOriginalValueFromNormalizedValueAndDataSeriesName(
        [series({})],
        0.5,
        "OTHER",
      ),
    ).toBeNull();
  });

  it("returns null when the normalized value is not present", () => {
    expect(
      getOriginalValueFromNormalizedValueAndDataSeriesName(
        [series({})],
        0.9,
        "SHORT",
      ),
    ).toBeNull();
  });
});

describe("getDataSeriesNameFromShortName", () => {
  it("returns the full name for a matching short name", () => {
    expect(getDataSeriesNameFromShortName([series({})], "SHORT")).toBe(
      "Full Name",
    );
  });

  it("returns an empty string when no series matches", () => {
    expect(getDataSeriesNameFromShortName([series({})], "OTHER")).toBe("");
  });
});

describe("sortDates", () => {
  it("sorts ascending by default", () => {
    expect(sortDates("2024-01-01", "2024-02-01")).toBeLessThan(0);
  });

  it("sorts descending when requested", () => {
    expect(sortDates("2024-01-01", "2024-02-01", "descending")).toBeGreaterThan(
      0,
    );
  });

  it("treats equal dates as equal", () => {
    expect(sortDates("2024-01-01", "2024-01-01")).toBe(0);
  });
});

describe("getDatesWithinRange", () => {
  it("returns only dates within the inclusive range", () => {
    const dates = ["2024-01-01", "2024-02-15", "2024-03-01"];

    expect(
      getDatesWithinRange(dates, ["2024-01-15", "2024-02-28"]),
    ).toEqual(["2024-02-15"]);
  });

  it("includes dates exactly on the range boundaries", () => {
    const dates = ["2024-01-01", "2024-02-01"];

    expect(getDatesWithinRange(dates, ["2024-01-01", "2024-02-01"])).toEqual(
      dates,
    );
  });
});

const questionnaire = (
  id: string,
  name: string,
  items: Record<string, Mapping.Item> = {},
): Mapping.Questionnaire => ({
  id,
  name,
  url: `https://example.org/${id}`,
  description: "",
  items,
});

const response = (
  overrides: Partial<Mapping.QuestionnaireResponse>,
): Mapping.QuestionnaireResponse => ({
  id: "resp-1",
  questionnaire: questionnaire("q1", "PHQ-9", {
    item1: { linkId: "item1", domain: "d", answerOptions: [] },
  }),
  authored: "2024-01-01",
  items: { item1: { linkId: "item1", answer: 3 } },
  ...overrides,
});

describe("createCommonTimeAxis", () => {
  it("returns unique, sorted authored dates", () => {
    const responses = {
      r1: response({ id: "r1", authored: "2024-02-01" }),
      r2: response({ id: "r2", authored: "2024-01-01" }),
      r3: response({ id: "r3", authored: "2024-01-01" }),
    };

    expect(createCommonTimeAxis(responses)).toEqual([
      "2024-01-01",
      "2024-02-01",
    ]);
  });
});

describe("groupQuestionnaireResponsesByQuestionnaireId", () => {
  it("groups responses by their questionnaire id", () => {
    const responses = {
      r1: response({ id: "r1", questionnaire: questionnaire("q1", "PHQ-9") }),
      r2: response({ id: "r2", questionnaire: questionnaire("q2", "PROMIS-29") }),
      r3: response({ id: "r3", questionnaire: questionnaire("q1", "PHQ-9") }),
    };

    const grouped = groupQuestionnaireResponsesByQuestionnaireId(responses);

    expect(Object.keys(grouped).sort()).toEqual(["q1", "q2"]);
    expect(grouped.q1).toHaveLength(2);
    expect(grouped.q2).toHaveLength(1);
  });
});

describe("addNullQuestionnaireResponsesForCommonTimeAxisAndSortByDate", () => {
  it("fills in a null-answer response for missing dates and sorts by date", () => {
    const grouped = {
      q1: [response({ id: "r1", authored: "2024-02-01" })],
    };

    const result = addNullQuestionnaireResponsesForCommonTimeAxisAndSortByDate(
      grouped,
      ["2024-01-01", "2024-02-01"],
    );

    expect(result.q1.map((r) => r.authored)).toEqual([
      "2024-01-01",
      "2024-02-01",
    ]);
    expect(result.q1[0].items.item1.answer).toBeNull();
    expect(result.q1[1].items.item1.answer).toBe(3);
  });

  it("does not add anything when all dates are already present", () => {
    const grouped = {
      q1: [response({ id: "r1", authored: "2024-01-01" })],
    };

    const result = addNullQuestionnaireResponsesForCommonTimeAxisAndSortByDate(
      grouped,
      ["2024-01-01"],
    );

    expect(result.q1).toHaveLength(1);
  });
});

describe("extractDatesOfQuestionnaireResponses", () => {
  it("returns unique dates sorted ascending by default", () => {
    const responses = {
      r1: response({ id: "r1", authored: "2024-02-01" }),
      r2: response({ id: "r2", authored: "2024-01-01" }),
      r3: response({ id: "r3", authored: "2024-01-01" }),
    };

    expect(extractDatesOfQuestionnaireResponses(responses)).toEqual([
      "2024-01-01",
      "2024-02-01",
    ]);
  });

  it("sorts descending when requested", () => {
    const responses = {
      r1: response({ id: "r1", authored: "2024-01-01" }),
      r2: response({ id: "r2", authored: "2024-02-01" }),
    };

    expect(
      extractDatesOfQuestionnaireResponses(responses, "descending"),
    ).toEqual(["2024-02-01", "2024-01-01"]);
  });
});

describe("filterQuestionnaireResponsesThatAreWithinDates", () => {
  it("keeps only responses authored within the inclusive date range", () => {
    const responses = {
      r1: response({ id: "r1", authored: "2024-01-01" }),
      r2: response({ id: "r2", authored: "2024-02-15" }),
      r3: response({ id: "r3", authored: "2024-03-01" }),
    };

    const filtered = filterQuestionnaireResponsesThatAreWithinDates(
      responses,
      "2024-01-15",
      "2024-02-28",
    );

    expect(Object.keys(filtered)).toEqual(["r2"]);
  });

  it("returns all responses unchanged when start or end date is empty", () => {
    const responses = { r1: response({ id: "r1" }) };

    expect(
      filterQuestionnaireResponsesThatAreWithinDates(responses, "", ""),
    ).toBe(responses);
  });
});

describe("filterQuestionnaireResponsesThatAreOnSingleDates", () => {
  it("keeps only responses authored on one of the given dates", () => {
    const responses = {
      r1: response({ id: "r1", authored: "2024-01-01" }),
      r2: response({ id: "r2", authored: "2024-02-01" }),
    };

    const filtered = filterQuestionnaireResponsesThatAreOnSingleDates(
      responses,
      ["2024-01-01"],
    );

    expect(Object.keys(filtered)).toEqual(["r1"]);
  });

  it("returns an empty object when no dates are given", () => {
    const responses = { r1: response({ id: "r1" }) };

    expect(
      filterQuestionnaireResponsesThatAreOnSingleDates(responses, []),
    ).toEqual({});
  });
});

describe("filterQuestionnaireResponsesByQuestionnaireIds", () => {
  it("keeps only responses whose questionnaire id is in the list", () => {
    const responses = {
      r1: response({ id: "r1", questionnaire: questionnaire("q1", "PHQ-9") }),
      r2: response({ id: "r2", questionnaire: questionnaire("q2", "PROMIS-29") }),
    };

    const filtered = filterQuestionnaireResponsesByQuestionnaireIds(
      responses,
      ["q2"],
    );

    expect(Object.keys(filtered)).toEqual(["r2"]);
  });
});

describe("createPseudoDataSeries", () => {
  it("creates a data series of nulls with the given length", () => {
    const pseudo = createPseudoDataSeries(3);

    expect(pseudo.data).toEqual([null, null, null]);
    expect(pseudo.originalData).toEqual([null, null, null]);
  });

  it("clamps a negative length to 0", () => {
    expect(createPseudoDataSeries(-5).data).toEqual([]);
  });
});

describe("filterDataSeriesDataAndDatesForCommonNullValues", () => {
  it("removes date columns where every series is null", () => {
    const dataSeries = [
      series({ data: [1, null, 3], originalData: [1, null, 3], dataLabels: ["a", "", "c"] }),
      series({ id: "row-2", data: [null, null, 4], originalData: [null, null, 4], dataLabels: ["", "", "d"] }),
    ];

    const result = filterDataSeriesDataAndDatesForCommonNullValues(
      dataSeries,
      ["2024-01-01", "2024-02-01", "2024-03-01"],
    );

    expect(result.xData).toEqual(["2024-01-01", "2024-03-01"]);
    expect(result.dataSeries[0].data).toEqual([1, 3]);
    expect(result.dataSeries[1].data).toEqual([null, 4]);
  });
});

describe("sortDomains", () => {
  it("sorts domains by descending occurrence count", () => {
    expect(sortDomains({ a: 1, b: 3, c: 2 })).toEqual(["b", "c", "a"]);
  });

  it("pins global health domains to the front", () => {
    expect(sortDomains({ a: 3, b: 1 }, ["b"])).toEqual(["b", "a"]);
  });

  it("removes an empty-string domain", () => {
    expect(sortDomains({ a: 1, "": 5 })).toEqual(["a"]);
  });

  it("appends an 'N/A' domain when addUnspecified is true", () => {
    expect(sortDomains({ a: 1 }, undefined, true, true)).toEqual(["a", "N/A"]);
  });

  it("preserves insertion order when sortDomainsAccordingToCount is false", () => {
    expect(sortDomains({ b: 1, a: 5 }, undefined, false)).toEqual(["b", "a"]);
  });
});

describe("getMinAndMaxAnswerOptionValueForItem", () => {
  it("returns the min and max of the item's answer option values", () => {
    const item: Mapping.QuestionnaireItem = {
      linkId: "1",
      domain: "d",
      answerOptions: [
        { value: 2, label: "two" },
        { value: 0, label: "zero" },
        { value: 4, label: "four" },
      ],
    };

    expect(getMinAndMaxAnswerOptionValueForItem(item)).toEqual([0, 4]);
  });

  it("ignores null answer option values", () => {
    const item: Mapping.QuestionnaireItem = {
      linkId: "1",
      domain: "d",
      answerOptions: [
        { value: null, label: "unanswered" },
        { value: 1, label: "one" },
        { value: 3, label: "three" },
      ],
    };

    expect(getMinAndMaxAnswerOptionValueForItem(item)).toEqual([1, 3]);
  });
});
