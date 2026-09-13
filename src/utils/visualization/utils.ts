import * as _ from "lodash-es";

import type * as Visualization from "./types";
import type * as Mapping from "@utils/mapping";
import { UNSPECIFIED_DOMAIN, UNSPECIFIED_DIMENSION } from "@utils/mapping";
import type * as GlobalTypes from "@customTypes/globalTypes";
import { getDateFormatPattern, parseFormattedDate } from "@utils/dateFormat";

/**
 * @param yData - the chart's data series
 * @param value - the (normalized) data value to look up
 * @param name - the `shortName` of the data series to search in
 * @returns the data label at the position of `value` within the matching series, or an empty string if no matching series or value is found
 */
export const getLabelFromValueAndDataSeriesName = (
  yData: Visualization.DataSeries[],
  value: number,
  name: string,
) => {
  const dataSeries = yData.find((series) => series.shortName === name);
  if (dataSeries) {
    const index = dataSeries.data.indexOf(value);
    if (index > -1) {
      const label = dataSeries.dataLabels[index];
      return label;
    }
    return "";
  }
  return "";
};

/**
 * @param yData - the chart's data series, each holding both normalized (`data`) and original (`originalData`) values
 * @param normalizedValue - the normalized data value to look up
 * @param seriesShortName - the `shortName` (falling back to `name`) of the data series to search in
 * @returns the original (non-normalized) value at the position of `normalizedValue` within the matching series (both arrays with null entries removed beforehand), or null if no matching series or value is found
 */
export const getOriginalValueFromNormalizedValueAndDataSeriesName = (
  yData: Visualization.DataSeries[],
  normalizedValue: number,
  seriesShortName: string,
) => {
  const originalData = yData.map((series) => {
    return {
      name: series.shortName ?? series.name,
      data: series.originalData,
    };
  });

  const normalizedData = yData.map((series) => {
    return {
      name: series.shortName ?? series.name,
      data: series.data,
    };
  });

  const correspondingOriginalSeries = originalData.find(
    (series) => series.name === seriesShortName,
  );
  const originalDataWithoutNulls = correspondingOriginalSeries?.data.filter(
    (yValue) => yValue !== null,
  );
  const correspondingNormalizedSeries = normalizedData.find(
    (series) => series.name === seriesShortName,
  );
  const normalizedDataWithoutNulls = correspondingNormalizedSeries?.data.filter(
    (yValue) => yValue !== null,
  );

  let originalValue: GlobalTypes.NumberOrNull = null;

  if (
    correspondingOriginalSeries !== undefined &&
    correspondingNormalizedSeries !== undefined &&
    normalizedDataWithoutNulls !== undefined &&
    originalDataWithoutNulls !== undefined
  ) {
    //
    correspondingNormalizedSeries.data = normalizedDataWithoutNulls;
    correspondingOriginalSeries.data = originalDataWithoutNulls;
    const dataIndex =
      correspondingNormalizedSeries.data.indexOf(normalizedValue);
    if (dataIndex !== -1) {
      originalValue = correspondingOriginalSeries.data[dataIndex];
    }
  }
  return originalValue;
};

/**
 * @param yData - the chart's data series
 * @param name - the `shortName` of the data series to look up
 * @returns the full `name` of the matching data series, or an empty string if none matches
 */
export const getDataSeriesNameFromShortName = (
  yData: Visualization.DataSeries[],
  name: string,
) => {
  const correspondingSeries = yData.find((series) => series.shortName === name);
  return correspondingSeries ? correspondingSeries.name : "";
};

/**
 * @param domainCount - a record mapping each domain name to the number of items/scores in it
 * @param globalHealthDomains - domain names that should be moved to the front of the result, regardless of count
 * @param sortDomainsAccordingToCount - whether to sort domains by descending count before applying the other steps (default true)
 * @param addUnspecified - whether to append the "Unspecified" domain to the result (default false)
 * @returns the domain names sorted by descending count (if enabled), with global health domains moved to the front, empty domain names removed, the "Unspecified" domain optionally appended, and duplicates removed
 */
export const sortDomains = (
  domainCount: Record<string, number>,
  globalHealthDomains?: string[],
  sortDomainsAccordingToCount = true,
  addUnspecified = false,
) => {
  const domains = Object.keys(domainCount);
  // 1. Sort according to number of occurences in questionnaires
  const sortedDomains = sortDomainsAccordingToCount
    ? [...domains.sort((a, b) => domainCount[b] - domainCount[a])]
    : [...domains];
  // 2. Put global domains to front
  const globalDomains = sortedDomains.filter((domain) =>
    globalHealthDomains?.includes(domain),
  );
  if (globalDomains.length > 0) {
    for (const dim of globalDomains) {
      const index = sortedDomains.indexOf(dim);
      sortedDomains.splice(index, 1);
      sortedDomains.unshift(dim);
    }
  }

  // 3. Delete empty
  const filteredDomains = sortedDomains.filter((domain) => domain !== "");

  // 4. Include domain "Unspecified" for items that were not assigned a domain in the configuration file
  if (addUnspecified) {
    // sortedDimensions.splice(dimensions.indexOf(unspecified), 1);
    filteredDomains.push(UNSPECIFIED_DOMAIN);
  }

  // 5. Delete duplicates
  const uniqueDomains = _.uniq(filteredDomains);

  return uniqueDomains;
};

