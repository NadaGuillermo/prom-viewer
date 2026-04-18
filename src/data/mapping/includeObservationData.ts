import type { NormalizedFHIR } from "@data/fhir";

// Warten auf Antwort von Dominik wegen Mapping
export const mapObservationToQuestionnaireItem = (item: NormalizedFHIR.QuestionnaireItem, observations: NormalizedFHIR.Observation[]) => {
  const itemLinkId = item.linkId;
  observations.forEach((observation) => {
    if (observation.id.includes(itemLinkId)) {
      item.observationCode = observation.code;
    }
  });

  return item;
}

export const mapObservationDefinitionToQuestionnaireItem = (item: NormalizedFHIR.QuestionnaireItem, observationDefinitions: NormalizedFHIR.ObservationDefinition[]) => {
  if (item.observationCode === undefined) {
    return item;
  }
  const observationCode = item.observationCode;
  observationDefinitions.forEach((observationDefinition) => {
    if (observationDefinition.code === observationCode) {
      if (item.scoreHealthCorrelation === undefined) {
        item.scoreHealthCorrelation = observationDefinition.scoreHealthCorrelation;
      }
      if (item.range === undefined) {
        item.range = observationDefinition.range;
      }
    }
  })

  return item;
}