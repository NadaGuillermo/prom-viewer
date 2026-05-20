import type { NormalizedFHIR } from "@utils/fhir";
import type { Mapping } from "./types";
import type { GlobalTypes } from "@customTypes/globalTypes";

export const mapNormalizedObservationToPromDataObservation = (
  observation: NormalizedFHIR.Observation,
): GlobalTypes.Result<Mapping.Observation> => {
  const issues: GlobalTypes.DataIssue[] = [];
  const observationId = observation.id;
  const value = observation.value;
  const questionnaireResponse = observation.questionnaireResponse;
  const observationDefinition = observation.observationDefinition;

  // if (questionnaireResponse === undefined) {
  //     issues.push({
  //         id: `issue-observation-${observationId}-${Math.random().toString(36).substring(2, 9)}`,
  //         level: 'error',
  //         message: `Observation with id ${observationId} does not reference any QuestionnaireResponse and will therefore be omitted.}`,
  //     })
  // }
  // if (observationDefinition === undefined) {
  //     issues.push({
  //         id: `issue-observation-${observationId}-${Math.random().toString(36).substring(2, 9)}`,
  //         level: 'error',
  //         message: `Observation with id ${observationId} does not reference any ObservationDefinition and will therefore be omitted.}`,
  //     });
  // }

  const answerNumber = Number(value);

  if (Number.isNaN(answerNumber) || value === null) {
    issues.push({
      id: `issue-observation-${Math.random().toString(36).substring(2, 9)}`,
      level: "error",
      message: `Value for observation with id ${observationId} could not be converted or mapped to a number and is therefore omitted. Value was: ${value}.`,
      resourceId: observation.id,
      resourceType: "Observation",
      linkId: undefined,
    });
  }

  return {
    data: {
      id: observationId,
      value:
        value === null || Number.isNaN(answerNumber) ? null : Number(value),
      questionnaireResponse: questionnaireResponse ?? "",
      observationDefinition: observationDefinition ?? "",
    },
    issues: issues,
  };
};