/**
 * @param item - the mapped questionnaire item whose answer options should be inspected
 * @returns a `[min, max]` tuple of the numeric values across the item's non-null answer options
 */
export const getMinAndMaxAnswerOptionValueForItem = (
  item: Mapping.QuestionnaireItem,
) => {
  const answerOptions = item.answerOptions;
  const answerOptionValues = answerOptions
    .map((opt) => opt.value)
    .filter((val) => val !== null);
  const minValue = Math.min(...answerOptionValues);
  const maxValue = Math.max(...answerOptionValues);
  return [minValue, maxValue];
};

/**
 * @param a - the first formatted date string to compare
 * @param b - the second formatted date string to compare
 * @param order - the sort direction, "ascending" or "descending" (default "ascending")
 * @param dateFormatPattern - the pattern `a` and `b` are formatted in (defaults to the configured date format pattern)
 * @returns a negative, zero, or positive number suitable for use as an `Array.sort` comparator, based on the chronological order of `a` and `b`
 */
export const sortDates = (
  a: string,
  b: string,
  order: "ascending" | "descending" = "ascending",
  dateFormatPattern?: string,
) => {
  const pattern = dateFormatPattern ?? getDateFormatPattern();
  const aDateString = parseFormattedDate(a, pattern);
  const bDateString = parseFormattedDate(b, pattern);
  const aDate = new Date(aDateString).getTime();
  const bDate = new Date(bDateString).getTime();
  return order === "ascending" ? aDate - bDate : bDate - aDate;
};

/**
 * @param dates - the formatted date strings to filter
 * @param range - a `[start, end]` tuple of formatted date strings bounding the inclusive range
 * @param dateFormatPattern - the pattern `dates` and `range` are formatted in (defaults to the configured date format pattern)
 * @returns the dates from `dates` that fall within `range` (inclusive), as ISO `YYYY-MM-DD` strings
 */
export const getDatesWithinRange = (
  dates: string[],
  range: [string, string],
  dateFormatPattern?: string,
): string[] => {
  const pattern = dateFormatPattern ?? getDateFormatPattern();
  // convert to ISO YYYY-MM-DD strings
  const datesAsDates = dates.map(
    (d) => new Date(parseFormattedDate(d, pattern)),
  );
  const rangeAsDates = range.map(
    (r) => new Date(parseFormattedDate(r, pattern)),
  );

  const filteredDates = datesAsDates
    .filter((d) => d >= rangeAsDates[0] && d <= rangeAsDates[1])
    .map((d) => d.toISOString().split("T")[0]);
  return filteredDates;
};

/**
 * @param questionnaireResponses - the mapped questionnaire responses to sort
 * @returns `questionnaireResponses` sorted in place by ascending `authored` date
 */
const sortQuestionnaireResponsesByDate = (
  questionnaireResponses: Mapping.QuestionnaireResponse[],
) => {
  return questionnaireResponses.sort((a, b) => {
    return sortDates(a.authored, b.authored);
  });
};

/**
 * @param questionnaireResponses - the mapped questionnaire responses to derive the time axis from
 * @returns the distinct `authored` dates across all responses, sorted in ascending chronological order
 */
export const createCommonTimeAxis = (
  questionnaireResponses: Record<string, Mapping.QuestionnaireResponse>,
) => {
  const allQuestionnaireResponseDates = Object.keys(questionnaireResponses).map(
    (key) => {
      return questionnaireResponses[key].authored;
    },
  );
  const allDates = [...new Set(allQuestionnaireResponseDates)];
  allDates.sort((a, b) => {
    return sortDates(a, b);
  });

  return allDates;
};

/**
 * @param questionnaireResponses - the mapped questionnaire responses to group
 * @returns the responses grouped by their questionnaire's id
 */
export const groupQuestionnaireResponsesByQuestionnaireId = (
  questionnaireResponses: Record<string, Mapping.QuestionnaireResponse>,
) => {
  const questionnaireResponsesGroupedByQuestionnaire = _.groupBy(
    questionnaireResponses,
    (questionnaireResponse) => questionnaireResponse.questionnaire.id,
  );
  return questionnaireResponsesGroupedByQuestionnaire;
};

/**
 * @param questionnaireResponses - the mapped questionnaire responses, grouped by questionnaire id
 * @param commonTimeAxisDates - the full set of dates the chart's time axis should cover
 * @returns `questionnaireResponses` with a synthetic null-answer response inserted (per group) for every date in `commonTimeAxisDates` that group doesn't already have a response for, with each group's responses sorted by ascending date
 */
