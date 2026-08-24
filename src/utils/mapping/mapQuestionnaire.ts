import type { NormalizedFHIR } from "@utils/normalization";
import type { Mapping } from "./types";
import { issueFactories, type Errors } from "@utils/errors";
// import * as _ from "lodash-es";
import { UNSPECIFIED_DOMAIN } from "./constants";

export const mapQuestionnaire = (
  questionnaire: NormalizedFHIR.Questionnaire,
): Errors.Result<Mapping.Questionnaire> => {
  const questionnaireId = questionnaire.id;
  const name = questionnaire.name;
  const url = questionnaire.url;
  const description = questionnaire.description;
  const items: Record<string, Mapping.Item> = {};
  const issues: Errors.DataIssue[] = [];

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
      return {
        value: answerOptionNumber, // NaN possible
        label: opt.label,
      };
    });

    if (
      item.answerOptions?.some(
        (opt) => opt.value !== undefined && isNaN(Number(opt.value)),
      )
    ) {
      issues.push(
        issueFactories.questionnaire.invalidItemAnswerOption(
          questionnaire,
          linkId,
          item.answerOptions,
        ),
      );
    }

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

    const range = item.range;
    // const scoreHealthCorrelation = item.scoreHealthCorrelation;
    const referenceQuestionnaireItems = item.referenceQuestionnaireItems;
    const scoreExpression = item.scoreExpression;

    items[linkId] = {
      linkId: linkId,
      domain: UNSPECIFIED_DOMAIN,
      answerOptions: filteredAnswerOptions,
      ...(item.text !== undefined && { text: item.text }),
      ...(range !== undefined && { range: range }),
      // ...(scoreHealthCorrelation !== undefined && {
      //   scoreHealthCorrelation: scoreHealthCorrelation,
      // }),
      ...(referenceQuestionnaireItems !== undefined && {
        referenceQuestionnaireItems: referenceQuestionnaireItems,
      }),
      ...(scoreExpression !== undefined && {
        scoreExpression: scoreExpression,
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
