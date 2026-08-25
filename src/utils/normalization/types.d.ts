export namespace NormalizedFHIR {
  type Answer = string | number | boolean | null;

  /** Questionnaire */
  interface AnswerOption {
    value: Answer;
    label: string;
    code?: string;
  }

  interface QuestionnaireItem {
    linkId: string;
    text: string;
    answerOptions?: AnswerOption[];
    referenceQuestionnaireItems?: string[];
    range?: [number, number];
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
    value: Answer;
    questionnaireResponse: string | undefined; // QuestionnaireResponse.id
    observationDefinition: string | undefined; // ObservationDefinition.id
  }

/* Patient */
  interface Patient {
    id: string;
    familyName: string | undefined;
    givenName: string | undefined;
    gender: string | undefined;
    birthDate: string | undefined;
  }
}
