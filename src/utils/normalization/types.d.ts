export type Value = string | number | boolean | null;
export type Range = [Value, Value];

/** Questionnaire */
export interface AnswerOptionCode {
  code: string;
  value?: Value;
  label?: string;
}

export interface AnswerOptionValue {
  value: Value;
}

export type AnswerOption = AnswerOptionCode | AnswerOptionValue;

export interface AnswerCode {
  code: string;
}

export interface AnswerValue {
  value: Value;
}

export type Answer = AnswerCode | AnswerValue;

export interface QuestionnaireItem {
  linkId: string;
  text?: string;
  answerOptions?: AnswerOption[];
  referenceQuestionnaireItems?: string[];
  range?: Range;
  // observationCode?: string; // from Observation
  observationDefinition?: string; // id for ObservationDefinition
  // scoreHealthCorrelation?: string; // from ObservationDefinition
  scoreExpression?: string;
}

export interface Questionnaire {
  id: string;
  url: string;
  title?: string;
  // description?: string;
  items: Record<string, QuestionnaireItem>;
}

export interface ReferenceRange {
  range: [number, number] | number;
  context?: string;
}

/** Observation Definition */
export interface ObservationDefinition {
  id: string;
  url: string;
  range?: [number, number];
  scoreHealthCorrelation?: string;
  // code: string;
  referenceRange?: ReferenceRange[];
  // referenceValue?: ReferenceRange[];
}

/** Response */
export interface ResponseItem {
  linkId: string;
  answer: Answer;
}

export interface QuestionnaireResponse {
  id: string;
  questionnaire: string; // Questionnaire.url
  authored: string;
  items: Record<string, ResponseItem>;
}

/** Observation */
export interface Observation {
  id: string;
  // code: string;
  value: Value;
  questionnaireResponse?: string; // QuestionnaireResponse.id
  observationDefinition?: string; // ObservationDefinition.id
}

/* Patient */
export interface Patient {
  id: string;
  familyName?: string;
  givenName?: string;
  gender?: string;
  birthDate?: string;
}
