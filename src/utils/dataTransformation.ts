import type { VariableDomains as Domains } from "@customTypes/variableDomains";
import _ from "lodash";
import type { PromData } from "@customTypes/promData";
import type { Visualization } from "@customTypes/visualization";

const normalizeValue = (
  value: number,
  minValue: number,
  maxValue: number,
) => {
  if (minValue === maxValue) {
    return value;
  }
  if (value < minValue) {
    return 0;
  }
  if (value > maxValue) {
    return 1;
  }
  if (minValue < 0) {
    minValue = 0;
  }
  return (value - minValue) / (maxValue - minValue);
};

const normalizeScoresOfQuestionnaireResponses = (questionnaireResponses: Record<string, PromData.QuestionnaireResponse>) => {
  const originalAndNormalizedScoreValues: Record<string, Visualization.OriginalAndNormalizedScore> = {};
  const questionnaireResponsesArrayWithNormalizedScores = Object.entries(questionnaireResponses).map(([key, questionnaireResponse]) => {
    if (questionnaireResponse.scoreValue !== undefined && questionnaireResponse.questionnaire.score !== undefined) {
      const normalizedScore = Number(normalizeValue(
          questionnaireResponse.scoreValue,
          questionnaireResponse.questionnaire.score.minValue,
          questionnaireResponse.questionnaire.score.maxValue,
        ).toFixed(3));
      const originalScore = questionnaireResponse.scoreValue;
      originalAndNormalizedScoreValues[questionnaireResponse.id] = {
        originalScore: originalScore,
        normalizedScore: normalizedScore,
      };
      return { questionnaireResponseKey: key, 
        normalizedQuestionnaireResponse: {
        ...questionnaireResponse,
        scoreValue: normalizedScore,
      } as PromData.QuestionnaireResponse };
    }
  });

  let questionnaireResponsesWithNormalizedScores: Record<string, PromData.QuestionnaireResponse> = {};
  questionnaireResponsesArrayWithNormalizedScores.forEach((questionnaireResponse) => {
    if (questionnaireResponse === undefined) {
      return;
    }
    questionnaireResponsesWithNormalizedScores[questionnaireResponse.questionnaireResponseKey] = questionnaireResponse.normalizedQuestionnaireResponse;
  });


  return { questionnaireResponsesWithNormalizedScores: questionnaireResponsesWithNormalizedScores, scoreRecord: originalAndNormalizedScoreValues};

}

const sortQuestionnaireResponsesByDate = (
  questionnaireResponses: PromData.QuestionnaireResponse[]
) => {
  return questionnaireResponses.sort((a, b) => {
    const aDate = new Date(a.authored);
    const bDate = new Date(b.authored);
    return aDate.getTime() - bDate.getTime();
  });
};

// 1
const createCommonTimeAxis = (questionnaireResponses: Record<string, PromData.QuestionnaireResponse>) => {
   const allQuestionnaireResponseDates = Object.keys(questionnaireResponses).map((key) => {
    return questionnaireResponses[key].authored;
  });
  const allDates = [...new Set(allQuestionnaireResponseDates)];
  allDates.sort();

  return allDates;
}

// 2
const groupQuestionnaireResponsesByQuestionnaire = (
  questionnaireResponses: Record<string, PromData.QuestionnaireResponse>,
) => {
  const questionnaireResponsesGroupedByQuestionnaire = _.groupBy(questionnaireResponses, questionnaireResponse => questionnaireResponse.questionnaire.id);
  return questionnaireResponsesGroupedByQuestionnaire;
};

// 3
const addNullQuestionnaireResponsesForCommonTimeAxisAndSortByDate = (questionnaireResponses: _.Dictionary<PromData.QuestionnaireResponse[]>, commonTimeAxisDates: Domains.DateFormat[]) => {
    
  const groupedQuestionnaireResponses = questionnaireResponses;

  Object.keys(groupedQuestionnaireResponses).forEach((key) => {
    const questionnaireDates = groupedQuestionnaireResponses[key].map((questionnaireResponse) => {
      return questionnaireResponse.authored;
    });

    const datesNotInQuestionnaireResponses = _.difference(commonTimeAxisDates, questionnaireDates);
    
    datesNotInQuestionnaireResponses.forEach((date) => {
      const nullItems = _.cloneDeep(groupedQuestionnaireResponses[key][0].items);
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
    })

    // sort questionnaireResponses
    const sortedQuestionnaireResponses = sortQuestionnaireResponsesByDate(groupedQuestionnaireResponses[key]);
    groupedQuestionnaireResponses[key] = sortedQuestionnaireResponses;
  });

  return groupedQuestionnaireResponses;
}


