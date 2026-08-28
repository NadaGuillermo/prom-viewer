export namespace NormalizedFHIR {
  type Value = string | number | boolean | null;
  type Range = [Value, Value];

  /** Questionnaire */
  interface AnswerOptionCode {
    code: string;
    value?: Value;
    label?: string;
  }

  interface AnswerOptionValue {
    value: Value;
  }

  type AnswerOption = AnswerOptionCode | AnswerOptionValue;

  interface AnswerCode {
    code: string;
  }

  interface AnswerValue {
    value: Value;
  }

  type Answer = AnswerCode | AnswerValue;

  interface QuestionnaireItem {
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

  interface Questionnaire {
    id: string;
    url: string;
    title?: string;
    // description?: string;
    items: Record<string, QuestionnaireItem>;
  }

  interface ReferenceRange {
    range: [number, number] | number;
    context?: string;
  }

  /** Observation Definition */
  interface ObservationDefinition {
    id: string;
    url: string;
    range?: [number, number];
    scoreHealthCorrelation?: string;
    // code: string;
    referenceRange?: ReferenceRange[];
    // referenceValue?: ReferenceRange[];
  }

  /** Response */
  interface ResponseItem {
    linkId: string;
    answer: Answer;
  }

  interface QuestionnaireResponse {
    id: string;
    questionnaire: string; // Questionnaire.url
    authored: string;
    items: Record<string, ResponseItem>;
  }

  /** Observation */
  interface Observation {
    id: string;
    // code: string;
    value: Value;
    questionnaireResponse?: string; // QuestionnaireResponse.id
    observationDefinition?: string; // ObservationDefinition.id
  }

/* Patient */
  interface Patient {
    id: string;
    familyName?: string;
    givenName?: string;
    gender?: string;
    birthDate?: string;
  }
}
