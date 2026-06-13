import type { Visualization } from "./types";
import { unspecifiedDimension, type Mapping } from "@utils/mapping";
import type { GlobalTypes } from "@customTypes/globalTypes";
import * as _ from "lodash-es";
import { calculateMean } from "./helpers";
import { ITEM_TYPES } from "@utils/mapping";

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

export const getDataSeriesNameFromShortName = (
  yData: Visualization.DataSeries[],
  name: string,
) => {
  const correspondingSeries = yData.find(
    (series) => series.shortName === name,
  );
  return correspondingSeries ? correspondingSeries.name : "";
};

// ok
// export const isQuestionnaireScoreItem = (
//   item: Mapping.Item,
// ): item is Mapping.QuestionnaireScoreItem => {
//   return (item as Mapping.QuestionnaireScoreItem).range !== undefined;
// };

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
  globalHealthDomains?: string[],
) => {
  const sortedDomains = domains;
  const globalDomains = domains.filter((domain) =>
    globalHealthDomains?.includes(domain),
  );
  // const other = dimensions.find((dimension) => dimension === otherDimension);
  // const unspecified = domains.find(
  //   (domain) => domain === unspecifiedDimension,
  // );

  if (globalDomains.length > 0) {
    for (let dim of globalDomains) {
      const index = sortedDomains.indexOf(dim);
      sortedDomains.splice(index, 1);
      sortedDomains.unshift(dim);
    }
  }
  // delete empty
  const filteredDomains = sortedDomains.filter(
    (domain) => domain !== ""
  );

  const uniqueDomains = _.uniq(filteredDomains);
  // sortedDimensions.splice(0, sortedDimensions.length, ...uniqueDimensions);
  
  // if (unspecified) {
  //   sortedDimensions.splice(dimensions.indexOf(unspecified), 1);
  //   sortedDimensions.push(unspecified);
  // }
  return uniqueDomains;
};

export const addUnspecifiedDimensionToDomains = (domains: string[]) => {
  return [...domains, unspecifiedDimension];
}

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
  order : "ascending" | "descending" = "ascending",
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
  // sort by key descending (newest first)
  let sortedQuestionnairesByDate: Record<string, string[]> = {};
  Object.keys(questionnairesByDate)
    .sort((a, b) => order === "ascending" ?  new Date(a).getTime() - new Date(b).getTime() : new Date(b).getTime() - new Date(a).getTime())
    .forEach((key) => {
      sortedQuestionnairesByDate[key] = questionnairesByDate[key];
    });

  return sortedQuestionnairesByDate;
};


export const createRadarData = (
  chartData: Visualization.ChartData,
): Record<string, string[]> => {
  
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

  return domainsByQuestionnaire;
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

  // Sort rows: globalScores -> dimensionScores per domain + referenced Items + rest
  const sortedChartDataByQuestionnaire: Record<
    string,
    Visualization.ChartData
  > = {};
  Object.entries(chartDataByQuestionnaireWithoutNulls).forEach(([questionnaireId, chartData]) => {
    const questionnaire = questionnaires.find((q) => q.id === questionnaireId);
    if (questionnaire === undefined) {
      return;
    }   
    const scoreSeries = chartData.yData.filter((series) => series.seriesType === ITEM_TYPES.score);
    const globalScoreSeries = scoreSeries.filter((series) => {
      const questionnaireItem = questionnaire.items[series.id];
      if (questionnaireItem === undefined) {
        return false;
      }
      return (questionnaireItem as Mapping.QuestionnaireScoreItem).isGlobalScore;
    });
    const domainScoreSeries = scoreSeries.filter((series) => {
      const questionnaireItem = questionnaire.items[series.id];
      if (questionnaireItem === undefined) {
        return false;
      }
      return (questionnaireItem as Mapping.QuestionnaireScoreItem).isDomainScore;
    });
    const dimensionScoreSeries = scoreSeries.filter((series) => {
      const questionnaireItem = questionnaire.items[series.id];
      if (questionnaireItem === undefined) {
        return false;
      }
      return (questionnaireItem as Mapping.QuestionnaireScoreItem).isDimensionScore;
    });
    const sortedScores = _.uniq([...globalScoreSeries, ...domainScoreSeries, ...dimensionScoreSeries]);
    const scoreSeriesWithReferencedItems: Visualization.DataSeries[] = []; 
    sortedScores.forEach((scoreSeries) => {
      scoreSeriesWithReferencedItems.push(scoreSeries);
      const scoreItem = questionnaire.items[scoreSeries.id];
      if (scoreItem === undefined) {
        return;
      }
      const referencedItemIds = (scoreItem as Mapping.QuestionnaireScoreItem).referenceQuestionnaireItems;
      if (referencedItemIds === undefined) {
        return;
      }
      const referencedItems = chartData.yData.filter((series) => referencedItemIds.includes(series.id));
      referencedItems.forEach((item) => {
        scoreSeriesWithReferencedItems.push(item);
      });
    });

    // rest
    const restSeries = chartData.yData.filter((series) => !scoreSeriesWithReferencedItems.map((s) => s.id).includes(series.id));
    const sortedDataSeries = [...scoreSeriesWithReferencedItems, ...restSeries];
    sortedChartDataByQuestionnaire[questionnaireId] = {
      xData: chartData.xData,
      yData: sortedDataSeries,
    };
  });

  return sortedChartDataByQuestionnaire;
};

