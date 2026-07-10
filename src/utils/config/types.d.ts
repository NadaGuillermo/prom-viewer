export namespace Config {
  type ReferenceRange = {
    range: number[];
    name: string;
    description?: string;
  }

  type Question = {
    itemId: string;
    shortName?: string;
    observationDefinition?: string;
    scoreDefinitionId?: string;
    isDimensionScore?: boolean;
    dimension?: string;
  }

  type DomainItemMapping = {
    domain?: string;
    questions?: Question[];
  }

  type ScoreDefinition = {
    id: string;
    range: number[];
    scoreHealthCorrelation: string;
    referenceRange?: ReferenceRange[];
  }

  type Questionnaire = {
    questionnaire: string;
    domainItemMapping: DomainItemMapping[];
    globalScores?: string[];
  }

  type PromConfig = {
    scoreDefinitions: ScoreDefinition[];
    questionnaires: Questionnaire[];
  }

}