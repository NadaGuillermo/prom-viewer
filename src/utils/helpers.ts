import type { Visualization } from "@customTypes/visualization";
import type { VariableDomains as Domains } from "@customTypes/variableDomains";
import type { PromData } from "@data/mapping";
import _ from "lodash";
import { unspecifiedDimension } from "@data/mapping";

export const isScoreSeries = (
  series: Visualization.DataSeries[],
  seriesName: string,
) => {
  return series.some((s) => s.name === seriesName || s.shortName === seriesName);
};

export const getLabelFromOriginalValueAndDataSeriesName = (
  yData: Visualization.DataSeries[],
  originalValue: Domains.NumberOrNull,
  seriesName: string,
) => {
  const correspondingSeries = yData.find(
    (series) => series.name === seriesName || series.shortName === seriesName,
  );
  // console.log("correspondingSeries: ", correspondingSeries, originalValue);
  return correspondingSeries
    ? correspondingSeries.dataLabels[
        correspondingSeries.originalData.indexOf(originalValue)
      ]
    : "";
};

// ok
export const getOriginalValueFromNormalizedValueAndDataSeriesName = (
  yData: Visualization.DataSeries[],
  normalizedValue: number,
  seriesShortName: string,
) => {
  const originalData = yData.map((series) => {
    return {
      name: series.shortName,
      data: series.originalData,
    };
  });

  const normalizedData = yData.map((series) => {
    return {
      name: series.shortName,
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

  let originalValue: Domains.NumberOrNull = null;

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
    originalValue = correspondingOriginalSeries.data[dataIndex];
  }
  return originalValue;
};

export const getNameForDataSeriesFromShortName = (
  yData: Visualization.DataSeries[],
  dataSeriesName: string,
) => {
  const correspondingSeries = yData.find((series) => series.shortName === dataSeriesName);
  return correspondingSeries ? correspondingSeries.name : "";
}

// ok
export const isQuestionnaireScoreItem = (
  item: PromData.Item,
): item is PromData.QuestionnaireScoreItem => {
  return (item as PromData.QuestionnaireScoreItem).range !== undefined;
};

export const groupItemsByDimension = (items: Visualization.DataSeries[]) => {
  const itemsByDimension = _.groupBy(items, (item) => item.dimension);
  return itemsByDimension;
};

/** Matrix */

// export const buildRows = (
//   dimensions: Visualization.MatrixDimension[],
//   expanded: Set<string>,
// ): Visualization.RowMeta[] => {
//   let rows: Visualization.RowMeta[] = [];
//   let rowIndex = 0;

//   for (const dim of dimensions) {
//     let dimensionRows: Visualization.RowMeta[] = [];
//     const startIndex = rowIndex;

//     dimensionRows.push({
//       rowIndex: rowIndex++,
//       dimensionId: dim.id,
//       isDimension: true,
//       label: dim.name,
//     });

//     if (expanded.has(dim.id)) {
//       Object.keys(dim.items).forEach((itemKey) => {
//         dimensionRows.push({
//           rowIndex: rowIndex++,
//           dimensionId: dim.id,
//           isDimension: false,
//           itemId: itemKey,
//           label: Object.values(dim.questionnaire.items).find((i) => i.linkId === itemKey)?.label ?? "",
//       });
//       });
//     }

//     const endIndex = rowIndex - 1;

//     if (endIndex > startIndex + 1) {
//       // Reverse dimensionRows
//       dimensionRows.reverse();

//       // Correct row indices
//       // dimensionRows.map((r) => {
//       //   r.rowIndex = endIndex - r.rowIndex + startIndex;
//       // });
//     }

//     // Push to rows
//     rows = dimensionRows.concat(rows);
//   }

//   return rows;
// }

// export const buildSeriesData = (
//   dimensions: Visualization.MatrixDimension[],
//   rows: Visualization.RowMeta[],
//   columns: string[],
// ): [number, number, Domains.NumberOrNull][] => {
//   const dimMap = new Map(dimensions.map((d) => [d.id, d]));
//   const data: [number, number, Domains.NumberOrNull][] = [];

//   for (const row of rows) {
//     const dim = dimMap.get(row.dimensionId);
//     const reversedRowIndex = rows.length - 1 - row.rowIndex;

//     let values: Domains.NumberOrNull[];
//     if (row.isDimension) {
//       values = dim?.dimensionValues ?? [];
//     } else {
//       const key = dim != undefined ? Object.keys(dim.items).find((key) => key === row.itemId) : "";
//       const itemKey = key ?? "";
//       values = dim != undefined && key ? dim.items[itemKey].map((item) => item) : []; // item.answer
//     }

//     for (let colIdx = 0; colIdx < columns.length; colIdx++) {
//       // ECharts heatmap uses [colIndex, rowIndex, value]
//       data.push([colIdx, reversedRowIndex, values[colIdx]]);
//     }
//   }

//   return data;
// }

export const sortDimensions = (
  dimensions: string[],
  globalHealthDimensions: string[],
) => {
  const sortedDimensions = dimensions;
  const globalDimensions = dimensions.filter((dimension) =>
    globalHealthDimensions.includes(dimension),
  );
  // const other = dimensions.find((dimension) => dimension === otherDimension);
  const unspecified = dimensions.find((dimension) => dimension === unspecifiedDimension);

  if (globalDimensions.length > 0) {
    for (let dim of globalDimensions) {
      const index = sortedDimensions.indexOf(dim);
      sortedDimensions.splice(index, 1);
      sortedDimensions.unshift(dim);
    }
  }
  if (unspecified) {
    sortedDimensions.splice(dimensions.indexOf(unspecified), 1);
    sortedDimensions.push(unspecified);
  }
  return sortedDimensions;
};

export const calculateMean = (data: Domains.NumberOrNull[]) => {
  const filteredData = data.filter((value) => value !== null);
  if (filteredData.length === 0) {
    return null;
  }
  const sum = filteredData.reduce((a, b) => a + b, 0);
  const mean = sum / filteredData.length;
  return mean;
};

// TODO: Berechnung ggf. anpassen
export const calculateRadarChartValue = (data: Domains.NumberOrNull[]) => {
  const mean = calculateMean(data);
  if (mean === null) {
    return 0; // 0 oder null
  }
  return mean;
};

// ok
export const normalizeValue = (
  value: number,
  minValue: number,
  maxValue: number,
) => {
  if (minValue > maxValue) {
    // swap
    const temp = minValue;
    minValue = maxValue;
    maxValue = temp;
  }
  if (minValue === maxValue) {
    return value;
  }
  if (minValue < 0) {
    minValue = 0;
  }
  if (value < minValue) {
    return 0;
  }
  if (value > maxValue) {
    return 1;
  }

  return (value - minValue) / (maxValue - minValue);
};

// ok
export const getMinAndMaxAnswerOptionValueForItem = (
  item: PromData.QuestionnaireItem,
) => {
  const answerOptions = item.answerOptions;
  const answerOptionValues = answerOptions.map((answerOption) => {
    return answerOption.value;
  });
  const minValue = Math.min(...answerOptionValues);
  const maxValue = Math.max(...answerOptionValues);
  return [minValue, maxValue];
};

// not needed
// export const normalizeQuestionnaireScores = (questionnaireResponses: Record<string, PromData.QuestionnaireResponse>) => {
//   const originalAndNormalizedScoreValues: Record<string, Visualization.OriginalAndNormalizedScore> = {};
//   const questionnaireResponsesArrayWithNormalizedScores = Object.entries(questionnaireResponses).map(([key, questionnaireResponse]) => {
//     const questionnaire = questionnaireResponse.questionnaire;
//     const scoreItemKeys = Object.keys(questionnaireResponse.items).filter((key) => {
//       return isQuestionnaireScoreItem(questionnaire.items[key]);
//     });
//     //if (questionnaireResponse.scoreValue != undefined && questionnaireResponse.questionnaire.score != undefined) {
//     // ne!
//     if(scoreItemKeys.length > 0) {

//     }
//     const normalizedScores = scoreItemKeys.map((key) => {
//       const normalizedScore = Number(normalizeValue(
//           questionnaireResponse.items[key].answer,
//           questionnaireResponse.questionnaire.items[key].range[0],
//           questionnaireResponse.questionnaire.items[key].range[1],
//         ).toFixed(3));
//       const originalScore = questionnaireResponse.scoreValue;
//       originalAndNormalizedScoreValues[questionnaireResponse.id] = {
//         originalScore: originalScore,
//         normalizedScore: normalizedScore,
//       };

//     });

//     return { questionnaireResponseKey: key,
//         normalizedQuestionnaireResponse: {
//         ...questionnaireResponse,
//         scoreValue: normalizedScore,
//       } as PromData.QuestionnaireResponse };

//     //}
//   });

//   let questionnaireResponsesWithNormalizedScores: Record<string, PromData.QuestionnaireResponse> = {};
//   questionnaireResponsesArrayWithNormalizedScores.forEach((questionnaireResponse) => {
//     if (questionnaireResponse == undefined) {
//       return;
//     }
//     questionnaireResponsesWithNormalizedScores[questionnaireResponse.questionnaireResponseKey] = questionnaireResponse.normalizedQuestionnaireResponse;
//   });

//   return { questionnaireResponsesWithNormalizedScores: questionnaireResponsesWithNormalizedScores, scoreRecord: originalAndNormalizedScoreValues};

// }

// ok
export const sortQuestionnaireResponsesByDate = (
  questionnaireResponses: PromData.QuestionnaireResponse[],
) => {
  return questionnaireResponses.sort((a, b) => {
    const aDate = new Date(a.authored);
    const bDate = new Date(b.authored);
    return aDate.getTime() - bDate.getTime();
  });
};

// ok
export const createCommonTimeAxis = (
  questionnaireResponses: Record<string, PromData.QuestionnaireResponse>,
) => {
  const allQuestionnaireResponseDates = Object.keys(questionnaireResponses).map(
    (key) => {
      return questionnaireResponses[key].authored;
    },
  );
  const allDates = [...new Set(allQuestionnaireResponseDates)];
  allDates.sort();

  return allDates;
};

// ok
export const groupQuestionnaireResponsesByQuestionnaireId = (
  questionnaireResponses: Record<string, PromData.QuestionnaireResponse>,
) => {
  const questionnaireResponsesGroupedByQuestionnaire = _.groupBy(
    questionnaireResponses,
    (questionnaireResponse) => questionnaireResponse.questionnaire.id,
  );
  return questionnaireResponsesGroupedByQuestionnaire;
};

// ok
export const addNullQuestionnaireResponsesForCommonTimeAxisAndSortByDate = (
  questionnaireResponses: _.Dictionary<PromData.QuestionnaireResponse[]>,
  commonTimeAxisDates: Domains.DateFormat[],
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

      const nullQuestionnaireResponse: PromData.QuestionnaireResponse = {
        id: `null-${groupedQuestionnaireResponses[key][0].questionnaire.name}-${date}`,
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

// ok
// export const getUniqueQuestionnaires = (
//   proms: Record<string, PromData.QuestionnaireResponse>,
// ) => {
//   const questionnaires = Object.values(proms).map((prom) => {
//     return prom.questionnaire;
//   });
//   const uniqueQuestionnaires = [...new Set(questionnaires)];

//   return uniqueQuestionnaires;
// };

// ok
export const calculatePeriodOfObservations = (
  proms: Record<string, PromData.QuestionnaireResponse>,
) => {
  const questionnaireResponses = Object.values(proms);
  const years = questionnaireResponses.map((prom) => {
    return new Date(prom.authored).getFullYear();
  });
  const uniqueYears = [...new Set(years)].sort();
  if (uniqueYears.length < 2) {
    return [uniqueYears[0].toString()];
  } else {
    return [
      uniqueYears[0].toString(),
      uniqueYears[uniqueYears.length - 1].toString(),
    ];
  }
};

export const createDateQuestionnairesRecord = (
  proms: Record<string, PromData.QuestionnaireResponse>,
) => {
  const questionnairesByDate: Record<string, string[]> = {};
  Object.values(proms).forEach((questionnaireResponse) => {
    const questionnaireName = questionnaireResponse.questionnaire.name;
    const date = questionnaireResponse.authored;
    if (!questionnairesByDate[date]) {
      questionnairesByDate[date] = [];
    }
    if (!questionnairesByDate[date].includes(questionnaireName)) {
      questionnairesByDate[date].push(questionnaireName);
    }
  });
  // console.log("questionnairesByDate: ", questionnairesByDate);
  // sort by key
  let sortedQuestionnairesByDate: Record<string, string[]> = {};
  Object.keys(questionnairesByDate)
    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
    .forEach((key) => {
      sortedQuestionnairesByDate[key] = questionnairesByDate[key];
    });

  return sortedQuestionnairesByDate;
};

export const createQuestionnaireChartDataRecord = (
  questionnaires: PromData.Questionnaire[],
  chartData: Visualization.ChartData,
) => {
  const chartDataByQuestionnaire: Record<string, Visualization.ChartData> = {};
  questionnaires.forEach((questionnaire) => {
    const questionnaireData = chartData.yData.filter(
      (data) => data.questionnaire === questionnaire.id,
    );
    chartDataByQuestionnaire[questionnaire.id] = {
      xData: chartData.xData,
      yData: questionnaireData,
    };
  });

  // delete null columns in chartDataByQuestionnaire
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
        };
      });
      chartDataByQuestionnaireWithoutNulls[questionnaireId] = {
        xData: newXData,
        yData: newYData,
      };
    } else {
      chartDataByQuestionnaireWithoutNulls[questionnaireId] = chartDataByQuestionnaire[questionnaireId];
    }
  });

  return chartDataByQuestionnaireWithoutNulls;
};

