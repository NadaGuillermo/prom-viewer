import type { Visualization } from "./types";
import { unspecifiedDimension, type Mapping } from "@utils/mapping";
import type { GlobalTypes } from "@customTypes/globalTypes";
import * as _ from "lodash-es";
import { calculateMean } from "./helpers";

export const isScoreSeries = (
  series: Visualization.DataSeries[],
  seriesName: string,
) => {
  return series.some(
    (s) => s.name === seriesName || s.shortName === seriesName,
  );
};

export const getLabelFromOriginalValueAndDataSeriesName = (
  yData: Visualization.DataSeries[],
  originalValue: GlobalTypes.NumberOrNull,
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

export const getNameForDataSeriesFromShortName = (
  yData: Visualization.DataSeries[],
  dataSeriesName: string,
) => {
  const correspondingSeries = yData.find(
    (series) => series.shortName === dataSeriesName,
  );
  return correspondingSeries ? correspondingSeries.name : "";
};

// ok
export const isQuestionnaireScoreItem = (
  item: Mapping.Item,
): item is Mapping.QuestionnaireScoreItem => {
  return (item as Mapping.QuestionnaireScoreItem).range !== undefined;
};

export const groupItemsByDomain = (items: Visualization.DataSeries[]) => {
  const itemsByDomain = _.groupBy(items, (item) => item.domain);
  return itemsByDomain;
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
// ): [number, number, Visualization.NumberOrNull][] => {
//   const dimMap = new Map(dimensions.map((d) => [d.id, d]));
//   const data: [number, number, Visualization.NumberOrNull][] = [];

//   for (const row of rows) {
//     const dim = dimMap.get(row.dimensionId);
//     const reversedRowIndex = rows.length - 1 - row.rowIndex;

//     let values: Visualization.NumberOrNull[];
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

export const sortDomains = (
  domains: string[],
  globalHealthDimensions: string[],
) => {
  const sortedDomains = domains;
  const globalDimensions = domains.filter((domain) =>
    globalHealthDimensions.includes(domain),
  );
  // const other = dimensions.find((dimension) => dimension === otherDimension);
  const unspecified = domains.find(
    (domain) => domain === unspecifiedDimension,
  );

  if (globalDimensions.length > 0) {
    for (let dim of globalDimensions) {
      const index = sortedDomains.indexOf(dim);
      sortedDomains.splice(index, 1);
      sortedDomains.unshift(dim);
    }
  }
  // delete unspecified and empty
  const filteredDomains = sortedDomains.filter(
    (domain) => domain !== unspecified && domain !== ""
  );

  const uniqueDomains = [...new Set(filteredDomains)];
  // sortedDimensions.splice(0, sortedDimensions.length, ...uniqueDimensions);
  
  // if (unspecified) {
  //   sortedDimensions.splice(dimensions.indexOf(unspecified), 1);
  //   sortedDimensions.push(unspecified);
  // }
  return uniqueDomains;
};

// TODO: Berechnung ggf. anpassen
export const calculateRadarChartValue = (data: GlobalTypes.NumberOrNull[]) => {
  const mean = calculateMean(data);
  if (mean === null) {
    return 0; // 0 oder null
  }
  return mean;
};

// ok
export const getMinAndMaxAnswerOptionValueForItem = (
  item: Mapping.QuestionnaireItem,
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
// export const normalizeQuestionnaireScores = (questionnaireResponses: Record<string, Mapping.QuestionnaireResponse>) => {
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
//       } as Mapping.QuestionnaireResponse };

//     //}
//   });

//   let questionnaireResponsesWithNormalizedScores: Record<string, Mapping.QuestionnaireResponse> = {};
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
  questionnaireResponses: Mapping.QuestionnaireResponse[],
) => {
  return questionnaireResponses.sort((a, b) => {
    const aDate = new Date(a.authored);
    const bDate = new Date(b.authored);
    return aDate.getTime() - bDate.getTime();
  });
};

// ok
export const createCommonTimeAxis = (
  questionnaireResponses: Record<string, Mapping.QuestionnaireResponse>,
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
  questionnaireResponses: Record<string, Mapping.QuestionnaireResponse>,
) => {
  const questionnaireResponsesGroupedByQuestionnaire = _.groupBy(
    questionnaireResponses,
    (questionnaireResponse) => questionnaireResponse.questionnaire.id,
  );
  return questionnaireResponsesGroupedByQuestionnaire;
};

// ok
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
//   proms: Record<string, Mapping.QuestionnaireResponse>,
// ) => {
//   const questionnaires = Object.values(proms).map((prom) => {
//     return prom.questionnaire;
//   });
//   const uniqueQuestionnaires = [...new Set(questionnaires)];

//   return uniqueQuestionnaires;
// };

// ok
export const calculatePeriodOfObservations = (
  proms: Record<string, Mapping.QuestionnaireResponse>,
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

export const createDateQuestionnaireNamesRecord = (
  questionnaireResponses: Record<string, Mapping.QuestionnaireResponse>,
) => {
  const questionnairesByDate: Record<string, string[]> = {};
  Object.values(questionnaireResponses).forEach((questionnaireResponse) => {
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

// TODO
export const createRadarData = (
  chartData: Visualization.ChartData,
): Visualization.RadarData => {
  
  const yDataByQuestionnaire: Record<string, Visualization.DataSeries[]> = {};
  chartData.yData.forEach((series) =>{
    if (!yDataByQuestionnaire[series.questionnaireName]) {
      yDataByQuestionnaire[series.questionnaireName] = [];
    }
    yDataByQuestionnaire[series.questionnaireName].push(series);
  });

  const domainsByQuestionnaire: Record<string, string[]> = {};
  Object.entries(yDataByQuestionnaire).forEach(([key, series]) => {
    const domains = series.map((series) => series.domain);
    const uniqueDomains = [...new Set(domains)];
    if (!domainsByQuestionnaire[key]) {
      domainsByQuestionnaire[key] = [];
    }
    domainsByQuestionnaire[key].push(... uniqueDomains); 
  });

  return {
    data: domainsByQuestionnaire
  };
}

export const createQuestionnaireCardData = (
  questionnaires: Mapping.Questionnaire[],
): Record<string, [string, string[]]> => {
  
  const questionnaireDimensions: Record<string, [string, string[]]> = {};
  questionnaires.forEach((questionnaire) => {
    const questionnaireNameAndDimensions: [string, string[]] = ["", []];
    const dimensions = Object.values(questionnaire.items).map((item) => item.domain);
    const uniqueDimensions = [...new Set(dimensions)];
    const name = questionnaire.name;
    questionnaireNameAndDimensions[0] = name;
    questionnaireNameAndDimensions[1] = uniqueDimensions;
    questionnaireDimensions[questionnaire.id] = questionnaireNameAndDimensions;
  });

  return questionnaireDimensions;
    
}

export const filterQuestionnairesAndQuestionnaireResponsesBasedOnSelectedFilters = (questionnaires: Mapping.Questionnaire[], questionnaireResponses: Record<string, Mapping.QuestionnaireResponse>, selectedQuestionnaireIds: string[], selectedStartDate: string, selectedEndDate: string) => {

}

export const createTableData = (
  questionnaires: Mapping.Questionnaire[],
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
          originalData: series.originalData.filter((_, index) =>
            !columnsToRemove.includes(chartData.xData[index]),
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

  return chartDataByQuestionnaireWithoutNulls;
};

export const createHeatmapData = (
  domains: string[],
  questionnaires: Mapping.Questionnaire[],
  allScoresDataSeries: Visualization.DataSeries[],
  itemsDataSeries: Visualization.DataSeries[],
  xData: string[],
) => {
  const chartDataByDomain: Record<string, Visualization.ChartData> = {};
  domains.forEach((domain) => {
    const scores = allScoresDataSeries.filter(
      (score) => score.domain === domain,
    );
    const items = itemsDataSeries.filter(
      (item) => item.domain === domain,
    );
    // Filter, besser: valueExpression attribut -> gesamtes Fhir Format ändern
    scores.forEach((score) => {
      const scoreQuestionnaire = questionnaires.find((q) =>
        Object.keys(q.items).includes(score.id),
      );
      if (scoreQuestionnaire) {
        const scoreItem = scoreQuestionnaire.items[
          score.id
        ] as Mapping.QuestionnaireScoreItem;
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
    chartDataByDomain[domain] = {
      xData: xData,
      yData,
    };
  });

  return chartDataByDomain;
};