export const createDomainQuestionnaireNamesDimensionsRecord = (
  dimensionScoresDataSeriesByDomain: Record<string, Visualization.DataSeries[]>,
): Record<string, Record<string, string[]>> => {
  const domains = Object.keys(dimensionScoresDataSeriesByDomain);
  const dimensionsByQuestionnaireAndDomain: Record<string, Record<string, string[]>> = {};
  domains.forEach((domain) => {
    if(!dimensionsByQuestionnaireAndDomain[domain]) {
      dimensionsByQuestionnaireAndDomain[domain] = {};
    }
    const dimensionScoresDataSeries = dimensionScoresDataSeriesByDomain[domain];
    
    dimensionScoresDataSeries.forEach((series) => {
      const questionnaireName = series.questionnaireName;
      const dimension = series.shortName ?? series.name;
      if (!dimensionsByQuestionnaireAndDomain[domain][questionnaireName]) {
        dimensionsByQuestionnaireAndDomain[domain][questionnaireName] = [];;
      }
      if (!dimensionsByQuestionnaireAndDomain[domain][questionnaireName].includes(dimension)) {
        dimensionsByQuestionnaireAndDomain[domain][questionnaireName].push(dimension);
      }
    });  
  });

  return dimensionsByQuestionnaireAndDomain;
}

export const createDomainDimensionQuestionnaireTupleArray = (
  dimensionScoresDataSeriesByDomain: Record<string, Visualization.DataSeries[]>,
): [string, string, string][] => {
  const domainDimensionQuestionnaireTuples: [string, string, string][] = [];
  Object.entries(dimensionScoresDataSeriesByDomain).forEach(([domain, dimensionScoresDataSeries]) => {
    dimensionScoresDataSeries.forEach((series) => {
      const dimension = series.shortName;
      const questionnaireName = series.questionnaireName;
      domainDimensionQuestionnaireTuples.push([domain, dimension, questionnaireName]);
    });
  });
  return domainDimensionQuestionnaireTuples;
}

export const createDimensionWithQuestionnaireByDomainRecord = (
  dimensionScoresDataSeriesByDomain: Record<string, Visualization.DataSeries[]>,
): Record<string, [string, string][]> => {
   const domainDimensionQuestionnaireRecord: Record<string, [string, string][]> = {};
  Object.entries(dimensionScoresDataSeriesByDomain).forEach(([domain, dimensionScoresDataSeries]) => {
    dimensionScoresDataSeries.forEach((series) => {
      const dimension = series.shortName;
      const questionnaireName = series.questionnaireName;
      if(!domainDimensionQuestionnaireRecord[domain]) {
        domainDimensionQuestionnaireRecord[domain] = [];
      }
      domainDimensionQuestionnaireRecord[domain].push([dimension, questionnaireName]);
    });
  });
  return domainDimensionQuestionnaireRecord;
}

// export const extractDimensionScoresDataSeriesBelongingToDomain = (
//   domain: string,
//   questionnaires: Mapping.Questionnaire[],
//   allScoresDataSeries: Visualization.DataSeries[],
//   itemsDataSeries: Visualization.DataSeries[],
// ):Visualization.DataSeries[] => {
//   const dimensionScoresDataSeries: Visualization.DataSeries[] = [];
  