export const createDimensionChartDataRecord = (
  dimensions: string[],
  questionnaires: PromData.Questionnaire[],
  scoresDataSeries: Visualization.DataSeries[],
  itemsDataSeries: Visualization.DataSeries[],
  xData: string[],
) => {
  const chartDataByDimension: Record<string, Visualization.ChartData> = {};
  dimensions.forEach((dimension) => {
    const scores = scoresDataSeries.filter(
      (score) => score.dimension === dimension,
    );
    const items = itemsDataSeries.filter(
      (item) => item.dimension === dimension,
    );
    // Filter
    scores.forEach((score) => {
      const scoreQuestionnaire = questionnaires.find((q) =>
        Object.keys(q.items).includes(score.id),
      );
      if (scoreQuestionnaire) {
        const scoreItem = scoreQuestionnaire.items[
          score.id
        ] as PromData.QuestionnaireScoreItem;
        const itemsToBeRemoved = scoreItem.referenceQuestionnaireItems
          ? scoreItem.referenceQuestionnaireItems
              .map((linkId) => items.find((item) => item.id === linkId))
              .filter((item) => item !== undefined)
          : [];
        if (itemsToBeRemoved.length > 0) {
          _.pullAll(items, itemsToBeRemoved);
        }
      }
    });
    // console.log("Scores after filtering: ", scores);
    // console.log("Items after filtering: ", items);
    const yData = [...scores, ...items]; // scores and items on same level
    chartDataByDimension[dimension] = {
      xData: xData,
      yData,
    };
  });

  return chartDataByDimension;
};
