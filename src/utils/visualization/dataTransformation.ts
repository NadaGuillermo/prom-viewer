// import * as _ from "lodash-es";
import type { Mapping } from "@utils/mapping";
import type { Visualization } from "./types";
import type { GlobalTypes } from "@customTypes/globalTypes";
import { ITEM_TYPES, SCORE_HEALTH_CORRELATIONS } from "@utils/mapping";
import {
  addNullQuestionnaireResponsesForCommonTimeAxisAndSortByDate,
  createCommonTimeAxis,
  groupQuestionnaireResponsesByQuestionnaireId,
  isQuestionnaireScoreItem,
  getMinAndMaxAnswerOptionValueForItem,
  calculateRadarChartValue,
} from "./utils";

import { normalizeValue } from "./helpers";

export const createChartData = (
  questionnaireResponses: Record<string, Mapping.QuestionnaireResponse>,
): Visualization.ChartData => {
  const xData = createCommonTimeAxis(questionnaireResponses);

  // group questionnaireResponses by questionnaire Id -> one dataseries
  const groupedQuestionnaireResponses =
    groupQuestionnaireResponsesByQuestionnaireId(questionnaireResponses);
  const groupedAndSortedQuestionnaireResponsesWithNullQuestionnaireResponses =
    addNullQuestionnaireResponsesForCommonTimeAxisAndSortByDate(
      groupedQuestionnaireResponses,
      xData,
    );

  // convert into DataSeries
  const yData = Object.values(
    groupedAndSortedQuestionnaireResponsesWithNullQuestionnaireResponses,
  ).flatMap((questionnaireResponses) => {
    // responses for one questionnaire
    const dataSeriesOfQuestionnaire: Visualization.DataSeries[] = [];
    const itemKeys = questionnaireResponses.flatMap((response) => {
      return Object.keys(response.items);
    });
    const uniqueItemKeys = [...new Set(itemKeys)];
    uniqueItemKeys.forEach((linkId) => {
      const data: GlobalTypes.NumberOrNull[] = [];
      const originalData: GlobalTypes.NumberOrNull[] = [];
      const dataLabels: string[] = [];
      questionnaireResponses.forEach((questionnaireResponse) => {
        // item might not exist -> null value
        const responseItem = questionnaireResponse.items[linkId] ?? {
          linkId: linkId,
          answer: null,
        };
        originalData.push(responseItem.answer);
        // normlize everything
        // console.log(
        //   "questionnaireItem: ",
        //   questionnaireResponse.questionnaire.items[linkId],
        // );
        if (responseItem.answer !== null) {
          const questionnaireItem =
            questionnaireResponse.questionnaire.items[linkId];
          // scores
          if (isQuestionnaireScoreItem(questionnaireItem)) {
            const [min, max] = questionnaireItem.range;
            // check if decreasing score health correlation
            if (
              questionnaireItem.scoreHealthCorrelation ===
              SCORE_HEALTH_CORRELATIONS.decrease
            ) {
              const originalNormalizedValue = normalizeValue(
                responseItem.answer,
                min,
                max,
              );
              const adjustedNormalizedValue = 1 - originalNormalizedValue;
              data.push(Number(adjustedNormalizedValue.toFixed(3)));
            } else {
              // increasing score health correlation
              data.push(
                Number(
                  normalizeValue(responseItem.answer, min, max).toFixed(3),
                ),
              );
            }
            dataLabels.push("");
          } else {
            // items
            const [min, max] =
              getMinAndMaxAnswerOptionValueForItem(questionnaireItem);
            data.push(
              Number(normalizeValue(responseItem.answer, min, max).toFixed(3)),
            );
            dataLabels.push(
              questionnaireItem.answerOptions.find((answerOption) => {
                return answerOption.value === responseItem.answer;
              })?.label ?? "",
            );
          }
        } else {
          // do not normalize null values
          data.push(responseItem.answer);
          dataLabels.push("");
        }
      });
      
      const questionnaire = questionnaireResponses[0].questionnaire;
      const questionnaireItem =
        questionnaire.items[linkId];
      // // console.log("questionnaireItem: ", questionnaireItem)
      // // console.log(isQuestionnaireScoreItem(questionnaireItem))
      // // console.log(isDimensionScoreItem(questionnaireItem))
      let seriesType: string;
      if (isQuestionnaireScoreItem(questionnaireItem)) {
        seriesType = ITEM_TYPES.score;
      } else {
        seriesType = ITEM_TYPES.item;
      }

      let referencedItems: string[] | undefined = undefined;
      if (isQuestionnaireScoreItem(questionnaireItem)) {
        if (
          questionnaireItem.referenceQuestionnaireItems &&
          questionnaireItem.referenceQuestionnaireItems.length > 0
        ) {
          referencedItems = questionnaireItem.referenceQuestionnaireItems;
        }
      }
      const shortLinkId = linkId.slice(0, 25);

      dataSeriesOfQuestionnaire.push({
        id: linkId,
        name: questionnaire.items[linkId].text ?? linkId,
        shortName:
          questionnaire.items[linkId].shortText ?? shortLinkId,
        data: data,
        originalData: originalData,
        dataLabels: dataLabels,
        seriesType: seriesType,
        questionnaireId: questionnaire.id,
        questionnaireName: questionnaire.name,
      });
    });

    return dataSeriesOfQuestionnaire;
  });

  return {
    xData: xData,
    yData: yData,
  };
};