export const addNullQuestionnaireResponsesForCommonTimeAxisAndSortByDate = (
  questionnaireResponses: Record<string, Mapping.QuestionnaireResponse[]>,
  commonTimeAxisDates: string[],
) => {
  const groupedQuestionnaireResponses = questionnaireResponses;

  Object.keys(groupedQuestionnaireResponses).forEach((key) => {
    const questionnaireDates = groupedQuestionnaireResponses[key].map(
      (questionnaireResponse) => {
        return questionnaireResponse.authored;
      },
    );

    const datesNotInQuestionnaireResponses = _.difference(
      commonTimeAxisDates,
      questionnaireDates,
    );

    datesNotInQuestionnaireResponses.forEach((date) => {
      const nullItems = _.cloneDeep(
        groupedQuestionnaireResponses[key][0].items,
      );
      Object.values(nullItems).forEach((item) => {
        item.answer = null;
      });

      const nullQuestionnaireResponse: Mapping.QuestionnaireResponse = {
        id: `null-${groupedQuestionnaireResponses[key][0].questionnaire.title}-${date}`,
        questionnaire: groupedQuestionnaireResponses[key][0].questionnaire,
        authored: date,
        items: nullItems,
      };
      groupedQuestionnaireResponses[key].push(nullQuestionnaireResponse);
    });

    // sort questionnaireResponses
    const sortedQuestionnaireResponses = sortQuestionnaireResponsesByDate(
      groupedQuestionnaireResponses[key],
    );
    groupedQuestionnaireResponses[key] = sortedQuestionnaireResponses;
  });

  return groupedQuestionnaireResponses;
};

/**
 * @param questionnaireResponses - the mapped questionnaire responses to derive dates from
 * @returns a record mapping each questionnaire id to the distinct `authored` dates of its responses (in encounter order, not sorted)
 */
export const createQuestionnaireDatesRecord = (
  questionnaireResponses: Record<string, Mapping.QuestionnaireResponse>,
) => {
  const questionnaireDatesRecord: Record<string, string[]> = {};
  Object.values(questionnaireResponses).forEach((questionnaireResponse) => {
    const questionnaireId = questionnaireResponse.questionnaire.id;
    const date = questionnaireResponse.authored;
    if (!questionnaireDatesRecord[questionnaireId]) {
      questionnaireDatesRecord[questionnaireId] = [];
    }
    if (!questionnaireDatesRecord[questionnaireId].includes(date)) {
      questionnaireDatesRecord[questionnaireId].push(date);
    }
  });
  return questionnaireDatesRecord;
};

/**
 * @param questionnaireResponses - the mapped questionnaire responses to derive questionnaire names from
 * @param order - the sort direction applied to the resulting dates, "ascending" or "descending" (default "ascending")
 * @returns a record mapping each `authored` date to the distinct questionnaire titles answered on that date, with keys ordered by `order`
 */
export const groupQuestionnaireNamesByDate = (
  questionnaireResponses: Record<string, Mapping.QuestionnaireResponse>,
  order: "ascending" | "descending" = "ascending",
) => {
  const questionnairesByDate: Record<string, string[]> = {};
  Object.values(questionnaireResponses).forEach((questionnaireResponse) => {
    const questionnaireName = questionnaireResponse.questionnaire.title;
    const date = questionnaireResponse.authored;
    if (!questionnairesByDate[date]) {
      questionnairesByDate[date] = [];
    }
    if (!questionnairesByDate[date].includes(questionnaireName)) {
      questionnairesByDate[date].push(questionnaireName);
    }
  });
  // sort by key descending (newest first)
  const sortedQuestionnairesByDate: Record<string, string[]> = {};
  Object.keys(questionnairesByDate)
    .sort((a, b) => {
      return sortDates(a, b, order);
    })
    .forEach((key) => {
      sortedQuestionnairesByDate[key] = questionnairesByDate[key];
    });

  return sortedQuestionnairesByDate;
};

/**
 * @param questionnaires - the mapped questionnaires the chart data belongs to
 * @param chartData - the chart's combined x/y data across all questionnaires
 * @returns the chart data split per questionnaire id, with date columns removed where every series has a null value, and rows within each questionnaire ordered as global scores, then domain scores, then dimension scores (each immediately followed by the items it references), then the remaining series
 */
