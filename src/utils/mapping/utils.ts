/*
PROM Viewer: SMART on FHIR web application for visualizing patient-reported outcome measures (PROMs).
Copyright (C) 2026 Thomas Eisenhauer

This file is part of PROM Viewer.

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License v3.0 or later.
See the LICENSE file for details.
*/

import type * as Mapping from "@utils/mapping";
import { formatDate, getDateFormatPattern } from "@utils/dateFormat";
// Formats using the runtime-configured date pattern (see
// src/mocks/config/data/dateFormat.json), falling back to ISO if it's missing or
// invalid.
export const convertFhirDateTimeToDateFormat = (isoDate: string): string => {
  return formatDate(isoDate, getDateFormatPattern());
};

/**
 * @param item - the mapped item to check
 * @returns true if `item` is a plain questionnaire item, i.e. it defines a non-empty list of answer options (narrows the type to `QuestionnaireItem`)
 */
export const isQuestionnaireItem = (
    item: Mapping.Item,
  ): item is Mapping.QuestionnaireItem => {
    return (item as Mapping.QuestionnaireItem).answerOptions !== undefined &&
      (item as Mapping.QuestionnaireItem).answerOptions.length > 0;
  };

/**
 * @param item - the mapped item to check
 * @returns true if `item` is a score item, i.e. it defines both a `range` and a `scoreHealthCorrelation` (narrows the type to `QuestionnaireScoreItem`)
 */
export const isScoreItem = (
    item: Mapping.Item,
  ): item is Mapping.QuestionnaireScoreItem => {
    return (item as Mapping.QuestionnaireScoreItem).range !== undefined && (item as Mapping.QuestionnaireScoreItem).scoreHealthCorrelation !== undefined;
  };

/**
 * @param item - the mapped item to check
 * @returns true if `item` is flagged as a dimension score
 */
export const isDimensionScore = (
  item: Mapping.Item
) => {
  return item.isDimensionScore !== undefined && item.isDimensionScore === true;
}

/**
 * @param value - the string to check
 * @returns true if `value` is a valid score-health correlation ("increase" or "decrease"), narrowing the type to `ScoreHealthCorrelation`
 */
export const isScoreHealthCorrelation = (value: string): value is Mapping.ScoreHealthCorrelation => {
  return value === "increase" || value === "decrease";
}

/**
 * @param value - the string to check
 * @returns true if `value` is a valid item type ("score", "item", or "dimensionScore"), narrowing the type to `ItemType`
 */
export const isItemType = (value: string): value is Mapping.ItemType => {
  return value === "score" || value === "item" || value === "dimensionScore";
}