export const createRadarChartData = (
  chartData: Visualization.ChartData,
): Visualization.ChartData => {
  // for every date calculate dataseries (one value per dimension)
  const dimensions = [
    ...new Set(
      chartData.yData.map((dataSeries) => {
        return dataSeries.domain;
      }),
    ),
  ];

  // filter dimension Other
  // dimensions.splice(dimensions.indexOf("Other"), 1);

  const xData: string[] = chartData.xData;
  const yData: Visualization.DataSeries[] = [];

  dimensions.forEach((dimension) => {
    const dimensionDataSeries = chartData.yData.filter((series) => 
      series.domain === dimension && series.seriesType === ITEM_TYPES.score
    );
    // console.log("dimensionDataSeries: ", dimension, ": ", dimensionDataSeries);
    const dimensionData = dimensionDataSeries.map(
      (series) => series.data,
    ); // oder originalData
    const data: GlobalTypes.NumberOrNull[] = [];
    xData.forEach((_, index) => {
      const dimensionDataForOneDate = dimensionData.map((data) => data[index]);
      const dimensionValue = calculateRadarChartValue(dimensionDataForOneDate);
      data.push(dimensionValue);
    });
    //return dimensionValue;
    yData.push({
      id: dimension,
      name: dimension,
      shortName: dimension,
      data: data,
      originalData: data,
      dataLabels: [],
      seriesType: ITEM_TYPES.score,
      questionnaireId: "",
      questionnaireName: "",
    });
  });

  return {
    xData: xData,
    yData: yData,
  };
};

// const createScoreDataSeries = (
//   questionnaireResponses: Mapping.QuestionnaireResponse[],
//   scoreRecord: Record<string, Visualization.OriginalAndNormalizedScore>
// ) => {
//   const name = questionnaireResponses[0].questionnaire.score?.name ?? "";
//     const data = questionnaireResponses.map((questionnaireResponse) => {
//       return questionnaireResponse.scoreValue?? null;
//     });
//     const correspondingQuestionnaireResponses = questionnaireResponses.map((responses) => {
//       return responses.id;
//     });
//     const correspondingScoreRecordKeys = Object.keys(scoreRecord).filter((questionnaireKey) => {
//       return correspondingQuestionnaireResponses.includes(questionnaireKey);
//     });
//     const originalScores = correspondingScoreRecordKeys.map((key) => {
//       return scoreRecord[key].originalScore;
//     });
//     return {
//       id: name,
//       name: name,
//       data: data,
//       originalData: originalScores,
//     } as Visualization.DataSeries;
// }

