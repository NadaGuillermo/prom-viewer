import type { NormalizedFHIR } from "@data/fhir";

// Warten auf Antwort von Dominik wegen Mapping
// export const mapObservationToQuestionnaireItem = (item: NormalizedFHIR.QuestionnaireItem, observations: NormalizedFHIR.Observation[]) => {
//   const itemLinkId = item.linkId;
//   observations.forEach((observation) => {
//     if (observation.id.includes(itemLinkId)) {
//       item.observationCode = observation.code;
//     }
//   });

//   return item;
// }



export const mapObservationDefinitionToQuestionnaireItem = (item: NormalizedFHIR.QuestionnaireItem, observationDefinitions: NormalizedFHIR.ObservationDefinition[], observations: NormalizedFHIR.Observation[], questionnaireResponses: NormalizedFHIR.QuestionnaireResponse[]) => {
  
  const correspondingQuestionnaireResponse = questionnaireResponses.find((response) => Object.keys(response.items).some((key) => key === item.linkId));
  
  const correspondingObservations = observations.filter((observation) => observation.questionnaireResponse === correspondingQuestionnaireResponse?.id); // TODO: checken, ob wirklich ID
  
  const observationDefinitionId = correspondingObservations[0]?.observationDefinition; // !!!!

  const observationDefinition = observationDefinitions.find((observationDefinition) => observationDefinition.id === observationDefinitionId); // TODO: checken, ob wirklich ID

  if (observationDefinition !== undefined) {
    if (item.scoreHealthCorrelation === undefined) {
        item.scoreHealthCorrelation = observationDefinition.scoreHealthCorrelation;
      }
      if (item.range === undefined) {
        item.range = observationDefinition.range;
      }
  }

  return item;
}

export const getQuestionnaireResponseIdFromObservationReferenceAttribute = (resource: any): string |undefined => {
  const questionnaireResponse: string | undefined = resource.derivedFrom?.find((entry: any) => entry.reference !== undefined)?.reference;

  if (questionnaireResponse === undefined) {
    return undefined;
  }

  // reference has form "QuestionnaireResponse/[id]"

  const splitPosition = questionnaireResponse.indexOf("/");
  if (splitPosition === -1) {
    return undefined;
  }

  return questionnaireResponse.slice(splitPosition + 1);
}

export const mapObservationsToQuestionnaireResponse = (observations: NormalizedFHIR.Observation[], questionnaireResponse: NormalizedFHIR.QuestionnaireResponse, config: any): NormalizedFHIR.QuestionnaireResponse => {
  // find corresponding observations for questionnaire
  const responseId = questionnaireResponse.id;
  const observationsForResponse = observations.filter((observation) => {
    const questionnaireResponseId = getQuestionnaireResponseIdFromObservationReferenceAttribute(observation);
    return questionnaireResponseId === responseId;
  });
  // call addObservationsToQuestionnaireResponse
  if (observationsForResponse.length === 0) {
    return questionnaireResponse;
  }
  const responseWithObservations = addObservationsToQuestionnaireResponse(observationsForResponse, questionnaireResponse, config);
  return responseWithObservations;
}

const addObservationsToQuestionnaireResponse = (observations: NormalizedFHIR.Observation[], questionnaireResponse: NormalizedFHIR.QuestionnaireResponse, questionnaires: NormalizedFHIR.Questionnaire[]) => {
  const questionnaireResponseWithObservationData = questionnaireResponse;
  observations.forEach((observation: NormalizedFHIR.Observation) => {
    if (questionnaireResponse.items[observation.id] === undefined) {
        // Mapping Observation zu Questionnaire Item
        // item fehlt in QR, ist aber in Q gegeben
        questionnaireResponse.items[observation.id] = {
        linkId: observation.id,
        answer: observation.value,
        };
        // add to questionnaire as well ??
        // questionnaire.items[observation.id] = {
        //   linkId: observation.id,
        //   text: observation.text ?? "",
        // };
    }
  
  });
  return questionnaireResponseWithObservationData;
}