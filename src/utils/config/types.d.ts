export namespace Config {
  interface ReferenceRange {
    range: number[];
    name: string;
    description?: string;
  }

  interface Question {
    itemId: string;
    shortName?: string;
    observationDefinition?: string;
    scoreDefinitionId?: string;
    isDimensionScore?: boolean;
    dimension?: string;
  }

  interface DomainItemMapping {
    domain?: string;
    questions?: Question[];
  }

  interface ScoreDefinition {
    id: string;
    range: number[];
    scoreHealthCorrelation: string;
    referenceRange?: ReferenceRange[];
  }

  interface Questionnaire {
    questionnaire: string;
    domainItemMapping: DomainItemMapping[];
    globalScores?: string[];
  }

  interface PromConfig {
    scoreDefinitions: ScoreDefinition[];
    questionnaires: Questionnaire[];
  }

}