// /** Group and join items of multiple QuestionnaireResponse instances of a Questionnaire as DataSeries */
// const createItemsDataSeries = (
//   questionnaireResponses: Mapping.QuestionnaireResponse[]
// ) => {

//   const allLinkIds = questionnaireResponses.map(
//     (questionnaireResponse) => {
//       const items = Object.values(questionnaireResponse.items);
//       const itemLinkIds = items.map((item) => {
//         return item.linkId;
//       });
//       return itemLinkIds;
//     },
//   );

//   const allLinkIdsFlattened = allLinkIds.flat();

//   const uniqueLinkIds = [...new Set(allLinkIdsFlattened)];

//   const itemsDataSeries: Visualization.DataSeries[] = Array(
//     uniqueLinkIds.length,
//   );

//   uniqueLinkIds.forEach((linkId, index) => {
//     const originalAnswersForItemOfAllQuestionnaireResponses: Mapping.AnswerValue[] = [];
//     const normalizedAnswersForItemOfAllQuestionnaireResponses: Mapping.AnswerValue[] = [];
//     let correspondingQuestionnaireItemLabel: string = "";

//     questionnaireResponses.forEach((questionnaireResponse) => {
//       const responseItems = Object.values(questionnaireResponse.items);
//       const responseItemWithRightLinkId = responseItems.find((item) => {
//         return item.linkId === linkId;
//       });
//       correspondingQuestionnaireItemLabel = questionnaireResponse.questionnaire.items[linkId]?.text ?? "";
//       originalAnswersForItemOfAllQuestionnaireResponses.push(
//         responseItemWithRightLinkId === undefined
//           ? null
//           : responseItemWithRightLinkId.answer,
//       );
//       const minAndMaxAnswerOptionValue = getMinAndMaxAnswerOptionValueForItem(questionnaireResponse.questionnaire.items[linkId]);
//       const normalizedAnswer = responseItemWithRightLinkId !== undefined && responseItemWithRightLinkId.answer !== null ? Number(normalizeValue(
//         responseItemWithRightLinkId.answer,
//         minAndMaxAnswerOptionValue.minValue,
//         minAndMaxAnswerOptionValue.maxValue,
//       ).toFixed(3)) : null;

//       normalizedAnswersForItemOfAllQuestionnaireResponses.push(
//         normalizedAnswer
//         );
//     });

//     itemsDataSeries[index] = {
//       id: linkId,
//       name: correspondingQuestionnaireItemLabel,
//       data: normalizedAnswersForItemOfAllQuestionnaireResponses,
//       originalData: originalAnswersForItemOfAllQuestionnaireResponses,
//     };
//   });

//   return itemsDataSeries;
// };

// export const createMatrixData = (questionnaireResponses: Record<string, Mapping.QuestionnaireResponse>, data: Visualization.DataSeries[]) => {
//   const chartScoreData = data.filter(dataseries =>
//     dataseries.seriesType === "questionnaireScore"
//   );
//   const chartItemsData = data.filter(dataseries =>
//     dataseries.seriesType === "item"
//   );
//   const chartDimensionScoreData = data.filter(dataseries =>
//     dataseries.seriesType === "dimensionScore"
//   );

//   const questionnaireResponsesGroupedByQuestionnaireId = groupQuestionnaireResponsesByQuestionnaireId(questionnaireResponses);
//   const questionnaireIds = Object.keys(questionnaireResponsesGroupedByQuestionnaireId);
//   const matrixData: Record<string, Visualization.DataSeries[]> = {}; // key = questionnaire name

