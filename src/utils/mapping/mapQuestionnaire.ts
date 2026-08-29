import type * as NormalizedFHIR from "@utils/normalization";
import type * as Mapping from "./types";
import type * as Errors from "@utils/errors";
import { issueFactories } from "@utils/errors";
// import * as _ from "lodash-es";
import { UNSPECIFIED_DOMAIN } from "./constants";
import { isAnswerOptionCode } from "@utils/normalization/utils";

export const mapQuestionnaire = (
  questionnaire: NormalizedFHIR.Questionnaire,
): Errors.Result<Mapping.Questionnaire> => {
  const questionnaireId = questionnaire.id;
  const title = questionnaire.title;
  const url = questionnaire.url;
  // const description = questionnaire.description;
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
    const answerOptions: Mapping.AnswerOption[] = [];
    item.answerOptions?.forEach((opt) => {
      if (isAnswerOptionCode(opt)) {
        const option = opt as NormalizedFHIR.AnswerOptionCode;
        // Convert value to number
        const valueNumber = option.value === null ? null : option.value !== undefined ? Number(option.value) : Number(option.code);
        // error: valueNumber is NaN
        if (valueNumber !== null && isNaN(valueNumber)) {
          issues.push(
            issueFactories.questionnaire.invalidItemAnswerOption(
              questionnaire, linkId, option.value ?? option.code
            )
          )
        }
        answerOptions.push({
          code: option.code,
          value: valueNumber,
          label: option.label ?? option.code,
        })
      } else {
        const option = (opt as NormalizedFHIR.AnswerOptionValue);
        const valueNumber = option.value === null ? null : Number(option.value);
        const label = option.value === null ? "null" : option.value.toString();
        // error: valueNumber isNaN
        if (valueNumber !== null && isNaN(valueNumber)) {
          issues.push(
            issueFactories.questionnaire.invalidItemAnswerOption(
              questionnaire, linkId, option.value
            )
          )
        }
       answerOptions.push({
          value: valueNumber,
          label: label,
        });
      }
      
      // Error: answerOptions are not numbers
    //   const answerOptionNumber = Number(opt.codeValue);
    //   if (isNaN(answerOptionNumber)) {
    //     issues.push(
    //       issueFactories.questionnaire.invalidItemAnswerOption(
    //         questionnaire,
    //         linkId,
    //         opt.codeValue,
    //       ),
    //     );
    //   } else {
    //     answerOptions.push({
    //       value: answerOptionNumber,
    //       label: opt.label ?? "N/A",
    //     });
    //   }
    });

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

    let rangeNumber = item.range !== undefined ? [Number(item.range[0]), Number(item.range[1])] as [number, number] : undefined;
    if (item.range !== undefined && rangeNumber !== undefined && (isNaN(rangeNumber[0]) || isNaN(rangeNumber[1]))) {
      rangeNumber = undefined;
      // push error
      issues.push(
        issueFactories.questionnaire.invalidItemRange(
          questionnaire,
          linkId,
          item.range,
        )
      )
    }
    // const scoreHealthCorrelation = item.scoreHealthCorrelation;
    const referenceQuestionnaireItems = item.referenceQuestionnaireItems;
    const scoreExpression = item.scoreExpression;

    items[linkId] = {
      linkId: linkId,
      domain: UNSPECIFIED_DOMAIN,
      answerOptions: answerOptions,
      text: item.text,
      range: rangeNumber,
      // ...(scoreHealthCorrelation !== undefined && {
      //   scoreHealthCorrelation: scoreHealthCorrelation,
      // }),
      referenceQuestionnaireItems: referenceQuestionnaireItems,
      scoreExpression: scoreExpression,
    };
  });

  return {
    data: {
      id: questionnaireId,
      url: url,
      title: title ?? questionnaireId,
      // description: description ?? "",
      items: items, // kann leer sein
    },
    issues: issues,
  };
};