export const createTableData = (
  questionnaires: Mapping.Questionnaire[],
  chartData: Visualization.ChartData,
) => {
  const chartDataByQuestionnaire: Record<string, Visualization.ChartData> = {};
  questionnaires.forEach((questionnaire) => {
    const questionnaireData = chartData.yData.filter(
      (series) => series.questionnaireId === questionnaire.id,
    );
    chartDataByQuestionnaire[questionnaire.id] = {
      xData: chartData.xData,
      yData: questionnaireData,
    };
  });

  // delete null columns
  // Otherwise all dates are shown in table even if no instance of questionnaire was filled out then
  const chartDataByQuestionnaireWithoutNulls: Record<
    string,
    Visualization.ChartData
  > = {};
  Object.keys(chartDataByQuestionnaire).forEach((questionnaireId) => {
    const { xData, yData } = chartDataByQuestionnaire[questionnaireId];
    const columnsToRemove = xData.filter((_, index) =>
      yData.every((series) => series.data[index] === null),
    );
    if (columnsToRemove.length > 0) {
      const newXData = xData.filter((x) => !columnsToRemove.includes(x));
      const newYData = yData.map((series) => {
        return {
          ...series,
          data: series.data.filter(
            (_, index) => !columnsToRemove.includes(chartData.xData[index]),
          ),
          originalData: series.originalData.filter(
            (_, index) => !columnsToRemove.includes(chartData.xData[index]),
          ),
        };
      });
      chartDataByQuestionnaireWithoutNulls[questionnaireId] = {
        xData: newXData,
        yData: newYData,
      };
    } else {
      chartDataByQuestionnaireWithoutNulls[questionnaireId] =
        chartDataByQuestionnaire[questionnaireId];
    }
  });

  // Sort rows: globalScores -> dimensionScores per domain + referenced Items + rest
  const sortedChartDataByQuestionnaire: Record<
    string,
    Visualization.ChartData
  > = {};
  Object.entries(chartDataByQuestionnaireWithoutNulls).forEach(
    ([questionnaireId, chartData]) => {
      const questionnaire = questionnaires.find(
        (q) => q.id === questionnaireId,
      );
      if (questionnaire === undefined) {
        return;
      }
      const scoreSeries = chartData.yData.filter(
        (series) => series.seriesType === "score",
      );
      const globalScoreSeries = scoreSeries.filter((series) => {
        const questionnaireItem = questionnaire.items[series.id];
        if (questionnaireItem === undefined) {
          return false;
        }
        return (questionnaireItem as Mapping.QuestionnaireScoreItem)
          .isGlobalScore;
      });
      const domainScoreSeries = scoreSeries.filter((series) => {
        const questionnaireItem = questionnaire.items[series.id];
        if (questionnaireItem === undefined) {
          return false;
        }
        return (questionnaireItem as Mapping.QuestionnaireScoreItem)
          .isDomainScore;
      });
      const dimensionScoreSeries = scoreSeries.filter((series) => {
        const questionnaireItem = questionnaire.items[series.id];
        if (questionnaireItem === undefined) {
          return false;
        }
        return (questionnaireItem as Mapping.QuestionnaireScoreItem)
          .isDimensionScore;
      });
      const sortedScores = _.uniq([
        ...globalScoreSeries,
        ...domainScoreSeries,
        ...dimensionScoreSeries,
      ]);
      const scoreSeriesWithReferencedItems: Visualization.DataSeries[] = [];
      sortedScores.forEach((scoreSeries) => {
        scoreSeriesWithReferencedItems.push(scoreSeries);
        const scoreItem = questionnaire.items[scoreSeries.id];
        if (scoreItem === undefined) {
          return;
        }
        const referencedItemIds = (scoreItem as Mapping.QuestionnaireScoreItem)
          .referenceQuestionnaireItems;
        if (referencedItemIds === undefined) {
          return;
        }
        const referencedItems = chartData.yData.filter((series) =>
          referencedItemIds.includes(series.id),
        );
        referencedItems.forEach((item) => {
          scoreSeriesWithReferencedItems.push(item);
        });
      });

      // rest
      const restSeries = chartData.yData.filter(
        (series) =>
          !scoreSeriesWithReferencedItems.map((s) => s.id).includes(series.id),
      );
      const sortedDataSeries = [
        ...scoreSeriesWithReferencedItems,
        ...restSeries,
      ];
      sortedChartDataByQuestionnaire[questionnaireId] = {
        xData: chartData.xData,
        yData: sortedDataSeries,
      };
    },
  );

  return sortedChartDataByQuestionnaire;
};

/**
 * @param dimensionScoresDataSeriesByDomain - dimension-score data series grouped by domain
 * @returns a record mapping each domain to a record mapping each questionnaire name to the distinct dimension names (`shortName`) scored within that domain for that questionnaire
 */
export const createDomainQuestionnaireNamesDimensionsRecord = (
  dimensionScoresDataSeriesByDomain: Record<string, Visualization.DataSeries[]>,
): Record<string, Record<string, string[]>> => {
  const domains = Object.keys(dimensionScoresDataSeriesByDomain);
  const dimensionsByQuestionnaireAndDomain: Record<
    string,
    Record<string, string[]>
  > = {};
  domains.forEach((domain) => {
    if (!dimensionsByQuestionnaireAndDomain[domain]) {
      dimensionsByQuestionnaireAndDomain[domain] = {};
    }
    const dimensionScoresDataSeries = dimensionScoresDataSeriesByDomain[domain];

    dimensionScoresDataSeries.forEach((series) => {
      const questionnaireName = series.questionnaireName;
      const dimension = series.shortName;
      if (!dimensionsByQuestionnaireAndDomain[domain][questionnaireName]) {
        dimensionsByQuestionnaireAndDomain[domain][questionnaireName] = [];
      }
      if (
        !dimensionsByQuestionnaireAndDomain[domain][questionnaireName].includes(
          dimension,
        )
      ) {
        dimensionsByQuestionnaireAndDomain[domain][questionnaireName].push(
          dimension,
        );
      }
    });
  });

  return dimensionsByQuestionnaireAndDomain;
};

