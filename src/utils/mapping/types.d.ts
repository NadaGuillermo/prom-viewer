import { SCORE_HEALTH_CORRELATIONS } from "./constants";

export namespace Mapping {
  type Value = number | null;
  type Item = QuestionnaireItem | QuestionnaireScoreItem;

  interface AnswerOptionValue {
    value: Value;
    label: string;
  }

  interface AnswerOptionCode extends AnswerOptionValue {
    code: string;
  }

  type AnswerOption = AnswerOptionCode | AnswerOptionValue;

  interface BaseItem {
    linkId: string;
    domain: string;
    text?: string;
    shortText?: string;
    dimension?: string;
    isDimensionScore?: boolean;
  }

  /** Questionnaire */

  interface ReferenceRange {
    range: [number, number] | number;
    name: string;
    description?: string;
  };

  interface QuestionnaireItem extends BaseItem {
    answerOptions: AnswerOption[];
    range?: [number, number];
    scoreHealthCorrelation?:
      | SCORE_HEALTH_CORRELATIONS.increase
      | SCORE_HEALTH_CORRELATIONS.decrease;
  }

  interface QuestionnaireScoreItem extends BaseItem {
    range: [number, number];
    scoreHealthCorrelation:
      | SCORE_HEALTH_CORRELATIONS.increase
      | SCORE_HEALTH_CORRELATIONS.decrease;
    isDomainScore?: boolean;
    isGlobalScore?: boolean;
    referenceQuestionnaireItems?: string[]; // linkIds
    scoreExpression?: string;
    referenceRange?: ReferenceRange[];
    // referenceValue?: ReferenceRange[];
  }

  interface Questionnaire {
    id: string;
    url: string;
    title: string;
    // description: string;
    items: Record<string, Item>; // key = linkId
  }

  interface ObservationDefinition {
    id: string;
    url: string;
    range?: [number, number];
    scoreHealthCorrelation?: string;
    referenceRange?: ReferenceRange[];
    // referenceValue?: NormalizedFHIR.ReferenceRange[];
  }

  /** Response */
  interface ResponseItem {
    linkId: string; // linkId of Item
    answer: Value;
  }

  interface QuestionnaireResponse {
    id: string;
    questionnaire: Questionnaire;
    authored: string;
    items: Record<string, ResponseItem>; // key = linkId
  }

  interface Observation {
    id: string;
    value: Value;
    questionnaireResponse?: string; // QuestionnaireResponse.id
    observationDefinition?: string; // ObservationDefinition.url
  }

  interface Patient {
    id: string;
    familyName: string;
    givenName: string;
    gender?: string;
    birthDate?: string;
  }
}
