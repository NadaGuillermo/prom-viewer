import type {
  QuestionnaireResponse,
  QuestionnaireResponseItem,
  QuestionnaireResponseItemAnswer,
} from "fhir/r4";

import type * as NormalizedFHIR from "./types";
import type * as Errors from "@utils/errors";
import { issueFactories } from "@utils/errors";
import { isAnswerOptionCode } from "./utils";

export const normalizeQuestionnaireResponse = (
  resource: QuestionnaireResponse,
  normalizedQuestionnaires: NormalizedFHIR.Questionnaire[],
): Errors.Result<NormalizedFHIR.QuestionnaireResponse> => {
  const items: Record<string, NormalizedFHIR.ResponseItem> = {};
  const issues: Errors.DataIssue[] = [];

  const extractValue = (answer: QuestionnaireResponseItemAnswer, linkId: string): NormalizedFHIR.AnswerCode | NormalizedFHIR.AnswerValue => {
    
    const answerValue =
      answer.valueInteger ??
      answer.valueDecimal ??
      answer.valueString ??
      answer.valueBoolean;
      // answer.valueCoding?.code ?? // Code: lookup needed: questionnaire.answerOptions.find((opt) => opt.code === answer.valueCoding.code).value
      // null;
    if (answerValue !== undefined) {
      return {
        value: answerValue
      };
    }
    // check if answer is part of coding system
    const questionnaire = normalizedQuestionnaires.find(
      (q) => q.url === resource.questionnaire,
    );
    const item = questionnaire?.items[linkId];
    // lookup in answerOptions
    const answerOption = item?.answerOptions?.find(
      (opt) => isAnswerOptionCode(opt) && (opt as NormalizedFHIR.AnswerOptionCode).code === answer.valueCoding?.code,
    );
    const code = answerOption !== undefined ? (answerOption as NormalizedFHIR.AnswerOptionCode).code : undefined;
    if (code !== undefined) {
      return {
        code: code
      };
    }
    return {
      value: null
    };
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
      items, // kann leer sein
    },
    issues: issues,
  };
};