export const createChartData = (questionnaireResponses: Record<string, PromData.QuestionnaireResponse>) => {
  const xData = createCommonTimeAxis(questionnaireResponses);

  const {questionnaireResponsesWithNormalizedScores, scoreRecord} = normalizeScoresOfQuestionnaireResponses(questionnaireResponses);

  const groupedQuestionnaireResponses = groupQuestionnaireResponsesByQuestionnaire(questionnaireResponsesWithNormalizedScores);
  const groupedAndSortedQuestionnaireResponsesWithNullQuestionnaireResponses = addNullQuestionnaireResponsesForCommonTimeAxisAndSortByDate(groupedQuestionnaireResponses, xData);

  // convert to ChartData format

  const yScoreData = Object.keys(groupedAndSortedQuestionnaireResponsesWithNullQuestionnaireResponses).map((key) => {
    return createScoreDataSeries(groupedAndSortedQuestionnaireResponsesWithNullQuestionnaireResponses[key], scoreRecord);
  });

  const yItemsDataGroupedByQuestionnaire = Object.keys(groupedAndSortedQuestionnaireResponsesWithNullQuestionnaireResponses).map((key) => {
    return createItemsDataSeries(groupedAndSortedQuestionnaireResponsesWithNullQuestionnaireResponses[key]);
  });

  const yItemsData = yItemsDataGroupedByQuestionnaire.flat();
  
  return {
    xData: xData,
    yScoreData: yScoreData,
    yItemsData: yItemsData,
  } as Visualization.ChartData;

};

const createScoreDataSeries = (
  questionnaireResponses: PromData.QuestionnaireResponse[],
  scoreRecord: Record<string, Visualization.OriginalAndNormalizedScore>
) => {
  const name = questionnaireResponses[0].questionnaire.score?.name ?? "";
    const data = questionnaireResponses.map((questionnaireResponse) => {
      return questionnaireResponse.scoreValue?? null;
    });
    const correspondingQuestionnaireResponses = questionnaireResponses.map((responses) => {
      return responses.id;
    });
    const correspondingScoreRecordKeys = Object.keys(scoreRecord).filter((questionnaireKey) => {
      correspondingQuestionnaireResponses.includes(questionnaireKey);
    });
    const originalScores = correspondingScoreRecordKeys.map((key) => {
      return scoreRecord[key].originalScore;
    });
    return {
      name: name,
      data: data,
      originalScores: originalScores,
    } as Visualization.ScoreDataSeries;
}

/** Group and join items of multiple QuestionnaireResponse instances of a Questionnaire as DataSeries */
const createItemsDataSeries = (
  questionnaireResponses: PromData.QuestionnaireResponse[]
) => {

  const allItemLinkIds = questionnaireResponses.map(
    (questionnaireResponse) => {
      const itemValues = Object.values(questionnaireResponse.items);
      const questionnaireItemLinkIds = itemValues.map((itemValue) => {
        return itemValue.linkId;
      });
      return questionnaireItemLinkIds;
    },
  );

  const allItemLinkIdsFlattened = allItemLinkIds.flat();

  const uniqueQuestionnaireItemLinkIds = [...new Set(allItemLinkIdsFlattened)];

  const itemsDataSeries: Visualization.DataSeries[] = Array(
    uniqueQuestionnaireItemLinkIds.length,
  );

  uniqueQuestionnaireItemLinkIds.forEach((itemLinkId, index) => {
    const itemValuesOfAllQuestionnaireResponses: PromData.AnswerValue[] = [];
    questionnaireResponses.forEach((questionnaireResponse) => {
      const itemValues = Object.values(questionnaireResponse.items);
      const itemValueForItemWithLinkId = itemValues.find((itemValue) => {
        return itemValue.linkId === itemLinkId;
      });
      itemValuesOfAllQuestionnaireResponses.push(
        itemValueForItemWithLinkId === undefined
          ? null
          : itemValueForItemWithLinkId.answer,
      );
    });
    itemsDataSeries[index] = {
      name: itemLinkId,
      data: itemValuesOfAllQuestionnaireResponses,
    };
  });

  return itemsDataSeries;
};