//     const scores = allScoresDataSeries.filter(
//       (score) => score.domain === domain,
//     );
//     const items = itemsDataSeries.filter(
//       (item) => item.domain === domain,
//     );
//     // Filter, besser: valueExpression attribut -> gesamtes Fhir Format ändern
//     scores.forEach((score) => {
//       const scoreQuestionnaire = questionnaires.find((q) =>
//         Object.keys(q.items).includes(score.id),
//       );
//       if (scoreQuestionnaire) {
//         const scoreItem = scoreQuestionnaire.items[
//           score.id
//         ] as Mapping.QuestionnaireScoreItem;

//         const itemsToBeRemoved = scoreItem.referenceQuestionnaireItems
//           ? scoreItem.referenceQuestionnaireItems
//               .map((linkId) => items.find((item) => item.id === linkId))
//               .filter((item) => {
//                 if (item === undefined) {
//                   return true; // remove
//                 }
//                 // keep items that have a scoreExpression (intermediate scores)
//                 const questionnaireItem = questionnaires.find((q) =>
//                   Object.keys(q.items).includes(item.id),
//                 )?.items[item.id] as Mapping.QuestionnaireScoreItem;
//                 if (questionnaireItem === undefined) {
//                   return true; // remove
//                 }
//                 if (questionnaireItem.scoreExpression !== undefined) {
//                   return false; // keep intermediate scores
//                 }
//                 return true; // remove raw questions
//               })
//           : [];
//         if (itemsToBeRemoved.length > 0) {
//           _.pullAll(items, itemsToBeRemoved);
//         }
//       }
//     });
//     // console.log("Scores after filtering: ", scores);
//     // console.log("Items after filtering: ", items);
//     dimensionScoresDataSeries.push(...scores);
//     dimensionScoresDataSeries.push(...items);
    
//     return dimensionScoresDataSeries;
// }

export const createHeatmapData = (
  domains: string[],
  dataSeries: Visualization.DataSeries[],
  xData: string[],
) => {
  const chartDataByDomain: Record<string, Visualization.ChartData> = {};
  domains.forEach((domain) => {
    const dimensionScoreDataSeries = dataSeries.filter((series) => 
    series.domain === domain && series.isDimensionScore
    );
    const yData = dimensionScoreDataSeries;
    chartDataByDomain[domain] = {
      xData: xData,
      yData,
    };
  });

  return chartDataByDomain;
};

export const extractDomainDataSeries = (
  data: Visualization.DataSeries[], 
  questionnaires: Mapping.Questionnaire[],
  domain: string,
): Visualization.DataSeries[] => {
  const domainDataSeries = data.filter((series) => {
    const questionnaire = questionnaires.find((q) => q.id === series.questionnaireId);
    if (questionnaire === undefined) {
      return false;
    }
    const correspondingQuestionnaireItem = Object.values(questionnaire.items).find((item) => series.id === item.linkId);
    if (correspondingQuestionnaireItem === undefined) {
      return false;
    }
    if (correspondingQuestionnaireItem.domain === domain) {
      return true;
    }
    return false;
  });
  return domainDataSeries;
}

export const extractGlobalScoresDataSeries = (
    data: Visualization.DataSeries[], 
    questionnaires: Mapping.Questionnaire[],
  ):Visualization.DataSeries[] => {
  
  const globalScores = data.filter((series) => {
    const questionnaire = questionnaires.find((q) => q.id === series.questionnaireId);
    if (questionnaire === undefined) {
      return false;
    }
    const correspondingQuestionnaireItem = questionnaire.items[series.id];
    if (correspondingQuestionnaireItem === undefined) {
      return false;
    }
    if ((correspondingQuestionnaireItem as Mapping.QuestionnaireScoreItem).isGlobalScore) {
      return true;
    }
    return false; 
  });
  return globalScores;
}

