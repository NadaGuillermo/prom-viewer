import type { VariableDomains as Domains } from "@customTypes/variableDomains";

export namespace PromData {
  type Answer = Domains.NumberOrNull; // | string | boolean;
  type Item = QuestionnaireItem | QuestionnaireScoreItem;

  interface BaseItem {
    linkId: string;
    text: string;
    dimension: Domains.Dimension;
  }

  /** Questionnaire */
  interface AnswerOption {
    value: number;
    label: string;
  }

  interface QuestionnaireItem extends BaseItem {
    answerOptions: AnswerOption[];
    thresholds?: number[];
  }

  interface QuestionnaireScoreItem extends BaseItem {
    range: [number, number];
    scoreHealthCorrelation: Domains.ScoreHealthCorrelation;
    referenceQuestionnaireItems: string[]; // linkIds
  }

  interface Questionnaire {
    id: string;
    name: string;
    url: string;
    description: string;
    items: Record<string, Item>; // key = linkId
  }

  /** Response */
  interface ResponseItem {
    linkId: string; // linkId of Item
    answer: Answer;
  }

  interface QuestionnaireResponse {
    id: string;
    questionnaire: Questionnaire;
    authored: Domains.DateFormat;
    items: Record<string, ResponseItem>; // key = linkId
  }
}