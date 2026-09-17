/*
PROM Viewer: SMART on FHIR web application for visualizing patient-reported outcome measures (PROMs).
Copyright (C) 2026 Thomas Eisenhauer

This file is part of PROM Viewer.

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License v3.0 or later.
See the LICENSE file for details.
*/

import type * as NormalizedFHIR from "@utils/normalization";
import type * as Mapping from "./types";
import type * as Errors from "@utils/errors";
import { issueFactories } from "@utils/errors";
import { UNSPECIFIED_DOMAIN } from "./constants";
import { isAnswerOptionCode } from "@utils/normalization/utils";

export const mapQuestionnaire = (
  questionnaire: NormalizedFHIR.Questionnaire,
): Errors.Result<Mapping.Questionnaire> => {
  const questionnaireId = questionnaire.id;
  const title = questionnaire.title;
  const url = questionnaire.url;
  const items: Record<string, Mapping.Item> = {};
  const issues: Errors.DataIssue[] = [];

  Object.entries(questionnaire.items).forEach(([linkId, item]) => {
    const answerOptions: Mapping.AnswerOption[] = [];
    item.answerOptions?.forEach((opt) => {
      if (isAnswerOptionCode(opt)) {
        const option = opt as NormalizedFHIR.AnswerOptionCode;
        // Convert value to number
        const valueNumber =
          option.value === null
            ? null
            : option.value !== undefined
              ? Number(option.value)
              : Number(option.code);
        // error: answer option not convertible to number -> valueNumber is NaN
        if (valueNumber !== null && isNaN(valueNumber)) {
          issues.push(
            issueFactories.questionnaire.invalidItemAnswerOption(
              questionnaire,
              linkId,
              option.value ?? option.code,
            ),
          );
        }
        answerOptions.push({
          code: option.code,
          value: valueNumber,
          label: option.label ?? option.code,
        });
      } else {
        const option = opt as NormalizedFHIR.AnswerOptionValue;
        const valueNumber = option.value === null ? null : Number(option.value);
        const label = option.value === null ? "null" : option.value.toString();
        // error: valueNumber isNaN
        if (valueNumber !== null && isNaN(valueNumber)) {
          issues.push(
            issueFactories.questionnaire.invalidItemAnswerOption(
              questionnaire,
              linkId,
              option.value,
            ),
          );
        }
        answerOptions.push({
          value: valueNumber,
          label: label,
        });
      }
    });

    let rangeNumber =
      item.range !== undefined
        ? ([Number(item.range[0]), Number(item.range[1])] as [number, number])
        : undefined;
    if (
      item.range !== undefined &&
      rangeNumber !== undefined &&
      (isNaN(rangeNumber[0]) || isNaN(rangeNumber[1]))
    ) {
      rangeNumber = undefined;
      // push error
      issues.push(
        issueFactories.questionnaire.invalidItemRange(
          questionnaire,
          linkId,
          item.range,
        ),
      );
    }
    const referenceQuestionnaireItems = item.referenceQuestionnaireItems;
    const scoreExpression = item.scoreExpression;

    items[linkId] = {
      linkId: linkId,
      domain: UNSPECIFIED_DOMAIN,
      answerOptions: answerOptions,
      text: item.text,
      range: rangeNumber,
      referenceQuestionnaireItems: referenceQuestionnaireItems,
      scoreExpression: scoreExpression,
    };
  });

  return {
    data: {
      id: questionnaireId,
      url: url,
      title: title ?? questionnaireId,
      items: items, // can be empty
    },
    issues: issues,
  };
};
