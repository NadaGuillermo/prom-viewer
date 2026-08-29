// import * as _ from "lodash-es";
import type * as Mapping from "@utils/mapping";
import type * as Visualization from "./types";
import type * as GlobalTypes from "@customTypes/globalTypes";
import { isScoreItem, isDimensionScore } from "@utils/mapping";
import {
  addNullQuestionnaireResponsesForCommonTimeAxisAndSortByDate,
  createCommonTimeAxis,
  groupQuestionnaireResponsesByQuestionnaireId,
  getMinAndMaxAnswerOptionValueForItem,
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
          if (isScoreItem(questionnaireItem)) {
            // range and scoreHealthCorrelation given
            const [min, max] = questionnaireItem.range;
            // check if decreasing score health correlation
            if (
              questionnaireItem.scoreHealthCorrelation ===
              "decrease"
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
          } else if (questionnaireItem.range !== undefined) {
            const [min, max] = questionnaireItem.range;
            data.push(
              Number(normalizeValue(responseItem.answer, min, max).toFixed(3)),
            );
            dataLabels.push(
              questionnaireItem.answerOptions.find((answerOption) => {
                return answerOption.value === responseItem.answer;
              })?.label ?? "",
            );
          } else if (questionnaireItem.scoreHealthCorrelation !== undefined) {
            const [min, max] =
              getMinAndMaxAnswerOptionValueForItem(questionnaireItem);
            
              if (
              questionnaireItem.scoreHealthCorrelation ===
              "decrease"
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
            dataLabels.push(
              questionnaireItem.answerOptions.find((answerOption) => {
                return answerOption.value === responseItem.answer;
              })?.label ?? "",
            );
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
      let seriesType: Mapping.ItemType;
      if (isScoreItem(questionnaireItem)) {
        seriesType = "score";
      } else if(isDimensionScore(questionnaireItem)) {
        seriesType = "dimensionScore";
      } else {
        seriesType = "item";
      }

      // let referencedItems: string[] = [];

      const referenceValues: Visualization.ReferenceRange[] = [];
      if (isScoreItem(questionnaireItem)) {
        const item = questionnaireItem as Mapping.QuestionnaireScoreItem;
        if (item.referenceRange !== undefined && item.referenceRange.length > 0) {
          const [min, max] = item.range;
          item.referenceRange.forEach((range) => {
            const referenceRange: Visualization.NumberOrTuple = range.range;
            let normalizedReferenceRange: Visualization.NumberOrTuple;
            if (Array.isArray(referenceRange)) {
              const values: number[] = [];
              referenceRange.forEach((val) => {
                const normalizedValue = Number(normalizeValue(val, min, max).toFixed(3));
                const adjustedNormalizedValue = item.scoreHealthCorrelation === "decrease" ? 1 - normalizedValue : normalizedValue;
                values.push(adjustedNormalizedValue)
              })
              normalizedReferenceRange = [values[0], values[1]];
            } else {
              const normalizedValue = Number(normalizeValue(referenceRange, min, max).toFixed(3));
              const adjustedNormalizedValue = item.scoreHealthCorrelation === "decrease" ? 1 - normalizedValue : normalizedValue;
              normalizedReferenceRange = adjustedNormalizedValue;
            }
            referenceValues.push({
              value: referenceRange,
              normalizedValue: normalizedReferenceRange,
              name: range.name,
              description: range.description,
            })
        });       
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
        questionnaireName: questionnaire.title,
        ...(referenceValues.length > 0 && {referenceValues: referenceValues}),
      });
    });

    return dataSeriesOfQuestionnaire;
  });

  return {
    xData: xData,
    yData: yData,
  };
};
