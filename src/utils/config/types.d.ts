export interface ReferenceRange {
  range: number[];
  name: string;
  description?: string;
}

export interface Question {
  itemId: string;
  shortName?: string;
  observationDefinition?: string;
  scoreDefinitionId?: string;
  isDimensionScore?: boolean;
  dimension?: string;
}

export interface DomainItemMapping {
  domain?: string;
  questions?: Question[];
}

export interface ScoreDefinition {
  id: string;
  range: number[];
  scoreHealthCorrelation: string;
  referenceRange?: ReferenceRange[];
}

export interface Questionnaire {
  questionnaire: string;
  domainItemMapping: DomainItemMapping[];
  globalScores?: string[];
}

export interface PromConfig {
  scoreDefinitions: ScoreDefinition[];
  questionnaires: Questionnaire[];
}