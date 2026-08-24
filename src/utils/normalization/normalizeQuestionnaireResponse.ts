import type {
  QuestionnaireResponse,
  QuestionnaireResponseItem,
  QuestionnaireResponseItemAnswer,
} from "fhir/r4";

import type { NormalizedFHIR } from "./types";
import { issueFactories, type Errors } from "@utils/errors";

export const normalizeQuestionnaireResponse = (
  resource: QuestionnaireResponse,
  normalizedQuestionnaires: NormalizedFHIR.Questionnaire[],
): Errors.Result<NormalizedFHIR.QuestionnaireResponse> => {
  const items: Record<string, NormalizedFHIR.ResponseItem> = {};
  const issues: Errors.DataIssue[] = [];

  const extractValue = (answer: QuestionnaireResponseItemAnswer, linkId: string): NormalizedFHIR.Answer => {
    if (!answer) return null;

    const answerValue =
      answer.valueInteger ??
      answer.valueDecimal ??
      answer.valueString ??
      answer.valueBoolean ??
      answer.valueDate ??
      answer.valueDateTime ??
      answer.valueTime ??
      // answer.valueCoding?.code ?? // Code: lookup needed: questionnaire.answerOptions.find((opt) => opt.code === answer.valueCoding.code).value
      // answer.valueCoding?.display ??
      null;
    if (answerValue !== null) {
      return answerValue;
    }
    const questionnaire = normalizedQuestionnaires.find(
      (q) => q.url === resource.questionnaire,
    );
    if (questionnaire === undefined) {
      issues.push(issueFactories.questionnaireResponse.missingQuestionnaire(resource));
    }
    const item = questionnaire?.items[linkId];
    // lookup in answerOptions
    const value = item?.answerOptions?.find(
      (opt) => opt.code === answer.valueCoding?.code,
    )?.value;
    if (value !== undefined) {
      return value;
    }
    return null;
  };

  const traverse = (itemsInput: QuestionnaireResponseItem[] | undefined) => {
    if (!itemsInput) return;

    for (const item of itemsInput) {
      // item has answer
      if (item.answer && item.answer.length > 0) {
        // only use first answer! otherwise add warning
        if (item.answer.length > 1) {
          issues.push(issueFactories.questionnaireResponse.multipleItemValues(resource, item.linkId, item.answer));
        }
        //for (const ans of item.answer) {
        items[item.linkId] = {
          linkId: item.linkId,
          answer: extractValue(item.answer[0], item.linkId),
        };

        // Nested items inside answers
        if (item.answer[0].item) {
          traverse(item.answer[0].item);
        }
        //}
      }

      // Item has child items
      if (item.item) {
        traverse(item.item);
      }
    }
  };

  traverse(resource.item);

  return {
    data: {
      id: resource.id!, // sollte immer gegeben sein
      questionnaire: resource.questionnaire!, // immer gegeben
      authored: resource.authored!, // immer gegeben in ISO Format
      items, // optional
    },
    issues: issues,
  };
};
