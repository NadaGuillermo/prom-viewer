import type { NormalizedFHIR } from "@utils/fhir";
import type { Mapping } from "./types";
import type { GlobalTypes } from "@customTypes/globalTypes";
// import * as _ from "lodash-es";
import { unspecifiedDimension } from "./constants";

export const mapNormalizedQuestionnaireToPromDataQuestionnaire = (
  questionnaire: NormalizedFHIR.Questionnaire,
): GlobalTypes.Result<Mapping.Questionnaire> => {
  const questionnaireId = questionnaire.id;
  const name = questionnaire.name;
  const url = questionnaire.url;
  const description = questionnaire.description;
  const items: Record<string, Mapping.Item> = {};
  const issues: GlobalTypes.DataIssue[] = [];

  // if (
  //     questionnaire.items === undefined ||
  //     Object.keys(questionnaire.items).length === 0
  //   ) {
  //     issues.push({
  //       id: `issue-questionnaire-${Math.random().toString(36).substring(2, 9)}`,
  //       level: "error",
  //       message: `Questionnaire with id ${questionnaireId} and url ${url} has no items.
  //         Corresponding QuestionnaireResponses are therefore omitted.`,
  //       resourceId: questionnaireId,
  //       resourceType: "Questionnaire",
  //       linkId: undefined,
  //     });
  //   }

  // Potential errors: answerOption not convertible to number

  Object.entries(questionnaire.items).forEach(([linkId, item]) => {
    const answerOptions = item.answerOptions?.map((opt) => {
      // Error: answerOptions are not numbers
      const answerOptionNumber = Number(opt.value);
      if (Number.isNaN(answerOptionNumber)) {
        issues.push({
          id: `issue-questionnaire-item-${Math.random().toString(36).substring(2, 9)}`,
          level: "warning",
          message: `At least one answer option for item with linkId ${linkId} in questionnaire 
            with url ${url} could not be converted or mapped to a number and is therefore omitted. 
            Answer option was: ${opt.value}`,
          resourceId: questionnaireId,
          resourceType: "Questionnaire",
          linkId: linkId,
        });
      }
      return {
        value: answerOptionNumber, // NaN possible
        label: opt.label,
      };
    });

    let filteredAnswerOptions: Mapping.AnswerOption[] = [];

    // if (answerOptions === undefined || answerOptions.length === 0) {
    //   // Fehler werfen: keine answer options
    //   issues.push({
    //     id: `issue-questionnaire-item-${Math.random().toString(36).substring(2, 9)}`,
    //     level: "warning",
    //     message: `No answer options found for item ${linkId} in Questionnaire with
    //     id ${questionnaireId} and url ${url}.`,
    //     resourceId: questionnaireId,
    //     resourceType: "Questionnaire",
    //     linkId: linkId,
    //   });
    // }
    if (answerOptions !== undefined) {
      // Filter answerOptions, only take those which are a number
      filteredAnswerOptions = answerOptions.filter((opt) => !isNaN(opt.value));
    }

    const dimension = unspecifiedDimension;
    const range = item.range;
    const scoreHealthCorrelation = item.scoreHealthCorrelation;
    const referenceQuestionnaireItems = item.referenceQuestionnaireItems;
    items[linkId] = {
      linkId: linkId,
      text: item.text ?? linkId,
      shortText: linkId,
      answerOptions: filteredAnswerOptions,
      domain: dimension,
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
    issues: issues,
  };
};