export const extractDomainScoresDataSeries = (
    domainData: Visualization.DataSeries[], 
    questionnaires: Mapping.Questionnaire[],
  ):Visualization.DataSeries[] => {
    const domainScores = domainData.filter((series) => {
      const questionnaire = questionnaires.find((q) => q.id === series.questionnaireId);
      if (questionnaire === undefined) {
        return false;
      }
      const correspondingQuestionnaireItem = questionnaire.items[series.id];
      if (correspondingQuestionnaireItem === undefined) {
        return false;
      }
      if ((correspondingQuestionnaireItem as Mapping.QuestionnaireScoreItem).isDomainScore) {
        return true;
      }
      return false;
    });
    return domainScores;
}

export const extractDimensionScoresDataSeries = (
    domainData: Visualization.DataSeries[], 
    questionnaires: Mapping.Questionnaire[],
    domainScoresDataSeries: Visualization.DataSeries[],
    removeDomainScores: boolean = false,
  ):Visualization.DataSeries[] => {
    const dimensionScores = domainData.filter((series) => {
      const questionnaire = questionnaires.find((q) => q.id === series.questionnaireId);
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
      return dimensionScores.filter((series) => !domainScoresDataSeries.map((s) => s.id).includes(series.id));
    }
    return dimensionScores;
  }

export const extractItemsDataSeries = (
    domainData: Visualization.DataSeries[],
    domainScoresDataSeries: Visualization.DataSeries[],
    dimensionScoresDataSeries: Visualization.DataSeries[],
    questionnaires: Mapping.Questionnaire[],
  ): Record<string, Visualization.DataSeries[]> => {
    const dimensionItemDataSeriesRecord: Record<string, Visualization.DataSeries[]> = {};
    dimensionScoresDataSeries.forEach((series) => {
      const questionnaire = questionnaires.find((q) => q.id === series.questionnaireId);
      const correspondingQuestionnaireItem = questionnaire !== undefined ? questionnaire.items[series.id] : undefined;
      if (correspondingQuestionnaireItem !== undefined) {
        const dimension = correspondingQuestionnaireItem.dimension;
        const referencedItems = domainData.filter((series) => 
          (correspondingQuestionnaireItem as Mapping.QuestionnaireScoreItem).referenceQuestionnaireItems?.includes(series.id)
        );
        const dimensionItems = domainData.filter((series) => {
          const questionnaire = questionnaires.find((q) => q.id === series.questionnaireId);
          if (questionnaire === undefined) {
            return false;
          }
          const questionnaireItem = questionnaire.items[series.id];
          if (questionnaireItem === undefined) {
            return false;
          }
          return questionnaireItem.dimension === dimension;
        });
        const items = referencedItems !== undefined ? _.uniqBy([...dimensionItems, ...referencedItems], (series) => series.id) : _.uniqBy(dimensionItems, (series) => series.id);
        const domainScoreIds = domainScoresDataSeries.map((series) => series.id);
        const dimensionScoreIds = dimensionScoresDataSeries.map((series) => series.id);
        const otherDimensionScoreIds = dimensionScoresDataSeries.map((series) => series.id).filter((id) => !dimensionItems.map((s) => s.id).includes(id));
        const allScoreIds = [...domainScoreIds, ...otherDimensionScoreIds, ...dimensionScoreIds];
        const itemsForDimension = items.filter((item) => !allScoreIds.includes(item.id));

        if(dimension !== undefined && itemsForDimension.length > 0) {
          if (!dimensionItemDataSeriesRecord[dimension]) {
            dimensionItemDataSeriesRecord[dimension] = itemsForDimension;
          }
          else {
            dimensionItemDataSeriesRecord[dimension] = _.uniqBy([...dimensionItemDataSeriesRecord[dimension], ...itemsForDimension], (series) => series.id);
          }
        }  
      }
    });
    return dimensionItemDataSeriesRecord;
  }

export const createQuestionnaireMostRecentResponseDateRecord = (questionnaireNamesByDate: Record<string, string[]>) => {
  const questionnaireMostRecentResponseDateRecord: Record<string, string> = {};
  const sortedDates = Object.keys(questionnaireNamesByDate).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  Object.entries(questionnaireNamesByDate).forEach(([date, names]) => {
    for(let name of names) {
      const mostRecentDate = sortedDates.find((d) => questionnaireNamesByDate[d].includes(name));
      if (mostRecentDate !== undefined) {
        questionnaireMostRecentResponseDateRecord[name] = date;
      }
    }
  });
  return questionnaireMostRecentResponseDateRecord;
}

export const createDomainDimensionsRecord = (
  questionnaires: Mapping.Questionnaire[],
  dimensionScoresDataSeriesByDomain: Record<string, Visualization.DataSeries[]>,
) => {
  const domainDimensionsRecord: Record<string, string[]> = {};
  Object.entries(dimensionScoresDataSeriesByDomain).forEach(([domain, dimensionScoresDataSeries]) => {
    const dimensions = dimensionScoresDataSeries.map((series) => {
      const questionnaire = questionnaires.find((q) => q.id === series.questionnaireId);
      if (questionnaire !== undefined) {
        const questionnaireItem = questionnaire.items[series.id];
        if (questionnaireItem !== undefined) {
          return questionnaireItem.dimension;
        }
        return undefined;
      }
      return undefined;
    });
    const uniqueDimensions = _.uniq(dimensions.filter((dim) => dim !== undefined));
    domainDimensionsRecord[domain] = uniqueDimensions;
  });
  return domainDimensionsRecord;
}


export const filterQuestionnaireResponsesThatAreWithinDates = (
  questionnaireResponses: Record<string, Mapping.QuestionnaireResponse>,
  startDate: string,
  endDate: string,
) => {
  if(startDate.length === 0 || endDate.length === 0) {
    return questionnaireResponses;
  }
  const questionnaireResponsesWithinDateRange: Record<string, Mapping.QuestionnaireResponse> = {};
  Object.entries(questionnaireResponses).forEach(([questionnaireResponseId, questionnaireResponse]) => {
    const date = new Date(questionnaireResponse.authored);
    if (date >= new Date(startDate) && date <= new Date(endDate)) {
      questionnaireResponsesWithinDateRange[questionnaireResponseId] = questionnaireResponse;
    }
  });
  return questionnaireResponsesWithinDateRange;
}

export const filterQuestionnaireResponsesThatAreOnSingleDates = (
  questionnaireResponses: Record<string, Mapping.QuestionnaireResponse>,
  dates: string[],
) => {
  if (dates.length === 0) {
    return {};
  }
  const datesAsDates = dates.map((date) => new Date(date));
  const questionnaireResponsesOnDates: Record<string, Mapping.QuestionnaireResponse> = {};
  Object.entries(questionnaireResponses).forEach(([questionnaireResponseId, questionnaireResponse]) => {
    const date = new Date(questionnaireResponse.authored);
    if (datesAsDates.some((d) => d.getTime() === date.getTime())) {
      questionnaireResponsesOnDates[questionnaireResponseId] = questionnaireResponse;
    }
  });
  return questionnaireResponsesOnDates;
}

export const filterQuestionnaireResponsesByQuestionnaireIds = (
  questionnaireResponses: Record<string, Mapping.QuestionnaireResponse>, 
  questionnaireIds: string[]) => {
  const questionnaireResponsesFilteredBySelectedQuestionnaires: Record<string, Mapping.QuestionnaireResponse> = {};
  Object.entries(questionnaireResponses).forEach(([key, response]) => {
    if (questionnaireIds.includes(response.questionnaire.id)) {
      questionnaireResponsesFilteredBySelectedQuestionnaires[key] = response;
    }
  });
  return questionnaireResponsesFilteredBySelectedQuestionnaires;
}

export const extractDatesOfQuestionnaireResponses = (questionnaireResponses: Record<string, Mapping.QuestionnaireResponse>) => {
  const dates = Object.values(questionnaireResponses).map((questionnaireResponse) => {
    return questionnaireResponse.authored;
  });
  const uniqueDates = _.uniq(dates);
  return uniqueDates;
}

export const createPseudoDataSeries = (length: number): Visualization.DataSeries => {
  const arrayLength = length > 0 ? length : 0;
  const pseudoDataPoints = Array(arrayLength).fill(null);
  const dataSeries: Visualization.DataSeries = {
    id: "psuedo",
    name: "",
    shortName: "",
    data: pseudoDataPoints,
    originalData: pseudoDataPoints,
    dataLabels: [],
    seriesType: ITEM_TYPES.item,
    questionnaireId: "",
    questionnaireName: "",
  };
  
  return dataSeries;
}