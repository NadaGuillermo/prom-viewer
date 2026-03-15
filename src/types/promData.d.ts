import type { VariableDomains as Domains} from "@customTypes/variableDomains";

export namespace PromData {
  type AnswerValue = Domains.NumberOrNull; // in FHIR duetlich mehr Typen: Umwandlung nach number oder Fehler/keine Darstellung

  interface AnswerOption {
    value: AnswerValue; // zB 1
    label: string; // zB "keine Probleme"
  }

  interface ItemBase {
    linkId: string;
  }

  interface QuestionnaireItem extends ItemBase {
    text: string;
    answerOptions: AnswerOption[];
    thresholds?: AnswerValue[];
  }

   interface Score {
      name: string;
      minValue: number;
      maxValue: number;
      thresholds?: AnswerValue[];
  }

  /* interface ScoreItem extends Score {
    linkId: string;
    text: string;
  } */

  interface ResponseItem extends ItemBase {
    answer: AnswerValue; // no multiple answers possible
  }
  
  interface Questionnaire {
    id: string;
    name: string;
    url?: string;
    description?: string;
    items: Record<string, QuestionnaireItem>;
    // scoreItems?: Record<string, ScoreItem>; 
    score?: Score;
  }

  interface QuestionnaireResponse {
    id: string;
    questionnaire: Questionnaire;
    authored: Domains.DateFormat; // Datum
    items: Record<string, ResponseItem>;
    scoreValue?: number;
  }
}
