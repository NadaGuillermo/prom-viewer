/*
PROM Viewer: SMART on FHIR web application for visualizing patient-reported outcome measures (PROMs).
Copyright (C) 2026 Thomas Eisenhauer

This file is part of PROM Viewer.

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License v3.0 or later.
See the LICENSE file for details.
*/

export const DATA_ISSUE_CODES = [
        "EMPTY_RESOURCE",
        "MISSING_RESOURCE_IN_CONFIG",
        "MISSING_RESOURCE_LINK",
        "CONTRADICTING_VALUES",
        "INVALID_REFERENCE",
        "INVALID_VALUE_TYPE",
        "INVALID_VALUE",
        "INVALID_CODE",
        "INVALID_NUMBER_OF_VALUES",
        "MISSING_FIELD",
        "MISSING_VALUE",
        "DUPLICATE_DEFINITION_IN_RESOURCE_AND_CONFIG",
 ] as const;

export const userMessageResponseNotDisplayed = "Some questionnaire responses could not be processed and will not be displayed.";
export const userMessageQuestionnaireNotDisplayed = "Some questionnaires are not configured correctly and will not be displayed."