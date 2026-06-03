import type { GlobalTypes} from "@customTypes/globalTypes";
import { SCORE_HEALTH_CORRELATIONS } from "./constants";

export namespace Mapping {
  type Answer = GlobalTypes.NumberOrNull; // | string | boolean;
  type Item = QuestionnaireItem | QuestionnaireScoreItem;

  interface BaseItem {
    linkId: string;
    domain: string;
    text?: string;
    shortText?: string;
    dimension?: string;
    isDimensionScore?: boolean;
    thresholds?: number[];
  }

  /** Questionnaire */
  interface AnswerOption {
    value: number;
    label: string;
  }

  interface QuestionnaireItem extends BaseItem {
    answerOptions: AnswerOption[];
  }

  interface QuestionnaireScoreItem extends BaseItem {
    range: [number, number];
    scoreHealthCorrelation: SCORE_HEALTH_CORRELATIONS.increase | SCORE_HEALTH_CORRELATIONS.decrease;
    isDomainScore?: boolean;
    isGlobalScore?: boolean;
    referenceQuestionnaireItems?: string[]; // linkIds
    scoreExpression?: string;
  }

  interface Questionnaire {
    id: string;
    name: string;
    url: string;
    description: string;
    items: Record<string, Item>; // key = linkId
  }

  interface ObservationDefinition {
    id: string;
    url: string;
    range?: [number, number];
    scoreHealthCorrelation?: string;
  }

  /** Response */
  interface ResponseItem {
    linkId: string; // linkId of Item
    answer: Answer;
  }

  interface QuestionnaireResponse {
    id: string;
    questionnaire: Questionnaire;
    authored: string;
    items: Record<string, ResponseItem>; // key = linkId
  }

  interface Observation {
    id: string;
    value: Answer;
    questionnaireResponse: string; // QuestionnaireResponse.id
    observationDefinition: string; // ObservationDefinition.id
  }
}