//   for (let id of questionnaireIds) {
//     const correspondingScore = scoreData?.find((scoreDataSeries) => {
//       return scoreDataSeries.name === questionnaireResponsesGroupedByQuestionnaireId[id][0].questionnaire.score?.name;
//     });
//     const correspondingItems = itemsData.filter((itemsDataSeries) => {
//       return questionnaireResponsesGroupedByQuestionnaireId[id][0].questionnaire.items[itemsDataSeries.id] !== undefined;
//     });
//     if (correspondingScore) {
//       correspondingItems.unshift(correspondingScore);
//     }
//     const questionnaireName = questionnaireResponsesGroupedByQuestionnaireId[id][0].questionnaire.name;
//     matrixData[questionnaireName] = [...correspondingItems];
//   }

//   return matrixData;
// }

// export const createMatrixDimensionsData = (questionnaireResponses: Record<string, Mapping.QuestionnaireResponse>, itemsData: Visualization.DataSeries[], scoreData?: Visualization.DataSeries[],) => {
//   const questionnaireResponsesGroupedByQuestionnaireId = groupQuestionnaireResponsesByQuestionnaireId(questionnaireResponses);
//   const matrixDimensions: Visualization.MatrixDimension[] = [];

//   Object.entries(questionnaireResponsesGroupedByQuestionnaireId).forEach(([key, responses]) => {
//     const scoreDataIndex = scoreData?.findIndex((scoreDataSeries) => {
//       for (let i = 0; i < responses.length; i++) {
//        if (scoreDataSeries.name === responses[i].questionnaire.score?.name) {
//         return true;
//        }
//       }
//       return false;
//     });
//     matrixDimensions.push({
//       id: "dimension-" + key, // key = questionnaire.id
//       name: responses.filter((response) => response.questionnaire.id === key)[0].questionnaire.name, // name = questionnaire.name
//       questionnaire: responses.filter((response) => response.questionnaire.id === key)[0].questionnaire, // questionnaireResponse.questionnaire
//       dimensionValues: scoreData !== undefined && scoreDataIndex !== undefined ? scoreData[scoreDataIndex].data : [], // normalisierte Daten!
//       items: createItemsBelongingToOneQuestionnaireForMatrixRow(responses, itemsData),
//     })
//   });
//   return matrixDimensions;
// };

// // questionnaireResponses for one questionnaire
// const createItemsBelongingToOneQuestionnaireForMatrixRow = (questionnaireResponses: Mapping.QuestionnaireResponse[], itemsData: Visualization.DataSeries[]) => {
//   const items: Record<string, Visualization.NumberOrNull[]> = {};
//   const itemKeys = questionnaireResponses.map((response) => {
//     return Object.keys(response.items);
//   }).flat();
//   const uniqueItemKeys = [...new Set(itemKeys)];

//   const itemKeyLabelRecord: Record<string, string> = {};

//   questionnaireResponses.forEach((response) => {
//     const keyLabelsArray = Object.values(response.items).map((responseItem) => {
//       const linkId = responseItem.linkId;
//       const label = response.questionnaire.items[linkId]?.text ?? "";
//       return [linkId, label];
//     });
//     const uniqueKeyLabelsArray = [...new Set(keyLabelsArray)];
//     uniqueKeyLabelsArray.forEach((keyLabel) => {
//       itemKeyLabelRecord[keyLabel[0]] = keyLabel[1];
//     });
//   });

//   const itemsForQuestionnaire = itemsData.filter((itemsDataSeries) => {
//     return Object.values(itemKeyLabelRecord).includes(itemsDataSeries.name);
//   });

//   uniqueItemKeys.forEach((key) => {
//     const correspondingItemLabel = itemKeyLabelRecord[key];
//     const correspondingItemForQuestionnaire = itemsForQuestionnaire.find((item) => {
//       return item.name === correspondingItemLabel;
//     });

//     items[key] = correspondingItemForQuestionnaire?.data ?? [];
//   });
//   return items;
// };
