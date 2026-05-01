import type { NormalizedFHIR } from "./types";
import type { Mapping } from "@data/globalTypes";

export const normalizeQuestionnaireResponse = (resource: any, normalizedQuestionnaires: NormalizedFHIR.Questionnaire[]): Mapping.Result<NormalizedFHIR.QuestionnaireResponse> => {
  const items: Record<string, NormalizedFHIR.ResponseItem> = {};
  const issues: Mapping.DataIssue[] = [];

  const extractValue = (answer: any, linkId: string): NormalizedFHIR.Answer => {
    if (!answer) return null;

    let answerValue = answer.valueInteger ??
      answer.valueDecimal ??
      answer.valueString ??
      answer.valueBoolean ??
      answer.valueDate ??
      answer.valueDateTime ??
      answer.valueTime ??
      // answer.valueCoding?.code ?? // Code: lookup needed: questionnaire.answerOptions.find((opt) => opt.code === answer.valueCoding.code).value
      // answer.valueCoding?.display ??
      null
    ;
    if (answerValue !== null) {
      return answerValue;
    }
    const questionnaire = normalizedQuestionnaires.find((q) => q.url === resource.questionnaire);
    if (questionnaire === undefined) {
      issues.push({
         id: `issue-questionnaireResponse-${resource.id}-${Math.random().toString(36).substring(2, 9)}`,
         level: 'error',
         message: `Questionnaire Response ${resource.id} does not reference any questionnaire and will therefore be omitted.`
      })
    }
    const item = questionnaire?.items[linkId];
    // lookup in answerOptions
    const value = item?.answerOptions?.find((opt) => opt.code === answer.valueCoding.code)?.value;
    if (value !== undefined) {
      return value;
    }
    return null;
  }

  const traverse = (itemsInput: any[] | undefined) => {
    if (!itemsInput) return;

    for (const item of itemsInput) {
      // item has answer
      if (item.answer && item.answer.length > 0) {
        // only use first answer! otherwise add warning
        if (item.answer.length > 1) {
          issues.push({
            id: `issue-questionnaireResponse-${resource.id}-item-${item.linkId}-${Math.random().toString(36).substring(2, 9)}`,
            level: 'warning',
            message: `Item with linkId ${item.linkId} has more than one answer. Only the first answer will be kept. Answers: ${JSON.stringify(item.answer)}`,
          });
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
  }

  traverse(resource.item);

  return {
    data: {
    id: resource.id, // sollte immer gegeben sein
    questionnaire: resource.questionnaire, // immer gegeben
    authored: resource.authored, // immer gegeben in ISO Format
    items, // optional
    },
    issues,
  };
}