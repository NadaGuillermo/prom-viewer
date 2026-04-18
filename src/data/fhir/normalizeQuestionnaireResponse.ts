import type { NormalizedFHIR } from "./types";

export const normalizeQuestionnaireResponse = (resource: any): NormalizedFHIR.QuestionnaireResponse => {
  const items: Record<string, NormalizedFHIR.ResponseItem> = {};

  const extractValue = (answer: any): NormalizedFHIR.Answer => {
    if (!answer) return null;

    return (
      answer.valueInteger ??
      answer.valueDecimal ??
      answer.valueString ??
      answer.valueBoolean ??
      answer.valueDate ??
      answer.valueDateTime ??
      answer.valueTime ??
      answer.valueCoding?.display ??
      answer.valueCoding?.code ??
      null
    );
  }

  const traverse = (itemsInput: any[] | undefined) => {
    if (!itemsInput) return;

    for (const item of itemsInput) {
      // item has answer
      if (item.answer && item.answer.length > 0) {
        // only use first answer!!!
        //for (const ans of item.answer) {
          items[item.linkId] = {
            linkId: item.linkId,
            answer: extractValue(item.answer[0]),
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
    id: resource.id, // sollte immer gegeben sein
    questionnaire: resource.questionnaire, // immer gegeben
    authored: resource.authored, // immer gegeben in ISO Format
    items, // optional
  };
}