/**
 * @param dimensionScoresDataSeriesByDomain - dimension-score data series grouped by domain
 * @returns a flat list of `[domain, dimension, questionnaireName]` tuples, one per dimension-score data series
 */
export const createDomainDimensionQuestionnaireTupleArray = (
  dimensionScoresDataSeriesByDomain: Record<string, Visualization.DataSeries[]>,
): [string, string, string][] => {
  const domainDimensionQuestionnaireTuples: [string, string, string][] = [];
  Object.entries(dimensionScoresDataSeriesByDomain).forEach(
    ([domain, dimensionScoresDataSeries]) => {
      dimensionScoresDataSeries.forEach((series) => {
        const dimension = series.shortName;
        const questionnaireName = series.questionnaireName;
        domainDimensionQuestionnaireTuples.push([
          domain,
          dimension,
          questionnaireName,
        ]);
      });
    },
  );
  return domainDimensionQuestionnaireTuples;
};

/**
 * @param dimensionScoresDataSeriesByDomain - dimension-score data series grouped by domain
 * @returns a record mapping each domain to a list of `[dimension, questionnaireName]` tuples, one per dimension-score data series in that domain
 */
export const createDimensionWithQuestionnaireByDomainRecord = (
  dimensionScoresDataSeriesByDomain: Record<string, Visualization.DataSeries[]>,
): Record<string, [string, string][]> => {
  const domainDimensionQuestionnaireRecord: Record<string, [string, string][]> =
    {};
  Object.entries(dimensionScoresDataSeriesByDomain).forEach(
    ([domain, dimensionScoresDataSeries]) => {
      dimensionScoresDataSeries.forEach((series) => {
        const dimension = series.shortName;
        const questionnaireName = series.questionnaireName;
        if (!domainDimensionQuestionnaireRecord[domain]) {
          domainDimensionQuestionnaireRecord[domain] = [];
        }
        domainDimensionQuestionnaireRecord[domain].push([
          dimension,
          questionnaireName,
        ]);
      });
    },
  );
  return domainDimensionQuestionnaireRecord;
};

/**
 * @param data - the data series to filter
 * @param questionnaires - the mapped questionnaires used to resolve each series' underlying questionnaire item
 * @param domain - the domain name to filter for
 * @returns the data series whose corresponding questionnaire item belongs to `domain`
 */
export const extractDomainDataSeries = (
  data: Visualization.DataSeries[],
  questionnaires: Mapping.Questionnaire[],
  domain: string,
): Visualization.DataSeries[] => {
  const domainDataSeries = data.filter((series) => {
    const questionnaire = questionnaires.find(
      (q) => q.id === series.questionnaireId,
    );
    if (questionnaire === undefined) {
      return false;
    }
    const correspondingQuestionnaireItem = Object.values(
      questionnaire.items,
    ).find((item) => series.id === item.linkId);
    if (correspondingQuestionnaireItem === undefined) {
      return false;
    }
    if (correspondingQuestionnaireItem.domain === domain) {
      return true;
    }
    return false;
  });
  return domainDataSeries;
};

/**
 * @param data - the data series to filter
 * @param questionnaires - the mapped questionnaires used to resolve each series' underlying questionnaire item
 * @returns the data series whose corresponding questionnaire item is flagged as a global score
 */
export const extractGlobalScoresDataSeries = (
  data: Visualization.DataSeries[],
  questionnaires: Mapping.Questionnaire[],
): Visualization.DataSeries[] => {
  const globalScores = data.filter((series) => {
    const questionnaire = questionnaires.find(
      (q) => q.id === series.questionnaireId,
    );
    if (questionnaire === undefined) {
      return false;
    }
    const correspondingQuestionnaireItem = questionnaire.items[series.id];
    if (correspondingQuestionnaireItem === undefined) {
      return false;
    }
    if (
      (correspondingQuestionnaireItem as Mapping.QuestionnaireScoreItem)
        .isGlobalScore
    ) {
      return true;
    }
    return false;
  });
  return globalScores;
};

/**
 * @param domainData - the data series (already restricted to a domain) to filter
 * @param questionnaires - the mapped questionnaires used to resolve each series' underlying questionnaire item
 * @returns the data series whose corresponding questionnaire item is flagged as a domain score
 */
