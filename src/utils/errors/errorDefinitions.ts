import type { Observation, QuestionnaireResponse, QuestionnaireResponseItemAnswer } from "fhir/r4";

import type * as Errors from "./types";
import {
  userMessageResponseNotDisplayed,
  userMessageQuestionnaireNotDisplayed,
} from "./constants";
import type * as Mapping from "@utils/mapping";
import type * as NormalizedFHIR from "@utils/normalization";

const createIssue = (base: Omit<Errors.DataIssue, "id">): Errors.DataIssue => {
  return {
    ...base,
    id: `${crypto.randomUUID()}`,
  };
};

export const issueFactories = {
  patient: {
    missingName: (resource: NormalizedFHIR.Patient): Errors.DataIssue =>
      createIssue({
        code: "MISSING_VALUE",
        level: "warning",
        message: `Patient ${resource.id} is missing a name.`,
        userMessage: `Patient has no name.`,
        showUser: true,
        context: {
          resourceId: resource.id,
        },
      }),
  },
  questionnaireResponse: {
    unreferencedItem: (
      resource: Mapping.QuestionnaireResponse,
      linkId: string,
    ): Errors.DataIssue =>
      createIssue({
        code: "INVALID_REFERENCE",
        level: "error",

        message: `Item ${linkId} does not exist in Questionnaire but in QuestionnaireResponse.`,

        // resourceId: resource.id,
        resourceType: "QuestionnaireResponse",

        showUser: false,

        context: {
          resourceId: resource.id,
          relatedResourceIds: [resource.questionnaire.id],
          field: linkId,
        },
      }),
    invalidItemValueType: (
      resource: NormalizedFHIR.QuestionnaireResponse,
      linkId: string,
      value: NormalizedFHIR.Answer,
    ): Errors.DataIssue =>
      createIssue({
        code: "INVALID_VALUE_TYPE",
        level: "error",

        message: `Invalid type for item ${linkId} in QuestionnaireResponse. Expected type: convertible to number.`,

        // resourceId: resource.id,
        resourceType: "QuestionnaireResponse",

        showUser: false,

        context: {
          resourceId: resource.id,
          relatedResourceIds: [resource.questionnaire],
          field: linkId,
          value: value,
        },
      }),
    multipleItemValues: (
      resource: QuestionnaireResponse,
      linkId: string,
      values: QuestionnaireResponseItemAnswer[],
    ): Errors.DataIssue =>
      createIssue({
        code: "INVALID_NUMBER_OF_VALUES",
        level: "warning",

        message: `Item ${linkId} in QuestionnaireResponse has multiple values. Only the first one is used.`,

        // resourceId: resource.id,
        resourceType: "QuestionnaireResponse",

        showUser: false,

        context: {
          resourceId: resource.id!,
          field: linkId,
          value: values,
        },
      }),
    invalidItemValue: (
      resource: NormalizedFHIR.QuestionnaireResponse,
      linkId: string,
      value: NormalizedFHIR.Value,
    ): Errors.DataIssue =>
      createIssue({
        code: "INVALID_VALUE",
        level: "warning",

        message: `Invalid value for item ${linkId} in QuestionnaireResponse.`,

        resourceType: "QuestionnaireResponse",

        showUser: false,

        context: {
          resourceId: resource.id,
          field: linkId,
          value: value,
        },
      }),
    missingItems: (
      resource: NormalizedFHIR.QuestionnaireResponse,
    ): Errors.DataIssue =>
      createIssue({
        code: "EMPTY_RESOURCE",
        level: "error",

        message: `QuestionnaireResponse has no items.`,
        userMessage: userMessageResponseNotDisplayed,

        // resourceId: resource.id,
        resourceType: "QuestionnaireResponse",

        showUser: true,

        context: {
          resourceId: resource.id,
        },
      }),
    missingQuestionnaire: (resource: NormalizedFHIR.QuestionnaireResponse): Errors.DataIssue =>
      createIssue({
        code: "MISSING_RESOURCE_LINK",
        level: "error",

        message: `Questionnaire referenced by QuestionnaireResponse could not be found. Either the questionnaire does not exist on the server or the URL is invalid.`,
        userMessage: userMessageResponseNotDisplayed,

        // resourceId: resource.id,
        resourceType: "QuestionnaireResponse",

        showUser: true,

        context: {
          resourceId: resource.id,
          value: resource.questionnaire,
        },
      }),
  },
  questionnaire: {
    missingItemAnswerOption: (
      resource: Mapping.Questionnaire,
      linkId: string,
    ): Errors.DataIssue =>
      createIssue({
        code: "MISSING_FIELD",
        level: "error",

        message: `For item ${linkId} in Questionnaire no answerOptions could be found.`,
        // userMessage: "test",
        // resourceId: resource.id,
        resourceType: "Questionnaire",

        // showUser: true,

        context: {
          resourceId: resource.id,
          field: linkId,
        },
      }),
    invalidItemAnswerOption: (
      resource: NormalizedFHIR.Questionnaire,
      linkId: string,
      value: NormalizedFHIR.Value,
    ): Errors.DataIssue =>
      createIssue({
        code: "INVALID_VALUE_TYPE",
        level: "warning",

        message: `Invalid type for at least one answerOption of item ${linkId} in Questionnaire. Expected type: convertible to number`,

        // resourceId: resource.id,
        resourceType: "Questionnaire",

        showUser: false,

        context: {
          resourceId: resource.id,
          field: linkId,
          value: value,
        },
      }),
    invalidItemRange: (
      resource: NormalizedFHIR.Questionnaire,
      linkId: string,
      value: NormalizedFHIR.Range,
    ): Errors.DataIssue => 
      createIssue({
        code: "INVALID_VALUE_TYPE",
        level: "warning",

        message: `Invalid type for range of item ${linkId} in Questionnaire. Expected type: convertible to number`,

        // resourceId: resource.id,
        resourceType: "Questionnaire",

        showUser: false,

        context: {
          resourceId: resource.id,
          field: linkId,
          value: value,
        },

      }
      ),
    missingInConfig: (
      resource: NormalizedFHIR.Questionnaire,
    ): Errors.DataIssue =>
      createIssue({
        code: "MISSING_RESOURCE_IN_CONFIG",
        level: "error",

        message: `Questionnaire is missing in the configuration file.`,
        userMessage: userMessageQuestionnaireNotDisplayed,

        // resourceId: resource.id,
        resourceType: "Questionnaire",

        showUser: true,

        context: {
          resourceId: resource.id,
        },
      }),
  },
  observation: {
    missingQuestionnaireResponse: (resource: Observation): Errors.DataIssue =>
      createIssue({
        code: "MISSING_RESOURCE_LINK",
        level: "error",

        message: `QuestionnaireResponse referenced by Observation is missing.`,

        // resourceId: resource.id,
        resourceType: "Observation",

        showUser: false,

        context: {
          resourceId: resource.id!,
        },
      }),
    missingObservationDefinition: (resource: Observation): Errors.DataIssue =>
      createIssue({
        code: "MISSING_RESOURCE_LINK",
        level: "error",

        message: `ObservationDefinition referenced by Observation is missing.`,

        // resourceId: resource.id,
        resourceType: "Observation",

        showUser: false,

        context: {
          resourceId: resource.id!,
        },
      }),
    invalidObservationValue: (
      resource: NormalizedFHIR.Observation,
    ): Errors.DataIssue =>
      createIssue({
        code: "INVALID_VALUE_TYPE",
        level: "error",

        message: `Observation value is of an invalid type. Expected type: convertible to number.`,

        // resourceId: resource.id,
        resourceType: "Observation",

        showUser: false,

        context: {
          resourceId: resource.id,
          value: resource.value,
          // expectedType: "number",
        },
      }),
  },
  observationDefinition: {
    contradictingRangeInConfig: (
      resource: Mapping.ObservationDefinition,
    ): Errors.DataIssue =>
      createIssue({
        code: "CONTRADICTING_VALUES",
        level: "warning",

        message:
          "Score range definition in ObservationDefinition contradicts range given in the configuration file. The latter is used.",

        // resourceId: resource.id,
        resourceType: "ObservationDefinition",

        showUser: false,

        context: {
          resourceId: resource.id,
          value: resource.range,
        },
      }),
    contradictingScoreHealthCorrelationInConfig: (
      resource: Mapping.ObservationDefinition,
    ): Errors.DataIssue =>
      createIssue({
        code: "CONTRADICTING_VALUES",
        level: "warning",

        message:
          "ScoreHealthCorrelation definition in ObservationDefinition contradicts scoreHealthCorrelation given in the configuration file. The latter is used.",

        // resourceId: resource.id,
        resourceType: "ObservationDefinition",

        showUser: false,

        context: {
          resourceId: resource.id,
          // scoreHealthCorrelation: resource.scoreHealthCorrelation,
          // scoreHealthCorrelationConfig: scoreHealthCorrelationConfig
        },
      }),
    missingRange: (resource: Mapping.ObservationDefinition): Errors.DataIssue =>
      createIssue({
        code: "MISSING_FIELD",
        level: "error",

        message: `ObservationDefinition is missing range.`,

        // resourceId: resource.id,
        resourceType: "ObservationDefinition",

        showUser: false,

        context: {
          resourceId: resource.id,
        },
      }),
    invalidRange: (resource: Mapping.ObservationDefinition): Errors.DataIssue =>
      createIssue({
        code: "INVALID_VALUE_TYPE",
        level: "error",

        message: "ObservationDefinition has an invalid range.",

        // resourceId: resource.id,
        resourceType: "ObservationDefinition",

        showUser: false,

        context: {
          resourceId: resource.id,
          // range: resource.range,
          // expectedType: "[number, number] with first number smaller or equal to second number",
        },
      }),
    missingScoreHealthCorrelation: (
      resource: Mapping.ObservationDefinition,
    ): Errors.DataIssue =>
      createIssue({
        code: "MISSING_FIELD",
        level: "error",

        message: `ObservationDefinition is missing scoreHealthCorrelation.`,

        // resourceId: resource.id,
        resourceType: "ObservationDefinition",

        showUser: false,

        context: {
          resourceId: resource.id,
        },
      }),
    invalidScoreHealthCorrelation: (
      resource: Mapping.ObservationDefinition,
    ): Errors.DataIssue =>
      createIssue({
        code: "INVALID_VALUE_TYPE",
        level: "error",

        message: "ObservationDefinition has an invalid scoreHealthCorrelation.",

        // resourceId: resource.id,
        resourceType: "ObservationDefinition",

        showUser: false,

        context: {
          resourceId: resource.id,
          //range: resource.scoreHealthCorrelation,
          //expectedType: "increase | decrease",
        },
      }),
    additionalReferenceValuesInConfig: (
      resource: Mapping.ObservationDefinition,
    ): Errors.DataIssue =>
      createIssue({
        code: "DUPLICATE_DEFINITION_IN_RESOURCE_AND_CONFIG",
        level: "warning",

        message:
          "There are reference values defined in both the ObservationDefinition and the configuration file. All will be displayed.",

        resourceType: "ObservationDefinition",

        showUser: false,

        context: {
          resourceId: resource.id,
          value: resource.referenceRange,
        },
      }),
  },
};
