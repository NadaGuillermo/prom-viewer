import type * as NormalizedFHIR from "@utils/normalization";
import type * as Mapping from "./types";
import { convertFhirDateTimeToDateFormat } from "./utils";
import type * as Errors from "@utils/errors";
import { issueFactories } from "@utils/errors";
import { isQuestionnaireItem } from "./utils";
import { isAnswerCode, isAnswerOptionCode } from "@utils/normalization/utils";

export const mapQuestionnaireResponse = (
  questionnaireResponse: NormalizedFHIR.QuestionnaireResponse,
  questionnaires: Mapping.Questionnaire[],
): Errors.Result<Mapping.QuestionnaireResponse> => {
  const responseId = questionnaireResponse.id;
  const questionnaireUrl = questionnaireResponse.questionnaire;
  const authored = convertFhirDateTimeToDateFormat(
    questionnaireResponse.authored,
  );
  const items: Record<string, Mapping.ResponseItem> = {};
  const issues: Errors.DataIssue[] = [];

  // Error: no items in questionnaireResponse
  if (
    questionnaireResponse.items === undefined ||
    Object.keys(questionnaireResponse.items).length === 0
  ) {
    issues.push(
      issueFactories.questionnaireResponse.missingItems(questionnaireResponse),
    );
  }
  const correspondingQuestionnaire = questionnaires.find(
    (q) => q.url === questionnaireUrl,
  );

  if (correspondingQuestionnaire === undefined) {
    issues.push(
      issueFactories.questionnaireResponse.missingQuestionnaire(
        questionnaireResponse,
      ),
    );
  }

  Object.entries(questionnaireResponse.items).forEach(([linkId, item]) => {
    let answerNumber: Mapping.Value | undefined = undefined;

    if (isAnswerCode(item.answer)) {
      const answerCode = (item.answer as NormalizedFHIR.AnswerCode).code;
      if (
        correspondingQuestionnaire !== undefined &&
        isQuestionnaireItem(correspondingQuestionnaire.items[linkId])
      ) {
        const questionnaireItem = correspondingQuestionnaire.items[linkId];
        const answerOptions = (questionnaireItem as Mapping.QuestionnaireItem)
          .answerOptions;
        const value = answerOptions.find(
          (opt) =>
            isAnswerOptionCode(opt) &&
            (opt as Mapping.AnswerOptionCode).code === answerCode,
        )?.value;
        answerNumber = value === null ? null : Number(value);
      }
    } else {
      const answer = (item.answer as NormalizedFHIR.AnswerValue).value;
      // check if answer options exist and if answer is among them
      if (
        answer !== null &&
        correspondingQuestionnaire !== undefined &&
        isQuestionnaireItem(correspondingQuestionnaire.items[linkId])
      ) {
        const questionnaireItem = correspondingQuestionnaire.items[linkId];
        const answerOptions = (
          questionnaireItem as NormalizedFHIR.QuestionnaireItem
        ).answerOptions;
        if (answerOptions !== undefined && answerOptions.length > 0) {
          const answerOptionValues = answerOptions.map((opt) => opt.value);
          if (!answerOptionValues.includes(answer)) {
            issues.push(
              issueFactories.questionnaireResponse.invalidItemValue(
                questionnaireResponse,
                linkId,
                answer,
              ),
            );
          }
        }
      }
      // Convert to number
      answerNumber = answer === null ? null : Number(answer);
    }

    // Error: answer is not a number
    if (Number.isNaN(answerNumber)) {
      issues.push(
        issueFactories.questionnaireResponse.invalidItemValueType(
          questionnaireResponse,
          linkId,
          item.answer,
        ),
      );
    }
    if (answerNumber !== undefined) {
      items[linkId] = {
        linkId: linkId,
        answer: answerNumber,
      };
    }
  });

  const emptyQuestionnaire: Mapping.Questionnaire = {
    id: "",
    title: "",
    url: "",
    items: {},
  };

  return {
    data: {
      id: responseId,
      questionnaire: correspondingQuestionnaire ?? emptyQuestionnaire,
      authored: authored,
      items: items, // can be empty
    },
    issues: issues,
  };
};