export const extractDomainScoresDataSeries = (
  domainData: Visualization.DataSeries[],
  questionnaires: Mapping.Questionnaire[],
): Visualization.DataSeries[] => {
  const domainScores = domainData.filter((series) => {
    const questionnaire = questionnaires.find(
      (q) => q.id === series.questionnaireId,
    );
    if (questionnaire === undefined) {
      return false;
    }
    const correspondingQuestionnaireItem = questionnaire.items[series.id];
    if (correspondingQuestionnaireItem === undefined) {
      return false;
    }
    if (
      (correspondingQuestionnaireItem as Mapping.QuestionnaireScoreItem)
        .isDomainScore
    ) {
      return true;
    }
    return false;
  });
  return domainScores;
};

/**
 * @param domainData - the data series (already restricted to a domain) to filter
 * @param questionnaires - the mapped questionnaires used to resolve each series' underlying questionnaire item
 * @param domainScoresDataSeries - the domain-score data series to exclude from the result when `removeDomainScores` is true
 * @param removeDomainScores - whether to exclude series that are also present in `domainScoresDataSeries` (default false)
 * @returns the data series whose corresponding questionnaire item is flagged as a dimension score, optionally excluding those that are also domain scores
 */
export const extractDimensionScoresDataSeries = (
  domainData: Visualization.DataSeries[],
  questionnaires: Mapping.Questionnaire[],
  domainScoresDataSeries: Visualization.DataSeries[],
  removeDomainScores: boolean = false,
): Visualization.DataSeries[] => {
  const dimensionScores = domainData.filter((series) => {
    const questionnaire = questionnaires.find(
      (q) => q.id === series.questionnaireId,
    );
    if (questionnaire === undefined) {
      return false;
    }
    const correspondingQuestionnaireItem = questionnaire.items[series.id];
    if (correspondingQuestionnaireItem === undefined) {
      return false;
    }
    if (correspondingQuestionnaireItem.isDimensionScore) {
      return true;
    }
    return false;
  });
  if (removeDomainScores) {
    return dimensionScores.filter(
      (series) => !domainScoresDataSeries.map((s) => s.id).includes(series.id),
    );
  }
  return dimensionScores;
};

/**
 * @param domainData - the data series (already restricted to a domain) to group
 * @param dimensionScoresDataSeries - the dimension-score data series within that domain, used to determine each dimension and its explicitly referenced items
 * @param questionnaires - the mapped questionnaires used to resolve each series' underlying questionnaire item
 * @returns a record mapping each dimension name to the non-score item data series belonging to it (matched by the item's `dimension`, plus any items the dimension score explicitly references), with items that don't belong to any dimension grouped under the "Unspecified" dimension
 */
export const extractItemsDataSeries = (
  domainData: Visualization.DataSeries[],
  dimensionScoresDataSeries: Visualization.DataSeries[],
  questionnaires: Mapping.Questionnaire[],
): Record<string, Visualization.DataSeries[]> => {
  const dimensionItemDataSeriesRecord: Record<
    string,
    Visualization.DataSeries[]
  > = {};
  dimensionScoresDataSeries.forEach((series) => {
    const questionnaire = questionnaires.find(
      (q) => q.id === series.questionnaireId,
    );
    const correspondingQuestionnaireItem =
      questionnaire !== undefined ? questionnaire.items[series.id] : undefined;
    if (correspondingQuestionnaireItem !== undefined) {
      const referencedItems = domainData.filter((series) =>
        (
          correspondingQuestionnaireItem as Mapping.QuestionnaireScoreItem
        ).referenceQuestionnaireItems?.includes(series.id),
      );
      const dimension =
        correspondingQuestionnaireItem.dimension ?? series.shortName;
      const dimensionItems = domainData.filter((series) => {
        const questionnaire = questionnaires.find(
          (q) => q.id === series.questionnaireId,
        );
        if (questionnaire === undefined) {
          return false;
        }
        const questionnaireItem = questionnaire.items[series.id];
        if (questionnaireItem === undefined) {
          return false;
        }
        return questionnaireItem.dimension === dimension;
      });
      const items = _.uniqBy(
        [...dimensionItems, ...referencedItems],
        (series: Visualization.DataSeries) => series.id,
      );
      // const domainScoreIds = domainScoresDataSeries.map((series) => series.id);
      const dimensionScoreIds = dimensionScoresDataSeries.map(
        (series) => series.id,
      );
      //const otherDimensionScoreIds = dimensionScoresDataSeries.map((series) => series.id).filter((id) => !dimensionItems.map((s) => s.id).includes(id));
      // const allScoreIds = [...otherDimensionScoreIds, ...dimensionScoreIds];
      const itemsForDimension = items.filter(
        (item) => !dimensionScoreIds.includes(item.id),
      );

      if (dimension !== undefined && itemsForDimension.length > 0) {
        if (!dimensionItemDataSeriesRecord[dimension]) {
          dimensionItemDataSeriesRecord[dimension] = itemsForDimension;
        } else {
          dimensionItemDataSeriesRecord[dimension] = _.uniqBy(
            [...dimensionItemDataSeriesRecord[dimension], ...itemsForDimension],
            (series) => series.id,
          );
        }
      }
    }
  });
  // items without a dimension
  const dimensionScoreAndItemDataSeries: Visualization.DataSeries[] = [
    ...dimensionScoresDataSeries,
  ];
  Object.values(dimensionItemDataSeriesRecord).forEach((series) => {
    series.forEach((s) => {
      dimensionScoreAndItemDataSeries.push(s);
    });
  });
  const itemsWithoutDimensionDataSeries: Visualization.DataSeries[] =
    _.difference(domainData, dimensionScoreAndItemDataSeries);

  if (itemsWithoutDimensionDataSeries.length > 0) {
    dimensionItemDataSeriesRecord[UNSPECIFIED_DIMENSION] =
      itemsWithoutDimensionDataSeries;
  }

  return dimensionItemDataSeriesRecord;
};

