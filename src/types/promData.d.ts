import type { VariableDomains as Domains } from "@customTypes/variableDomains";

export namespace PromData {
  /** General */
  type AnswerValue = Domains.NumberOrNull; // in FHIR duetlich mehr Typen: Umwandlung nach number oder Fehler/keine Darstellung

  interface BaseItem {
    linkId: string;
    text: string;
    dimension: Domains.Dimension; // vordefinierte Dimensionen in variableDomains definieren -> für Gesamtübersicht verplfichtend machen
  }

  /** Questionnaire */
  interface AnswerOption {
    value: number; // FHIR: value.code
    label: string; // FHIR: value.display
  }
  
  interface QuestionnaireItem extends BaseItem {
    answerOptions: AnswerOption[];
    thresholds?: number[];
  }

  interface QuestionnaireScoreItem extends BaseItem {
    range: [number, number];
    scoreHealthCorrelation: Domains.ScoreHealthCorrelation;
    referenceQuestionnaireItems?: string[]; // filled with linkIds
  }

  type Item = QuestionnaireItem | QuestionnaireScoreItem;


  // Score instance
  // interface Observation {
  //   id: string;
  //   observationDefinition: ObservationDefinition;
  //   value: AnswerValue;
  //   interpretation?: string;
  //   referenceRange?: [number, number];
  // }

  interface Questionnaire {
    id: string;
    name: string;
    url: string;
    description?: string;
    // key = linkId
    items: Record<
      string,
      QuestionnaireItem | QuestionnaireScoreItem
    >; // alle Items und Scores; Test nach range und referenceQuestionnaireItems: objectName.hasOwnProperty('propertyName')
  }

  /** Response */

  interface ResponseItem {
    linkId: string; // reference to Item
    answer: AnswerValue;
  }

  interface QuestionnaireResponse {
    id: string;
    questionnaire: Questionnaire;
    authored: Domains.DateFormat; // Datum
    // key = linkId
    items: Record<string, ResponseItem>; // includes scores
  }
}
