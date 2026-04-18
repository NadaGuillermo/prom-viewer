export namespace NormalizedFHIR {
  type Answer = string | number | boolean | null;

  /** Questionnaire */
  interface AnswerOption {
    value: Answer;
    label: string;
  }

  interface QuestionnaireItem {
    linkId: string;
    text: string;
    answerOptions: AnswerOption[];
    referenceQuestionnaireItems?: string[];
    range?: [number, number]; // update from ObservationDefinition
    observationCode?: string; // from Observation
    scoreHealthCorrelation?: string; // from ObservationDefinition
  }

  interface Questionnaire {
    id: string;
    name: string;
    url: string;
    description: string;
    items: Record<string, QuestionnaireItem>;
  }

  /** Observation Definition */
  interface ObservationDefinition {
    id: string;
    range: [number, number];
    scoreHealthCorrelation: string;
    code: string;
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
    code: string;
    value: Answer | undefined;
  }
}