/**
 * @param questionnaires - the mapped questionnaires used to resolve each series' underlying questionnaire item
 * @param dimensionScoresDataSeriesByDomain - dimension-score data series grouped by domain
 * @param addUnspecifiedDimension - whether to append the "Unspecified" dimension to each domain's list (default true)
 * @returns a record mapping each domain to the distinct dimension names scored within it, with the "Unspecified" dimension optionally appended
 */
export const createDomainDimensionsRecord = (
  questionnaires: Mapping.Questionnaire[],
  dimensionScoresDataSeriesByDomain: Record<string, Visualization.DataSeries[]>,
  addUnspecifiedDimension = true,
) => {
  const domainDimensionsRecord: Record<string, string[]> = {};
  Object.entries(dimensionScoresDataSeriesByDomain).forEach(
    ([domain, dimensionScoresDataSeries]) => {
      const dimensions = dimensionScoresDataSeries.map((series) => {
        const questionnaire = questionnaires.find(
          (q) => q.id === series.questionnaireId,
        );
        if (questionnaire !== undefined) {
          const questionnaireItem = questionnaire.items[series.id];
          if (questionnaireItem !== undefined) {
            return questionnaireItem.dimension ?? series.shortName;
          }
          return series.shortName;
        }
        return series.shortName;
      });
      const uniqueDimensions = _.uniq(
        dimensions.filter((dim) => dim !== undefined),
      );
      // add unspecified dimension
      if (addUnspecifiedDimension) {
        uniqueDimensions.push(UNSPECIFIED_DIMENSION);
      }
      domainDimensionsRecord[domain] = uniqueDimensions;
    },
  );
  return domainDimensionsRecord;
};

/**
 * @param questionnaireResponses - the mapped questionnaire responses to filter
 * @param startDate - the inclusive lower bound, as a string parseable by `Date` (e.g. ISO format)
 * @param endDate - the inclusive upper bound, as a string parseable by `Date` (e.g. ISO format)
 * @returns the responses whose `authored` date falls within `[startDate, endDate]`, or all responses unchanged if either bound is an empty string
 */
export const filterQuestionnaireResponsesThatAreWithinDates = (
  questionnaireResponses: Record<string, Mapping.QuestionnaireResponse>,
  startDate: string,
  endDate: string,
) => {
  if (startDate.length === 0 || endDate.length === 0) {
    return questionnaireResponses;
  }
  const questionnaireResponsesWithinDateRange: Record<
    string,
    Mapping.QuestionnaireResponse
  > = {};
  Object.entries(questionnaireResponses).forEach(
    ([questionnaireResponseId, questionnaireResponse]) => {
      const date = new Date(questionnaireResponse.authored);
      if (date >= new Date(startDate) && date <= new Date(endDate)) {
        questionnaireResponsesWithinDateRange[questionnaireResponseId] =
          questionnaireResponse;
      }
    },
  );
  return questionnaireResponsesWithinDateRange;
};

/**
 * @param questionnaireResponses - the mapped questionnaire responses to filter
 * @param dates - the formatted date strings to keep responses for (in the configured date format)
 * @returns the responses whose `authored` date matches one of `dates`, or an empty record if `dates` is empty
 */
export const filterQuestionnaireResponsesThatAreOnSingleDates = (
  questionnaireResponses: Record<string, Mapping.QuestionnaireResponse>,
  dates: string[],
) => {
  if (dates.length === 0) {
    return {};
  }
  const dateFormatPattern = getDateFormatPattern();
  const datesAsDates = dates.map(
    (date) => new Date(parseFormattedDate(date, dateFormatPattern)),
  );
  const questionnaireResponsesOnDates: Record<
    string,
    Mapping.QuestionnaireResponse
  > = {};
  Object.entries(questionnaireResponses).forEach(
    ([questionnaireResponseId, questionnaireResponse]) => {
      const date = new Date(
        parseFormattedDate(questionnaireResponse.authored, dateFormatPattern),
      );
      if (
        datesAsDates.some(
          (d) =>
            d.toISOString().split("T")[0] === date.toISOString().split("T")[0],
        )
      ) {
        questionnaireResponsesOnDates[questionnaireResponseId] =
          questionnaireResponse;
      }
    },
  );
  return questionnaireResponsesOnDates;
};

