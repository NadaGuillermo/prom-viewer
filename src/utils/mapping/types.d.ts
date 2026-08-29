import { SCORE_HEALTH_CORRELATIONS, ITEM_TYPES } from "./constants";

export type Value = number | null;
export type Item = QuestionnaireItem | QuestionnaireScoreItem;
export type ScoreHealthCorrelation = typeof SCORE_HEALTH_CORRELATIONS[number];
export type ItemType = typeof ITEM_TYPES[number];
export interface AnswerOptionValue {
  value: Value;
  label: string;
}

export interface AnswerOptionCode extends AnswerOptionValue {
  code: string;
}

export type AnswerOption = AnswerOptionCode | AnswerOptionValue;

export interface BaseItem {
  linkId: string;
  domain: string;
  text?: string;
  shortText?: string;
  dimension?: string;
  isDimensionScore?: boolean;
}

/** Questionnaire */

export interface ReferenceRange {
  range: [number, number] | number;
  name: string;
  description?: string;
}

export interface QuestionnaireItem extends BaseItem {
  answerOptions: AnswerOption[];
  range?: [number, number];
  scoreHealthCorrelation?: ScoreHealthCorrelation;
}

export interface QuestionnaireScoreItem extends BaseItem {
  range: [number, number];
  scoreHealthCorrelation: ScoreHealthCorrelation;
  isDomainScore?: boolean;
  isGlobalScore?: boolean;
  referenceQuestionnaireItems?: string[]; // linkIds
  scoreExpression?: string;
  referenceRange?: ReferenceRange[];
  // referenceValue?: ReferenceRange[];
}

export interface Questionnaire {
  id: string;
  url: string;
  title: string;
  // description: string;
  items: Record<string, Item>; // key = linkId
}

export interface ObservationDefinition {
  id: string;
  url: string;
  range?: [number, number];
  scoreHealthCorrelation?: string;
  referenceRange?: ReferenceRange[];
  // referenceValue?: NormalizedFHIR.ReferenceRange[];
}

/** Response */
export interface ResponseItem {
  linkId: string; // linkId of Item
  answer: Value;
}

export interface QuestionnaireResponse {
  id: string;
  questionnaire: Questionnaire;
  authored: string;
  items: Record<string, ResponseItem>; // key = linkId
}

export interface Observation {
  id: string;
  value: Value;
  questionnaireResponse?: string; // QuestionnaireResponse.id
  observationDefinition?: string; // ObservationDefinition.url
}

export interface Patient {
  id: string;
  familyName: string;
  givenName: string;
  gender?: string;
  birthDate?: string;
}
