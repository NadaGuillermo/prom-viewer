import type { Visualization } from "./types";
import { unspecifiedDimension, type Mapping } from "@utils/mapping";
import type { GlobalTypes } from "@customTypes/globalTypes";
import * as _ from "lodash-es";
import { ITEM_TYPES } from "@utils/mapping";
import { getDateFormatPattern, parseFormattedDate } from "@utils/dateFormat";

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

export const sortDomains = (
  domainCount: Record<string, number>,
  globalHealthDomains?: string[],
  sortDomainsAccordingToCount = true,
  addUnspecified = false,
) => {
  const domains = Object.keys(domainCount);
  // 1. Sort according to number of occurences in questionnaires
  const sortedDomains = sortDomainsAccordingToCount ? [...domains.sort((a, b) => domainCount[b] - domainCount[a])] : [...domains];
  console.log("Sorted domains: ", sortedDomains)
  // 2. Put global domains to front
  const globalDomains = sortedDomains.filter((domain) =>
    globalHealthDomains?.includes(domain),
  );
  if (globalDomains.length > 0) {
    for (let dim of globalDomains) {
      const index = sortedDomains.indexOf(dim);
      sortedDomains.splice(index, 1);
      sortedDomains.unshift(dim);
    }
  }
  
  // 3. Delete empty
  const filteredDomains = sortedDomains.filter(
    (domain) => domain !== ""
  );

  // 4. Include domain "Unspecified" for items that were not assigned a domain in the configuration file
  if (addUnspecified) {
    // sortedDimensions.splice(dimensions.indexOf(unspecified), 1);
    filteredDomains.push(unspecifiedDimension);
  }

  // 5. Delete duplicates
  const uniqueDomains = _.uniq(filteredDomains);
  
  return uniqueDomains;
};

export const addUnspecifiedDimensionToDomains = (domains: string[]) => {
  return [...domains, unspecifiedDimension];
}

// ok
export const getMinAndMaxAnswerOptionValueForItem = (
  item: Mapping.QuestionnaireItem,
) => {
  const answerOptions = item.answerOptions;
  const answerOptionValues = answerOptions.map((opt) => opt.value).filter((val) => val !== null);
  const minValue = Math.min(...answerOptionValues);
  const maxValue = Math.max(...answerOptionValues);
  return [minValue, maxValue];
};

const sortDates = (a: string, b:string, order: "ascending" | "descending" = "ascending", dateFormatPattern?: string) => {
  const pattern = dateFormatPattern ?? getDateFormatPattern();
  const aDateString = parseFormattedDate(a, pattern);
  const bDateString = parseFormattedDate(b, pattern);
  const aDate = new Date(aDateString).getTime();
  const bDate = new Date(bDateString).getTime();
  return order === "ascending" ? aDate - bDate : bDate - aDate;
}

// ok
export const sortQuestionnaireResponsesByDate = (
  questionnaireResponses: Mapping.QuestionnaireResponse[],
) => {
  return questionnaireResponses.sort((a, b) => {
    return sortDates(a.authored, b.authored);
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
  allDates.sort((a, b) => {
    return sortDates(a, b);
  }
  );

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
  console.log("grouped QRs: ", questionnaireResponses)

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

    console.log("Unsorted QRs: ", groupedQuestionnaireResponses)

    // sort questionnaireResponses
    const sortedQuestionnaireResponses = sortQuestionnaireResponsesByDate(
      groupedQuestionnaireResponses[key],
    );
    console.log("Sorted QRs: ", sortedQuestionnaireResponses)
    groupedQuestionnaireResponses[key] = sortedQuestionnaireResponses;
  });

  return groupedQuestionnaireResponses;
};

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
    .sort((a, b) => 
     {
    return sortDates(a, b, order);
     }
    )
    .forEach((key) => {
      sortedQuestionnairesByDate[key] = questionnairesByDate[key];
    });

  return sortedQuestionnairesByDate;
};


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
      const dimension = series.shortName;
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
    dimensionScoresDataSeries: Visualization.DataSeries[],
    questionnaires: Mapping.Questionnaire[],
  ): Record<string, Visualization.DataSeries[]> => {
    const dimensionItemDataSeriesRecord: Record<string, Visualization.DataSeries[]> = {};
    dimensionScoresDataSeries.forEach((series) => {
      const questionnaire = questionnaires.find((q) => q.id === series.questionnaireId);
      const correspondingQuestionnaireItem = questionnaire !== undefined ? questionnaire.items[series.id] : undefined;
      if (correspondingQuestionnaireItem !== undefined) {
        const referencedItems = domainData.filter((series) => 
          (correspondingQuestionnaireItem as Mapping.QuestionnaireScoreItem).referenceQuestionnaireItems?.includes(series.id)
        );
        const dimension = correspondingQuestionnaireItem.dimension ?? series.shortName;
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
        const items = _.uniqBy([...dimensionItems, ...referencedItems], (series: Visualization.DataSeries) => series.id);
        // const domainScoreIds = domainScoresDataSeries.map((series) => series.id);
        const dimensionScoreIds = dimensionScoresDataSeries.map((series) => series.id);
        //const otherDimensionScoreIds = dimensionScoresDataSeries.map((series) => series.id).filter((id) => !dimensionItems.map((s) => s.id).includes(id));
        // const allScoreIds = [...otherDimensionScoreIds, ...dimensionScoreIds];
        const itemsForDimension = items.filter((item) => !dimensionScoreIds.includes(item.id));

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
  const sortedDates = Object.keys(questionnaireNamesByDate).sort(
    (a, b) => {
    return sortDates(a, b, "descending");
    });
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
    const dimensions = dimensionScoresDataSeries.map((series) =>
     {
      const questionnaire = questionnaires.find((q) => q.id === series.questionnaireId);
      if (questionnaire !== undefined) {
        const questionnaireItem = questionnaire.items[series.id];
        if (questionnaireItem !== undefined) {
          return questionnaireItem.dimension ?? series.shortName;
        }
        return series.shortName;
      }
      return series.shortName;
    }
  );
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
  console.log("Dates: ", dates)
  const dateFormatPattern = getDateFormatPattern();
  const datesAsDates = dates.map((date) => new Date(parseFormattedDate(date, dateFormatPattern)));
  console.log("dates as Dates: ", datesAsDates)
  console.log("Dates DDD: ", datesAsDates[0].toISOString().split('T')[0])
  const questionnaireResponsesOnDates: Record<string, Mapping.QuestionnaireResponse> = {};
  Object.entries(questionnaireResponses).forEach(([questionnaireResponseId, questionnaireResponse]) => {
    console.log("dates string:, ", questionnaireResponse.authored)
    const date = new Date(parseFormattedDate(questionnaireResponse.authored, dateFormatPattern));
    console.log("Dates in QR: ", date)
    if (datesAsDates.some((d) => d.toISOString().split('T')[0] === date.toISOString().split('T')[0])) {
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
  // sort dates
  const sortedDates = uniqueDates.sort((a, b) => {
    return sortDates(a, b);
  })
  return sortedDates;
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


export const truncateAtWord = (str: string, maxLength:number = 80) => {
  if (str.length <= maxLength) {
    return str;
  }
  let truncated = str.slice(0, maxLength);
  const lastSpaceIndex = truncated.lastIndexOf(' ');
  if (lastSpaceIndex > -1) {
    truncated = truncated.slice(0, lastSpaceIndex);
  }
  return truncated + '...';
}