/**
 * @param questionnaireResponses - the mapped questionnaire responses to filter
 * @param questionnaireIds - the questionnaire ids to keep responses for
 * @returns the responses whose questionnaire id is included in `questionnaireIds`
 */
export const filterQuestionnaireResponsesByQuestionnaireIds = (
  questionnaireResponses: Record<string, Mapping.QuestionnaireResponse>,
  questionnaireIds: string[],
) => {
  const questionnaireResponsesFilteredBySelectedQuestionnaires: Record<
    string,
    Mapping.QuestionnaireResponse
  > = {};
  Object.entries(questionnaireResponses).forEach(([key, response]) => {
    if (questionnaireIds.includes(response.questionnaire.id)) {
      questionnaireResponsesFilteredBySelectedQuestionnaires[key] = response;
    }
  });
  return questionnaireResponsesFilteredBySelectedQuestionnaires;
};

/**
 * @param questionnaireResponses - the mapped questionnaire responses to derive dates from
 * @param sortOrder - the sort direction, "ascending" or "descending" (default "ascending")
 * @returns the distinct `authored` dates across all responses, sorted by `sortOrder`
 */
export const extractDatesOfQuestionnaireResponses = (
  questionnaireResponses: Record<string, Mapping.QuestionnaireResponse>,
  sortOrder: "ascending" | "descending" = "ascending",
) => {
  const dates = Object.values(questionnaireResponses).map(
    (questionnaireResponse) => {
      return questionnaireResponse.authored;
    },
  );
  const uniqueDates = _.uniq(dates);
  // sort dates
  const sortedDates = uniqueDates.sort((a, b) => {
    return sortDates(a, b, sortOrder);
  });
  return sortedDates;
};

/**
 * @param length - the number of null data points the placeholder series should contain (negative values are treated as 0)
 * @returns an empty placeholder `DataSeries` (no name/id, no data labels) filled with `length` null values, useful for reserving a chart row before real data is available
 */
export const createPseudoDataSeries = (
  length: number,
): Visualization.DataSeries => {
  const arrayLength = length > 0 ? length : 0;
  const pseudoDataPoints = Array(arrayLength).fill(null);
  const dataSeries: Visualization.DataSeries = {
    id: "psuedo",
    name: "",
    shortName: "",
    data: pseudoDataPoints,
    originalData: pseudoDataPoints,
    dataLabels: [],
    seriesType: "item",
    questionnaireId: "",
    questionnaireName: "",
  };

  return dataSeries;
};

/**
 * @param dataSeries - the data series to filter
 * @param xData - the x-axis labels (e.g. dates) corresponding by index to each series' data points
 * @returns `dataSeries` and `xData` with every index removed where all series have a null value, i.e. columns with no data across any series are dropped
 */
export const filterDataSeriesDataAndDatesForCommonNullValues = (
  dataSeries: Visualization.DataSeries[],
  xData: string[],
) => {
  const filteredXDataIndices: number[] = [];
  const filteredXData: string[] = [];
  xData.forEach((x, i) => {
    if (dataSeries.some((series) => series.data[i] !== null)) {
      filteredXDataIndices.push(i);
      filteredXData.push(x);
    }
  });
  const filteredDataSeries: Visualization.DataSeries[] = dataSeries.map(
    (series) => {
      const filteredData = series.data.filter((_, i) =>
        filteredXDataIndices.includes(i),
      );
      const filteredOriginalData = series.originalData.filter((_, i) =>
        filteredXDataIndices.includes(i),
      );
      const filteredDataLables = series.dataLabels.filter((_, i) =>
        filteredXDataIndices.includes(i),
      );
      return {
        ...series,
        data: filteredData,
        originalData: filteredOriginalData,
        dataLabels: filteredDataLables,
      };
    },
  );
  return {
    dataSeries: filteredDataSeries,
    xData: filteredXData,
  };
};

/**
 * @param str - the string to truncate
 * @param maxLength - the maximum length before truncation kicks in (default 80)
 * @returns `str` unchanged if it is at most `maxLength` characters long; otherwise `str` cut to `maxLength` characters, trimmed back to the last full word, and suffixed with "..."
 */
export const truncateAtWord = (str: string, maxLength: number = 80) => {
  if (str.length <= maxLength) {
    return str;
  }
  let truncated = str.slice(0, maxLength);
  const lastSpaceIndex = truncated.lastIndexOf(" ");
  if (lastSpaceIndex > -1) {
    truncated = truncated.slice(0, lastSpaceIndex);
  }
  return truncated + "...";
};
