import type { NormalizedFHIR } from "@data/fhir";
import type { PromData } from "@data/mapping/types";
import type { Mapping } from "@data/globalTypes";
import _ from "lodash";

export const mapNormalizedQuestionnaireToPromDataQuestionnaire = (
  questionnaire: NormalizedFHIR.Questionnaire,
): Mapping.Result<PromData.Questionnaire> => {
  const questionnaireId = questionnaire.id;
  const name = questionnaire.name;
  const url = questionnaire.url;
  const description = questionnaire.description;
  const items: Record<string, PromData.Item> = {};
  const issues = [];

  // Potential errors: answerOption not convertible to number

  Object.entries(questionnaire.items).forEach(([linkId, item]) => {
    const text = item.text;
    const answerOptions = item.answerOptions?.map((opt) => {
      // Error: answerOptions are not numbers
      const answerOptionNumber = Number(opt.value);
      if (Number.isNaN(answerOptionNumber)) {
        issues.push({
          id: `issue-questionnaire-${questionnaireId}-item-${linkId}-${Math.random().toString(36).substring(2, 9)}`,
          level: "warning",
          message: `At least one answer option for item with linkId ${linkId} could not be converted or mapped to a number and will therefore be omitted. Answer option was: ${opt.value}`,
        });
        return; // undefined
      }
      return {
        value: answerOptionNumber,
        label: opt.label,
      };
    });

    let filteredAnswerOptions: PromData.AnswerOption[] = [];

    if (answerOptions === undefined || answerOptions.length === 0) {
      // Fehler werfen: keine answer options
      issues.push({
        id: `issue-questionnaire-${url}-item-${linkId}-${Math.random().toString(36).substring(2, 9)}`,
        level: "warning",
        message: `No answer options found for item ${linkId} in Questionnaire with url ${url}.`,
      });
    } else {
      // Filter answerOptions, only take those which are a number
      filteredAnswerOptions = answerOptions.filter((opt) => opt !== undefined);
    }

    const dimension = "";
    const range = item.range;
    const scoreHealthCorrelation = item.scoreHealthCorrelation;
    const referenceQuestionnaireItems = item.referenceQuestionnaireItems;
    items[linkId] = {
      linkId: linkId,
      text: text, // kann undefined sein
      answerOptions: filteredAnswerOptions,
      dimension: dimension,
      ...(range !== undefined && { range: range }),
      ...(scoreHealthCorrelation !== undefined && {
        scoreHealthCorrelation: scoreHealthCorrelation,
      }),
      ...(referenceQuestionnaireItems !== undefined && {
        referenceQuestionnaireItems: referenceQuestionnaireItems,
      }),
    };
  });

  return {
    data: {
      id: questionnaireId,
      name: name ?? questionnaireId,
      url: url,
      description: description ?? "",
      items: items, // kann leer sein
    },
    issues: [],
  };
};
